import React, { useState, useEffect } from 'react';
import './TaskForm.css';

const TaskForm = ({ initialData, subjects, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setSubjectId(initialData.subjectId);
      setDueDate(initialData.dueDate);
      setPriority(initialData.priority);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }
    if (!dueDate) {
      setError('Due date is required.');
      return;
    }
    if (!priority) {
      setError('Priority is required.');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      subjectId,
      dueDate,
      priority
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{initialData ? 'Edit Task' : 'Add Task'}</h2>
        
        {error && <div className="form-error">{error}</div>}
        
        {subjects.length === 0 ? (
          <div className="empty-state">
            <p>No subjects available. Add a subject first.</p>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onCancel}>Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
              <label>Task Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Read Chapter 4"
              />
            </div>
            
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="e.g. Complete exercises 1-10"
                rows={3}
              />
            </div>
            
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
                <label>Due Date *</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                />
              </div>

              <div className="form-group half-width">
                <label>Priority *</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
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

export default TaskForm;
