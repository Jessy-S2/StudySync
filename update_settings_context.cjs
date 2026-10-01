const fs = require('fs');
let code = fs.readFileSync('src/context/SettingsContext.jsx', 'utf8');

code = code.replace(
  /notifyBeforeDeadline: 30/,
  `notifyBeforeDeadline: 1440,
    customNotifyValue: 5,
    customNotifyUnit: 'Days'`
);

fs.writeFileSync('src/context/SettingsContext.jsx', code);
console.log('SettingsContext updated');
