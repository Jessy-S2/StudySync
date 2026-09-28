const fs = require('fs');
const file = 'src/components/MonthlyCalendar.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `        <div className="monthly-toolbar" style={{ display: 'flex', marginBottom: '15px' }}>
          <div className="color-legend">
            <span className="legend-title">Color Key:</span>
            {Object.entries(EVENT_TYPE_COLORS).map(([name, color]) => {
              const dark = isDarkColor(color);
              return (
                <span 
                  key={name} 
                  className="legend-item" 
                  style={{ backgroundColor: color, color: dark ? '#FFFFFF' : '#17143A' }} 
                >
                  {name}
                </span>
              );
            })}
          </div>
        </div>

        {view === 'monthly' ? (
        <div className="calendar-grid">`;

const newCode = `        {view === 'monthly' ? (
        <>
          <div className="monthly-toolbar" style={{ display: 'flex', marginBottom: '15px' }}>
            <div className="color-legend">
              <span className="legend-title">Color Key:</span>
              {Object.entries(EVENT_TYPE_COLORS).map(([name, color]) => {
                const dark = isDarkColor(color);
                return (
                  <span 
                    key={name} 
                    className="legend-item" 
                    style={{ backgroundColor: color, color: dark ? '#FFFFFF' : '#17143A' }} 
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="calendar-grid">`;

code = code.replace(oldCode, newCode);

fs.writeFileSync(file, code);
console.log('Success!');
