import React from 'react';
import './SubjectCard.css';

const SubjectCard = ({ subject, unitCount = 0, onClick, onEdit, onDelete }) => {
  const { name, description } = subject;
  
  return (
    <div className="subject-card" onClick={() => onClick && onClick(subject.id)} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="subject-card-header">
        <h3 className="subject-card-title">{name}</h3>
        <div className="subject-card-actions">
          <button className="icon-btn edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(subject); }}>Edit</button>
          <button className="icon-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(subject.id); }}>Delete</button>
        </div>
      </div>
      
      {description && <p className="subject-card-description">{description}</p>}
      
      <div className="subject-card-stats">
        <span className="stat-label">{unitCount} {unitCount === 1 ? "unit" : "units"}</span>
      </div>
    </div>
  );
};

export default SubjectCard;
