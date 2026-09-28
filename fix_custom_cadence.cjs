const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyGrid.jsx', 'utf8');

const startIndex = code.indexOf("const generateTimes = (start, end) => {");
const endIndex = code.indexOf("const handleRowTimeEdit = (e, r) => {");

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find boundaries!");
  process.exit(1);
}

const replacement = `const adjustGlobalStart = (deltaMins) => {
    const currentStart = rowTimes[0];
    const newStart = currentStart + deltaMins;
    const currentEnd = rowTimes[rowTimes.length - 1];
    
    if (newStart >= currentEnd) return; 
    if (newStart < 0) return;

    setRowTimes(prev => {
      let copy = [...prev];
      const targetFirstRow = newStart;
      
      if (targetFirstRow < copy[0]) {
        while (copy[0] - 60 >= targetFirstRow) {
          copy.unshift(copy[0] - 60);
        }
        if (copy[0] !== targetFirstRow) {
          copy.unshift(targetFirstRow);
        }
      } else {
        while (copy.length > 1 && copy[0] < targetFirstRow) {
          copy.shift();
        }
        if (copy[0] !== targetFirstRow) {
          copy.unshift(targetFirstRow);
        }
      }
      return copy;
    });
  };

  const adjustGlobalEnd = (deltaMins) => {
    const currentEnd = rowTimes[rowTimes.length - 1];
    const newEnd = currentEnd + deltaMins;
    
    if (newEnd <= rowTimes[0]) return; 
    if (newEnd >= 1440) return; 

    setRowTimes(prev => {
      let copy = [...prev];
      const targetLastRow = newEnd;
      
      if (targetLastRow > copy[copy.length - 1]) {
        while (copy[copy.length - 1] + 60 <= targetLastRow) {
          copy.push(copy[copy.length - 1] + 60);
        }
        if (copy[copy.length - 1] !== targetLastRow) {
          copy.push(targetLastRow);
        }
      } else {
        while (copy.length > 1 && copy[copy.length - 1] > targetLastRow) {
          copy.pop();
        }
        if (copy[copy.length - 1] !== targetLastRow) {
          copy.push(targetLastRow);
        }
      }
      return copy;
    });
  };

  `;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

// Also need to check if <input type="time"> uses adjustGlobalEnd correctly.
// Yes, it does `adjustGlobalEnd(delta)`. That will work perfectly with the new logic.

fs.writeFileSync('src/components/WeeklyGrid.jsx', code, 'utf8');
console.log("Success!");
