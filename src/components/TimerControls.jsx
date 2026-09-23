import React from 'react';
import './TimerControls.css';

const TimerControls = ({ 
  status, 
  onStart, 
  onPause, 
  onResume, 
  onReset,
  disabled 
}) => {
  return (
    <div className="timer-controls">
      {status === 'Idle' && (
        <button 
          className="btn-control start" 
          onClick={onStart}
          disabled={disabled}
        >
          Start
        </button>
      )}
      
      {status === 'Studying' && (
        <button 
          className="btn-control pause" 
          onClick={onPause}
        >
          Pause
        </button>
      )}
      
      {status === 'Paused' && (
        <button 
          className="btn-control resume" 
          onClick={onResume}
        >
          Resume
        </button>
      )}
      
      {status !== 'Idle' && (
        <button 
          className="btn-control reset" 
          onClick={onReset}
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default TimerControls;
