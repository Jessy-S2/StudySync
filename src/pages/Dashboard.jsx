import React, { useState, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import QuickAction from '../components/QuickAction';
import './Dashboard.css';

const Dashboard = () => {
  const [totalSubjects, setTotalSubjects] = useState(() => {
    const savedSubjects = localStorage.getItem('studysync_subjects');
    if (savedSubjects) {
      try {
        const parsed = JSON.parse(savedSubjects) || [];
        return parsed.length;
      } catch (e) {
        return 0;
      }
    }
    return 0;
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

  const [schedule, setSchedule] = useState(() => {
    const savedSchedule = localStorage.getItem('studysync_schedule');
    if (savedSchedule) {
      try {
        return JSON.parse(savedSchedule) || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  const upcomingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5); // Show only top 5

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
    return sub ? sub.name : 'Unknown Subject';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="welcome-section">
          <h2>Good morning!</h2>
          <p>Here's your study overview for today.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Summary Cards */}
        <section className="dashboard-section summary-section">
          <SummaryCard title="Total Subjects" value={totalSubjects.toString()} />
          <SummaryCard title="Total Tasks" value={totalTasks.toString()} />
          <SummaryCard title="Completed Tasks" value={completedTasks.toString()} />
          <SummaryCard title="Study Hours" value="0" />
          <SummaryCard title="Overall Progress" value="0%" />
        </section>

        <div className="dashboard-main-columns">
          <div className="dashboard-column-left">
            {/* Upcoming Tasks */}
            <section className="dashboard-section list-section">
              <h3 className="section-title">Upcoming Tasks</h3>
              {upcomingTasks.length === 0 ? (
                <div className="empty-state">
                  <p>No upcoming tasks.</p>
                </div>
              ) : (
                <div className="upcoming-tasks-list">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="upcoming-task-item">
                      <div className="upcoming-task-info">
                        <span className="upcoming-task-title">{task.title}</span>
                        <span className="upcoming-task-subject">{getSubjectName(task.subjectId)}</span>
                      </div>
                      <div className="upcoming-task-meta">
                        <span className="upcoming-task-date">{task.dueDate}</span>
                        <span className={`task-priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Today's Schedule */}
            <section className="dashboard-section list-section">
              <h3 className="section-title">Today's Schedule</h3>
              {todaysSessions.length === 0 ? (
                <div className="empty-state">
                  <p>No study sessions scheduled for today.</p>
                </div>
              ) : (
                <div className="upcoming-tasks-list">
                  {todaysSessions.map(sess => (
                    <div key={sess.id} className={`upcoming-task-item ${sess.completed ? 'completed' : ''}`}>
                      <div className="upcoming-task-info">
                        <span className="upcoming-task-title" style={sess.completed ? { textDecoration: 'line-through', color: '#7f8c8d' } : {}}>{getSubjectName(sess.subjectId)}</span>
                        <span className="upcoming-task-subject">{sess.duration} min</span>
                      </div>
                      <div className="upcoming-task-meta">
                        <span className="upcoming-task-date" style={{ fontWeight: 'bold' }}>{sess.startTime}</span>
                        {sess.completed && <span className="task-priority priority-low">Done</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="dashboard-column-right">
            {/* Study Progress */}
            <section className="dashboard-section list-section">
              <h3 className="section-title">Study Progress</h3>
              <div className="progress-container">
                <div className="progress-label">Overall Progress</div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: '0%' }}></div>
                </div>
                <div className="progress-value">0%</div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="dashboard-section list-section">
              <h3 className="section-title">Quick Actions</h3>
              <div className="quick-actions-grid">
                <QuickAction title="Add Task" route="/tasks" />
                <QuickAction title="Add Subject" route="/subjects" />
                <QuickAction title="Create Study Session" route="/schedule" />
                <QuickAction title="Start Study Timer" route="/study-timer" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
