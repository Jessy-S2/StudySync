const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyGrid.jsx', 'utf8');

const regexEnd = /const adjustGlobalEnd = \(deltaMins\) => \{[\s\S]*?return copy;\s*\}\);\s*\};/;
const regexStart = /const adjustGlobalStart = \(deltaMins\) => \{[\s\S]*?return copy;\s*\}\);\s*\};/;

const generateFn = `
  const generateTimes = (start, end) => {
    const times = [];
    let current = start;
    const interval = 60;
    while (current <= end) {
      times.push(current);
      let next = current + interval;
      if (next > end) {
        if (current !== end) {
          times.push(end);
        }
        break;
      }
      current = next;
    }
    return times;
  };`;

const newStart = `const adjustGlobalStart = (deltaMins) => {
      const currentStart = rowTimes[0];
      const newStart = currentStart + deltaMins;
      const currentEnd = rowTimes[rowTimes.length - 1];
      
      if (newStart >= currentEnd) return; 
      if (newStart < 0) return;
  
      setRowTimes(generateTimes(newStart, currentEnd));
    };`;

const newEnd = `const adjustGlobalEnd = (deltaMins) => {
      const currentEnd = rowTimes[rowTimes.length - 1];
      const newEnd = currentEnd + deltaMins;
      
      if (newEnd <= rowTimes[0]) return; 
      if (newEnd >= 1440) return; 
  
      setRowTimes(generateTimes(rowTimes[0], newEnd));
    };`;

code = code.replace(regexStart, generateFn + '\n\n  ' + newStart);
code = code.replace(regexEnd, newEnd);

fs.writeFileSync('src/components/WeeklyGrid.jsx', code, 'utf8');
