const fs = require('fs');

let code = fs.readFileSync('src/components/SubjectNotes.jsx', 'utf8');

code = code.replace(
  /const navigate = useNavigate\(\);/,
  `const navigate = useNavigate();
  const { settings } = useSettings();`
);

fs.writeFileSync('src/components/SubjectNotes.jsx', code);
console.log('SubjectNotes.jsx fixed');
