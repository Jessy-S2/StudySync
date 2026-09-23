import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFile } from '../utils/fileStorage';
import NotesView from '../components/workspace/NotesView';
import QuizView from '../components/workspace/QuizView';
import FlashcardsView from '../components/workspace/FlashcardsView';
import AssistantView from '../components/workspace/AssistantView';
import { jsPDF } from "jspdf";
import './StudyWorkspace.css';

const StudyWorkspace = () => {
  const { subjectId, unitId, fileId } = useParams();
  const navigate = useNavigate();
  
  const [unit, setUnit] = useState(null);
  const [fileRecord, setFileRecord] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(`studysync_workspace_tab_${fileId}`);
    const validTabs = ['Notes', 'Quiz', 'Flashcards', 'PDF', 'Assistant'];
    if (saved && validTabs.includes(saved)) {
      return saved;
    }
    return 'Notes';
  });

  useEffect(() => {
    localStorage.setItem(`studysync_workspace_tab_${fileId}`, activeTab);
  }, [activeTab, fileId]);
  
  const [generatedData, setGeneratedData] = useState(null);
  const [error, setError] = useState(null);

  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    let url = null;
    
    // 1. Load unit to get unit name
    const savedUnits = localStorage.getItem('studysync_units');
    if (savedUnits) {
      try {
        const parsedUnits = JSON.parse(savedUnits) || [];
        const found = parsedUnits.find(u => u.id === unitId && u.subjectId === subjectId);
        if (found) {
          setUnit(found);
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    // 2. Load file record from DB
    const loadFile = async () => {
      try {
        const record = await getFile(fileId);
        if (record) {
          setFileRecord(record);
          if (record.blob) {
            url = URL.createObjectURL(record.blob);
            setPdfUrl(url);
          }
          if (record.generatedData) {
            setGeneratedData(record.generatedData);
          } else {
            setError("Study material has not been generated for this file yet.");
          }
        } else {
          setError("File not found in database.");
        }
      } catch (err) {
        setError("Error loading file.");
      }
    };
    
    loadFile();
    
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [subjectId, unitId, fileId]);

  const handleDownloadNotes = () => {
    if (!generatedData || !generatedData.notes) return;
    
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - margin * 2;
    let y = 20;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(52, 152, 219);
    const titleLines = doc.splitTextToSize(generatedData.notes.title || "Study Notes", textWidth);
    doc.text(titleLines, margin, y);
    y += (titleLines.length * 10) + 10;
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const subtitleLines = doc.splitTextToSize(`Generated for: ${fileRecord.name}`, textWidth);
    doc.text(subtitleLines, margin, y);
    y += (subtitleLines.length * 7) + 10;

    doc.setTextColor(0, 0, 0);

    generatedData.notes.sections.forEach(section => {
      if (y > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const headingLines = doc.splitTextToSize(section.heading, textWidth);
      doc.text(headingLines, margin, y);
      y += (headingLines.length * 8) + 5;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      section.points.forEach(point => {
        const pointLines = doc.splitTextToSize(`• ${point}`, textWidth - 5);
        if (y + (pointLines.length * 6) > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(pointLines, margin + 5, y);
        y += (pointLines.length * 6) + 3;
      });
      y += 5;
    });

    const safeFilename = fileRecord.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    doc.save(`StudySync_${safeFilename}_Notes.pdf`);
  };

  if (error) {
    return (
      <div className="workspace-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>Error</h2>
          <p style={{ color: '#bdc3c7', marginBottom: '30px', lineHeight: '1.5' }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate(`/subjects/${subjectId}?tab=notes`)}>
            &larr; Back to Notes
          </button>
        </div>
      </div>
    );
  }

  if (!unit || !fileRecord || !generatedData) {
    return <div className="workspace-container">Loading workspace...</div>;
  }

  // Results UI
  return (
    <div className="workspace-container">
      <div className="workspace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button className="workspace-back-btn" onClick={() => navigate(`/subjects/${subjectId}?tab=notes`)}>
            &larr; Back
          </button>
          <h1 className="workspace-title">Unit {unit.unitNumber} - {unit.name}</h1>
          <p style={{ color: '#95a5a6', marginTop: '10px' }}>{fileRecord.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          {activeTab === 'Notes' && generatedData.notes && (
             <button className="btn-primary" onClick={handleDownloadNotes}>
               Download Notes
             </button>
          )}
        </div>
      </div>

      <div className="workspace-layout">
        <div className="workspace-sidebar">
          <button className={`workspace-nav-item ${activeTab === 'Notes' ? 'active' : ''}`} onClick={() => setActiveTab('Notes')}>
            <svg viewBox="0 0 24 24" className="workspace-nav-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Notes
          </button>
          <button className={`workspace-nav-item ${activeTab === 'Quiz' ? 'active' : ''}`} onClick={() => setActiveTab('Quiz')}>
            <svg viewBox="0 0 24 24" className="workspace-nav-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Quiz
          </button>
          <button className={`workspace-nav-item ${activeTab === 'Flashcards' ? 'active' : ''}`} onClick={() => setActiveTab('Flashcards')}>
            <svg viewBox="0 0 24 24" className="workspace-nav-icon">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            Flashcards
          </button>
          <button className={`workspace-nav-item ${activeTab === 'PDF' ? 'active' : ''}`} onClick={() => setActiveTab('PDF')}>
            <svg viewBox="0 0 24 24" className="workspace-nav-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            PDF
          </button>
          <button className={`workspace-nav-item ${activeTab === 'Assistant' ? 'active' : ''}`} onClick={() => setActiveTab('Assistant')}>
            <svg viewBox="0 0 24 24" className="workspace-nav-icon">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Assistant
          </button>
        </div>

        <div className="workspace-content">
          {activeTab === 'Notes' && <NotesView notes={generatedData.notes} />}
          {activeTab === 'Quiz' && <QuizView quiz={generatedData.quiz} />}
          {activeTab === 'Flashcards' && <FlashcardsView flashcards={generatedData.flashcards} />}
          {activeTab === 'Assistant' && <AssistantView fileId={fileId} pdfBlob={fileRecord.blob} />}
          {activeTab === 'PDF' && (
            pdfUrl ? (
              <div style={{ height: 'calc(100vh - 120px)', minHeight: '800px', width: '100%' }}>
                <iframe src={pdfUrl} width="100%" height="100%" style={{ border: 'none', borderRadius: '8px' }} title="PDF Viewer" />
              </div>
            ) : (
              <div className="workspace-placeholder">PDF file is not available or could not be loaded.</div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyWorkspace;
