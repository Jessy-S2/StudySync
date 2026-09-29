const fs = require('fs');
let code = fs.readFileSync('src/components/MonthlyCalendar.jsx', 'utf8');

const oldStr1 = '<div className="calendar-grid">';
const newStr1 = '<div className="calendar-responsive">\n<div className="calendar-grid">';
code = code.replace(oldStr1, newStr1);

const oldStr2 = '</div></div></>) : (';
const newStr2 = '</div></div></div></>) : (';
code = code.replace(oldStr2, newStr2);

fs.writeFileSync('src/components/MonthlyCalendar.jsx', code);
console.log('Done');
