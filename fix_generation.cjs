const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyGrid.jsx', 'utf8');

const oldEnd = `    const adjustGlobalEnd = (deltaMins) => {
      const currentEnd = rowTimes[rowTimes.length - 1];
      const newEnd = currentEnd + deltaMins;
      
      if (newEnd <= rowTimes[0]) return; 

      setRowTimes(prev => {
        let copy = [...prev];
        const interval = copy.length > 1 ? copy[copy.length - 1] - copy[copy.length - 2] : 60;
        const targetLastRow = newEnd;
        
        if (targetLastRow > copy[copy.length - 1]) {
          while (copy[copy.length - 1] < targetLastRow) {
            copy.push(copy[copy.length - 1] + interval);
          }
          copy[copy.length - 1] = targetLastRow;
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

const newEnd = `    const adjustGlobalEnd = (deltaMins) => {
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


const oldStart = `    const adjustGlobalStart = (deltaMins) => {
      const currentStart = rowTimes[0];
      const newStart = currentStart + deltaMins;
      const currentEnd = rowTimes[rowTimes.length - 1];
      
      if (newStart >= currentEnd) return; 

      setRowTimes(prev => {
        let copy = [...prev];
        const interval = copy.length > 1 ? copy[1] - copy[0] : 60;
        
        if (newStart < copy[0]) {
          while (copy[0] > newStart) {
            copy.unshift(copy[0] - interval);
          }
          copy[0] = newStart; 
        } else {
          while (copy.length > 1 && copy[1] <= newStart) {
            copy.shift();
          }
          copy[0] = newStart;
        }
        return copy;
      });
    };`;

const newStart = `    const adjustGlobalStart = (deltaMins) => {
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

code = code.replace(oldEnd, newEnd);
code = code.replace(oldStart, newStart);

fs.writeFileSync('src/components/WeeklyGrid.jsx', code, 'utf8');
