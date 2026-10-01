const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(/<SettingsProvider>\s*<TimerProvider>/, '<TimerProvider>');
code = code.replace(/<\/TimerProvider>\s*<\/SettingsProvider>/, '</TimerProvider>');

code = code.replace(
  '<AuthProvider>',
  '<AuthProvider>\n        <SettingsProvider>'
);
code = code.replace(
  '</AuthProvider>',
  '</SettingsProvider>\n        </AuthProvider>'
);

fs.writeFileSync('src/App.jsx', code);
