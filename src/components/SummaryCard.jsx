import React from 'react';
import './SummaryCard.css';

const SummaryCard = ({ title, value }) => {
  return (
    <div className="summary-card">
      <h3 className="summary-card-title">{title}</h3>
      <p className="summary-card-value">{value}</p>
    </div>
  );
};

export default SummaryCard;
