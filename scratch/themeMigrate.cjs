const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, '../src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.css') && !file.includes('StudyWorkspace.css')) { 
      results.push(file);
    }
  });
  return results;
}

const cssFiles = walk(cssDir);

const replacements = [
  // Backgrounds
  { regex: /background-color:\s*#f4f7f6/gi, replace: 'background-color: #121212' },
  { regex: /background-color:\s*#fff(?:fff)?/gi, replace: 'background-color: #1e1e1e' },
  { regex: /background:\s*#fff(?:fff)?/gi, replace: 'background: #1e1e1e' },
  { regex: /background-color:\s*white/gi, replace: 'background-color: #1e1e1e' },
  { regex: /background:\s*white/gi, replace: 'background: #1e1e1e' },
  
  // Secondary Backgrounds (often #f9f9f9, #f8f9fa, #eee)
  { regex: /background-color:\s*#f9f9f9/gi, replace: 'background-color: #242424' },
  { regex: /background-color:\s*#f8f9fa/gi, replace: 'background-color: #242424' },
  { regex: /background-color:\s*#f5f6fa/gi, replace: 'background-color: #242424' },
  { regex: /background-color:\s*#f1f2f6/gi, replace: 'background-color: #242424' },
  { regex: /background-color:\s*#e0e0e0/gi, replace: 'background-color: #333333' },
  { regex: /background-color:\s*#ecf0f1/gi, replace: 'background-color: #242424' },
  { regex: /background-color:\s*#fafafa/gi, replace: 'background-color: #242424' },
  
  // Text Colors
  { regex: /color:\s*#2c3e50/gi, replace: 'color: #ffffff' }, // Titles should be white
  { regex: /color:\s*#333(?:333)?/gi, replace: 'color: #ecf0f1' },
  { regex: /color:\s*#555(?:555)?/gi, replace: 'color: #b0b0b0' },
  { regex: /color:\s*#666(?:666)?/gi, replace: 'color: #b0b0b0' },
  { regex: /color:\s*#7f8c8d/gi, replace: 'color: #b0b0b0' },
  { regex: /color:\s*#95a5a6/gi, replace: 'color: #b0b0b0' },
  { regex: /color:\s*#000(?:000)?/gi, replace: 'color: #ecf0f1' },
  
  // Borders
  { regex: /border:\s*1px solid #ddd/gi, replace: 'border: 1px solid #333' },
  { regex: /border:\s*1px solid #eee/gi, replace: 'border: 1px solid #333' },
  { regex: /border:\s*1px solid #ccc/gi, replace: 'border: 1px solid #333' },
  { regex: /border:\s*1px solid #e0e0e0/gi, replace: 'border: 1px solid #333' },
  { regex: /border-bottom:\s*1px solid #ddd/gi, replace: 'border-bottom: 1px solid #333' },
  { regex: /border-bottom:\s*1px solid #eee/gi, replace: 'border-bottom: 1px solid #333' },
  { regex: /border-top:\s*1px solid #eee/gi, replace: 'border-top: 1px solid #333' },
  { regex: /border-color:\s*#ddd/gi, replace: 'border-color: #333' },
  
  // Hover states
  { regex: /background-color:\s*#f1f1f1/gi, replace: 'background-color: #2a2a2a' },
  
  // Sidebar Width adjustments
  { regex: /250px/g, replace: '220px' }
];

cssFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Specific Sidebar overrides
  if (file.endsWith('Sidebar.css')) {
    content = content.replace(/background-color:\s*#2c3e50/gi, 'background-color: #5B3A8E'); // Purple Sidebar
    content = content.replace(/border-bottom:\s*1px solid #34495e/gi, 'border-bottom: 1px solid rgba(255, 255, 255, 0.1)');
    content = content.replace(/background-color:\s*#34495e/gi, 'background-color: rgba(255, 255, 255, 0.15)'); // Active/Hover state
  }

  replacements.forEach(({regex, replace}) => {
    content = content.replace(regex, replace);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
