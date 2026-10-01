import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useUI } from './UIContext';
import { useSettings } from './SettingsContext';
import { useNotification } from './NotificationContext';
import './TimerContext.css';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within TimerProvider");
  return context;
};

export const TimerProvider = ({ children }) => {
  const { showConfirm, showAlert } = useUI();
  const { addNotification } = useNotification();
  
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('studysync_subjects');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [completedSessions, setCompletedSessions] = useState(() => {
    const saved = localStorage.getItem('studysync_study_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [customSubjectName, setCustomSubjectName] = useState('');
  const { settings } = useSettings();
  const [selectedDuration, setSelectedDuration] = useState(settings?.study?.defaultStudyDuration || 25);
  const [customDuration, setCustomDuration] = useState('');
  useEffect(() => {
    if (status === 'Idle') {
      setSelectedDuration(settings.study.defaultStudyDuration);
      setTimeLeft(settings.study.defaultStudyDuration * 60);
    }
  }, [settings.study.defaultStudyDuration]);
  
  const [status, setStatus] = useState('Idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  
  const endTimeRef = useRef(null);
  const stateRef = useRef({ selectedSubjectId, selectedDuration, customSubjectName, settings });
  
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => { stateRef.current = { selectedSubjectId, selectedDuration, customSubjectName, settings }; }, [selectedSubjectId, selectedDuration, customSubjectName, settings]);

  useEffect(() => {
    localStorage.setItem('studysync_study_sessions', JSON.stringify(completedSessions));
  }, [completedSessions]);

  const updateSubjects = useCallback(() => {
    const saved = localStorage.getItem('studysync_subjects');
    if (saved) setSubjects(JSON.parse(saved));
  }, []);

  useEffect(() => {
    window.addEventListener('storage', updateSubjects);
    return () => window.removeEventListener('storage', updateSubjects);
  }, [updateSubjects]);

    const isCompletingRef = useRef(false);

  const handleCompletion = useCallback(() => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    setStatus('Idle');
    
    const { selectedSubjectId, selectedDuration, customSubjectName } = stateRef.current;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    
    const newSession = {
      id: crypto.randomUUID(),
      subjectId: selectedSubjectId,
      customSubjectName: selectedSubjectId === 'custom' ? customSubjectName.trim() : '',
      duration: selectedDuration,
      date: `${y}-${m}-${d}`,
      completedAt: new Date().toISOString()
    };
    
    setCompletedSessions(prev => [newSession, ...prev]);
    setShowPopup(true);
    
    const { settings: currentSettings } = stateRef.current;
    if (currentSettings?.notifications?.timerCompletion) {
      addNotification({
        id: `timer-complete-${newSession.id}`,
        type: 'timer',
        title: 'Study Session Complete',
        message: `Your ${newSession.duration}-minute study session has completed.`,
        route: '/timer'
      });
    }
    
    // Auto-reset
    endTimeRef.current = null;
    setTimeLeft(selectedDuration * 60);

    // Release lock after a brief moment to prevent strict-mode double firing
    setTimeout(() => {
      isCompletingRef.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    let interval;
    if (status === 'Studying') {
      interval = setInterval(() => {
        if (!endTimeRef.current) return;
        const now = Date.now();
        const remaining = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          handleCompletion();
        }
      }, 200);
    }
    return () => clearInterval(interval);
  }, [status, handleCompletion]);

    const handleStart = () => {
    if (!selectedSubjectId || selectedDuration <= 0) return;
    if (selectedSubjectId === 'custom' && !customSubjectName.trim()) {
      showAlert("Please enter a custom subject.", "error");
      return;
    }
    setStatus('Studying');
    endTimeRef.current = Date.now() + (timeLeft * 1000);
  };

  const handlePause = () => {
    setStatus('Paused');
    endTimeRef.current = null;
  };

  const handleResume = () => {
    setStatus('Studying');
    endTimeRef.current = Date.now() + (timeLeft * 1000);
  };

  const handleReset = () => {
    setStatus('Idle');
    endTimeRef.current = null;
    setTimeLeft(selectedDuration * 60);
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

  const handleClearSessions = () => {
    showConfirm("Clear Sessions", "Are you sure you want to clear all recent study sessions?", () => {
      setCompletedSessions([]);
      showAlert("Sessions cleared.", "info");
    });
  };
  
  const closePopup = () => setShowPopup(false);

  const value = {
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
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
      
      {showPopup && (
        <div className="timer-popup-overlay">
          <div className="timer-popup-content">
            
            <h2>Study Session Complete!</h2>
            <p>Your study timer has finished.</p>
            <button className="btn-primary" onClick={closePopup}>OK</button>
          </div>
        </div>
      )}
    </TimerContext.Provider>
  );
};






