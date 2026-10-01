const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.js', 'utf8');

const regex = /export const generateStudyMaterial = async \(pdfBlob, onProgress\) => \{[\s\S]*?const userPrompt = `Generate the study package for this document.`;/;

const replacement = `export const generateStudyMaterial = async (pdfBlob, onProgress, aiPrefs = {}) => {
  try {
    if (!pdfBlob) {
      throw new Error("No PDF file provided.");
    }
    
    onProgress("Preparing PDF for analysis...");
    const base64Data = await blobToBase64(pdfBlob);
    
    // Scale quiz/flashcards dynamically based on settings or file size
    const isLargePDF = pdfBlob.size > 1024 * 1024 * 2;
    const isMediumPDF = pdfBlob.size > 1024 * 512;
    const expectedQuizCount = aiPrefs.numQuestions || (isLargePDF ? 15 : (isMediumPDF ? 10 : 5));
    const expectedFlashcardCount = aiPrefs.numFlashcards || (isLargePDF ? 15 : (isMediumPDF ? 10 : 5));
    
    onProgress("Sending material to Gemini...");
    
    const ai = getGeminiClient();
    
    onProgress("Creating notes, quiz, and flashcards...");
    
    const systemInstruction = \`You are an expert academic tutor. Generate a highly useful study package by analyzing BOTH the textual and visual information in the provided PDF.

REQUIREMENTS:
1. "notes": Comprehensive and structured study notes.
   - Verbosity: \${aiPrefs.notesLength || 'medium'}
   - Focus: \${aiPrefs.examOriented ? 'Highly exam-oriented, highlighting critical exam topics.' : 'General knowledge gathering.'}
   \${aiPrefs.includeFormulas ? '- Preserve important formulas and equations (use readable mathematical notation/LaTeX where appropriate).' : ''}
   \${aiPrefs.includeExamples ? '- Include relevant examples to aid understanding.' : ''}
   - Explain important diagrams, flowcharts, graphs, charts, and tables concisely.
2. "quiz": Generate exactly \${expectedQuizCount} multiple choice questions focusing on concepts and problem-solving. Target difficulty: \${aiPrefs.quizDifficulty || 'mixed'}.
3. "flashcards": Generate exactly \${expectedFlashcardCount} flashcards covering key definitions, terminology, and facts.\`;

    const userPrompt = \`Generate the study package for this document.\`;`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/services/geminiService.js', code);
console.log('Gemini service updated');
