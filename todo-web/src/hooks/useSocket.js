import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const WS_URL = 'ws://localhost:3000/ws';

// Message types (matching backend)
export const MESSAGE_TYPES = {
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

export const useSocket = () => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const messageHandlers = useRef(new Map());
  const pendingMessages = useRef(new Map());
  const messageId = useRef(0);

  // Generate unique message ID
  const generateMessageId = () => {
    return `msg_${Date.now()}_${++messageId.current}`;
  };

  // Send message with optional response handling
  const sendMessage = useCallback((type, data = {}, responseHandler = null) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message:', type);
      if (responseHandler) {
        responseHandler({ success: false, message: 'WebSocket not connected' });
      }
      return null;
    }

    const id = generateMessageId();
    const message = { type, data, id };

    if (responseHandler) {
      pendingMessages.current.set(id, responseHandler);
    }

    socketRef.current.send(JSON.stringify(message));
    return id;
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      const { type, data, id } = message;

      console.log('📨 Received WebSocket message:', type, data);

      // Handle response to pending message
      if (id && pendingMessages.current.has(id)) {
        const handler = pendingMessages.current.get(id);
        pendingMessages.current.delete(id);
        handler({ success: true, data });
        return;
      }

      // Handle specific message types
      switch (type) {
        case 'connected':
          console.log('🎉 Connected to WebSocket server');
          if (data.requiresAuth && token) {
            // Authenticate immediately
            sendMessage(MESSAGE_TYPES.AUTH, { token });
          }
          break;

        case MESSAGE_TYPES.AUTH_SUCCESS:
          console.log('✅ WebSocket authentication successful');
          setAuthenticated(true);
          setError(null);
          break;

        case MESSAGE_TYPES.AUTH_ERROR:
          console.error('❌ WebSocket authentication failed:', data.message);
          setAuthenticated(false);
          setError(data.message);
          break;

        case MESSAGE_TYPES.ERROR:
          console.error('❌ WebSocket error:', data.message);
          setError(data.message);
          break;

        case MESSAGE_TYPES.PONG:
          // Handle pong response
          break;

        default:
          // Handle other message types with registered handlers
          if (messageHandlers.current.has(type)) {
            messageHandlers.current.get(type).forEach(handler => {
              handler(data);
            });
          }
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }, [token, sendMessage]);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Create WebSocket connection
      console.log('🔌 Connecting to WebSocket server...');
      socketRef.current = new WebSocket(WS_URL);

      const ws = socketRef.current;

      ws.onopen = () => {
        console.log('✅ WebSocket connection opened');
        setConnected(true);
        setError(null);
      };

      ws.onmessage = handleMessage;

      ws.onclose = (event) => {
        console.log('❌ WebSocket connection closed:', event.code, event.reason);
        setConnected(false);
        setAuthenticated(false);

        // Clear pending messages
        pendingMessages.current.clear();
      };

      ws.onerror = (error) => {
        console.error('🔥 WebSocket error:', error);
        setError('WebSocket connection error');
        setConnected(false);
        setAuthenticated(false);
      };

      // Cleanup on unmount or auth change
      return () => {
        if (ws) {
          ws.close();
        }
      };
    } else {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setConnected(false);
        setAuthenticated(false);
      }
    }
  }, [isAuthenticated, token, handleMessage]);

  // Register message handler
  const on = useCallback((messageType, handler) => {
    if (!messageHandlers.current.has(messageType)) {
      messageHandlers.current.set(messageType, new Set());
    }
    messageHandlers.current.get(messageType).add(handler);
  }, []);

  // Unregister message handler
  const off = useCallback((messageType, handler) => {
    if (messageHandlers.current.has(messageType)) {
      messageHandlers.current.get(messageType).delete(handler);
      if (messageHandlers.current.get(messageType).size === 0) {
        messageHandlers.current.delete(messageType);
      }
    }
  }, []);

  // Send message with promise-based response
  const emit = useCallback((messageType, data = {}) => {
    return new Promise((resolve) => {
      sendMessage(messageType, data, resolve);
    });
  }, [sendMessage]);

  // Ping server
  const ping = useCallback(() => {
    sendMessage(MESSAGE_TYPES.PING);
  }, [sendMessage]);

  return {
    connected: connected && authenticated,
    error,
    sendMessage,
    emit,
    on,
    off,
    ping
  };
};
