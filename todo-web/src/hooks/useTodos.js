import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { emit, on, off, connected } = useSocket();

  // Load todos on mount and when socket connects
  useEffect(() => {
    if (connected) {
      loadTodos();
      loadStats();
    }
  }, [connected]);

  // Set up real-time event listeners
  useEffect(() => {
    if (connected) {
      // Listen for real-time updates
      on('todos:created', (data) => {
        console.log('📝 Todo created via WebSocket:', data);
        if (data.success) {
          setTodos(prev => [data.data.todo, ...prev]);
          loadStats(); // Refresh stats
        }
      });

      on('todos:updated', (data) => {
        console.log('✏️ Todo updated via WebSocket:', data);
        if (data.success) {
          setTodos(prev => prev.map(todo => 
            todo._id === data.data.todo._id ? data.data.todo : todo
          ));
          loadStats(); // Refresh stats
        }
      });

      on('todos:deleted', (data) => {
        console.log('🗑️ Todo deleted via WebSocket:', data);
        if (data.success) {
          setTodos(prev => prev.filter(todo => todo._id !== data.data.id));
          loadStats(); // Refresh stats
        }
      });

      // Cleanup listeners
      return () => {
        off('todos:created');
        off('todos:updated');
        off('todos:deleted');
      };
    }
  }, [connected, on, off]);

  const loadTodos = useCallback(() => {
    if (!connected) {
      // Fallback to REST API
      loadTodosREST();
      return;
    }

    setLoading(true);
    setError(null);

    emit('todos:list', {}, (response) => {
      setLoading(false);
      if (response.success) {
        setTodos(response.data.todos);
      } else {
        setError(response.message);
        // Fallback to REST API
        loadTodosREST();
      }
    });
  }, [connected, emit]);

  const loadTodosREST = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/todos`);
      if (response.data.success) {
        setTodos(response.data.data.todos);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error loading todos via REST:', error);
      setError(error.response?.data?.message || 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = useCallback(() => {
    if (!connected) {
      loadStatsREST();
      return;
    }

    emit('todos:stats', {}, (response) => {
      if (response.success) {
        setStats(response.data.stats);
      } else {
        loadStatsREST();
      }
    });
  }, [connected, emit]);

  const loadStatsREST = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/todos/stats/summary`);
      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats via REST:', error);
    }
  };

  const createTodo = useCallback(async (todoData) => {
    if (!connected) {
      return createTodoREST(todoData);
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      emit('todos:create', todoData, (response) => {
        setLoading(false);
        if (response.success) {
          // Todo will be added via real-time event
          resolve({ success: true });
        } else {
          setError(response.message);
          resolve({ success: false, message: response.message });
        }
      });
    });
  }, [connected, emit]);

  const createTodoREST = async (todoData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/todos`, todoData);
      if (response.data.success) {
        setTodos(prev => [response.data.data.todo, ...prev]);
        loadStats();
        return { success: true };
      } else {
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create todo';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = useCallback(async (id, updateData) => {
    if (!connected) {
      return updateTodoREST(id, updateData);
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      emit('todos:update', { id, ...updateData }, (response) => {
        setLoading(false);
        if (response.success) {
          // Todo will be updated via real-time event
          resolve({ success: true });
        } else {
          setError(response.message);
          resolve({ success: false, message: response.message });
        }
      });
    });
  }, [connected, emit]);

  const updateTodoREST = async (id, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, updateData);
      if (response.data.success) {
        setTodos(prev => prev.map(todo => 
          todo._id === id ? response.data.data.todo : todo
        ));
        loadStats();
        return { success: true };
      } else {
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update todo';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = useCallback(async (id) => {
    if (!connected) {
      return deleteTodoREST(id);
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      emit('todos:delete', { id }, (response) => {
        setLoading(false);
        if (response.success) {
          // Todo will be removed via real-time event
          resolve({ success: true });
        } else {
          setError(response.message);
          resolve({ success: false, message: response.message });
        }
      });
    });
  }, [connected, emit]);

  const deleteTodoREST = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.delete(`${API_BASE_URL}/todos/${id}`);
      if (response.data.success) {
        setTodos(prev => prev.filter(todo => todo._id !== id));
        loadStats();
        return { success: true };
      } else {
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete todo';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    todos,
    stats,
    loading,
    error,
    loadTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    connected
  };
};
