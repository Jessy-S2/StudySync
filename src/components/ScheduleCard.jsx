import React from 'react';
import './ScheduleCard.css';

const ScheduleCard = ({ session, subjectName, onEdit, onDelete, onToggleComplete }) => {
  const { date, startTime, duration, notes, completed } = session;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`schedule-card ${completed ? 'completed' : ''}`}>
      <div className="schedule-card-header">
        <div className="schedule-card-title-group">
          <input 
            type="checkbox" 
            checked={completed} 
            onChange={() => onToggleComplete(session.id)}
            className="schedule-checkbox"
          />
          <h3 className="schedule-card-title">{subjectName || 'Unknown Subject'}</h3>
        </div>
        <div className="schedule-card-actions">
          <button className="icon-btn edit-btn" onClick={() => onEdit(session)}>Edit</button>
          <button className="icon-btn delete-btn" onClick={() => onDelete(session.id)}>Delete</button>
        </div>
      </div>
      
      <div className="schedule-card-details">
        <div className="schedule-time-block">
          <span className="schedule-time">{startTime}</span>
          <span className="schedule-duration">{duration} min</span>
        </div>
        <div className="schedule-info-block">
          <span className="schedule-date">{formatDate(date)}</span>
          {notes && <p className="schedule-notes">{notes}</p>}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
