import React from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickAction.css';

const QuickAction = ({ title, route }) => {
  const navigate = useNavigate();

  return (
    <button className="quick-action-btn" onClick={() => navigate(route)}>
      {title}
    </button>
  );
};

export default QuickAction;
