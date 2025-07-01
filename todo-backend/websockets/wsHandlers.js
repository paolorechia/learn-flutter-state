const url = require('url');
const { verifyToken, getUserFromToken } = require('../middleware/auth');
const Todo = require('../models/Todo');

// Store active connections by user ID
const userConnections = new Map();

// WebSocket message types
const MESSAGE_TYPES = {
  // Authentication
  AUTH: 'auth',
  AUTH_SUCCESS: 'auth_success',
  AUTH_ERROR: 'auth_error',
  
  // Todo operations
  TODOS_LIST: 'todos_list',
  TODOS_LIST_RESPONSE: 'todos_list_response',
  TODOS_CREATE: 'todos_create',
  TODOS_CREATE_RESPONSE: 'todos_create_response',
  TODOS_UPDATE: 'todos_update',
  TODOS_UPDATE_RESPONSE: 'todos_update_response',
  TODOS_DELETE: 'todos_delete',
  TODOS_DELETE_RESPONSE: 'todos_delete_response',
  TODOS_STATS: 'todos_stats',
  TODOS_STATS_RESPONSE: 'todos_stats_response',
  TODOS_SEARCH: 'todos_search',
  TODOS_SEARCH_RESPONSE: 'todos_search_response',
  
  // Real-time broadcasts
  TODO_CREATED: 'todo_created',
  TODO_UPDATED: 'todo_updated',
  TODO_DELETED: 'todo_deleted',
  
  // System
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error'
};

const handleWebSocketConnection = (ws, request, wss) => {
  console.log('🔌 New WebSocket connection attempt');
  
  let user = null;
  let isAuthenticated = false;
  
  // Parse query parameters for token (optional)
  const query = url.parse(request.url, true).query;
  const tokenFromQuery = query.token;
  
  // Handle authentication on connection if token provided
  if (tokenFromQuery) {
    authenticateConnection(ws, tokenFromQuery);
  }
  
  // Send welcome message
  sendMessage(ws, {
    type: 'connected',
    data: {
      message: 'Connected to Todo API WebSocket',
      requiresAuth: !isAuthenticated
    }
  });
  
  // Handle incoming messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(ws, message, wss);
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
      sendError(ws, 'Invalid message format');
    }
  });
  
  // Handle connection close
  ws.on('close', () => {
    if (user) {
      console.log(`❌ User ${user.username} disconnected from WebSocket`);
      removeUserConnection(user._id, ws);
    } else {
      console.log('❌ Unauthenticated connection closed');
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('🔥 WebSocket error:', error);
  });
  
  // Authentication helper
  async function authenticateConnection(ws, token) {
    try {
      user = await getUserFromToken(token);
      isAuthenticated = true;
      
      // Store connection
      addUserConnection(user._id, ws);
      
      console.log(`✅ User ${user.username} authenticated via WebSocket`);
      
      sendMessage(ws, {
        type: MESSAGE_TYPES.AUTH_SUCCESS,
        data: {
          user: {
            _id: user._id,
            username: user.username,
            email: user.email
          }
        }
      });
    } catch (error) {
      console.error('❌ WebSocket authentication failed:', error);
      sendMessage(ws, {
        type: MESSAGE_TYPES.AUTH_ERROR,
        data: { message: 'Authentication failed' }
      });
    }
  }
  
  // Message handler
  async function handleMessage(ws, message, wss) {
    const { type, data = {}, id } = message;
    
    // Handle authentication
    if (type === MESSAGE_TYPES.AUTH) {
      if (data.token) {
        await authenticateConnection(ws, data.token);
      } else {
        sendError(ws, 'Token required for authentication', id);
      }
      return;
    }
    
    // Handle ping/pong
    if (type === MESSAGE_TYPES.PING) {
      sendMessage(ws, { type: MESSAGE_TYPES.PONG, id });
      return;
    }
    
    // Require authentication for all other operations
    if (!isAuthenticated || !user) {
      sendError(ws, 'Authentication required', id);
      return;
    }
    
    // Handle todo operations
    try {
      switch (type) {
        case MESSAGE_TYPES.TODOS_LIST:
          await handleTodosList(ws, data, id);
          break;
          
        case MESSAGE_TYPES.TODOS_CREATE:
          await handleTodosCreate(ws, data, id, wss);
          break;
          
        case MESSAGE_TYPES.TODOS_UPDATE:
          await handleTodosUpdate(ws, data, id, wss);
          break;
          
        case MESSAGE_TYPES.TODOS_DELETE:
          await handleTodosDelete(ws, data, id, wss);
          break;
          
        case MESSAGE_TYPES.TODOS_STATS:
          await handleTodosStats(ws, data, id);
          break;
          
        case MESSAGE_TYPES.TODOS_SEARCH:
          await handleTodosSearch(ws, data, id);
          break;
          
        default:
          sendError(ws, `Unknown message type: ${type}`, id);
      }
    } catch (error) {
      console.error(`❌ Error handling ${type}:`, error);
      sendError(ws, error.message || 'Internal server error', id);
    }
  }
  
  // Todo operation handlers
  async function handleTodosList(ws, data, id) {
    const options = {
      completed: data.completed,
      priority: data.priority,
      limit: data.limit || 50,
      skip: data.skip || 0,
      sortBy: data.sortBy || 'createdAt',
      sortOrder: data.sortOrder || -1
    };

    const todos = await Todo.findByUserId(user._id, options);
    
    sendMessage(ws, {
      type: MESSAGE_TYPES.TODOS_LIST_RESPONSE,
      data: { todos },
      id
    });
  }
  
  async function handleTodosCreate(ws, data, id, wss) {
    if (!data.title) {
      sendError(ws, 'Title is required', id);
      return;
    }

    const todoData = {
      title: data.title,
      description: data.description || '',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
      tags: data.tags || [],
      userId: user._id
    };

    const todo = new Todo(todoData);
    const savedTodo = await todo.save();

    const response = {
      type: MESSAGE_TYPES.TODOS_CREATE_RESPONSE,
      data: { todo: savedTodo },
      id
    };

    // Send response to creator
    sendMessage(ws, response);

    // Broadcast to all user's connections
    broadcastToUser(user._id, {
      type: MESSAGE_TYPES.TODO_CREATED,
      data: { todo: savedTodo }
    }, ws);
  }
  
  async function handleTodosUpdate(ws, data, id, wss) {
    if (!data.id) {
      sendError(ws, 'Todo ID is required', id);
      return;
    }

    const updateData = { ...data };
    delete updateData.id;
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;

    const updated = await Todo.updateByIdAndUserId(data.id, user._id, updateData);
    
    if (!updated) {
      sendError(ws, 'Todo not found or not authorized', id);
      return;
    }

    const updatedTodo = await Todo.findByIdAndUserId(data.id, user._id);

    const response = {
      type: MESSAGE_TYPES.TODOS_UPDATE_RESPONSE,
      data: { todo: updatedTodo },
      id
    };

    // Send response to updater
    sendMessage(ws, response);

    // Broadcast to all user's connections
    broadcastToUser(user._id, {
      type: MESSAGE_TYPES.TODO_UPDATED,
      data: { todo: updatedTodo }
    }, ws);
  }
  
  async function handleTodosDelete(ws, data, id, wss) {
    if (!data.id) {
      sendError(ws, 'Todo ID is required', id);
      return;
    }

    const deleted = await Todo.deleteByIdAndUserId(data.id, user._id);
    
    if (!deleted) {
      sendError(ws, 'Todo not found or not authorized', id);
      return;
    }

    const response = {
      type: MESSAGE_TYPES.TODOS_DELETE_RESPONSE,
      data: { id: data.id },
      id
    };

    // Send response to deleter
    sendMessage(ws, response);

    // Broadcast to all user's connections
    broadcastToUser(user._id, {
      type: MESSAGE_TYPES.TODO_DELETED,
      data: { id: data.id }
    }, ws);
  }
  
  async function handleTodosStats(ws, data, id) {
    const stats = await Todo.getStatsByUserId(user._id);
    
    sendMessage(ws, {
      type: MESSAGE_TYPES.TODOS_STATS_RESPONSE,
      data: { stats },
      id
    });
  }
  
  async function handleTodosSearch(ws, data, id) {
    if (!data.query) {
      sendError(ws, 'Search query is required', id);
      return;
    }

    const options = {
      limit: data.limit || 20,
      skip: data.skip || 0
    };

    const todos = await Todo.search(user._id, data.query, options);
    
    sendMessage(ws, {
      type: MESSAGE_TYPES.TODOS_SEARCH_RESPONSE,
      data: { todos, query: data.query },
      id
    });
  }
};

// Utility functions
function sendMessage(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws, message, id = null) {
  sendMessage(ws, {
    type: MESSAGE_TYPES.ERROR,
    data: { message },
    id
  });
}

function addUserConnection(userId, ws) {
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId).add(ws);
}

function removeUserConnection(userId, ws) {
  if (userConnections.has(userId)) {
    userConnections.get(userId).delete(ws);
    if (userConnections.get(userId).size === 0) {
      userConnections.delete(userId);
    }
  }
}

function broadcastToUser(userId, message, excludeWs = null) {
  if (userConnections.has(userId)) {
    userConnections.get(userId).forEach(ws => {
      if (ws !== excludeWs && ws.readyState === ws.OPEN) {
        sendMessage(ws, message);
      }
    });
  }
}

module.exports = {
  handleWebSocketConnection,
  MESSAGE_TYPES
};
