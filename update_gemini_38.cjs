const fs = require('fs');

let code = fs.readFileSync('src/services/geminiService.js', 'utf8');

// Change model to gemini-3.8-flash
code = code.replace(
  /const GEMINI_MODEL = "gemini-2\.5-flash";/,
  'const GEMINI_MODEL = "gemini-3.8-flash";'
);

// Remove temperature to be strictly compatible and avoid schema errors
code = code.replace(/\s*temperature:\s*0\.[23],?/g, '');

fs.writeFileSync('src/services/geminiService.js', code);
console.log('geminiService.js updated');
