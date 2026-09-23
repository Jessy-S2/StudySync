import React from 'react';
import './TimerDisplay.css';

const TimerDisplay = ({ timeLeft, status, subjectName, duration }) => {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer-display-container">
      {subjectName && (
        <div className="timer-header">
          <h3 className="timer-subject">{subjectName}</h3>
          <p className="timer-duration-info">{duration} minute session</p>
        </div>
      )}
      
      <div className={`timer-circle ${status.toLowerCase()}`}>
        <div className="timer-time">{formatTime(timeLeft)}</div>
        <div className="timer-status">Status: {status}</div>
      </div>
    </div>
  );
};

export default TimerDisplay;
