import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = [];
    
    if (currentUser) {
      const subjects = JSON.parse(localStorage.getItem(`studysync_subjects_${currentUser.id}`)) || [];
      const units = JSON.parse(localStorage.getItem(`studysync_units_${currentUser.id}`)) || [];
      const tasks = JSON.parse(localStorage.getItem(`studysync_tasks_${currentUser.id}`)) || [];

      subjects.forEach(sub => {
        if (sub.name.toLowerCase().includes(query)) {
          results.push({ id: sub.id, title: sub.name, type: 'Subject', url: `/subjects/${sub.id}` });
        }
      });

      units.forEach(unit => {
        if (unit.name.toLowerCase().includes(query)) {
          results.push({ id: unit.id, title: unit.name, type: 'Unit', url: `/subjects/${unit.subjectId}` });
        }
      });

      tasks.forEach(task => {
        if (task.title.toLowerCase().includes(query)) {
          results.push({ id: task.id, title: task.title, type: 'Task', url: '/tasks' });
        }
      });
    }

    setSearchResults(results);
  }, [searchQuery, currentUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    const handleNotifClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('mousedown', handleNotifClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mousedown', handleNotifClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsNotifOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery('');
    } else if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleResultClick(searchResults[0].url);
      }
    }
  };

  const handleResultClick = (url) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(url);
  };

  return (
    <header className="app-header">
      <div className="header-search" ref={searchRef}>
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" className="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Search resources, subjects, or tasks..." 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          onKeyDown={handleSearchKeyDown}
        />
        {isSearchOpen && searchQuery.trim() !== '' && (
          <div className="search-dropdown">
            {searchResults.length > 0 ? (
              searchResults.map((result, idx) => (
                <div key={`${result.id}-${idx}`} className="search-result-item" onClick={() => handleResultClick(result.url)}>
                  <div className="search-result-title">{result.title}</div>
                  <div className="search-result-type">{result.type}</div>
                </div>
              ))
            ) : (
              <div className="search-result-empty">No results found.</div>
            )}
          </div>
        )}
      </div>
      
      <div className="header-right">
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="header-notification" onClick={() => setIsNotifOpen(!isNotifOpen)}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            {unreadCount > 0 && (
              <span className="notification-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 'bold' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {isNotifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={markAllAsRead}>Mark all as read</button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notif-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.route) {
                          navigate(notif.route);
                          setIsNotifOpen(false);
                        }
                      }}
                    >
                      <div className="notif-icon">
                        {notif.type === 'task' && <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
                        {notif.type === 'schedule' && <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                        {notif.type === 'timer' && <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                      </div>
                      <div className="notif-content">
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-message">{notif.message}</div>
                        <div className="notif-time">
                          {(() => {
                            const diff = Date.now() - new Date(notif.createdAt).getTime();
                            const mins = Math.floor(diff / 60000);
                            if (mins < 1) return 'Just now';
                            if (mins < 60) return `${mins}m ago`;
                            const hrs = Math.floor(mins / 60);
                            if (hrs < 24) return `${hrs}h ago`;
                            return `${Math.floor(hrs/24)}d ago`;
                          })()}
                        </div>
                      </div>
                      {!notif.read && <div className="notif-unread-dot"></div>}
                    </div>
                  ))
                ) : (
                  <div className="notif-empty">No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

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
