const fs = require('fs');

let code = fs.readFileSync('src/components/TaskCard.jsx', 'utf8');

code = code.replace(
  /<span className="task-subject">\{subjectName \|\| 'Unknown Subject'\}<\/span>/,
  `{subjectName ? <span className="task-subject">{subjectName}</span> : null}`
);

fs.writeFileSync('src/components/TaskCard.jsx', code);
console.log('TaskCard.jsx updated');
