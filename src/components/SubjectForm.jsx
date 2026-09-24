import React, { useState, useEffect } from 'react';
import './SubjectForm.css';

const SubjectForm = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetHours, setTargetHours] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setTargetHours(initialData.targetHours.toString());
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Subject name is required.');
      return;
    }

    

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{initialData ? 'Edit Subject' : 'Add Subject'}</h2>
        
        {error && <div className="form-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="subject-form">
          <div className="form-group">
            <label>Subject Name *</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Mathematics"
            />
          </div>
          
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="e.g. Calculus and Linear Algebra"
              rows={3}
            />
          </div>
          
          
          
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectForm;


