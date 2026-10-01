const fs = require('fs');
let code = fs.readFileSync('src/components/FloatingTimer.jsx', 'utf8');

code = code.replace(/'🟢'/g, '(<svg viewBox="0 0 24 24" width="12" height="12" fill="#10B981"><circle cx="12" cy="12" r="10"/></svg>)');
code = code.replace(/'⏸'/g, '(<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>)');
code = code.replace(/'▶️'/g, '(<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>)');
code = code.replace(/>⏸</g, '><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg><');
code = code.replace(/>▶️</g, '><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><');

fs.writeFileSync('src/components/FloatingTimer.jsx', code);
console.log('Replaced emojis in FloatingTimer.jsx with SVGs');
