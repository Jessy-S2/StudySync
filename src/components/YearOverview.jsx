import React from 'react';
import './YearOverview.css';

const YearOverview = ({ year, setYear }) => {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renderMiniCalendar = (month) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const startDay = firstDay;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`pad-${i}`} className="mini-cell empty"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const currentWeekDay = (startDay + day - 1) % 7;
      const isWeekend = currentWeekDay === 0 || currentWeekDay === 6;
      cells.push(
        <div key={`day-${day}`} className={`mini-cell ${isWeekend ? 'weekend' : ''}`}>
          {day}
        </div>
      );
    }

    return (
      <div className="mini-calendar" key={month}>
        <div className="mini-month-name">{monthNames[month]}</div>
        <div className="mini-header">
          <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
        </div>
        <div className="mini-body">
          {cells}
        </div>
      </div>
    );
  };

  return (
    <div className="year-overview">
      <div className="year-navigation">
        <button className="nav-btn" onClick={() => setYear(year - 1)}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Previous Year
        </button>
        <h2>{year}</h2>
        <button className="nav-btn" onClick={() => setYear(year + 1)}>
          Next Year
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
      <div className="year-grid">
        {monthNames.map((_, idx) => renderMiniCalendar(idx))}
      </div>
    </div>
  );
};

export default YearOverview;
