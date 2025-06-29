import React, { useState } from 'react';

const TodoItem = ({ todo, onUpdate, onDelete, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    completed: todo.completed
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      completed: todo.completed
    });
  };

  const handleSave = () => {
    onUpdate(todo._id, editData);
    setIsEditing(false);
  };

  const handleToggleComplete = () => {
    onUpdate(todo._id, { completed: !todo.completed });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      onDelete(todo._id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString();
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  if (isEditing) {
    return (
      <div className="todo-item editing">
        <div className="todo-edit-form">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="edit-title"
            disabled={loading}
          />
          
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="edit-description"
            rows={2}
            disabled={loading}
          />
          
          <div className="edit-controls">
            <select
              value={editData.priority}
              onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editData.completed}
                onChange={(e) => setEditData({ ...editData, completed: e.target.checked })}
                disabled={loading}
              />
              Completed
            </label>
          </div>
          
          <div className="edit-buttons">
            <button onClick={handleSave} disabled={loading} className="save-button">
              Save
            </button>
            <button onClick={handleCancel} disabled={loading} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${getPriorityClass(todo.priority)}`}>
      <div className="todo-content">
        <div className="todo-header">
          <h4 className="todo-title">{todo.title}</h4>
          <div className="todo-meta">
            <span className={`priority-badge ${getPriorityClass(todo.priority)}`}>
              {todo.priority}
            </span>
            {todo.dueDate && (
              <span className="due-date">
                Due: {formatDate(todo.dueDate)}
              </span>
            )}
          </div>
        </div>
        
        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}
        
        {todo.tags && todo.tags.length > 0 && (
          <div className="todo-tags">
            {todo.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="todo-dates">
          <small>Created: {formatDate(todo.createdAt)}</small>
          {todo.updatedAt !== todo.createdAt && (
            <small>Updated: {formatDate(todo.updatedAt)}</small>
          )}
        </div>
      </div>
      
      <div className="todo-actions">
        <button
          onClick={handleToggleComplete}
          disabled={loading}
          className={`toggle-button ${todo.completed ? 'uncomplete' : 'complete'}`}
        >
          {todo.completed ? '↶ Undo' : '✓ Done'}
        </button>
        
        <button
          onClick={handleEdit}
          disabled={loading}
          className="edit-button"
        >
          ✏️ Edit
        </button>
        
        <button
          onClick={handleDelete}
          disabled={loading}
          className="delete-button"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
