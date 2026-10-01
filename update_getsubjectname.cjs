const fs = require('fs');

const fixGetSubjectName = (file) => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /const getSubjectName = \(subjectId\) => \{[\s\S]*?\};\n/,
    `const getSubjectName = (subjectId) => {
    if (!subjectId) return '';
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : subjectId;
  };\n`
  );
  
  // also in Dashboard.jsx, update where it displays subject Name if it shouldn't show the bullet point when empty
  if (file.includes('Dashboard')) {
    code = code.replace(
      /<p>\{getSubjectName\(task\.subjectId\)\} &bull; Due: \{task\.dueDate\}<\/p>/g,
      `<p>{getSubjectName(task.subjectId) ? getSubjectName(task.subjectId) + ' • ' : ''}Due: {task.dueDate}</p>`
    );
  }
  
  fs.writeFileSync(file, code);
  console.log(file + ' updated');
}

fixGetSubjectName('src/pages/Tasks.jsx');
fixGetSubjectName('src/pages/Dashboard.jsx');
