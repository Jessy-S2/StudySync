const fs = require('fs');
let code = fs.readFileSync('src/components/MonthlyCalendar.jsx', 'utf8');

const helpers = `
const getLuminance = (r, g, b) => {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const hexToRgb = (hex) => {
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  return { r: parseInt(c.substring(0, 2), 16), g: parseInt(c.substring(2, 4), 16), b: parseInt(c.substring(4, 6), 16) };
};

const isDarkColor = (hex) => {
  if (!hex || hex === 'transparent' || hex === 'none') return false;
  try {
    const rgb = hexToRgb(hex);
    return getLuminance(rgb.r, rgb.g, rgb.b) < 0.179;
  } catch (e) { return false; }
};
`;

code = code.replace('const MonthlyCalendar = ({ tasks, sessions, subjects }) => {', helpers + '\nconst MonthlyCalendar = ({ tasks, sessions, subjects }) => {');

const stateCode = `
  const [colorKeys, setColorKeys] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studysync_weekly_grid_colorkeys') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'studysync_weekly_grid_colorkeys') {
        try {
          setColorKeys(JSON.parse(e.newValue || '[]'));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
`;

code = code.replace('const [hoveredDay, setHoveredDay] = useState(null);', stateCode + '\n  const [hoveredDay, setHoveredDay] = useState(null);');

const jsxInjection = `
        <div className="monthly-toolbar" style={{ display: 'flex', marginBottom: '15px' }}>
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
        </div>
`;

code = code.replace("{view === 'monthly' ? (", jsxInjection + "\n        {view === 'monthly' ? (");

fs.writeFileSync('src/components/MonthlyCalendar.jsx', code, 'utf8');
console.log('Success!');
