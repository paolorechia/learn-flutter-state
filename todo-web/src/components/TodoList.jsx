import React, { useState } from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ todos, onUpdate, onDelete, loading, stats }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTodos = todos.filter(todo => {
    // Filter by completion status
    if (filter === 'completed' && !todo.completed) return false;
    if (filter === 'pending' && todo.completed) return false;
    if (filter === 'high' && todo.priority !== 'high') return false;
    if (filter === 'medium' && todo.priority !== 'medium') return false;
    if (filter === 'low' && todo.priority !== 'low') return false;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        todo.title.toLowerCase().includes(searchLower) ||
        todo.description.toLowerCase().includes(searchLower) ||
        (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date sorting
    if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'dueDate') {
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    }

    // Handle string sorting
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="todo-list-container">
      <div className="todo-list-header">
        <h3>Your Todos</h3>
        
        {stats && (
          <div className="todo-stats">
            <span className="stat">Total: {stats.total}</span>
            <span className="stat">Completed: {stats.completed}</span>
            <span className="stat">Pending: {stats.pending}</span>
          </div>
        )}
      </div>

      <div className="todo-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search todos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <div className="sort-container">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
            <option value="dueDate">Due Date</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
          </select>
          
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <div className="todo-list">
        {loading && <div className="loading">Loading todos...</div>}
        
        {!loading && sortedTodos.length === 0 && (
          <div className="no-todos">
            {searchTerm || filter !== 'all' 
              ? 'No todos match your current filters.' 
              : 'No todos yet. Create your first todo above!'}
          </div>
        )}

        {sortedTodos.map(todo => (
          <TodoItem
            key={todo._id}
            todo={todo}
            onUpdate={onUpdate}
            onDelete={onDelete}
            loading={loading}
          />
        ))}
      </div>

      {sortedTodos.length > 0 && (
        <div className="todo-summary">
          Showing {sortedTodos.length} of {todos.length} todos
        </div>
      )}
    </div>
  );
};

export default TodoList;
