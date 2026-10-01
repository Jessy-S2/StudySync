const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace(
  /import \{ TimerProvider \} from '\.\/context\/TimerContext';/,
  "import { TimerProvider } from './context/TimerContext';\nimport { NotificationProvider } from './context/NotificationContext';"
);
code = code.replace(
  /<UIProvider>\s*<TimerProvider>/,
  "<UIProvider>\n      <NotificationProvider>\n        <TimerProvider>"
);
code = code.replace(
  /<\/TimerProvider>\s*<\/UIProvider>/,
  "</TimerProvider>\n      </NotificationProvider>\n    </UIProvider>"
);
fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx updated');
