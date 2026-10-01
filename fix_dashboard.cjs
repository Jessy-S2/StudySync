const fs = require('fs');

let css = fs.readFileSync('src/pages/Dashboard.css', 'utf8');

// The file got messed up. Let's fix it by replacing the whole .dashboard-hero block.
// And removing the \n literals.

css = css.replace(/\.dashboard-hero \{\\n  padding: 10px 0 30px 0;\\n  40px;\s*display: flex;\s*justify-content: space-between;\s*align-items: center;\s*position: relative;\s*overflow: hidden;\s*\}/, 
`.dashboard-hero {
  padding: 10px 0 30px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}`);

css = css.replace(/\.dashboard-hero \{\\n    padding: 10px 0 20px 0;\s*flex-direction: column;\s*text-align: center;\s*gap: 20px;\s*\}/,
`.dashboard-hero {
    padding: 10px 0 20px 0;
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }`);

fs.writeFileSync('src/pages/Dashboard.css', css);
console.log('Fixed Dashboard.css');
