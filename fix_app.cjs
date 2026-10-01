const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace(
  "import { SettingsProvider } from './context/SettingsContext';",
  "import { SettingsProvider, useSettings } from './context/SettingsContext';"
);
fs.writeFileSync('src/App.jsx', code);
