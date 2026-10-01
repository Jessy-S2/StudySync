const fs = require('fs');

let code = fs.readFileSync('src/pages/Settings.jsx', 'utf8');

// I will insert two new setting-rows inside the notifications tab card.
const newRows = `
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
                    onChange={(e) => updateSettings('notifications', 'notifyBeforeDeadline', parseInt(e.target.value))} 
                    className="settings-select"
                    disabled={!settings.notifications.desktopNotifications}
                  >
                    <option value={1440}>1 day before</option>
                    <option value={180}>3 hours before</option>
                    <option value={60}>1 hour before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={15}>15 minutes before</option>
                  </select>
                </div>
`;

code = code.replace(
  /<div className="setting-info">\s*<label>Daily Study Reminder<\/label>[\s\S]*?<\/label>\s*<\/div>/,
  match => match + '\n' + newRows
);

fs.writeFileSync('src/pages/Settings.jsx', code);
console.log('Settings.jsx updated');
