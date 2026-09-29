const fs = require('fs');
let code = fs.readFileSync('src/App.css', 'utf8');
const idx = code.indexOf('@media');
if (idx > -1) {
  code = code.substring(0, idx);
}
code += `
@media (max-width: 1024px) {
  .main-content {
    margin-left: 80px;
  }
}

@media (max-width: 768px) {
  .main-content,
  .app-container.sidebar-collapsed .main-content {
    margin-left: 0;
    padding-bottom: 70px;
  }
  .generic-page {
    padding: 15px;
  }
}
`;
fs.writeFileSync('src/App.css', code);
