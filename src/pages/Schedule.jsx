import React, { useState, useEffect } from 'react';
import ScheduleCard from '../components/ScheduleCard';
import ScheduleForm from '../components/ScheduleForm';
import './Schedule.css';

const Schedule = () => {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('studysync_schedule');
    if (saved) {
      try {
        return JSON.parse(saved) || [];
      } catch (e) {
        console.error("Failed to parse schedule", e);
        return [];
      }
    }
    return [];
  });
  
  const [subjects, setSubjects] = useState(() => {
    const savedSubjects = localStorage.getItem('studysync_subjects');
    if (savedSubjects) {
      try {
        return JSON.parse(savedSubjects) || [];
      } catch (e) {
        console.error("Failed to parse subjects", e);
        return [];
      }
    }
    return [];
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [filter, setFilter] = useState('All'); // All, Today, Upcoming, Completed

  useEffect(() => {
    localStorage.setItem('studysync_schedule', JSON.stringify(sessions));
  }, [sessions]);

  const handleOpenForm = () => {
    setEditingSession(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSession(null);
  };

  const handleSaveSession = (data) => {
    if (editingSession) {
      setSessions(sessions.map(sess => 
        sess.id === editingSession.id 
          ? { ...sess, ...data } 
          : sess
      ));
    } else {
      const newSession = {
        id: crypto.randomUUID(),
        ...data,
        completed: false
      };
      setSessions([...sessions, newSession]);
    }
    handleCloseForm();
  };

  const handleDeleteSession = (id) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      setSessions(sessions.filter(sess => sess.id !== id));
    }
  };

  const handleToggleComplete = (id) => {
    setSessions(sessions.map(sess => 
      sess.id === id 
        ? { ...sess, completed: !sess.completed }
        : sess
    ));
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  // Get current date string in YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    // Use local time for today
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayString();

  // Filter and Sort
  const filteredSessions = sessions.filter(sess => {
    if (filter === 'Today') {
      return sess.date === todayStr;
    }
    if (filter === 'Upcoming') {
      return !sess.completed && sess.date >= todayStr;
    }
    if (filter === 'Completed') {
      return sess.completed;
    }
    return true; // 'All'
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    // Completed last
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Earlier date first
    if (a.date !== b.date) {
      return a.date > b.date ? 1 : -1;
    }
    // Earlier start time first
    return a.startTime > b.startTime ? 1 : -1;
  });

  return (
    <div className="generic-page schedule-page">
      <div className="page-header">
        <div>
          <h1>Study Schedule</h1>
          <p className="page-subtitle">Plan your study sessions and stay consistent.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenForm}>+ Add Study Session</button>
      </div>

      <div className="schedule-filters">
        <button 
          className={`filter-btn ${filter === 'All' ? 'active' : ''}`}
          onClick={() => setFilter('All')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'Today' ? 'active' : ''}`}
          onClick={() => setFilter('Today')}
        >
          Today
        </button>
        <button 
          className={`filter-btn ${filter === 'Upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('Upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`filter-btn ${filter === 'Completed' ? 'active' : ''}`}
          onClick={() => setFilter('Completed')}
        >
          Completed
        </button>
      </div>
      
      {sortedSessions.length === 0 ? (
        <div className="empty-state">
          <p>No study sessions found.</p>
        </div>
      ) : (
        <div className="schedule-list">
          {sortedSessions.map(session => (
            <ScheduleCard 
              key={session.id} 
              session={session}
              subjectName={getSubjectName(session.subjectId)}
              onEdit={handleEditSession}
              onDelete={handleDeleteSession}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <ScheduleForm 
          initialData={editingSession} 
          subjects={subjects}
          onSubmit={handleSaveSession} 
          onCancel={handleCloseForm} 
        />
      )}
    </div>
  );
};

export default Schedule;
