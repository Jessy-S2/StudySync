const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyGrid.jsx', 'utf8');

const regexEnd = /const adjustGlobalEnd = \(deltaMins\) => \{[\s\S]*?return copy;\s*\}\);\s*\};/;
const newEnd = `const adjustGlobalEnd = (deltaMins) => {
      const currentEnd = rowTimes[rowTimes.length - 1];
      const newEnd = currentEnd + deltaMins;
      
      if (newEnd <= rowTimes[0]) return; 
      if (newEnd >= 1440) return; 

      setRowTimes(prev => {
        let copy = [...prev];
        const targetLastRow = newEnd;
        
        if (targetLastRow > copy[copy.length - 1]) {
          if (copy.length > 1 && (copy[copy.length - 1] - copy[0]) % 60 !== 0) {
            copy.pop();
          }
          
          let lastT = copy[copy.length - 1];
          let nextT = copy[0] + Math.ceil((lastT + 1 - copy[0]) / 60) * 60;
          
          while (nextT < targetLastRow) {
            copy.push(nextT);
            nextT += 60;
          }
          if (copy[copy.length - 1] !== targetLastRow) {
            copy.push(targetLastRow);
          }
        } else {
          while (copy.length > 1 && copy[copy.length - 1] > targetLastRow) {
            copy.pop();
          }
          if (copy[copy.length - 1] < targetLastRow) {
            copy.push(targetLastRow);
          }
        }
        return copy;
      });
    };`;

code = code.replace(regexEnd, newEnd);

const regexStart = /const adjustGlobalStart = \(deltaMins\) => \{[\s\S]*?return copy;\s*\}\);\s*\};/;
const newStart = `const adjustGlobalStart = (deltaMins) => {
      const currentStart = rowTimes[0];
      const newStart = currentStart + deltaMins;
      const currentEnd = rowTimes[rowTimes.length - 1];
      
      if (newStart >= currentEnd) return; 
      if (newStart < 0) return;

      setRowTimes(prev => {
        let copy = [...prev];
        const targetFirstRow = newStart;
        
        if (targetFirstRow < copy[0]) {
          let firstT = copy[0];
          let nextT = firstT - 60;
          while (nextT > targetFirstRow) {
            copy.unshift(nextT);
            nextT -= 60;
          }
          if (copy[0] !== targetFirstRow) {
            copy.unshift(targetFirstRow);
          }
        } else {
          while (copy.length > 1 && copy[1] <= targetFirstRow) {
            copy.shift();
          }
          if (copy[0] !== targetFirstRow) {
            copy[0] = targetFirstRow;
          }
        }
        return copy;
      });
    };`;

code = code.replace(regexStart, newStart);

fs.writeFileSync('src/components/WeeklyGrid.jsx', code, 'utf8');
