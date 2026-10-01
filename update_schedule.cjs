const fs = require('fs');
let code = fs.readFileSync('src/pages/Schedule.jsx', 'utf8');

if (!code.includes('useSettings')) {
  code = code.replace(
    "import { useUI } from '../context/UIContext';",
    "import { useUI } from '../context/UIContext';\nimport { useSettings } from '../context/SettingsContext';"
  );
  
  // We can't use a hook inside useState initializer, so we change it to an effect or just use it inside the component.
  // Actually, we can call useSettings at the top of the component.
  code = code.replace(
    "const Schedule = () => {",
    "const Schedule = () => {\n  const { settings } = useSettings();"
  );
  
  code = code.replace(
    "return saved === 'monthly' ? 'monthly' : 'daily';",
    "return saved ? saved : (settings?.study?.defaultScheduleView || 'daily');"
  );
}

fs.writeFileSync('src/pages/Schedule.jsx', code);
console.log('Schedule updated');
