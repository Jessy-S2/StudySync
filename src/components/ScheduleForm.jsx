import React, { useState, useEffect } from 'react';
import './ScheduleForm.css';

const ScheduleForm = ({ initialData, subjects, onSubmit, onCancel }) => {
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setSubjectId(initialData.subjectId);
      setDate(initialData.date);
      setStartTime(initialData.startTime);
      setDuration(initialData.duration.toString());
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }
    if (!startTime) {
      setError('Start time is required.');
      return;
    }
    
    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum <= 0) {
      setError('Duration must be greater than 0.');
      return;
    }

    onSubmit({
      subjectId,
      date,
      startTime,
      duration: durationNum,
      notes: notes.trim()
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{initialData ? 'Edit Session' : 'Add Study Session'}</h2>
        
        {error && <div className="form-error">{error}</div>}
        
        {subjects.length === 0 ? (
          <div className="empty-state">
            <p>No subjects available. Add a subject first.</p>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onCancel}>Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="schedule-form">
            <div className="form-group">
              <label>Subject *</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">-- Select Subject --</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label>Date *</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>

              <div className="form-group half-width">
                <label>Start Time *</label>
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Duration (minutes) *</label>
              <input 
                type="number" 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)} 
                placeholder="e.g. 60"
              />
            </div>
            
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="e.g. Revise React components"
                rows={3}
              />
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
              <button type="submit" className="btn-submit">Save</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ScheduleForm;
