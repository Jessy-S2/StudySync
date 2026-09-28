const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyGrid.jsx', 'utf8');

// We will find the start of adjustGlobalStart and the end of adjustGlobalEnd.
const startStr = "const adjustGlobalStart = (deltaMins) => {";
const endStr = "const handleRowTimeEdit = (e, r) => {";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find boundaries!");
  process.exit(1);
}

const replacement = `const generateTimes = (start, end) => {
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
  };

  const adjustGlobalStart = (deltaMins) => {
    const currentStart = rowTimes[0];
    const newStart = currentStart + deltaMins;
    const currentEnd = rowTimes[rowTimes.length - 1];
    
    if (newStart >= currentEnd) return; 
    if (newStart < 0) return;

    setRowTimes(generateTimes(newStart, currentEnd));
  };

  const adjustGlobalEnd = (deltaMins) => {
    const currentEnd = rowTimes[rowTimes.length - 1];
    const newEnd = currentEnd + deltaMins;
    
    if (newEnd <= rowTimes[0]) return; 
    if (newEnd >= 1440) return; 

    setRowTimes(generateTimes(rowTimes[0], newEnd));
  };

  `;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

// Also need to fix the <input type="time"> logic in the header
// It currently does adjustGlobalStart(delta). It works natively since it just passes delta.
// But we want to be safe and verify.

fs.writeFileSync('src/components/WeeklyGrid.jsx', code, 'utf8');
console.log("Successfully replaced generation logic!");
