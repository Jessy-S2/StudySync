import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import './FloatingTimer.css';

const FloatingTimer = () => {
  const { status, timeLeft, handlePause, handleResume } = useTimer();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  // Only show if not on timer page, and timer is not idle
  if (location.pathname === '/timer' || status === 'Idle' || status === 'Completed') {
    return null;
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePointerDown = (e) => {
    // Only drag on the main body, not on buttons
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) {
      return;
    }
    
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    let newX = dragRef.current.initialX + dx;
    let newY = dragRef.current.initialY + dy;
    
    // Bounds check
    const maxX = window.innerWidth - 200; // approx width
    const maxY = window.innerHeight - 80; // approx height
    
    newX = Math.max(10, Math.min(newX, maxX));
    newY = Math.max(10, Math.min(newY, maxY));
    
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      className="floating-timer"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="ft-indicator">
        {status === 'Studying' ? (<svg viewBox="0 0 24 24" width="12" height="12" fill="#10B981"><circle cx="12" cy="12" r="10"/></svg>) : (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>)}
      </div>
      <div className="ft-time" onClick={() => navigate('/timer')} title="Open Timer">
        {formatTime(timeLeft)}
      </div>
      <div className="ft-controls">
        {status === 'Studying' ? (
          <button onClick={handlePause} title="Pause"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg></button>
        ) : (
          <button onClick={handleResume} title="Resume"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
        )}
      </div>
    </div>
  );
};

export default FloatingTimer;
