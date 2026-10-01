const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

code = code.replace(
  /const getSubjectName = \(subjectId\) => \{\s*const sub = subjects\.find\(s => s\.id === subjectId\);\s*return sub \? sub\.name : 'Unknown Subject';\s*\};/,
  `const getSubjectName = (subjectId) => {
    if (!subjectId) return 'No Subject';
    const sub = subjects.find(s => s.id === subjectId);
    return sub ? sub.name : 'Unknown Subject';
  };`
);

fs.writeFileSync('src/pages/Dashboard.jsx', code);
console.log('Dashboard.jsx updated');
