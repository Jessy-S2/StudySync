import React, { useState, useEffect } from 'react';
import './SubjectForm.css';
import './UnitModal.css';

const UnitModal = ({ initialData, onSubmit, onCancel }) => {
  const [unitNumber, setUnitNumber] = useState('');
  const [name, setName] = useState('');
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setUnitNumber(initialData.unitNumber || '');
      setName(initialData.name || '');
      setMaterials(initialData.materials || []);
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newMaterials = files.map(file => ({
      id: crypto.randomUUID(), // This will act as fileId
      name: file.name,
      size: file.size,
      type: file.type,
      rawFile: file
    }));
    setMaterials([...materials, ...newMaterials]);
    // Clear input
    e.target.value = '';
  };

  const handleRemoveMaterial = (id) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!unitNumber.trim()) {
      setError('Unit number is required.');
      return;
    }
    if (!name.trim()) {
      setError('Unit name is required.');
      return;
    }

    onSubmit({
      unitNumber: unitNumber.trim(),
      name: name.trim(),
      materials
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{initialData ? 'Edit Unit' : 'Add Unit'}</h2>
        
        {error && <div className="form-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="unit-form">
          <div className="form-row">
            <div className="form-group half-width">
              <label>Unit Number *</label>
              <input 
                type="text" 
                value={unitNumber} 
                onChange={(e) => setUnitNumber(e.target.value)} 
                placeholder="e.g. 1"
              />
            </div>
            <div className="form-group half-width" style={{ flex: 2 }}>
              <label>Unit Name *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Introduction to React JS"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Study Material</label>
            <div className="file-upload-wrapper">
              <input 
                type="file" 
                multiple
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="file-input"
                id="unit-files"
              />
              <label htmlFor="unit-files" className="file-input-label">
                Choose Files
              </label>
            </div>
            
            {materials.length > 0 && (
              <ul className="materials-list">
                {materials.map(mat => (
                  <li key={mat.id} className="material-item">
                    <span className="material-name">{mat.name}</span>
                    <button type="button" className="btn-remove-material" onClick={() => handleRemoveMaterial(mat.id)}>✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-submit">{initialData ? 'Save Changes' : 'Add Unit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitModal;
