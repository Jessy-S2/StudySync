const fs = require('fs');

let code = fs.readFileSync('src/components/Header.jsx', 'utf8');

// Imports
if (!code.includes('useNotification')) {
  code = code.replace(
    /import \{ useAuth \} from '\.\.\/context\/AuthContext';/,
    "import { useAuth } from '../context/AuthContext';\nimport { useNotification } from '../context/NotificationContext';"
  );
}

// Hooks
code = code.replace(
  /const \{ currentUser, logout \} = useAuth\(\);/,
  `const { currentUser, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);`
);

// Click outside for notif
code = code.replace(
  /document\.addEventListener\('mousedown', handleClickOutside\);/,
  `const handleNotifClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('mousedown', handleNotifClickOutside);`
);
code = code.replace(
  /return \(\) => document\.removeEventListener\('mousedown', handleClickOutside\);/,
  `return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mousedown', handleNotifClickOutside);
    };`
);

// Escape key for notif
code = code.replace(
  /const handleSearchKeyDown = \(e\) => \{/,
  `useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsNotifOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchKeyDown = (e) => {`
);

// Bell HTML
const notifHtml = `
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
                      className={\`notif-item \${!notif.read ? 'unread' : ''}\`}
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
                            if (mins < 60) return \`\${mins}m ago\`;
                            const hrs = Math.floor(mins / 60);
                            if (hrs < 24) return \`\${hrs}h ago\`;
                            return \`\${Math.floor(hrs/24)}d ago\`;
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
`;

code = code.replace(
  /<div className="header-right">[\s\S]*?<button className="header-notification">[\s\S]*?<\/button>/,
  notifHtml
);

fs.writeFileSync('src/components/Header.jsx', code);
console.log('Header.jsx updated');
