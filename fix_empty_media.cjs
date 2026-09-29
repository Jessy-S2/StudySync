const fs = require('fs');
let code = fs.readFileSync('src/components/MonthlyCalendar.css', 'utf8');

code = code.replace(/@media \(max-width: 768px\) \{\s*\/\*.*?\*\/\s*\}/g, '');

fs.writeFileSync('src/components/MonthlyCalendar.css', code);
