import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// The keys that should be user-specific
const USER_SPECIFIC_KEYS = [
  'studysync_subjects',
  'studysync_units',
  'studysync_tasks',
  'studysync_study_sessions',
  'studysync_schedule_view',
  'studysync_schedule',
  'studysync_calendar_events',
  'studysync_schedule_calendar_view',
  'studysync_weekly_grid_times',
  'studysync_weekly_grid_start',
  'studysync_weekly_grid_end',
  'studysync_weekly_grid_merges',
  'studysync_weekly_grid_configured',
  'studysync_weekly_grid_colwidths',
  'studysync_weekly_grid_colorkeys',
  'studysync_v3_migrated'
];

// We also have dynamic keys like studysync_workspace_tab_${fileId}. 
// We will intercept anything starting with studysync_workspace_tab_
const isUserSpecificKey = (key) => {
  if (!key) return false;
  if (USER_SPECIFIC_KEYS.includes(key)) return true;
  if (key.startsWith('studysync_workspace_tab_') && !key.includes('_user_')) return true;
  return false;
};

// Keep original references
const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

let activeUserId = null;

// Proxy localStorage to automatically scope keys to the active user
window.localStorage.getItem = (key) => {
  if (activeUserId && isUserSpecificKey(key)) {
    if (key.startsWith('studysync_workspace_tab_')) {
      return originalGetItem(`${key}_user_${activeUserId}`);
    }
    return originalGetItem(`${key}_${activeUserId}`);
  }
  return originalGetItem(key);
};

window.localStorage.setItem = (key, value) => {
  if (activeUserId && isUserSpecificKey(key)) {
    if (key.startsWith('studysync_workspace_tab_')) {
      return originalSetItem(`${key}_user_${activeUserId}`, value);
    }
    return originalSetItem(`${key}_${activeUserId}`, value);
  }
  return originalSetItem(key, value);
};

window.localStorage.removeItem = (key) => {
  if (activeUserId && isUserSpecificKey(key)) {
    if (key.startsWith('studysync_workspace_tab_')) {
      return originalRemoveItem(`${key}_user_${activeUserId}`);
    }
    return originalRemoveItem(`${key}_${activeUserId}`);
  }
  return originalRemoveItem(key);
};

export const AuthProvider = ({ children }) => {
  // Read initial auth state (bypass proxy manually if needed, but studysync_current_user is not user-specific)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = originalGetItem('studysync_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState(() => {
    const saved = originalGetItem('studysync_users');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Set the proxy state immediately on every render/mount so synchronous hooks read correct data
  activeUserId = currentUser ? currentUser.id : null;

  useEffect(() => {
    originalSetItem('studysync_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      originalSetItem('studysync_current_user', JSON.stringify(currentUser));
      activeUserId = currentUser.id;
    } else {
      originalRemoveItem('studysync_current_user');
      activeUserId = null;
    }
  }, [currentUser]);

  // Migration for the very first user (migrating global data to their user-specific keys)
  useEffect(() => {
    if (currentUser) {
      const migratedFlag = `studysync_migrated_${currentUser.id}`;
      if (!originalGetItem(migratedFlag)) {
        // If they are the first user and there are global subjects, migrate them
        if (users.length === 1 && originalGetItem('studysync_subjects')) {
          USER_SPECIFIC_KEYS.forEach(key => {
            const data = originalGetItem(key);
            if (data) {
              originalSetItem(`${key}_${currentUser.id}`, data);
              // We do NOT delete the global data to ensure safe rollback if needed, 
              // but from now on this user uses their scoped version.
            }
          });
          
          // Migrate workspace tabs dynamically
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key && key.startsWith('studysync_workspace_tab_') && !key.includes('_user_')) {
              const data = originalGetItem(key);
              if (data) {
                originalSetItem(`${key}_user_${currentUser.id}`, data);
              }
            }
          }
        }
        originalSetItem(migratedFlag, 'true');
      }
    }
  }, [currentUser, users.length]);

  const login = (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (name, email, password) => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email already exists' };
    }
    
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password
    };
    
    setUsers([...users, newUser]);
    setCurrentUser(newUser); // Auto login
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
