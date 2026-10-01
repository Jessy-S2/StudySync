const fs = require('fs');

let code = fs.readFileSync('src/context/NotificationContext.jsx', 'utf8');

const newLogic = `
          // Parse proper date/time for task
          let taskDateStr = task.dueDate;
          if (task.dueTime) {
            taskDateStr = \`\${task.dueDate}T\${task.dueTime}\`;
          }
          const dueDate = new Date(taskDateStr);
          if (isNaN(dueDate.getTime())) return;

          const timeDiff = dueDate.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          const minutesDiff = timeDiff / (1000 * 60);
          
          // Overdue
          if (timeDiff < 0) {
            addNotification({
              id: \`task-overdue-\${task.id}\`,
              type: 'task',
              title: 'Overdue Task',
              message: \`"\${task.title}" is overdue.\`,
              route: '/tasks'
            });
          } 
          // Upcoming (within 24 hours)
          else if (hoursDiff <= 24) {
            // Only add once for "upcoming"
            addNotification({
              id: \`task-upcoming-\${task.id}\`,
              type: 'task',
              title: 'Upcoming Task',
              message: \`"\${task.title}" is due soon.\`,
              route: '/tasks'
            });
          }

          // Desktop deadline notification logic
          if (settings.notifications?.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
            const notifyBefore = settings.notifications?.notifyBeforeDeadline || 30;
            if (minutesDiff > 0 && minutesDiff <= notifyBefore) {
              const desktopNotifId = \`desktop-notified-\${task.id}-\${taskDateStr}-\${notifyBefore}\`;
              const notified = localStorage.getItem(desktopNotifId);
              if (!notified) {
                const rnd = Math.round(minutesDiff);
                let exactMsg = \`is due in \${rnd} minutes.\`;
                if (rnd > 60) exactMsg = \`is due in \${Math.round(rnd/60)} hours.\`;
                else if (rnd === 60) exactMsg = \`is due in 1 hour.\`;
                else if (rnd <= 5) exactMsg = \`is due soon.\`;

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
  /const dueDate = new Date\(task\.dueDate\);[\s\S]*?route: '\/tasks'\n\s*\}\);\n\s*\}/,
  newLogic
);

fs.writeFileSync('src/context/NotificationContext.jsx', code);
console.log('NotificationContext.jsx updated');
