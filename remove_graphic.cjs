const fs = require('fs');

// Update Dashboard.jsx
let jsxCode = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
const jsxRegex = /\s*<div className="hero-decoration">[\s\S]*?<\/div>/;
jsxCode = jsxCode.replace(jsxRegex, '');
fs.writeFileSync('src/pages/Dashboard.jsx', jsxCode);

// Update Dashboard.css
let cssCode = fs.readFileSync('src/pages/Dashboard.css', 'utf8');

// First block:
// .hero-decoration {
//   position: absolute;
//   right: 40px;
//   top: 50%;
//   transform: translateY(-50%);
//   opacity: 0.8;
// }
const cssRegex1 = /\s*\.hero-decoration\s*\{[\s\S]*?\}/g;
cssCode = cssCode.replace(cssRegex1, '');

fs.writeFileSync('src/pages/Dashboard.css', cssCode);
console.log('Removed hero-decoration');
