const fs = require('fs');
let code = fs.readFileSync('src/pages/Tasks.jsx', 'utf8');

code = code.replace(
  /const getSubjectName = \(subjectId\) => \{\s*const subject = subjects\.find\(s => s\.id === subjectId\);\s*return subject \? subject\.name : 'Unknown Subject';\s*\};/,
  `const getSubjectName = (subjectId) => {
    if (!subjectId) return 'No Subject';
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };`
);

fs.writeFileSync('src/pages/Tasks.jsx', code);
console.log('Tasks.jsx updated');
