import React from 'react';

const NotesView = ({ notes }) => {
  if (!notes || !notes.sections) {
    return <div className="workspace-placeholder">Notes format is invalid.</div>;
  }

  return (
    <div className="notes-view" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
      <h2 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '20px' }}>
        {notes.title || "Study Notes"}
      </h2>
      
      {notes.sections.map((section, idx) => (
        <div key={idx} style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#3498db', fontSize: '20px', marginBottom: '10px' }}>{section.heading}</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            {section.points.map((point, pIdx) => (
              <li key={pIdx} style={{ marginBottom: '8px' }}>{point}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default NotesView;
