const fs = require('fs');
let code = fs.readFileSync('src/services/geminiService.js', 'utf8');

code = code.replace(
  /const GEMINI_MODEL = 'gemini-3\.5-flash-lite';/,
  'const GEMINI_MODEL = "gemini-2.5-flash";'
);

const generateFunctionMatch = /export const generateStudyMaterial = async \(pdfBlob, onProgress, settings\) => \{\s*try \{/m;

const loggingCode = `
export const generateStudyMaterial = async (pdfBlob, onProgress, settings) => {
  try {
    const ai = getGeminiClient();
    
    console.error("--- DEBUG: Gemini API Request Info ---");
    console.error("Gemini Model:", GEMINI_MODEL);
    console.error("API Key Present:", !!import.meta.env.VITE_GEMINI_API_KEY);
    console.error("PDF MIME Type:", pdfBlob?.type);
    console.error("PDF Size (bytes):", pdfBlob?.size);
    
    let base64Data;
    try {
      base64Data = await blobToBase64(pdfBlob);
      console.error("PDF successfully converted to base64. Base64 length:", base64Data.length);
    } catch (b64Err) {
      console.error("Failed to convert PDF to base64:", b64Err);
      throw new Error("Failed to process the PDF file.");
    }
    console.error("--------------------------------------");
`;

code = code.replace(
  /export const generateStudyMaterial = async \(pdfBlob, onProgress, settings\) => \{\s*try \{\s*const ai = getGeminiClient\(\);\s*const base64Data = await blobToBase64\(pdfBlob\);/,
  loggingCode
);

const catchLoggingCode = `} catch (error) {
    console.error("Gemini Generation Error:", error);
    console.error("Actual Gemini API error message:", error.message);
    if (error.status) console.error("HTTP/status info:", error.status);
    if (error.response) console.error("Error Response info:", error.response);
    if (error.details) console.error("Error Details:", error.details);`;

code = code.replace(
  /\} catch \(error\) \{\s*console\.error\("Gemini Generation Error:", error\);/,
  catchLoggingCode
);

fs.writeFileSync('src/services/geminiService.js', code);
console.log('geminiService.js fixed');
