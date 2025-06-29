import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const SOCKET_URL = 'http://localhost:3000';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize socket connection
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: token
        },
        autoConnect: true
      });

      const socket = socketRef.current;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('✅ Connected to WebSocket server');
        setConnected(true);
        setError(null);
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from WebSocket server:', reason);
        setConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('🔥 WebSocket connection error:', error);
        setError(error.message);
        setConnected(false);
      });

      socket.on('connected', (data) => {
        console.log('🎉 Welcome message:', data);
      });

      // Cleanup on unmount or auth change
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    } else {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  // Socket methods
  const emit = (event, data, callback) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data, callback);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const on = (event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  };

  const off = (event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  };

  return {
    socket: socketRef.current,
    connected,
    error,
    emit,
    on,
    off
  };
};
