import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="header-search">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" className="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Search resources, subjects, or tasks..." />
      </div>
      <div className="header-right">
        <button className="header-notification">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3-9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notification-dot"></span>
        </button>
        <div className="header-profile" onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
          <div className="avatar">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span className="profile-name">{currentUser?.name || 'Student'}</span>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" className="profile-chevron">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>

          {isDropdownOpen && (
            <div className="profile-dropdown" style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '10px',
              backgroundColor: '#FFF',
              border: '1px solid #E6E4EF',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              padding: '10px',
              zIndex: 100,
              minWidth: '150px'
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #E6E4EF', marginBottom: '8px', fontSize: '13px', color: '#6F6878' }}>
                {currentUser?.email}
              </div>
              <button 
                onClick={logout}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#B91C1C',
                  fontWeight: 600,
                  borderRadius: '4px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#FEE2E2'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
