const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.jsx', 'utf8');

// 1. Update tabs array
code = code.replace(
  /{ id: 'study', label: 'Study Preferences' },\s*{ id: 'ai', label: 'AI Preferences' }/,
  "{ id: 'ai', label: 'Study Preferences' }"
);

// 2. Remove the old Study Preferences block
const studyBlockRegex = /\{\/\* STUDY PREFERENCES \*\/\}[\s\S]*?(?=\{\/\* AI PREFERENCES \*\/\} )/;
// wait, maybe the regex is missing some whitespace. Let's just find the indexes.

const startIndex = code.indexOf('{/* STUDY PREFERENCES */}');
const endIndex = code.indexOf('{/* AI PREFERENCES */}');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
}

// 3. Rename AI Preferences block heading
code = code.replace(
  /\{\/\* AI PREFERENCES \*\/\}[\s\S]*?\{activeTab === 'ai' && \([\s\S]*?<div className="settings-section">[\s\S]*?<h2>AI Preferences<\/h2>/,
  "{/* STUDY PREFERENCES */}\n          {activeTab === 'ai' && (\n            <div className=\"settings-section\">\n              <h2>Study Preferences</h2>"
);

fs.writeFileSync('src/pages/Settings.jsx', code);
console.log('Successfully updated Settings.jsx');
