import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>StudySync</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li><NavLink to="/dashboard">Dashboard</NavLink></li>
          <li><NavLink to="/subjects">Subjects</NavLink></li>
          <li><NavLink to="/tasks">Tasks</NavLink></li>
          <li><NavLink to="/schedule">Schedule</NavLink></li>
          <li><NavLink to="/study-timer">Study Timer</NavLink></li>
          <li><NavLink to="/progress">Progress</NavLink></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
