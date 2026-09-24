import React, { useState, useEffect } from 'react';
import ScheduleCard from '../components/ScheduleCard';
import ScheduleForm from '../components/ScheduleForm';
import MonthlyCalendar from '../components/MonthlyCalendar';
import './Schedule.css';
import { useUI } from '../context/UIContext';

const Schedule = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('studysync_schedule_view');
    return saved === 'monthly' ? 'monthly' : 'daily';
  });

  useEffect(() => {
    localStorage.setItem('studysync_schedule_view', activeTab);
  }, [activeTab]);

  const { showConfirm, showAlert } = useUI();
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('studysync_schedule');
    if (saved) {
      try {
        return JSON.parse(saved) || [];
      } catch (e) {
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
        return [];
      }
    }
    return [];
  });

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('studysync_tasks');
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks) || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [filter, setFilter] = useState('All');

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
    showConfirm("Delete Session", "Are you sure you want to delete this session?", () => {
      setSessions(sessions.filter(sess => sess.id !== id));
      showAlert("Session deleted.", "info");
    });
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

  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayString();

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
    return true; 
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (a.date !== b.date) {
      return a.date > b.date ? 1 : -1;
    }
    return a.startTime > b.startTime ? 1 : -1;
  });

  return (
    <div className="generic-page schedule-page">
      <div className="page-header">
        <div>
          <h1>Schedule</h1>
          <p className="page-subtitle">Plan your study sessions and track events.</p>
        </div>
        {activeTab === 'daily' && (
          <button className="btn-primary" onClick={handleOpenForm}>+ Add Study Session</button>
        )}
      </div>

      <div className="details-tabs">
        <button 
          className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Daily Schedule
        </button>
        <button 
          className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Schedule
        </button>
      </div>

      <div className="tab-content-container" style={{ padding: activeTab === 'monthly' ? '30px' : '0', background: activeTab === 'monthly' ? '#FFFFFF' : 'transparent', border: activeTab === 'monthly' ? '1px solid #E6E4EF' : 'none', minHeight: 'auto' }}>
        
        {activeTab === 'daily' && (
          <>
            <div className="schedule-filters">
              <button className={`filter-btn ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>All</button>
              <button className={`filter-btn ${filter === 'Today' ? 'active' : ''}`} onClick={() => setFilter('Today')}>Today</button>
              <button className={`filter-btn ${filter === 'Upcoming' ? 'active' : ''}`} onClick={() => setFilter('Upcoming')}>Upcoming</button>
              <button className={`filter-btn ${filter === 'Completed' ? 'active' : ''}`} onClick={() => setFilter('Completed')}>Completed</button>
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
          </>
        )}

        {activeTab === 'monthly' && (
          <MonthlyCalendar tasks={tasks} sessions={sessions} subjects={subjects} />
        )}
      </div>

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




