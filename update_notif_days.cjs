const fs = require('fs');
let code = fs.readFileSync('src/context/NotificationContext.jsx', 'utf8');

const replacement = `
          // Desktop deadline notification logic
          if (settings.notifications?.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
            let notifyBeforeSetting = settings.notifications?.notifyBeforeDeadline || 1440;
            let notifyBefore = 1440;
            
            if (notifyBeforeSetting === 'custom') {
              const val = parseInt(settings.notifications?.customNotifyValue);
              if (!isNaN(val) && val > 0) {
                const unit = settings.notifications?.customNotifyUnit || 'Minutes';
                if (unit === 'Days') notifyBefore = val * 1440;
                else if (unit === 'Hours') notifyBefore = val * 60;
                else notifyBefore = val;
              }
            } else {
              notifyBefore = parseInt(notifyBeforeSetting);
            }

            if (minutesDiff > 0 && minutesDiff <= notifyBefore) {
              const desktopNotifId = \`desktop-notified-\${task.id}-\${taskDateStr}-\${notifyBefore}\`;
              const notified = localStorage.getItem(desktopNotifId);
              if (!notified) {
                const rnd = Math.round(minutesDiff);
                let exactMsg = \`is due in \${rnd} minutes.\`;
                
                if (rnd >= 1440) {
                  const days = Math.round(rnd / 1440);
                  exactMsg = \`is due in \${days} \${days === 1 ? 'day' : 'days'}.\`;
                } else if (rnd > 60) {
                  const hrs = Math.round(rnd / 60);
                  exactMsg = \`is due in \${hrs} \${hrs === 1 ? 'hour' : 'hours'}.\`;
                } else if (rnd === 60) {
                  exactMsg = \`is due in 1 hour.\`;
                } else if (rnd <= 5) {
                  exactMsg = \`is due soon.\`;
                }

                const title = "Deadline Approaching";
                const body = \`"\${task.title}" \${exactMsg}\`;

                // Native Notification
                const n = new Notification(title, { body });
                n.onclick = () => {
                  window.focus();
                  window.location.pathname = '/tasks';
                };

                // Bell Notification
                addNotification({
                  id: \`deadline-bell-\${task.id}-\${taskDateStr}-\${notifyBefore}\`,
                  type: 'task',
                  title: title,
                  message: body,
                  route: '/tasks'
                });

                localStorage.setItem(desktopNotifId, 'true');
              }
            }
          }
`;

code = code.replace(
  /\/\/ Desktop deadline notification logic[\s\S]*?localStorage\.setItem\(desktopNotifId, 'true'\);\s*\}\s*\}\s*\}/,
  replacement.trim()
);

fs.writeFileSync('src/context/NotificationContext.jsx', code);
console.log('NotificationContext.jsx updated');
