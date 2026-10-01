const fs = require('fs');

let code = fs.readFileSync('src/components/TaskForm.jsx', 'utf8');

// Remove validation error for subjectId
code = code.replace(
  /\s*if \(\!subjectId\) \{\s*setError\('Please select a subject\.'\);\s*return;\s*\}/,
  ""
);

// Remove the subjects.length === 0 block
code = code.replace(
  /\{subjects\.length === 0 \? \([\s\S]*?\) : \(/,
  ""
);

// Remove the matching parenthesis and closing div for the above block
code = code.replace(
  /<\/form>\s*\)\}\s*<\/div>\s*<\/div>/,
  `</form>\n      </div>\n    </div>`
);

// Modify label and option
code = code.replace(
  /<label>Subject \*<\/label>/,
  "<label>Subject (Optional)</label>"
);
code = code.replace(
  /<option value="">-- Select Subject --<\/option>/,
  "<option value=\"\">No Subject</option>"
);

fs.writeFileSync('src/components/TaskForm.jsx', code);
console.log('TaskForm.jsx updated');
