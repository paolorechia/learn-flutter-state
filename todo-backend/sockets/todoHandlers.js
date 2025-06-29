const Todo = require('../models/Todo');

const todoSocketHandlers = (socket, io) => {
  // Get all todos for the authenticated user
  socket.on('todos:list', async (data, callback) => {
    try {
      const options = {
        completed: data?.completed,
        priority: data?.priority,
        limit: data?.limit || 50,
        skip: data?.skip || 0,
        sortBy: data?.sortBy || 'createdAt',
        sortOrder: data?.sortOrder || -1
      };

      const todos = await Todo.findByUserId(socket.user._id, options);
      
      const response = {
        success: true,
        data: { todos },
        message: 'Todos retrieved successfully'
      };

      if (callback) callback(response);
      else socket.emit('todos:list:response', response);
    } catch (error) {
      console.error('Error fetching todos:', error);
      const errorResponse = {
        success: false,
        message: error.message || 'Failed to fetch todos'
      };
      
      if (callback) callback(errorResponse);
      else socket.emit('todos:list:error', errorResponse);
    }
  });

  // Create a new todo
  socket.on('todos:create', async (data, callback) => {
    try {
      if (!data.title) {
        const errorResponse = {
          success: false,
          message: 'Title is required'
        };
        if (callback) callback(errorResponse);
        else socket.emit('todos:create:error', errorResponse);
        return;
      }

      const todoData = {
        title: data.title,
        description: data.description || '',
        priority: data.priority || 'medium',
        dueDate: data.dueDate || null,
        tags: data.tags || [],
        userId: socket.user._id
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      const response = {
        success: true,
        data: { todo: savedTodo },
        message: 'Todo created successfully'
      };

      // Notify the user who created the todo
      if (callback) callback(response);
      else socket.emit('todos:create:response', response);

      // Broadcast to user's room (in case they have multiple connections)
      socket.to(`user_${socket.user._id}`).emit('todos:created', response);
    } catch (error) {
      console.error('Error creating todo:', error);
      const errorResponse = {
        success: false,
        message: error.message || 'Failed to create todo'
      };
      
      if (callback) callback(errorResponse);
      else socket.emit('todos:create:error', errorResponse);
    }
  });

  // Update a todo
  socket.on('todos:update', async (data, callback) => {
    try {
      if (!data.id) {
        const errorResponse = {
          success: false,
          message: 'Todo ID is required'
        };
        if (callback) callback(errorResponse);
        else socket.emit('todos:update:error', errorResponse);
        return;
      }

      // Remove fields that shouldn't be updated
      const updateData = { ...data };
      delete updateData.id;
      delete updateData._id;
      delete updateData.userId;
      delete updateData.createdAt;

      const updated = await Todo.updateByIdAndUserId(data.id, socket.user._id, updateData);
      
      if (!updated) {
        const errorResponse = {
          success: false,
          message: 'Todo not found or not authorized'
        };
        if (callback) callback(errorResponse);
        else socket.emit('todos:update:error', errorResponse);
        return;
      }

      // Get the updated todo
      const updatedTodo = await Todo.findByIdAndUserId(data.id, socket.user._id);

      const response = {
        success: true,
        data: { todo: updatedTodo },
        message: 'Todo updated successfully'
      };

      // Notify the user who updated the todo
      if (callback) callback(response);
      else socket.emit('todos:update:response', response);

      // Broadcast to user's room
      socket.to(`user_${socket.user._id}`).emit('todos:updated', response);
    } catch (error) {
      console.error('Error updating todo:', error);
      const errorResponse = {
        success: false,
        message: error.message || 'Failed to update todo'
      };
      
      if (callback) callback(errorResponse);
      else socket.emit('todos:update:error', errorResponse);
    }
  });

  // Delete a todo
  socket.on('todos:delete', async (data, callback) => {
    try {
      if (!data.id) {
        const errorResponse = {
          success: false,
          message: 'Todo ID is required'
        };
        if (callback) callback(errorResponse);
        else socket.emit('todos:delete:error', errorResponse);
        return;
      }

      const deleted = await Todo.deleteByIdAndUserId(data.id, socket.user._id);
      
      if (!deleted) {
        const errorResponse = {
          success: false,
          message: 'Todo not found or not authorized'
        };
        if (callback) callback(errorResponse);
        else socket.emit('todos:delete:error', errorResponse);
        return;
      }

      const response = {
        success: true,
        data: { id: data.id },
        message: 'Todo deleted successfully'
      };

      // Notify the user who deleted the todo
      if (callback) callback(response);
      else socket.emit('todos:delete:response', response);

      // Broadcast to user's room
      socket.to(`user_${socket.user._id}`).emit('todos:deleted', response);
    } catch (error) {
      console.error('Error deleting todo:', error);
      const errorResponse = {
        success: false,
        message: error.message || 'Failed to delete todo'
      };
      
      if (callback) callback(errorResponse);
      else socket.emit('todos:delete:error', errorResponse);
    }
  });

  // Get todo statistics
  socket.on('todos:stats', async (data, callback) => {
    try {
      const stats = await Todo.getStatsByUserId(socket.user._id);
      
      const response = {
        success: true,
        data: { stats },
        message: 'Todo statistics retrieved successfully'
      };

      if (callback) callback(response);
      else socket.emit('todos:stats:response', response);
    } catch (error) {
      console.error('Error fetching todo stats:', error);
      const errorResponse = {
        success: false,
        message: error.message || 'Failed to fetch todo statistics'
      };
      
      if (callback) callback(errorResponse);
      else socket.emit('todos:stats:error', errorResponse);
    }
  });

  // Search todos
  socket.on('todos:search', async (data, callback) => {
    try {
      if (!data.query) {
        const errorResponse = {
          success: false,
          message: 'Search query is required'
        };
        if (callback) callback(errorResponse);
        else socket.emit('todos:search:error', errorResponse);
        return;
      }

      const options = {
        limit: data.limit || 20,
        skip: data.skip || 0
      };

      const todos = await Todo.search(socket.user._id, data.query, options);
      
      const response = {
        success: true,
        data: { todos, query: data.query },
        message: 'Search completed successfully'
      };

      if (callback) callback(response);
      else socket.emit('todos:search:response', response);
    } catch (error) {
      console.error('Error searching todos:', error);
      const errorResponse = {
        success: false,
        message: error.message || 'Failed to search todos'
      };
      
      if (callback) callback(errorResponse);
      else socket.emit('todos:search:error', errorResponse);
    }
  });
};

module.exports = todoSocketHandlers;
