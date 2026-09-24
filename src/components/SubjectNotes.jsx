import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFilesBySubject, updateFileGenerationStatus, updateFileGeneratedData, getFile } from '../utils/fileStorage';
import { generateStudyMaterial } from '../services/geminiService';

const SubjectNotes = ({ subjectId }) => {
  const navigate = useNavigate();
  const [units] = useState(() => {
    const saved = localStorage.getItem('studysync_units');
    if (saved) {
      try {
        return JSON.parse(saved) || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [subjectFiles, setSubjectFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressStatus, setProgressStatus] = useState({});

  const fetchFiles = async () => {
    try {
      const files = await getFilesBySubject(subjectId);
      setSubjectFiles(files);
    } catch (e) {
      console.error("Failed to load files", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [subjectId]);

  const subjectUnits = units.filter(u => u.subjectId === subjectId)
    .sort((a, b) => {
      const numA = parseInt(a.unitNumber) || 0;
      const numB = parseInt(b.unitNumber) || 0;
      return numA - numB;
    });

  const handleUnitClick = (unitId, fileId) => {
    navigate(`/subjects/${subjectId}/notes/${unitId}/workspace/${fileId}`);
  };

  const handleGenerate = async (e, file) => {
    e.stopPropagation();
    
    try {
      // 1. Update UI state immediately
      await updateFileGenerationStatus(file.fileId, 'generating');
      fetchFiles(); // Re-render to show progress string
      
      const onProgress = (statusText) => {
        setProgressStatus(prev => ({ ...prev, [file.fileId]: statusText }));
      };
      onProgress("Reading PDF...");

      // 2. Fetch blob
      const record = await getFile(file.fileId);

      // 3. Generate structured material using the original PDF blob
      const generatedData = await generateStudyMaterial(record.blob, onProgress);
      
      // 4. Save and mark completed
      await updateFileGeneratedData(file.fileId, generatedData);
      
      setProgressStatus(prev => ({ ...prev, [file.fileId]: undefined }));
      fetchFiles();
    } catch (err) {
      console.error(err);
      await updateFileGenerationStatus(file.fileId, 'error');
      setProgressStatus(prev => ({ ...prev, [file.fileId]: `Generation failed: ${err.message}` }));
      fetchFiles();
    }
  };

  if (loading) {
    return <div className="subject-notes"><p>Loading notes...</p></div>;
  }

  // Find units that actually have uploaded PDFs
  const unitsWithFiles = subjectUnits.filter(unit => 
    subjectFiles.some(f => f.unitId === unit.id)
  );

  return (
    <div className="subject-notes" >
      <div className="tab-section-header">
        <h2 style={{ color: '#17143A', margin: '0 0 20px 0' }}>Notes</h2>
      </div>

      {unitsWithFiles.length === 0 ? (
        <div className="empty-state">
          <p>No study materials uploaded yet. Upload a PDF in the Units tab to begin.</p>
        </div>
      ) : (
        <div className="units-list">
          {unitsWithFiles.map(unit => {
            const filesForUnit = subjectFiles.filter(f => f.unitId === unit.id);
            
            return (
              <div key={unit.id} className="unit-notes-group" style={{ marginBottom: '20px', border: '1px solid #E6E4EF', borderRadius: '8px', padding: '15px', backgroundColor: '#F7F8FC' }}>
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#17143A' }}>Unit {unit.unitNumber} - {unit.name}</h3>
                </div>
                
                <div className="unit-files-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filesForUnit.map(file => {
                    const status = file.generationStatus || 'idle';
                    
                    return (
                      <div key={file.fileId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '15px', borderRadius: '4px' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '500', color: '#17143A' }}>{file.name}</p>
                          
                          {status === 'generating' && (
                            <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#5B2DBB' }}>
                              {progressStatus[file.fileId] || "Generating study material..."}
                            </p>
                          )}
                          
                          {status === 'completed' && (
                            <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#2ecc71' }}>
                              Study material ready
                            </p>
                          )}
                          
                          {status === 'error' && (
                            <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#e74c3c' }}>
                              {progressStatus[file.fileId] || "Generation failed. Please try again."}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          {status === 'completed' ? (
                            <button 
                              className="btn-primary" 
                              onClick={() => handleUnitClick(unit.id, file.fileId)}
                              style={{ padding: '8px 16px' }}
                            >
                              Get Notes
                            </button>
                          ) : status === 'generating' ? (
                            <button 
                              className="btn-primary" 
                              disabled
                              style={{ padding: '8px 16px', opacity: 0.5, cursor: 'not-allowed' }}
                            >
                              Generating...
                            </button>
                          ) : (
                            <button 
                              className="btn-primary" 
                              onClick={(e) => handleGenerate(e, file)}
                              style={{ padding: '8px 16px', backgroundColor: status === 'error' ? 'transparent' : undefined, border: status === 'error' ? '1px solid #e74c3c' : undefined, color: status === 'error' ? '#e74c3c' : undefined }}
                            >
                              {status === 'error' ? 'Retry' : 'Generate Notes'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectNotes;


