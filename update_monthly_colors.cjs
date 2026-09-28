const fs = require('fs');
let code = fs.readFileSync('src/components/MonthlyCalendar.jsx', 'utf8');

// Replace EVENT_TYPE_COLORS
const oldColors = `export const EVENT_TYPE_COLORS = {
  Exam: '#8B5CF6',
  Assignment: '#3B82F6',
  Project: '#F59E0B',
  Presentation: '#EC4899',
  Meeting: '#22C55E',
  Other: '#A855F7'
};`;
const newColors = `export const EVENT_TYPE_COLORS = {
  Exam: '#EF4444',
  Assignment: '#F97316',
  Project: '#EAB308',
  Presentation: '#22C55E',
  Meeting: '#3B82F6',
  Other: '#A855F7'
};`;

code = code.replace(oldColors, newColors);

// Remove colorKeys state and effect
const stateRegex = /const \[colorKeys, setColorKeys\] = useState\(\(\) => \{[\s\S]*?\}\);\s*useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/;
code = code.replace(stateRegex, '');

// Replace the toolbar
const oldToolbar = `<div className="monthly-toolbar" style={{ display: 'flex', marginBottom: '15px' }}>
          <div className="color-legend">
            <span className="legend-title">Color Key:</span>
            {colorKeys.length > 0 ? colorKeys.map(k => {
              const dark = isDarkColor(k.color);
              return (
                <span 
                  key={k.id} 
                  className="legend-item" 
                  style={{ backgroundColor: k.color, color: dark ? '#FFFFFF' : '#17143A' }} 
                >
                  {k.name}
                </span>
              );
            }) : (
               <span style={{ fontSize: '13px', color: '#6F6878' }}>No color keys added yet.</span>
            )}
          </div>
        </div>`;

const newToolbar = `<div className="monthly-toolbar" style={{ display: 'flex', marginBottom: '15px' }}>
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
        </div>`;

code = code.replace(oldToolbar, newToolbar);

fs.writeFileSync('src/components/MonthlyCalendar.jsx', code, 'utf8');
console.log('Success!');
