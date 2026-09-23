import React from 'react';
import './StudySessionCard.css';

const StudySessionCard = ({ session, subjectName }) => {
  const { duration, completedAt } = session;

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString();
  };

  return (
    <div className="study-session-card">
      <div className="session-card-info">
        <span className="session-subject">{subjectName || 'Unknown Subject'}</span>
        <span className="session-meta">
          {formatDate(completedAt)} at {formatTime(completedAt)}
        </span>
      </div>
      <div className="session-card-duration">
        {duration} min
      </div>
    </div>
  );
};

export default StudySessionCard;
