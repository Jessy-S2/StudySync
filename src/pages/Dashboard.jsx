import React, { useState, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import QuickAction from '../components/QuickAction';
import './Dashboard.css';

const Dashboard = () => {
  const [totalSubjects, setTotalSubjects] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('studysync_subjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTotalSubjects(parsed.length);
      } catch (e) {
        console.error("Failed to load subjects for dashboard", e);
      }
    }
  }, []);

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
          <SummaryCard title="Total Tasks" value="0" />
          <SummaryCard title="Completed Tasks" value="0" />
          <SummaryCard title="Study Hours" value="0" />
          <SummaryCard title="Overall Progress" value="0%" />
        </section>

        <div className="dashboard-main-columns">
          <div className="dashboard-column-left">
            {/* Upcoming Tasks */}
            <section className="dashboard-section list-section">
              <h3 className="section-title">Upcoming Tasks</h3>
              <div className="empty-state">
                <p>No upcoming tasks.</p>
              </div>
            </section>

            {/* Today's Schedule */}
            <section className="dashboard-section list-section">
              <h3 className="section-title">Today's Schedule</h3>
              <div className="empty-state">
                <p>No study sessions scheduled for today.</p>
              </div>
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
