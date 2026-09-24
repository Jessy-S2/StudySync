import React, { useState, useEffect, useRef } from 'react';
import TimerDisplay from '../components/TimerDisplay';
import TimerControls from '../components/TimerControls';
import StudySessionCard from '../components/StudySessionCard';
import './StudyTimer.css';
import { useUI } from '../context/UIContext';

const PRESETS = [25, 45, 60];

const StudyTimer = () => {
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('studysync_subjects');
    if (saved) {
      try {
        return JSON.parse(saved) || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const { showConfirm, showAlert } = useUI();
  const [completedSessions, setCompletedSessions] = useState(() => {
    const saved = localStorage.getItem('studysync_study_sessions');
    if (saved) {
      try {
        return JSON.parse(saved) || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(25); // in minutes
  const [customDuration, setCustomDuration] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [status, setStatus] = useState('Idle'); // Idle, Studying, Paused, Completed

  const timerRef = useRef(null);

  // Sync saved sessions
  useEffect(() => {
    localStorage.setItem('studysync_study_sessions', JSON.stringify(completedSessions));
  }, [completedSessions]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (status === 'Studying' && timeLeft === 0) {
      clearInterval(timerRef.current);
      handleCompletion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, status]);

  const handleStart = () => {
    if (!selectedSubjectId || selectedDuration <= 0) return;
    setStatus('Studying');
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
  };

  const handlePause = () => {
    setStatus('Paused');
    clearInterval(timerRef.current);
  };

  const handleResume = () => {
    setStatus('Studying');
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
  };

  const handleReset = () => {
    setStatus('Idle');
    clearInterval(timerRef.current);
    setTimeLeft(selectedDuration * 60);
  };

  const handleCompletion = () => {
    setStatus('Completed');
    
    // Save session
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const newSession = {
      id: crypto.randomUUID(),
      subjectId: selectedSubjectId,
      duration: selectedDuration,
      date: dateStr,
      completedAt: new Date().toISOString()
    };
    
    setCompletedSessions(prev => [newSession, ...prev]);
  };

  const handleDurationSelect = (mins) => {
    if (status !== 'Idle') return;
    setSelectedDuration(mins);
    setCustomDuration('');
    setTimeLeft(mins * 60);
  };

  const handleCustomDurationChange = (e) => {
    if (status !== 'Idle') return;
    const val = e.target.value;
    setCustomDuration(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedDuration(parsed);
      setTimeLeft(Math.floor(parsed * 60));
    }
  };

  const handleSubjectChange = (e) => {
    if (status !== 'Idle') return;
    setSelectedSubjectId(e.target.value);
  };

  const getSubjectName = (id) => {
    const sub = subjects.find(s => s.id === id);
    return sub ? sub.name : 'Unknown Subject';
  };

  const handleClearSessions = () => {
    showConfirm("Clear Sessions", "Are you sure you want to clear all recent study sessions?", () => {
      setCompletedSessions([]);
      showAlert("Sessions cleared.", "info");
    });
  };

  // Recent 5
  const recentSessions = completedSessions.slice(0, 5);

  return (
    <div className="generic-page study-timer-page">
      <div className="page-header">
        <h1>Study Timer</h1>
      </div>

      <div className="timer-layout">
        <div className="timer-main-column">
          <div className="timer-setup-card">
            {subjects.length === 0 ? (
              <div className="empty-state">
                <p>No subjects available. Add a subject first.</p>
              </div>
            ) : (
              <div className="setup-controls">
                <div className="form-group">
                  <label>Select Subject</label>
                  <select 
                    value={selectedSubjectId} 
                    onChange={handleSubjectChange}
                    disabled={status !== 'Idle'}
                  >
                    <option value="">-- Choose Subject --</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="duration-selector">
                  <label>Duration</label>
                  <div className="duration-options">
                    {PRESETS.map(preset => (
                      <button 
                        key={preset}
                        className={`preset-btn ${selectedDuration === preset && customDuration === '' ? 'active' : ''}`}
                        onClick={() => handleDurationSelect(preset)}
                        disabled={status !== 'Idle'}
                      >
                        {preset} min
                      </button>
                    ))}
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="Custom"
                      className="custom-duration-input"
                      value={customDuration}
                      onChange={handleCustomDurationChange}
                      disabled={status !== 'Idle'}
                      min="0.1"
                    />
                  </div>
                </div>
              </div>
            )}

            <TimerDisplay 
              timeLeft={timeLeft}
              status={status}
              subjectName={selectedSubjectId ? getSubjectName(selectedSubjectId) : ''}
              duration={selectedDuration}
            />

            {status === 'Completed' && (
              <div className="completion-message">
                Study session completed!
              </div>
            )}

            <TimerControls 
              status={status}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onReset={handleReset}
              disabled={!selectedSubjectId || selectedDuration <= 0}
            />
          </div>
        </div>

        <div className="timer-side-column">
          <div className="side-card recent-sessions">
            <div className="recent-sessions-header">
              <h3>Recent Study Sessions</h3>
              {completedSessions.length > 0 && (
                <button 
                  className="btn-clear-sessions"
                  onClick={handleClearSessions}
                >
                  Clear
                </button>
              )}
            </div>
            
            {recentSessions.length === 0 ? (
              <p className="empty-sessions">No study sessions completed yet.</p>
            ) : (
              <div className="recent-sessions-list">
                {recentSessions.map(sess => (
                  <StudySessionCard 
                    key={sess.id}
                    session={sess}
                    subjectName={getSubjectName(sess.subjectId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;


