import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-search">
        <input type="text" placeholder="Search..." />
      </div>
      <div className="header-profile">
        <span>Student Profile</span>
      </div>
    </header>
  );
};

export default Header;
