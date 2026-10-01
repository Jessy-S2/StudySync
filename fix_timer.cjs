const fs = require('fs');
let code = fs.readFileSync('src/context/TimerContext.jsx', 'utf8');

if (!code.includes("import { useSettings } from './SettingsContext';")) {
  code = code.replace(
    "import { useUI } from './UIContext';",
    "import { useUI } from './UIContext';\nimport { useSettings } from './SettingsContext';"
  );
}

fs.writeFileSync('src/context/TimerContext.jsx', code);
