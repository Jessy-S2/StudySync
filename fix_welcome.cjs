const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
content = content.replace(/<h1>Welcome back, \{currentUser\?\.name \|\| 'Student'\}! <span className="wave">.*<\/span><\/h1>/, "<h1>Welcome back, {currentUser?.name || 'Student'}!</h1>");
fs.writeFileSync('src/pages/Dashboard.jsx', content);
console.log('Fixed Welcome back in Dashboard.jsx');
