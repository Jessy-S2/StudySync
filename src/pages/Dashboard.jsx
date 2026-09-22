import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>
      <div className="dashboard-content">
        <div className="placeholder-card">
          <h3>Upcoming Tasks</h3>
          <p>Task list placeholder...</p>
        </div>
        <div className="placeholder-card">
          <h3>Recent Progress</h3>
          <p>Progress chart placeholder...</p>
        </div>
        <div className="placeholder-card">
          <h3>Study Schedule</h3>
          <p>Schedule placeholder...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
