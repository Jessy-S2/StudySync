const fs = require('fs');

let jsxCode = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
const jsxRegex = /\s*<div className="dash-widget motivation-widget" style=\{\{ backgroundImage: 'linear-gradient\(to right, #E8F4FF, #F5F1FF\)' \}\}>\s*<h3>You can do it!<\/h3>\s*<p>Discipline today, freedom tomorrow\.<\/p>\s*<\/div>/;

if (jsxRegex.test(jsxCode)) {
  jsxCode = jsxCode.replace(jsxRegex, '');
  fs.writeFileSync('src/pages/Dashboard.jsx', jsxCode);
  console.log('Removed from Dashboard.jsx');
} else {
  console.log('Regex did not match in Dashboard.jsx');
}

let cssCode = fs.readFileSync('src/pages/Dashboard.css', 'utf8');
const cssRegex = /\s*\.motivation-widget\s*\{[\s\S]*?\}\s*\.motivation-widget h3\s*\{[\s\S]*?\}\s*\.motivation-widget p\s*\{[\s\S]*?\}/;

if (cssRegex.test(cssCode)) {
  cssCode = cssCode.replace(cssRegex, '');
  fs.writeFileSync('src/pages/Dashboard.css', cssCode);
  console.log('Removed from Dashboard.css');
} else {
  console.log('Regex did not match in Dashboard.css');
}
