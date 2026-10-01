import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

const DEFAULT_SETTINGS = {
  appearance: {
    theme: 'light', // light, dark, system
    accentColor: '#5B2DBB',
    rememberSidebar: true
  },
  notifications: {
    taskReminders: true,
    scheduleReminders: true,
    sessionReminders: true,
    timerCompletion: true,
    dailyReminder: false,
    desktopNotifications: false,
    notifyBeforeDeadline: 1440,
    customNotifyValue: 5,
    customNotifyUnit: 'Days'
  },
  study: {
    defaultStudyDuration: 25,
    defaultBreakDuration: 5,
    defaultLongBreakDuration: 15,
    timeFormat: '12', // 12 or 24
    weekStartsOn: 'Monday', // Sunday or Monday
    defaultScheduleView: 'weekly' // daily, weekly, monthly
  },
  ai: {
    notesLength: 'medium', // short, medium, detailed
    quizDifficulty: 'mixed', // easy, medium, hard, mixed
    numQuestions: 10,
    numFlashcards: 10,
    examOriented: true,
    includeFormulas: true,
    includeExamples: true
  }
};

export const SettingsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('studysync_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge with defaults to ensure new settings properties exist
        return {
          appearance: { ...DEFAULT_SETTINGS.appearance, ...(parsed.appearance || {}) },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications || {}) },
          study: { ...DEFAULT_SETTINGS.study, ...(parsed.study || {}) },
          ai: { ...DEFAULT_SETTINGS.ai, ...(parsed.ai || {}) }
        };
      }
    } catch (e) {
      console.error("Could not load settings", e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('studysync_settings', JSON.stringify(settings));
      
      // Apply theme
      if (settings.appearance.theme === 'dark') {
        document.body.classList.add('theme-dark');
      } else {
        document.body.classList.remove('theme-dark');
      }
      
      // Apply accent color (CSS variable)
      document.documentElement.style.setProperty('--primary-color', settings.appearance.accentColor);
      
      // Compute hover color (slightly darker)
      // Basic hex darken approximation
      const hex = settings.appearance.accentColor.replace('#', '');
      if (hex.length === 6) {
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        r = Math.max(0, r - 30);
        g = Math.max(0, g - 30);
        b = Math.max(0, b - 30);
        const darkerHex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        document.documentElement.style.setProperty('--primary-hover', darkerHex);
      }
    }
  }, [settings, isAuthenticated]);

  const updateSettings = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };
  
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
