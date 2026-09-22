import React from 'react';
import './SubjectCard.css';

const SubjectCard = ({ subject, onEdit, onDelete }) => {
  const { name, description, targetHours, currentHours } = subject;
  
  const progressPercent = targetHours > 0 
    ? Math.min(Math.round((currentHours / targetHours) * 100), 100) 
    : 0;

  return (
    <div className="subject-card">
      <div className="subject-card-header">
        <h3 className="subject-card-title">{name}</h3>
        <div className="subject-card-actions">
          <button className="icon-btn edit-btn" onClick={() => onEdit(subject)}>Edit</button>
          <button className="icon-btn delete-btn" onClick={() => onDelete(subject.id)}>Delete</button>
        </div>
      </div>
      
      {description && <p className="subject-card-description">{description}</p>}
      
      <div className="subject-card-stats">
        <div className="stat">
          <span className="stat-label">Current</span>
          <span className="stat-value">{currentHours}h</span>
        </div>
        <div className="stat">
          <span className="stat-label">Target</span>
          <span className="stat-value">{targetHours}h</span>
        </div>
      </div>
      
      <div className="subject-card-progress">
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="progress-value">{progressPercent}%</div>
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;
