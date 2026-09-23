import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('studysync_subjects');
    return saved ? JSON.parse(saved) : [];
  });

  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem('studysync_units');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('studysync_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('studysync_schedule');
    return saved ? JSON.parse(saved) : [];
  });

  const [studySessions, setStudySessions] = useState(() => {
    const saved = localStorage.getItem('studysync_study_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;

  const totalStudyMinutes = studySessions.reduce((total, sess) => total + sess.duration, 0);
  const totalStudyHours = Math.floor(totalStudyMinutes / 60);
  const remainderMinutes = Math.floor(totalStudyMinutes % 60);
  const formattedStudyTime = totalStudyHours > 0 ? `${totalStudyHours}h ${remainderMinutes}m` : `${remainderMinutes}m`;

  const upcomingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayString();
  const todaysSessions = schedule
    .filter(s => s.date === todayStr)
    .sort((a, b) => a.startTime > b.startTime ? 1 : -1);

  const getSubjectName = (id) => {
    const sub = subjects.find(s => s.id === id);
    return sub ? sub.name : 'Unknown';
  };

  const getSubjectUnitsCount = (id) => {
    return units.filter(u => u.subjectId === id).length;
  };

  const getSubjectTasksCount = (id) => {
    return tasks.filter(t => t.subjectId === id && !t.completed).length;
  };

  const accentColors = ['#5B3A8E', '#3498db', '#27ae60', '#e67e22', '#e84393', '#00cec9'];

  return (
    <div className="dashboard">
      
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome back, Student! <span className="wave">👋</span></h1>
          <p>Ready to make progress today? Here's what's happening in your workspace.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(91, 58, 142, 0.2)', color: '#9b59b6' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Subjects</span>
            <span className="stat-value">{subjects.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(52, 152, 219, 0.2)', color: '#3498db' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Study Time</span>
            <span className="stat-value">{formattedStudyTime}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(230, 126, 34, 0.2)', color: '#e67e22' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Tasks</span>
            <span className="stat-value">{activeTasks}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(39, 174, 96, 0.2)', color: '#2ecc71' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Completed Tasks</span>
            <span className="stat-value">{completedTasks}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        {/* Left Column */}
        <div className="dash-col">
          
          {/* Subjects Grid */}
          <section className="dash-section">
            <div className="section-header">
              <h2>My Subjects</h2>
              <button className="view-all-btn" onClick={() => navigate('/subjects')}>View all</button>
            </div>
            
            {subjects.length === 0 ? (
              <div className="dash-empty">
                <p>No subjects added yet. Start by adding a subject!</p>
                <button className="btn-primary" style={{marginTop: '15px'}} onClick={() => navigate('/subjects')}>Add Subject</button>
              </div>
            ) : (
              <div className="subject-cards-grid">
                {subjects.slice(0, 4).map((sub, idx) => {
                  const color = accentColors[idx % accentColors.length];
                  return (
                    <div key={sub.id} className="modern-subject-card" onClick={() => navigate(`/subjects/${sub.id}`)}>
                      <div className="card-top">
                        <div className="sub-icon" style={{ backgroundColor: color }}>
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        </div>
                        <div className="sub-tasks-badge">{getSubjectTasksCount(sub.id)} active tasks</div>
                      </div>
                      <h3>{sub.name}</h3>
                      <p>{getSubjectUnitsCount(sub.id)} units</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Today's Schedule */}
          <section className="dash-section">
            <div className="section-header">
              <h2>Today's Schedule</h2>
              <button className="view-all-btn" onClick={() => navigate('/schedule')}>View full schedule</button>
            </div>
            
            {todaysSessions.length === 0 ? (
              <div className="dash-empty">
                <p>No sessions scheduled for today. You have free time!</p>
              </div>
            ) : (
              <div className="schedule-list">
                {todaysSessions.map(sess => (
                  <div key={sess.id} className={`schedule-item ${sess.completed ? 'completed' : ''}`}>
                    <div className="sch-time">{sess.startTime}</div>
                    <div className="sch-details">
                      <h4>{getSubjectName(sess.subjectId)}</h4>
                      <p>{sess.duration} min session</p>
                    </div>
                    <div className="sch-status">
                      {sess.completed ? (
                        <span className="badge badge-success">Done</span>
                      ) : (
                        <span className="badge badge-pending">Upcoming</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column */}
        <div className="dash-col">
          
          {/* Recent/Upcoming Tasks */}
          <section className="dash-section">
            <div className="section-header">
              <h2>Upcoming Tasks</h2>
              <button className="view-all-btn" onClick={() => navigate('/tasks')}>View all</button>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="dash-empty">
                <p>You're all caught up on tasks!</p>
              </div>
            ) : (
              <div className="task-list">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-left">
                      <div className={`priority-indicator priority-${task.priority.toLowerCase()}`}></div>
                      <div className="task-info">
                        <h4>{task.title}</h4>
                        <p>{getSubjectName(task.subjectId)} • Due: {task.dueDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
