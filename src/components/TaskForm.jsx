import React, { useState, useEffect, useRef } from 'react';
import './TaskForm.css';

const TaskForm = ({ initialData, subjects, onSubmit, onCancel, fixedSubjectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState('');

  const [subjectInput, setSubjectInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setDueDate(initialData.dueDate);
      setPriority(initialData.priority);
      
      const sid = initialData.subjectId;
      if (sid) {
        const sub = subjects.find(s => s.id === sid);
        setSubjectInput(sub ? sub.name : sid);
      } else {
        setSubjectInput('');
      }
    } else if (fixedSubjectId) {
      const sub = subjects.find(s => s.id === fixedSubjectId);
      setSubjectInput(sub ? sub.name : fixedSubjectId);
    }
  }, [initialData, fixedSubjectId, subjects]);

  const filteredSubjects = subjectInput 
    ? subjects.filter(s => s.name.toLowerCase().includes(subjectInput.toLowerCase()))
    : subjects;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredSubjects.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < filteredSubjects.length) {
      e.preventDefault();
      setSubjectInput(filteredSubjects[activeIndex].name);
      setShowSuggestions(false);
      setActiveIndex(-1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required.');
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

    const trimmedInput = subjectInput.trim();
    let finalSubjectId = '';
    if (trimmedInput) {
      const matched = subjects.find(s => s.name.toLowerCase() === trimmedInput.toLowerCase());
      finalSubjectId = matched ? matched.id : trimmedInput;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      subjectId: finalSubjectId,
      dueDate,
      priority
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{initialData ? 'Edit Task' : 'Add Task'}</h2>
        
        {error && <div className="form-error">{error}</div>}
        
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
          
          <div className="form-group" ref={suggestionsRef} style={{ position: 'relative' }}>
            <label>Subject (Optional)</label>
            <input 
              type="text" 
              value={subjectInput} 
              onChange={(e) => {
                setSubjectInput(e.target.value);
                setShowSuggestions(true);
                setActiveIndex(-1);
              }}
              onFocus={() => {
                if (subjectInput) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a subject or select one"
              disabled={!!fixedSubjectId}
              autoComplete="off"
            />
            {showSuggestions && subjectInput && filteredSubjects.length > 0 && !fixedSubjectId && (
              <div className="subject-suggestions" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #E6E4EF',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                zIndex: 10,
                maxHeight: '150px',
                overflowY: 'auto',
                marginTop: '4px'
              }}>
                {filteredSubjects.map((sub, idx) => (
                  <div 
                    key={sub.id} 
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      backgroundColor: idx === activeIndex ? '#F8F5FC' : 'white',
                      borderBottom: idx < filteredSubjects.length - 1 ? '1px solid #F0EEFC' : 'none',
                      color: '#17143A',
                      fontSize: '14px'
                    }}
                    onMouseDown={(e) => e.preventDefault()} 
                    onClick={() => {
                      setSubjectInput(sub.name);
                      setShowSuggestions(false);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    {sub.name}
                  </div>
                ))}
              </div>
            )}
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
      </div>
    </div>
  );
};

export default TaskForm;
