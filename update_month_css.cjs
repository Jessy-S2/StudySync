const fs = require('fs');
let code = fs.readFileSync('src/components/MonthlyCalendar.css', 'utf8');

// Find the start of the 768px media query
const idx = code.indexOf('@media (max-width: 768px)');
if (idx > -1) {
    // We assume the block is exactly what we saw earlier:
    // @media (max-width: 768px) {
    //   .cal-cell {
    //     min-height: 80px;
    //     padding: 4px;
    //   }
    //   .cal-item {
    //     font-size: 9px;
    //     padding: 2px 4px;
    //   }
    // }
    // It's about 170 characters long. Let's just find the closing brace.
    let openBraces = 0;
    let endIdx = -1;
    let started = false;
    for (let i = idx; i < code.length; i++) {
        if (code[i] === '{') {
            openBraces++;
            started = true;
        } else if (code[i] === '}') {
            openBraces--;
        }
        if (started && openBraces === 0) {
            endIdx = i + 1;
            break;
        }
    }
    if (endIdx > -1) {
        code = code.substring(0, idx) + code.substring(endIdx);
    }
}

code += `
/* Add responsive wrappers */
.monthly-schedule-container {
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
}

.calendar-responsive {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 15px; /* Ensure tooltip or scrollbar doesn't clip */
}

.calendar-responsive .calendar-grid {
  min-width: 750px; /* Keep it wide and readable like desktop */
}
`;

fs.writeFileSync('src/components/MonthlyCalendar.css', code);
console.log('Done');
