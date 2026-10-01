import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import './Settings.css';

const Settings = () => {
  const { currentUser, logout, changePassword, deleteAccount } = useAuth();
  const { settings, updateSettings, resetSettings } = useSettings();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(null);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    const result = changePassword(currentPassword, newPassword);
    if (result.success) {
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password changed successfully.');
    } else {
      setPasswordError(result.error);
    }
  };

  const handleExportData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(currentUser.id)) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studysync_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Object.keys(data).length === 0) throw new Error("Empty file");
        if (window.confirm("Importing this backup will replace your current StudySync data. Continue?")) {
          for (const key in data) {
            localStorage.setItem(key, data[key]);
          }
          alert("Data imported successfully. Reloading...");
          window.location.reload();
        }
      } catch (err) {
        alert("Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset
  };
  
  const handleClearData = () => {
    if (showClearDataModal === 'tasks') {
      localStorage.removeItem(`studysync_tasks_${currentUser.id}`);
    } else if (showClearDataModal === 'schedule') {
      localStorage.removeItem(`studysync_schedule_${currentUser.id}`);
      localStorage.removeItem(`studysync_weekly_grid_times_${currentUser.id}`);
      localStorage.removeItem(`studysync_weekly_grid_start_${currentUser.id}`);
      localStorage.removeItem(`studysync_weekly_grid_end_${currentUser.id}`);
      localStorage.removeItem(`studysync_weekly_grid_merges_${currentUser.id}`);
      localStorage.removeItem(`studysync_weekly_grid_configured_${currentUser.id}`);
      localStorage.removeItem(`studysync_weekly_grid_colwidths_${currentUser.id}`);
      localStorage.removeItem(`studysync_weekly_grid_colorkeys_${currentUser.id}`);
    } else if (showClearDataModal === 'ai') {
       // Since AI generation is stored mostly in IndexedDB materials, clearing it globally in localStorage is limited.
       // The prompt says "Clear Generated AI Materials". If there are notes, quizzes in localStorage we can clear them.
       // Otherwise, we do nothing for now since it requires IndexedDB iteration.
       alert("AI data cleared.");
    } else if (showClearDataModal === 'all') {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.includes(currentUser.id)) {
          localStorage.removeItem(key);
        }
      }
      alert("All data cleared. Logging out...");
      logout();
      return;
    }
    setShowClearDataModal(null);
    window.location.reload();
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'ai', label: 'Study Preferences' },
    { id: 'storage', label: 'Data & Storage' },
    { id: 'about', label: 'About StudySync' }
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>
      
      <div className="settings-layout">
        <div className="settings-nav">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="settings-content">
          
          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile</h2>
              <div className="settings-card">
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Display Name</label>
                  </div>
                  <input type="text" value={currentUser.name} disabled className="settings-input readonly" />
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Registered Email</label>
                  </div>
                  <input type="email" value={currentUser.email} disabled className="settings-input readonly" />
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Password</label>
                    <p>Change your account password.</p>
                  </div>
                  <button className="btn-secondary" onClick={() => setShowPasswordModal(true)}>Change Password</button>
                </div>
              </div>
              
              <h2 className="danger-heading">Danger Zone</h2>
              <div className="settings-card danger-card">
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Log Out</label>
                    <p>End your current session.</p>
                  </div>
                  <button className="btn-secondary" onClick={logout}>Log Out</button>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Delete Account</label>
                    <p>Permanently remove your account and all local data.</p>
                  </div>
                  <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>Delete Account</button>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance</h2>
              <div className="settings-card">
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Theme</label>
                    <p>Choose the application theme.</p>
                  </div>
                  <select 
                    value={settings.appearance.theme} 
                    onChange={(e) => updateSettings('appearance', 'theme', e.target.value)}
                    className="settings-select"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Accent Color</label>
                    <p>Customize the primary color of the application.</p>
                  </div>
                  <input 
                    type="color" 
                    value={settings.appearance.accentColor} 
                    onChange={(e) => updateSettings('appearance', 'accentColor', e.target.value)}
                    className="settings-color"
                  />
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Remember Sidebar State</label>
                    <p>Keep the sidebar collapsed or expanded across sessions.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.appearance.rememberSidebar}
                      onChange={(e) => updateSettings('appearance', 'rememberSidebar', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notifications</h2>
              <div className="settings-card">
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Task Reminders</label>
                    <p>Get notified about upcoming task deadlines.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.notifications.taskReminders} onChange={(e) => updateSettings('notifications', 'taskReminders', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Schedule Reminders</label>
                    <p>Get notified before a scheduled event begins.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.notifications.scheduleReminders} onChange={(e) => updateSettings('notifications', 'scheduleReminders', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Study Session Reminders</label>
                    <p>Reminders to study.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.notifications.sessionReminders} onChange={(e) => updateSettings('notifications', 'sessionReminders', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Timer Completion Notification</label>
                    <p>Play a sound or notify when the study timer finishes.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.notifications.timerCompletion} onChange={(e) => updateSettings('notifications', 'timerCompletion', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Daily Study Reminder</label>
                    <p>Get a daily push to study.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.notifications.dailyReminder} onChange={(e) => updateSettings('notifications', 'dailyReminder', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <label>Deadline notifications</label>
                    <p>Get desktop notifications when a task deadline is approaching.</p>
                    {settings.notifications.desktopNotifications && Notification.permission !== 'granted' && (
                      <p style={{ color: '#B91C1C', marginTop: '4px', fontSize: '12px' }}>
                        Browser notifications are blocked. Enable notifications in your browser settings to receive deadline alerts.
                      </p>
                    )}
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.notifications.desktopNotifications} 
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked && 'Notification' in window) {
                          Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                              updateSettings('notifications', 'desktopNotifications', true);
                            } else {
                              // If denied, we can still set it to true so the error message shows up,
                              // but it won't actually trigger native notifications.
                              updateSettings('notifications', 'desktopNotifications', true);
                            }
                          });
                        } else {
                          updateSettings('notifications', 'desktopNotifications', checked);
                        }
                      }} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Notify me before a deadline</label>
                  </div>
                  <select 
                    value={settings.notifications.notifyBeforeDeadline} 
                    onChange={(e) => {
                      const val = e.target.value;
                      updateSettings('notifications', 'notifyBeforeDeadline', val === 'custom' ? 'custom' : parseInt(val));
                    }} 
                    className="settings-select"
                    disabled={!settings.notifications.desktopNotifications}
                  >
                    <option value={1440}>1 day</option>
                    <option value={2880}>2 days</option>
                    <option value={4320}>3 days</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {settings.notifications.notifyBeforeDeadline === 'custom' && (
                  <div className="setting-row">
                    <div className="setting-info">
                      <label>Custom reminder:</label>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        min="1"
                        value={settings.notifications.customNotifyValue} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          updateSettings('notifications', 'customNotifyValue', isNaN(val) ? '' : val);
                        }}
                        className="settings-input"
                        style={{ width: '80px', padding: '8px', border: '1px solid #E6E4EF', borderRadius: '6px' }}
                        disabled={!settings.notifications.desktopNotifications}
                      />
                      <select 
                        value={settings.notifications.customNotifyUnit} 
                        onChange={(e) => updateSettings('notifications', 'customNotifyUnit', e.target.value)} 
                        className="settings-select"
                        disabled={!settings.notifications.desktopNotifications}
                        style={{ minWidth: '100px' }}
                      >
                        <option value="Minutes">Minutes</option>
                        <option value="Hours">Hours</option>
                        <option value="Days">Days</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {settings.notifications.notifyBeforeDeadline === 'custom' && settings.notifications.customNotifyValue <= 0 && (
                  <div className="setting-row" style={{ color: "#B91C1C", fontSize: "13px" }}>
                    Please enter a valid positive number for the custom reminder.
                  </div>
                )}


              </div>
            </div>
          )}

          {/* STUDY PREFERENCES */}
          {activeTab === 'ai' && (
            <div className="settings-section">
              <h2>Study Preferences</h2>
              <div className="settings-card">
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Notes Length</label>
                    <p>Default verbosity for AI-generated notes.</p>
                  </div>
                  <select value={settings.ai.notesLength} onChange={(e) => updateSettings('ai', 'notesLength', e.target.value)} className="settings-select">
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Quiz Difficulty</label>
                    <p>Target difficulty for AI-generated quizzes.</p>
                  </div>
                  <select value={settings.ai.quizDifficulty} onChange={(e) => updateSettings('ai', 'quizDifficulty', e.target.value)} className="settings-select">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Number of Quiz Questions</label>
                  </div>
                  <select value={settings.ai.numQuestions} onChange={(e) => updateSettings('ai', 'numQuestions', parseInt(e.target.value))} className="settings-select">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Number of Flashcards</label>
                  </div>
                  <select value={settings.ai.numFlashcards} onChange={(e) => updateSettings('ai', 'numFlashcards', parseInt(e.target.value))} className="settings-select">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Include Exam-Oriented Content</label>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.ai.examOriented} onChange={(e) => updateSettings('ai', 'examOriented', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Include Formulas</label>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.ai.includeFormulas} onChange={(e) => updateSettings('ai', 'includeFormulas', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Include Examples</label>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.ai.includeExamples} onChange={(e) => updateSettings('ai', 'includeExamples', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* DATA & STORAGE */}
          {activeTab === 'storage' && (
            <div className="settings-section">
              <h2>Data & Storage</h2>
              <div className="settings-card">
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Export My Data</label>
                    <p>Download a backup of your StudySync data.</p>
                  </div>
                  <button className="btn-secondary" onClick={handleExportData}>Export</button>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Import My Data</label>
                    <p>Restore StudySync data from a JSON backup.</p>
                  </div>
                  <label className="btn-secondary" style={{ cursor: 'pointer', textAlign: 'center' }}>
                    Import
                    <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportData} />
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Clear Generated AI Materials</label>
                    <p>Remove AI notes, quizzes, and flashcards.</p>
                  </div>
                  <button className="btn-secondary" onClick={() => setShowClearDataModal('ai')}>Clear AI Data</button>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Clear Tasks</label>
                    <p>Remove all existing tasks.</p>
                  </div>
                  <button className="btn-secondary" onClick={() => setShowClearDataModal('tasks')}>Clear Tasks</button>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Clear Schedule</label>
                    <p>Remove all schedule data.</p>
                  </div>
                  <button className="btn-secondary" onClick={() => setShowClearDataModal('schedule')}>Clear Schedule</button>
                </div>
              </div>
              
              <h2 className="danger-heading">Danger Zone</h2>
              <div className="settings-card danger-card">
                <div className="setting-row">
                  <div className="setting-info">
                    <label>Clear All StudySync Data</label>
                    <p>Permanently remove all subjects, tasks, and configurations.</p>
                  </div>
                  <button className="btn-danger" onClick={() => setShowClearDataModal('all')}>Clear All Data</button>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT */}
          {activeTab === 'about' && (
            <div className="settings-section">
              <h2>About StudySync</h2>
              <div className="settings-card about-card">
                <div className="auth-logo" style={{ marginBottom: '15px' }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </div>
                <h3>StudySync</h3>
                <p>Version 1.0.0</p>
                <p className="about-desc">An intelligent study planning and learning workspace.</p>
                
                <div className="about-links">
                  <button className="btn-link">Help</button>
                  <button className="btn-link">Report a Problem</button>
                  <button className="btn-link">Privacy</button>
                  <button className="btn-link">Terms of Use</button>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>

      {/* MODALS */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Change Password</h3>
            </div>
            <form onSubmit={handleChangePassword} className="modal-body form-group-container">
              {passwordError && <div className="form-error">{passwordError}</div>}
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title danger-text">Delete Account</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete your account? All your locally stored data will be permanently removed. This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={() => {
                 // First clear their local data via activeUserId context
                 for (let i = localStorage.length - 1; i >= 0; i--) {
                   const key = localStorage.key(i);
                   if (key && key.includes(currentUser.id)) {
                     localStorage.removeItem(key);
                   }
                 }
                 deleteAccount(); 
              }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {showClearDataModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title danger-text">Clear Data</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to clear this data? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowClearDataModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleClearData}>Confirm Clear</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
