import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import SubjectUnits from '../components/SubjectUnits';
import SubjectNotes from '../components/SubjectNotes';
import Tasks from './Tasks';
import './SubjectDetails.css';

const SubjectDetails = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subject, setSubject] = useState(null);

  const tabParam = searchParams.get('tab');
  const validTabs = {
    units: 'Units',
    notes: 'Notes',
    tasks: 'Tasks'
  };
  const activeTab = tabParam && validTabs[tabParam.toLowerCase()] 
    ? validTabs[tabParam.toLowerCase()] 
    : 'Units';

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName.toLowerCase() });
  };

  useEffect(() => {
    const saved = localStorage.getItem('studysync_subjects');
    if (saved) {
      try {
        const subjects = JSON.parse(saved) || [];
        const found = subjects.find(s => s.id === subjectId);
        if (found) {
          setSubject(found);
        } else {
          // Subject not found, redirect to subjects
          navigate('/subjects');
        }
      } catch (e) {
        console.error("Failed to parse subjects", e);
        navigate('/subjects');
      }
    } else {
      navigate('/subjects');
    }
  }, [subjectId, navigate]);

  if (!subject) {
    return <div className="generic-page">Loading...</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Units':
        return <SubjectUnits subjectId={subjectId} />;
      case 'Notes':
        return <SubjectNotes subjectId={subjectId} />;
      case 'Tasks':
        return <Tasks subjectIdFilter={subjectId} />;
      default:
        return null;
    }
  };

  return (
    <div className="generic-page subject-details-page">
      <div className="page-header">
        <h1>{subject.name}</h1>
      </div>

      <div className="details-tabs">
        <button 
          className={`tab-btn ${activeTab === 'Units' ? 'active' : ''}`}
          onClick={() => handleTabChange('Units')}
        >
          Units
        </button>
        <button 
          className={`tab-btn ${activeTab === 'Notes' ? 'active' : ''}`}
          onClick={() => handleTabChange('Notes')}
        >
          Notes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'Tasks' ? 'active' : ''}`}
          onClick={() => handleTabChange('Tasks')}
        >
          Tasks
        </button>
      </div>

      <div className="tab-content-container">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SubjectDetails;
