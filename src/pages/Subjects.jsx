import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import SubjectCard from '../components/SubjectCard';
import SubjectForm from '../components/SubjectForm';
import './Subjects.css';

const Subjects = () => {
  const navigate = useNavigate();
  const { showConfirm, showAlert } = useUI();
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('studysync_subjects');
    if (saved) {
      try {
        return JSON.parse(saved) || [];
      } catch (e) {
        console.error("Failed to parse subjects", e);
        return [];
      }
    }
    return [];
  });
  const [units] = useState(() => {
    const saved = localStorage.getItem('studysync_units');
    return saved ? JSON.parse(saved) : [];
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    localStorage.setItem('studysync_subjects', JSON.stringify(subjects));
  }, [subjects]);

  const handleOpenForm = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSubject(null);
  };

  const handleSaveSubject = (data) => {
    if (editingSubject) {
      setSubjects(subjects.map(sub => 
        sub.id === editingSubject.id 
          ? { ...sub, ...data } 
          : sub
      ));
    } else {
      const newSubject = {
        id: crypto.randomUUID(),
        ...data,
        currentHours: 0
      };
      setSubjects([...subjects, newSubject]);
    }
    handleCloseForm();
  };

  const handleDeleteSubject = (id) => {
    showConfirm("Delete Subject", "Are you sure you want to delete this subject?", () => {
      setSubjects(subjects.filter(sub => sub.id !== id));
      showAlert("Subject deleted.", "info");
    });
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleSubjectClick = (id) => {
    navigate(`/subjects/${id}`);
  };

  return (
    <div className="generic-page subjects-page">
      <div className="page-header">
        <h1>Subjects</h1>
        <button className="btn-primary" onClick={handleOpenForm}>Add Subject</button>
      </div>
      
      {subjects.length === 0 ? (
        <div className="empty-state">
          <p>No subjects added yet.</p>
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.map(subject => (
            <SubjectCard key={subject.id} subject={subject} unitCount={units.filter(u => u.subjectId === subject.id).length} 
              onClick={handleSubjectClick}
              onEdit={handleEditSubject}
              onDelete={handleDeleteSubject}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <SubjectForm 
          initialData={editingSubject} 
          onSubmit={handleSaveSubject} 
          onCancel={handleCloseForm} 
        />
      )}
    </div>
  );
};

export default Subjects;



