import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetails from './pages/SubjectDetails';
import UnitMaterials from './pages/UnitMaterials';
import StudyWorkspace from './pages/StudyWorkspace';
import Tasks from './pages/Tasks';
import Schedule from './pages/Schedule';
import StudyTimer from './pages/StudyTimer';
import Progress from './pages/Progress';
import Login from './pages/Login';
import Register from './pages/Register';
import { UIProvider } from './context/UIContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Settings from './pages/Settings';
import { TimerProvider } from './context/TimerContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import FloatingTimer from './components/FloatingTimer';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();
  const { settings } = useSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    if (settings?.appearance?.rememberSidebar) {
      const saved = localStorage.getItem('studysync_sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('studysync_sidebar_collapsed', newState);
      return newState;
    });
  };

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <UIProvider>
      <NotificationProvider>
        <TimerProvider>
        <Routes>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />
          <Route path="/subjects/:subjectId/notes/:unitId/workspace/:fileId" element={<StudyWorkspace />} />
          
          <Route path="*" element={
            <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
              <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
              <main className="main-content">
                <Header />
                <div className="page-content">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/subjects" element={<Subjects />} />
                    <Route path="/subjects/:subjectId" element={<SubjectDetails />} />
                    <Route path="/subjects/:subjectId/units/:unitId" element={<UnitMaterials />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/timer" element={<StudyTimer />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </main>
            </div>
          } />
        </Routes>
        <FloatingTimer />
      </TimerProvider>
      </NotificationProvider>
    </UIProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
        <AppContent />
      </SettingsProvider>
        </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
