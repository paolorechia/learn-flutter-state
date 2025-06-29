import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { useTodos } from './hooks/useTodos';
import './App.css';

const TodoApp = () => {
  const { user, logout } = useAuth();
  const { todos, stats, loading, error, createTodo, updateTodo, deleteTodo, connected } = useTodos();

  const handleCreateTodo = async (todoData) => {
    const result = await createTodo(todoData);
    if (!result.success) {
      alert(`Failed to create todo: ${result.message}`);
    }
  };

  const handleUpdateTodo = async (id, updateData) => {
    const result = await updateTodo(id, updateData);
    if (!result.success) {
      alert(`Failed to update todo: ${result.message}`);
    }
  };

  const handleDeleteTodo = async (id) => {
    const result = await deleteTodo(id);
    if (!result.success) {
      alert(`Failed to delete todo: ${result.message}`);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Todo Debug App</h1>
        <div className="header-info">
          <div className="connection-status">
            <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? '🟢 WebSocket Connected' : '🔴 Using REST API'}
            </span>
          </div>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            ⚠️ Error: {error}
          </div>
        )}

        <TodoForm onSubmit={handleCreateTodo} loading={loading} />

        <TodoList
          todos={todos}
          stats={stats}
          onUpdate={handleUpdateTodo}
          onDelete={handleDeleteTodo}
          loading={loading}
        />
      </main>
    </div>
  );
};

const AuthWrapper = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return isLogin ? (
      <Login onToggleMode={() => setIsLogin(false)} />
    ) : (
      <Register onToggleMode={() => setIsLogin(true)} />
    );
  }

  return <TodoApp />;
};

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

export default App;
