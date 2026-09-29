const fs = require('fs');
let code = fs.readFileSync('src/App.css', 'utf8');

const regex = /@media\s*\(max-width:\s*992px\)\s*\{[\s\S]*?\}/;
const newMedia = `@media (max-width: 1024px) {
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
}`;

if (regex.test(code)) {
    code = code.replace(regex, newMedia);
} else {
    code += '\n' + newMedia;
}

fs.writeFileSync('src/App.css', code);
console.log('App.css updated');
