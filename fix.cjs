const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyGrid.jsx', 'utf8');

code = code.replace(/<button className="stepper-btn" onClick=\{\(\) => adjustGlobalStart\(60\)\}>.*?<\/button>/g, '<button className="stepper-btn" onClick={() => adjustGlobalStart(60)}>▲</button>');
code = code.replace(/<button className="stepper-btn" onClick=\{\(\) => adjustGlobalStart\(-60\)\}>.*?<\/button>/g, '<button className="stepper-btn" onClick={() => adjustGlobalStart(-60)}>▼</button>');
code = code.replace(/<button className="stepper-btn" onClick=\{\(\) => adjustGlobalEnd\(60\)\}>.*?<\/button>/g, '<button className="stepper-btn" onClick={() => adjustGlobalEnd(60)}>▲</button>');
code = code.replace(/<button className="stepper-btn" onClick=\{\(\) => adjustGlobalEnd\(-60\)\}>.*?<\/button>/g, '<button className="stepper-btn" onClick={() => adjustGlobalEnd(-60)}>▼</button>');

fs.writeFileSync('src/components/WeeklyGrid.jsx', code, 'utf8');
