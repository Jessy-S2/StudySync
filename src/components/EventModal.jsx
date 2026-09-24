import React, { useState, useEffect } from 'react';

const EventModal = ({ onSave, onDelete, onClose, defaultDate, eventToEdit }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || '');
  const [time, setTime] = useState('');
  const [type, setType] = useState('Other');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || '');
      setDate(eventToEdit.date || '');
      setTime(eventToEdit.time || '');
      setType(eventToEdit.type || 'Other');
      setDescription(eventToEdit.description || '');
    }
  }, [eventToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date) {
      setError('Title and Date are required');
      return;
    }
    onSave({ title, date, time, type, description });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content event-modal">
        <div className="event-modal-header">
          <h3 className="modal-title">{eventToEdit ? 'Edit Event' : 'Add Event'}</h3>
          {error && <div className="form-error">{error}</div>}
        </div>
        
        <div className="event-modal-body">
          <form id="event-form" onSubmit={handleSubmit} className="subject-form">
            <div className="form-group">
              <label>Event Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Final Exam" />
            </div>
            
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Time (Optional)</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Event Type</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="Exam">Exam</option>
                <option value="Assignment">Assignment</option>
                <option value="Project">Project</option>
                <option value="Presentation">Presentation</option>
                <option value="Meeting">Meeting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} placeholder="Additional details..." />
            </div>
          </form>
        </div>

        <div className="event-modal-footer form-actions" style={{ justifyContent: eventToEdit ? 'space-between' : 'flex-end', display: 'flex', width: '100%', gap: '10px' }}>
          {eventToEdit && (
            <button 
              type="button" 
              className="btn-delete" 
              onClick={() => {
                if(onDelete) {
                  onDelete();
                  onClose();
                }
              }}
              style={{ backgroundColor: '#FFEAF2', color: '#e74c3c', border: '1px solid #e74c3c', marginRight: 'auto' }}
            >
              Delete Event
            </button>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" form="event-form" className="btn-submit">{eventToEdit ? 'Save Changes' : 'Add Event'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
