const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectNotes.jsx', 'utf8');

if (!code.includes('useSettings')) {
  code = code.replace(
    "import { generateStudyMaterial } from '../services/geminiService';",
    "import { generateStudyMaterial } from '../services/geminiService';\nimport { useSettings } from '../context/SettingsContext';"
  );
  code = code.replace(
    "const [isGenerating, setIsGenerating] = useState(false);",
    "const [isGenerating, setIsGenerating] = useState(false);\n  const { settings } = useSettings();"
  );
  code = code.replace(
    "const generatedData = await generateStudyMaterial(record.blob, onProgress);",
    "const generatedData = await generateStudyMaterial(record.blob, onProgress, settings.ai);"
  );
}

fs.writeFileSync('src/components/SubjectNotes.jsx', code);
console.log('SubjectNotes updated');
