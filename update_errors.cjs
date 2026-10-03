const fs = require('fs');

let dbCode = fs.readFileSync('src/utils/fileStorage.js', 'utf8');
dbCode = dbCode.replace(
  /export const updateFileGenerationStatus = async \(fileId, status\) => \{/,
  'export const updateFileGenerationStatus = async (fileId, status, errorMsg = null) => {'
);
dbCode = dbCode.replace(
  /record\.generationStatus = status;/,
  `record.generationStatus = status;
          if (errorMsg) record.generationError = errorMsg;`
);
fs.writeFileSync('src/utils/fileStorage.js', dbCode);
console.log('fileStorage.js updated');

let notesCode = fs.readFileSync('src/components/SubjectNotes.jsx', 'utf8');
notesCode = notesCode.replace(
  /await updateFileGenerationStatus\(file\.fileId, 'error'\);/,
  `await updateFileGenerationStatus(file.fileId, 'error', err.message);`
);
notesCode = notesCode.replace(
  /\{progressStatus\[file\.fileId\] \|\| "Generation failed\. Please try again\."\}/,
  `{progressStatus[file.fileId] || file.generationError || "Generation failed. Please try again."}`
);
fs.writeFileSync('src/components/SubjectNotes.jsx', notesCode);
console.log('SubjectNotes.jsx updated');
