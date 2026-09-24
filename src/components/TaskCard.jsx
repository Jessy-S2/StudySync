import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, subjectName, onEdit, onDelete, onToggleComplete }) => {
  const { title, description, dueDate, priority, completed } = task;

  return (
    <div className={`task-card ${completed ? 'completed' : ''}`}>
      <div className="task-card-header">
        <div className="task-card-title-group">
          <input 
            type="checkbox" 
            checked={completed} 
            onChange={() => onToggleComplete(task.id)}
            className="task-checkbox"
          />
          <h3 className="task-card-title">{title}</h3>
        </div>
        <div className="task-card-actions">
          <button type="button" className="icon-btn edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>Edit</button>
          <button type="button" className="icon-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>Delete</button>
        </div>
      </div>
      
      {description && <p className="task-card-description">{description}</p>}
      
      <div className="task-card-details">
        <span className="task-subject">{subjectName || 'Unknown Subject'}</span>
        <span className="task-due-date">Due: {dueDate}</span>
        <span className={`task-priority priority-${priority.toLowerCase()}`}>
          {priority}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;

