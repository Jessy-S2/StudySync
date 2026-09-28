const fs = require('fs');
const file = 'src/components/MonthlyCalendar.jsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace("Assignment: '#F97316'", "Assignment: '#14B8A6'");
fs.writeFileSync(file, code);
console.log('Success!');
