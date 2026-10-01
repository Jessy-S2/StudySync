const fs = require('fs');
let code = fs.readFileSync('src/components/Header.jsx', 'utf8');

code = code.replace(
  /<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">[\s\S]*?<path d="M18 8A6 6 0 0 0 6 8c0 7-3-9-3 9h18s-3-2-3-9"><\/path>[\s\S]*?<path d="M13\.73 21a2 2 0 0 1-3\.46 0"><\/path>[\s\S]*?<\/svg>/,
  '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>'
);

fs.writeFileSync('src/components/Header.jsx', code);
console.log('Fixed bell icon.');
