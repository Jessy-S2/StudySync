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
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/subjects/:subjectId/notes/:unitId/workspace/:fileId" element={<StudyWorkspace />} />
        
        <Route path="*" element={
          <div className="app-container">
            <Sidebar />
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
                  <Route path="/study-timer" element={<StudyTimer />} />
                  <Route path="/progress" element={<Progress />} />
                </Routes>
              </div>
            </main>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
