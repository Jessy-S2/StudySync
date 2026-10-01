const fs = require('fs');

let code = fs.readFileSync('src/pages/Settings.jsx', 'utf8');

// Replace the inline styles that break layout
code = code.replace(
  /<div className="setting-row" style=\{\{ marginTop: '-15px', paddingTop: 0, borderTop: 'none' \}\}>/g,
  '<div className="setting-row">'
);

code = code.replace(
  /<div className="setting-row" style=\{\{ marginTop: '-20px', paddingTop: 0, borderTop: 'none', color: '#B91C1C', fontSize: '12px' \}\}>/g,
  '<div className="setting-row" style={{ color: "#B91C1C", fontSize: "13px" }}>'
);

fs.writeFileSync('src/pages/Settings.jsx', code);
console.log('Settings.jsx layout fixed');
