import React from 'react';
import TimerDisplay from '../components/TimerDisplay';
import TimerControls from '../components/TimerControls';
import StudySessionCard from '../components/StudySessionCard';
import './StudyTimer.css';
import { useTimer } from '../context/TimerContext';

const PRESETS = [15, 25, 45, 60];

const StudyTimer = () => {
  const {
    subjects,
    completedSessions,
    selectedSubjectId,
    selectedDuration,
    customDuration,
    customSubjectName,
    setCustomSubjectName,
    status,
    timeLeft,
    handleStart,
    handlePause,
    handleResume,
    handleReset,
    handleDurationSelect,
    handleCustomDurationChange,
    handleSubjectChange,
    handleClearSessions
  } = useTimer();

    const getSubjectName = (id) => {
    if (id === 'custom') return customSubjectName || 'Custom Subject';
    const sub = subjects.find(s => s.id === id);
    return sub ? sub.name : 'Unknown Subject';
  };

  const recentSessions = completedSessions.slice(0, 5);

  return (
    <div className="generic-page study-timer-page">
      <div className="page-header">
        <h1>Study Timer</h1>
      </div>

      <div className="timer-layout">
        <div className="timer-main-column">
          <div className="timer-setup-card">
            
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
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {selectedSubjectId === 'custom' && (
                  <div className="form-group" style={{ marginTop: '-5px', marginBottom: '15px' }}>
                    <label>Custom Subject</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Machine Learning" 
                      value={customSubjectName} 
                      onChange={(e) => setCustomSubjectName(e.target.value)}
                      disabled={status !== 'Idle'}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #dcdde1', borderRadius: '6px', fontSize: '15px', outline: 'none' }}
                    />
                  </div>
                )}

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
                    subjectName={sess.subjectId === 'custom' ? sess.customSubjectName : getSubjectName(sess.subjectId)}
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






