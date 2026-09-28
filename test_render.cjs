import React from 'react';
import { renderToString } from 'react-dom/server';
import WeeklyGrid from './src/components/WeeklyGrid.jsx';

// Mock localStorage
global.localStorage = {
  getItem: (key) => {
    if (key === 'studysync_weekly_grid_configured') return 'true';
    if (key === 'studysync_weekly_grid_times') return JSON.stringify([540, 600, 660]); // 9, 10, 11 AM
    if (key === 'studysync_weekly_grid_merges') return JSON.stringify([
      { t1: 540, c1: 0, t2: 540, c2: 1, id: '1' } // Merge Monday and Tuesday 9 AM
    ]);
    return null;
  },
  setItem: () => {}
};

// Mock crypto
global.crypto = { randomUUID: () => 'uuid' };

const html = renderToString(<WeeklyGrid />);
const fs = require('fs');
fs.writeFileSync('output.html', html);
console.log("Rendered HTML saved to output.html");
