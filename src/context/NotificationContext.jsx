import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { settings } = useSettings();
  
  const storageKey = currentUser ? `studysync_notifications_${currentUser.id}` : null;
  
  const [notifications, setNotifications] = useState(() => {
    if (!storageKey) return [];
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    }
  }, [notifications, storageKey]);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => {
      // Prevent duplicates by ID
      if (prev.some(n => n.id === notification.id)) {
        return prev;
      }
      
      const newNotif = {
        ...notification,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      // Keep only the most recent 50
      const updated = [newNotif, ...prev];
      return updated.slice(0, 50);
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Background checker for Tasks and Schedule
  useEffect(() => {
    if (!currentUser || !settings) return;
    
    const checkReminders = () => {
      const now = new Date();
      
      // 1. Check Tasks (Upcoming / Overdue)
      if (settings.notifications?.taskReminders) {
        const tasks = JSON.parse(localStorage.getItem(`studysync_tasks_${currentUser.id}`)) || [];
        tasks.forEach(task => {
          if (task.completed) return;
          if (!task.dueDate) return;
          
          
          // Parse proper date/time for task
          let taskDateStr = task.dueDate;
          if (task.dueTime) {
            taskDateStr = `${task.dueDate}T${task.dueTime}`;
          }
          const dueDate = new Date(taskDateStr);
          if (isNaN(dueDate.getTime())) return;

          const timeDiff = dueDate.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          const minutesDiff = timeDiff / (1000 * 60);
          
          // Overdue
          if (timeDiff < 0) {
            addNotification({
              id: `task-overdue-${task.id}`,
              type: 'task',
              title: 'Overdue Task',
              message: `"${task.title}" is overdue.`,
              route: '/tasks'
            });
          } 
          // Upcoming (within 24 hours)
          else if (hoursDiff <= 24) {
            // Only add once for "upcoming"
            addNotification({
              id: `task-upcoming-${task.id}`,
              type: 'task',
              title: 'Upcoming Task',
              message: `"${task.title}" is due soon.`,
              route: '/tasks'
            });
          }

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
              const desktopNotifId = `desktop-notified-${task.id}-${taskDateStr}-${notifyBefore}`;
              const notified = localStorage.getItem(desktopNotifId);
              if (!notified) {
                const rnd = Math.round(minutesDiff);
                let exactMsg = `is due in ${rnd} minutes.`;
                
                if (rnd >= 1440) {
                  const days = Math.round(rnd / 1440);
                  exactMsg = `is due in ${days} ${days === 1 ? 'day' : 'days'}.`;
                } else if (rnd > 60) {
                  const hrs = Math.round(rnd / 60);
                  exactMsg = `is due in ${hrs} ${hrs === 1 ? 'hour' : 'hours'}.`;
                } else if (rnd === 60) {
                  exactMsg = `is due in 1 hour.`;
                } else if (rnd <= 5) {
                  exactMsg = `is due soon.`;
                }

                const title = "Deadline Approaching";
                const body = `"${task.title}" ${exactMsg}`;

                // Native Notification
                const n = new Notification(title, { body });
                n.onclick = () => {
                  window.focus();
                  window.location.pathname = '/tasks';
                };

                // Bell Notification
                addNotification({
                  id: `deadline-bell-${task.id}-${taskDateStr}-${notifyBefore}`,
                  type: 'task',
                  title: title,
                  message: body,
                  route: '/tasks'
                });

                localStorage.setItem(desktopNotifId, 'true');
              }
            }
          }
 
          // Upcoming (within 24 hours)
          else if (hoursDiff <= 24) {
            // Only add once for "upcoming"
            addNotification({
              id: `task-upcoming-${task.id}`,
              type: 'task',
              title: 'Upcoming Task',
              message: `"${task.title}" is due soon.`,
              route: '/tasks'
            });
          }
        });
      }

      // 2. Check Schedule (Upcoming)
      if (settings.notifications?.scheduleReminders) {
        const schedule = JSON.parse(localStorage.getItem(`studysync_schedule_${currentUser.id}`)) || [];
        // The schedule objects might look like { id, day, title, startTime, endTime }
        // Let's assume daily/weekly schedule is recurring. 
        // For simplicity, we just check if it's today and within 1 hour.
        const currentDayIndex = now.getDay(); 
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayStr = days[currentDayIndex];
        
        schedule.forEach(entry => {
          if (entry.day !== currentDayStr && entry.day !== 'All') return;
          if (!entry.startTime) return;
          
          const [hours, mins] = entry.startTime.split(':').map(Number);
          const entryTime = new Date(now);
          entryTime.setHours(hours, mins, 0, 0);
          
          const timeDiffMinutes = (entryTime.getTime() - now.getTime()) / (1000 * 60);
          
          if (timeDiffMinutes > 0 && timeDiffMinutes <= 60) {
            addNotification({
              id: `schedule-upcoming-${entry.id}-${now.toDateString()}`, // unique per day
              type: 'schedule',
              title: 'Upcoming Study Session',
              message: `Your session "${entry.title}" starts at ${entry.startTime}.`,
              route: '/schedule'
            });
          }
        });
      }
    };
    
    // Initial check
    checkReminders();
    
    // Then check every 1 minute
    const intervalId = setInterval(checkReminders, 60000);
    return () => clearInterval(intervalId);
  }, [currentUser, settings, addNotification]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
