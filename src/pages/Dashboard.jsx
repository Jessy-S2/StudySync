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

  const getSubjectName = (subjectId) => {
    const sub = subjects.find(s => s.id === subjectId);
    return sub ? sub.name : 'Unknown Subject';
  };

  const PASTEL_COLORS = ['#EDE7FF', '#E8F4FF', '#FFF3E3', '#E8FAF0', '#FFEAF2'];
  const getSubjectColor = (idx) => PASTEL_COLORS[idx % PASTEL_COLORS.length];

  // Quick Calendar logic
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // Sunday is 0
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renderMiniCalendar = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="mini-cal-cell empty"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate();
      cells.push(
        <div key={`day-${d}`} className={`mini-cal-cell ${isToday ? 'today' : ''}`}>
          {d}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome back, Student! <span className="wave">👋</span></h1>
          <p>Small steps today lead to big achievements tomorrow.<br/>Keep going! You're doing great!</p>
        </div>
        <div className="hero-decoration">
          <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="#7C3AED" fillOpacity="0.1" />
            <path d="M30 70 L70 30" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
            <path d="M40 70 L70 40" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="dashboard-stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">TOTAL SUBJECTS</div>
            <div className="stat-value">{subjects.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">ACTIVE TASKS</div>
            <div className="stat-value">{activeTasks}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">COMPLETED TASKS</div>
            <div className="stat-value">{completedTasks}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main-col">
          <div className="section-header">
            <h2>My Subjects</h2>
            <button className="view-all-btn" onClick={() => navigate('/subjects')}>View all &rarr;</button>
          </div>
          
          <div className="subjects-grid">
            {subjects.length > 0 ? (
              subjects.slice(0, 2).map((subject, idx) => {
                const bg = getSubjectColor(idx);
                const subjUnits = units.filter(u => u.subjectId === subject.id);
                const progress = subjUnits.length > 0 ? Math.round((subjUnits.filter(u => u.isCompleted).length / subjUnits.length) * 100) : 0;
                return (
                  <div key={subject.id} className="dash-subject-card" style={{ backgroundColor: bg }} onClick={() => navigate(`/subjects/${subject.id}`)}>
                    <div className="dash-subject-icon">
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                    <h3>{subject.name}</h3>
                    <p>{subjUnits.length} units</p>
                    <div className="dash-subject-progress">
                      <div className="dash-progress-bar">
                        <div className="dash-progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="dash-progress-text">{progress}%</span>
                      <button className="dash-subject-arrow">&rarr;</button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">No subjects yet. Get started by adding one!</div>
            )}
          </div>

          <div className="section-header" style={{ marginTop: '30px' }}>
            <h2>Upcoming Tasks</h2>
            <button className="view-all-btn" onClick={() => navigate('/tasks')}>View all &rarr;</button>
          </div>

          <div className="dash-task-list">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(task => (
                <div key={task.id} className="dash-task-item">
                  <div className={`dash-task-priority priority-${task.priority.toLowerCase()}`}></div>
                  <div className="dash-task-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div className="dash-task-details">
                    <h4>{task.title}</h4>
                    <p>{getSubjectName(task.subjectId)} &bull; Due: {task.dueDate}</p>
                  </div>
                  <div className="dash-task-badge">Today</div>
                </div>
              ))
            ) : (
              <div className="empty-state">No upcoming tasks!</div>
            )}
          </div>

        </div>

        <div className="dashboard-side-col">
          <div className="dash-widget mini-calendar-widget">
            <div className="mini-cal-header">
              <button>&larr;</button>
              <h3>{monthNames[month]} {year}</h3>
              <button>&rarr;</button>
            </div>
            <div className="mini-cal-grid">
              <div className="mini-cal-dow">Sun</div><div className="mini-cal-dow">Mon</div><div className="mini-cal-dow">Tue</div><div className="mini-cal-dow">Wed</div><div className="mini-cal-dow">Thu</div><div className="mini-cal-dow">Fri</div><div className="mini-cal-dow">Sat</div>
              {renderMiniCalendar()}
            </div>
          </div>

          <div className="dash-widget quick-actions-widget">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="qa-btn" onClick={() => navigate('/subjects')}>
                <div className="qa-icon" style={{ backgroundColor: '#EDE7FF', color: '#5B2DBB' }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <span>Add Subject</span>
              </button>
              <button className="qa-btn" onClick={() => navigate('/tasks')}>
                <div className="qa-icon" style={{ backgroundColor: '#E8F4FF', color: '#2563EB' }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </div>
                <span>Add Task</span>
              </button>
              <button className="qa-btn" onClick={() => navigate('/timer')}>
                <div className="qa-icon" style={{ backgroundColor: '#E8FAF0', color: '#16A34A' }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <span>Start Timer</span>
              </button>
              <button className="qa-btn" onClick={() => navigate('/schedule')}>
                <div className="qa-icon" style={{ backgroundColor: '#FFEAF2', color: '#DB2777' }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <span>View Schedule</span>
              </button>
            </div>
          </div>
          
          <div className="dash-widget motivation-widget" style={{ backgroundImage: 'linear-gradient(to right, #E8F4FF, #F5F1FF)' }}>
            <h3>You can do it! <span className="sparkles">✨</span></h3>
            <p>Discipline today, freedom tomorrow.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
