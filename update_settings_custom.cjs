const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.jsx', 'utf8');

const replacement = `
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
                  <div className="setting-row" style={{ marginTop: '-15px', paddingTop: 0, borderTop: 'none' }}>
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
                  <div className="setting-row" style={{ marginTop: '-20px', paddingTop: 0, borderTop: 'none', color: '#B91C1C', fontSize: '12px' }}>
                    Please enter a valid positive number for the custom reminder.
                  </div>
                )}
`;

code = code.replace(
  /<div className="setting-row">\s*<div className="setting-info">\s*<label>Notify me before a deadline<\/label>[\s\S]*?<\/select>\s*<\/div>/,
  replacement
);

fs.writeFileSync('src/pages/Settings.jsx', code);
console.log('Settings.jsx updated');
