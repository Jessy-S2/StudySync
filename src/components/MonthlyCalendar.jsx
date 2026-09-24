import React, { useState, useEffect } from 'react';
import './MonthlyCalendar.css';
import YearOverview from './YearOverview';
import EventModal from './EventModal';
import { useUI } from '../context/UIContext';

export const EVENT_TYPE_COLORS = {
  Exam: '#8B5CF6',
  Assignment: '#3B82F6',
  Project: '#F59E0B',
  Presentation: '#EC4899',
  Meeting: '#22C55E',
  Other: '#A855F7'
};

const MonthlyCalendar = ({ tasks, sessions, subjects }) => {
  const { showConfirm, showAlert } = useUI();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('studysync_calendar_events');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [view, setView] = useState(() => {
    const savedView = localStorage.getItem('studysync_schedule_calendar_view');
    return savedView === 'yearly' ? 'yearly' : 'monthly';
  });
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);

  // Tooltip state
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    localStorage.setItem('studysync_schedule_calendar_view', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('studysync_calendar_events', JSON.stringify(events));
  }, [events]);

  const handleSaveEvent = (eventData) => {
    if (eventToEdit) {
      setEvents(events.map(e => e.id === eventToEdit.id ? { ...e, ...eventData } : e));
    } else {
      setEvents([...events, { id: crypto.randomUUID(), ...eventData }]);
    }
    setIsEventModalOpen(false);
    setEventToEdit(null);
  };

  const handleDeleteEvent = (id) => {
    showConfirm("Delete Event", "Are you sure you want to delete this event?", () => {
      setEvents(events.filter(e => e.id !== id));
      setHoveredDay(null);
      showAlert("Event deleted.", "info");
    });
  };

  // Monthly Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  // Compile all items for a given date string 'YYYY-MM-DD'
  const getItemsForDate = (dateStr) => {
    const dayEvents = events.filter(e => e.date === dateStr).map(e => ({
      ...e,
      itemType: 'event',
      displayTitle: e.title,
      isCompleted: false
    }));

    const dayTasks = tasks.filter(t => t.dueDate === dateStr).map(t => ({
      ...t,
      itemType: 'task',
      displayTitle: t.title,
      isCompleted: t.completed
    }));

    const daySessions = sessions.filter(s => s.date === dateStr).map(s => {
      const subject = subjects.find(sub => sub.id === s.subjectId);
      return {
        ...s,
        itemType: 'session',
        displayTitle: subject ? subject.name : 'Study Session',
        isCompleted: s.completed
      };
    });

    return [...dayEvents, ...dayTasks, ...daySessions];
  };

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  // Adjust so Monday is 0
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const renderCells = () => {
    const cells = [];
    
    // Previous month padding
    for (let i = 0; i < startDay; i++) {
      const dayNum = daysInPrevMonth - startDay + i + 1;
      cells.push(<div key={`prev-${i}`} className="cal-cell padded">{dayNum}</div>);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayItems = getItemsForDate(dateStr);
      
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = selectedDate === dateStr;

      cells.push(
        <div 
          key={`day-${day}`} 
          className={`cal-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(dateStr)}
          onMouseEnter={(e) => {
            if (dayItems.length > 2) {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPos({ x: rect.left + window.scrollX + rect.width / 2, y: rect.top + window.scrollY });
              setHoveredDay(dateStr);
            }
          }}
          onMouseLeave={() => setHoveredDay(null)}
        >
          <div className="cal-day-num">{day}</div>
          <div className="cal-items">
            {dayItems.slice(0, 2).map((item, idx) => {
              const isEvent = item.itemType === 'event';
              const eventColor = isEvent ? (EVENT_TYPE_COLORS[item.type] || EVENT_TYPE_COLORS.Other) : null;
              
              return (
                <div 
                  key={idx} 
                  className={`cal-item type-${item.itemType} ${item.isCompleted ? 'completed' : ''}`}
                  style={isEvent ? { backgroundColor: `${eventColor}33`, borderLeftColor: eventColor, cursor: 'pointer' } : {}}
                  onClick={(e) => {
                    if (isEvent) {
                      e.stopPropagation();
                      setEventToEdit(item);
                      setIsEventModalOpen(true);
                    }
                  }}
                >
                  {item.displayTitle}
                </div>
              );
            })}
            {dayItems.length > 2 && (
              <div className="cal-more-indicator">+{dayItems.length - 2} more</div>
            )}
          </div>

          {hoveredDay === dateStr && (
            <div 
              className="cal-tooltip"
              style={{
                position: 'fixed',
                left: tooltipPos.x,
                top: tooltipPos.y - 10,
                transform: 'translate(-50%, -100%)',
                zIndex: 1000
              }}
            >
              <h4>{dateStr}</h4>
              <div className="tooltip-items">
                {dayItems.map((item, idx) => {
                  const isEvent = item.itemType === 'event';
                  const eventColor = isEvent ? (EVENT_TYPE_COLORS[item.type] || EVENT_TYPE_COLORS.Other) : null;
                  
                  return (
                    <div key={idx} className={`tooltip-item type-${item.itemType} ${item.isCompleted ? 'completed' : ''}`}>
                      <span className="dot" style={isEvent ? { backgroundColor: eventColor } : {}}></span>
                      <span className="title" style={{ flex: 1, cursor: isEvent ? 'pointer' : 'default' }} onClick={(e) => {
                        if (isEvent) {
                          e.stopPropagation();
                          setEventToEdit(item);
                          setIsEventModalOpen(true);
                        }
                      }}>
                        {item.displayTitle}
                      </span>
                      {item.time && <span className="time">{item.time}</span>}
                      {item.startTime && <span className="time">{item.startTime}</span>}
                      {isEvent && (
                        <div className="tooltip-actions" style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                          <button 
                            className="icon-btn" 
                            onClick={(e) => { e.stopPropagation(); setEventToEdit(item); setIsEventModalOpen(true); }}
                            style={{ background: 'none', border: 'none', color: '#a8a8a8', cursor: 'pointer', padding: 0 }}
                            title="Edit Event"
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button 
                            className="icon-btn" 
                            onClick={(e) => { e.stopPropagation(); handleDeleteEvent(item.id); }}
                            style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0 }}
                            title="Delete Event"
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Next month padding
    const totalCells = cells.length;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      cells.push(<div key={`next-${i}`} className="cal-cell padded">{i}</div>);
    }

    return cells;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="monthly-schedule-container">
      <div className="monthly-header">
        <div className="view-toggles">
          <button className={`toggle-btn ${view === 'monthly' ? 'active' : ''}`} onClick={() => setView('monthly')}>Monthly View</button>
          <button className={`toggle-btn ${view === 'yearly' ? 'active' : ''}`} onClick={() => setView('yearly')}>Year Overview</button>
        </div>
        
        {view === 'monthly' && (
          <div className="month-navigation">
            <button className="nav-btn" onClick={prevMonth}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
              Prev
            </button>
            <h2 className="current-month">{monthNames[month]} {year}</h2>
            <button className="nav-btn" onClick={nextMonth}>
              Next
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        )}

        {view === 'monthly' && (
          <button className="btn-primary add-event-btn" onClick={() => {
            setEventToEdit(null);
            setIsEventModalOpen(true);
          }}>+ Add Event</button>
        )}
      </div>

      {view === 'monthly' ? (
        <div className="calendar-grid">
          <div className="cal-header">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
          </div>
          <div className="cal-body">
            {renderCells()}
          </div>
        </div>
      ) : (
        <YearOverview year={currentDate.getFullYear()} setYear={(y) => setCurrentDate(new Date(y, 0, 1))} />
      )}

      {isEventModalOpen && (
        <EventModal 
          onSave={handleSaveEvent} 
          onDelete={() => {
            if (eventToEdit && eventToEdit.id) {
              handleDeleteEvent(eventToEdit.id);
            }
          }}
          onClose={() => {
            setIsEventModalOpen(false);
            setEventToEdit(null);
          }} 
          defaultDate={selectedDate || `${year}-${String(month + 1).padStart(2, '0')}-01`}
          eventToEdit={eventToEdit}
        />
      )}
    </div>
  );
};

export default MonthlyCalendar;



