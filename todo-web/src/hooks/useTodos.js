import { useState, useEffect, useCallback } from 'react';
import { useSocket, MESSAGE_TYPES } from './useSocket';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { emit, on, off, connected } = useSocket();

  // Define loadStats first to avoid circular dependency
  const loadStats = useCallback(async () => {
    if (!connected) {
      loadStatsREST();
      return;
    }

    try {
      const response = await emit(MESSAGE_TYPES.TODOS_STATS, {});
      if (response.success && response.data.stats) {
        setStats(response.data.stats);
      } else {
        loadStatsREST();
      }
    } catch (error) {
      loadStatsREST();
    }
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

  const loadTodos = useCallback(async () => {
    if (!connected) {
      // Fallback to REST API
      loadTodosREST();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await emit(MESSAGE_TYPES.TODOS_LIST, {});
      setLoading(false);
      if (response.success && response.data.todos) {
        setTodos(response.data.todos);
      } else {
        setError(response.data?.message || 'Failed to load todos');
        // Fallback to REST API
        loadTodosREST();
      }
    } catch (error) {
      setLoading(false);
      setError('Failed to load todos');
      loadTodosREST();
    }
  }, [connected, emit]);

  // Load todos on mount and when socket connects
  useEffect(() => {
    if (connected) {
      loadTodos();
      loadStats();
    }
  }, [connected, loadTodos, loadStats]);

  // Set up real-time event listeners
  useEffect(() => {
    if (connected) {
      // Listen for real-time updates
      const handleTodoCreated = (data) => {
        console.log('📝 Todo created via WebSocket:', data);
        if (data.todo) {
          setTodos(prev => [data.todo, ...prev]);
          loadStats(); // Refresh stats
        }
      };

      const handleTodoUpdated = (data) => {
        console.log('✏️ Todo updated via WebSocket:', data);
        if (data.todo) {
          setTodos(prev => prev.map(todo =>
            todo._id === data.todo._id ? data.todo : todo
          ));
          loadStats(); // Refresh stats
        }
      };

      const handleTodoDeleted = (data) => {
        console.log('🗑️ Todo deleted via WebSocket:', data);
        if (data.id) {
          setTodos(prev => prev.filter(todo => todo._id !== data.id));
          loadStats(); // Refresh stats
        }
      };

      on(MESSAGE_TYPES.TODO_CREATED, handleTodoCreated);
      on(MESSAGE_TYPES.TODO_UPDATED, handleTodoUpdated);
      on(MESSAGE_TYPES.TODO_DELETED, handleTodoDeleted);

      // Cleanup listeners
      return () => {
        off(MESSAGE_TYPES.TODO_CREATED, handleTodoCreated);
        off(MESSAGE_TYPES.TODO_UPDATED, handleTodoUpdated);
        off(MESSAGE_TYPES.TODO_DELETED, handleTodoDeleted);
      };
    }
  }, [connected, on, off, loadStats]);





  const createTodo = useCallback(async (todoData) => {
    if (!connected) {
      return createTodoREST(todoData);
    }

    setLoading(true);
    setError(null);

    try {
      const response = await emit(MESSAGE_TYPES.TODOS_CREATE, todoData);
      setLoading(false);
      if (response.success) {
        // Todo will be added via real-time event
        return { success: true };
      } else {
        const message = response.data?.message || 'Failed to create todo';
        setError(message);
        return { success: false, message };
      }
    } catch (error) {
      setLoading(false);
      const message = 'Failed to create todo';
      setError(message);
      return { success: false, message };
    }
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

    try {
      const response = await emit(MESSAGE_TYPES.TODOS_UPDATE, { id, ...updateData });
      setLoading(false);
      if (response.success) {
        // Todo will be updated via real-time event
        return { success: true };
      } else {
        const message = response.data?.message || 'Failed to update todo';
        setError(message);
        return { success: false, message };
      }
    } catch (error) {
      setLoading(false);
      const message = 'Failed to update todo';
      setError(message);
      return { success: false, message };
    }
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

    try {
      const response = await emit(MESSAGE_TYPES.TODOS_DELETE, { id });
      setLoading(false);
      if (response.success) {
        // Todo will be removed via real-time event
        return { success: true };
      } else {
        const message = response.data?.message || 'Failed to delete todo';
        setError(message);
        return { success: false, message };
      }
    } catch (error) {
      setLoading(false);
      const message = 'Failed to delete todo';
      setError(message);
      return { success: false, message };
    }
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
