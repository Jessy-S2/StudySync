import React, { useState, useEffect } from 'react';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import './Tasks.css';
import { useUI } from '../context/UIContext';

const Tasks = ({ subjectIdFilter }) => {
  const { showConfirm, showAlert } = useUI();
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('studysync_tasks');
    if (saved) {
      try {
        return JSON.parse(saved) || [];
      } catch (e) {
        console.error("Failed to parse tasks", e);
        return [];
      }
    }
    return [];
  });
  
  const [subjects, setSubjects] = useState(() => {
    const savedSubjects = localStorage.getItem('studysync_subjects');
    if (savedSubjects) {
      try {
        return JSON.parse(savedSubjects) || [];
      } catch (e) {
        console.error("Failed to parse subjects", e);
        return [];
      }
    }
    return [];
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('All'); // All, Active, Completed

  useEffect(() => {
    localStorage.setItem('studysync_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleOpenForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (data) => {
    if (editingTask) {
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...data } 
          : task
      ));
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        ...data,
        completed: false
      };
      setTasks([...tasks, newTask]);
    }
    handleCloseForm();
  };

  const handleDeleteTask = (id) => {
    showConfirm("Delete Task", "Are you sure you want to delete this task?", () => {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      showAlert("Task deleted.", "info");
    });
  };

  const handleToggleComplete = (id) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  // Filter and Sort
  const filteredTasks = tasks.filter(task => {
    if (subjectIdFilter && task.subjectId !== subjectIdFilter) return false;
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className={`tasks-page ${subjectIdFilter ? 'nested-tasks' : 'generic-page'}`}>
      {!subjectIdFilter ? (
        <div className="page-header">
          <h1>Tasks</h1>
          <button className="btn-primary" onClick={handleOpenForm}>Add Task</button>
        </div>
      ) : (
        <div className="tab-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '20px' }}>Subject Tasks</h2>
          <button className="btn-primary" onClick={handleOpenForm}>Add Task</button>
        </div>
      )}

      {!subjectIdFilter && (
        <div className="tasks-filters">
          <button 
            className={`filter-btn ${filter === 'All' ? 'active' : ''}`}
            onClick={() => setFilter('All')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'Active' ? 'active' : ''}`}
            onClick={() => setFilter('Active')}
          >
            Active
          </button>
          <button 
            className={`filter-btn ${filter === 'Completed' ? 'active' : ''}`}
            onClick={() => setFilter('Completed')}
          >
            Completed
          </button>
        </div>
      )}
      
      {sortedTasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found.</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {sortedTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task}
              subjectName={getSubjectName(task.subjectId)}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <TaskForm 
          initialData={editingTask} 
          subjects={subjects}
          fixedSubjectId={subjectIdFilter}
          onSubmit={handleSaveTask} 
          onCancel={handleCloseForm} 
        />
      )}
    </div>
  );
};

export default Tasks;





