const fs = require('fs');

let code = fs.readFileSync('src/services/geminiService.js', 'utf8');

code = code.replace(
  /export const generateStudyMaterial = async \(pdfBlob, onProgress, settings\) => \{/,
  `export const generateStudyMaterial = async (pdfBlob, onProgress, aiPrefs) => {`
);

fs.writeFileSync('src/services/geminiService.js', code);
console.log('geminiService.js fixed argument');
