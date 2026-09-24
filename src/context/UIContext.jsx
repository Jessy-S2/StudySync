import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import './UIContext.css';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
};

export const UIProvider = ({ children }) => {
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const [toasts, setToasts] = useState([]);

  const showConfirm = useCallback((title, message, onConfirm, onCancel = null) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmConfig.onConfirm) confirmConfig.onConfirm();
    closeConfirm();
  }, [confirmConfig, closeConfirm]);

  const handleCancel = useCallback(() => {
    if (confirmConfig.onCancel) confirmConfig.onCancel();
    closeConfirm();
  }, [confirmConfig, closeConfirm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && confirmConfig.isOpen) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmConfig.isOpen, handleCancel]);

  const showAlert = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <UIContext.Provider value={{ showConfirm, showAlert }}>
      {children}
      
      {/* Confirm Modal */}
      {confirmConfig.isOpen && (
        <div className="ui-modal-overlay" onClick={handleCancel}>
          <div className="ui-modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="ui-modal-title">{confirmConfig.title}</h3>
            <p className="ui-modal-message">{confirmConfig.message}</p>
            <div className="ui-modal-actions">
              <button className="ui-btn-cancel" onClick={handleCancel}>Cancel</button>
              <button className="ui-btn-confirm" onClick={handleConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="ui-toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`ui-toast ui-toast-${toast.type}`}>
            <span className="ui-toast-icon">
              {toast.type === 'error' ? '⚠' : '✓'}
            </span>
            <span className="ui-toast-message">{toast.message}</span>
            <button className="ui-toast-close" onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>
    </UIContext.Provider>
  );
};
