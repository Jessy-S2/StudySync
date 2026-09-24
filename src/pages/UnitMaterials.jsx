import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../components/UnitModal.css'; // Reuse existing styles for file uploads
import { saveFile, getFile, deleteFile } from '../utils/fileStorage';
import { useUI } from '../context/UIContext';

const UnitMaterials = () => {
  const { subjectId, unitId } = useParams();
  const navigate = useNavigate();
  const { showConfirm, showAlert } = useUI();

  const [unit, setUnit] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  
  useEffect(() => {
    // Load subject
    const savedSubjects = localStorage.getItem('studysync_subjects');
    let subName = 'Unknown Subject';
    if (savedSubjects) {
      try {
        const parsedSubs = JSON.parse(savedSubjects) || [];
        const sub = parsedSubs.find(s => s.id === subjectId);
        if (sub) subName = sub.name;
      } catch (e) {}
    }
    setSubjectName(subName);

    // Load unit
    const savedUnits = localStorage.getItem('studysync_units');
    if (savedUnits) {
      try {
        const parsedUnits = JSON.parse(savedUnits) || [];
        const found = parsedUnits.find(u => u.id === unitId && u.subjectId === subjectId);
        if (found) {
          setUnit(found);
        } else {
          navigate(`/subjects/${subjectId}?tab=units`);
        }
      } catch (e) {
        navigate(`/subjects/${subjectId}?tab=units`);
      }
    } else {
      navigate(`/subjects/${subjectId}?tab=units`);
    }
  }, [subjectId, unitId, navigate]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    const newMaterials = [];
    for (const file of files) {
      const fileId = crypto.randomUUID();
      try {
        await saveFile(fileId, subjectId, unitId, file);
        newMaterials.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type
        });
      } catch (err) {
        console.error(err);
        showAlert(`Failed to save file ${file.name}`, "error");
      }
    }

    if (newMaterials.length > 0) {
      const updatedUnit = { 
        ...unit, 
        materials: [...(unit.materials || []), ...newMaterials] 
      };
      
      setUnit(updatedUnit);
      
      // Save globally
      const savedUnits = JSON.parse(localStorage.getItem('studysync_units') || '[]');
      const updatedUnits = savedUnits.map(u => u.id === unitId ? updatedUnit : u);
      localStorage.setItem('studysync_units', JSON.stringify(updatedUnits));
    }
    
    // Clear input
    e.target.value = '';
  };

  const handleRemoveMaterial = async (id) => {
    showConfirm("Remove Material", "Are you sure you want to remove this material?", async () => {
      try {
        await deleteFile(id);
      } catch (err) {
        console.error("Could not delete from IndexedDB", err);
      }
      
      const updatedUnit = {
        ...unit,
        materials: unit.materials.filter(m => m.id !== id)
      };
      
      setUnit(updatedUnit);
      
      // Save globally
      const savedUnits = JSON.parse(localStorage.getItem('studysync_units') || '[]');
      const updatedUnits = savedUnits.map(u => u.id === unitId ? updatedUnit : u);
      localStorage.setItem('studysync_units', JSON.stringify(updatedUnits));
      showAlert("Material removed.", "info");
    });
  };

  const handleOpenFile = async (id) => {
    try {
      const record = await getFile(id);
      if (record && record.blob) {
        const url = URL.createObjectURL(record.blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000); // Cleanup after a bit
      } else {
        showAlert("File is no longer available for opening (legacy metadata only).", "error");
      }
    } catch (e) {
      console.error(e);
      showAlert("Error opening file.", "error");
    }
  };

  const handleDownloadFile = async (id, name) => {
    try {
      const record = await getFile(id);
      if (record && record.blob) {
        const url = URL.createObjectURL(record.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } else {
        showAlert("File is no longer available for downloading (legacy metadata only).", "error");
      }
    } catch (e) {
      console.error(e);
      showAlert("Error downloading file.", "error");
    }
  };

  if (!unit) return <div className="generic-page">Loading...</div>;

  return (
    <div className="generic-page unit-materials-page">
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <button className="btn-cancel" onClick={() => navigate(`/subjects/${subjectId}?tab=units`)} style={{ marginBottom: '15px' }}>
          &larr; Back to Units
        </button>
        <p style={{ color: '#7f8c8d', margin: '0 0 5px 0' }}>{subjectName}</p>
        <h1 style={{ margin: 0 }}>Unit {unit.unitNumber}: {unit.name}</h1>
      </div>

      <div className="tab-content-container" style={{ marginTop: '20px' }}>
        <div className="tab-section-header">
          <h2>Course Materials</h2>
          <div className="file-upload-wrapper" style={{ marginTop: 0 }}>
            <input 
              type="file" 
              multiple
              accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="file-input"
              id="unit-materials-upload"
            />
            <label htmlFor="unit-materials-upload" className="file-input-label">
              Upload Files
            </label>
          </div>
        </div>

        {(!unit.materials || unit.materials.length === 0) ? (
          <div className="empty-state">
            <p>No materials uploaded for this unit yet.</p>
          </div>
        ) : (
          <ul className="materials-list" style={{ marginTop: '20px' }}>
            {unit.materials.map(mat => (
              <li key={mat.id} className="material-item">
                <span className="material-name" style={{ fontWeight: 500 }}>{mat.name}</span>
                <span style={{ fontSize: '12px', color: '#95a5a6', flex: 1 }}>
                  ({Math.round(mat.size / 1024)} KB)
                </span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button type="button" className="btn-cancel" style={{ padding: '4px 8px', fontSize: '13px' }} onClick={() => handleOpenFile(mat.id)}>Open</button>
                  <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: '13px' }} onClick={() => handleDownloadFile(mat.id, mat.name)}>Download</button>
                  <button type="button" className="btn-remove-material" style={{ marginLeft: '10px' }} onClick={() => handleRemoveMaterial(mat.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="upload-notice" style={{ marginTop: '20px' }}>Note: Files are saved as metadata references due to browser localStorage limits. Blobs are not persistent.</p>
      </div>
    </div>
  );
};

export default UnitMaterials;



