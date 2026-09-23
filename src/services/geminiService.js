import { GoogleGenAI, Type } from '@google/genai';

const GEMINI_MODEL = 'gemini-3.5-flash-lite';

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error("Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env.local file.");
  }
  
  return new GoogleGenAI({
    apiKey: apiKey
  });
};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateStudyMaterial = async (pdfBlob, onProgress) => {
  try {
    if (!pdfBlob) {
      throw new Error("No PDF file provided.");
    }
    
    onProgress("Preparing PDF for analysis...");
    const base64Data = await blobToBase64(pdfBlob);
    
    // Scale quiz/flashcards dynamically based on file size
    const isLargePDF = pdfBlob.size > 1024 * 1024 * 2; // > 2MB
    const isMediumPDF = pdfBlob.size > 1024 * 512; // > 500KB
    const expectedCount = isLargePDF ? 15 : (isMediumPDF ? 10 : 5);
    
    onProgress("Sending material to Gemini...");
    
    const ai = getGeminiClient();
    
    onProgress("Creating notes, quiz, and flashcards...");
    
    const systemInstruction = `You are an expert academic tutor. Generate a highly useful study package by analyzing BOTH the textual and visual information in the provided PDF.

REQUIREMENTS:
1. "notes": Comprehensive and structured study notes.
   - Capture important concepts, relationships, and definitions.
   - Preserve important formulas and equations (use readable mathematical notation/LaTeX where appropriate).
   - Explain important diagrams, flowcharts, graphs, charts, and tables (e.g., "Figure: Data preprocessing pipeline â€” shows the sequence from data cleaning â†’ transformation..."). Do not attempt to reproduce the image itself; provide a concise explanation of what it shows and why it matters.
   - Include relevant examples.
   - Distinguish important definitions from supporting information.
   - Produce useful, detailed study notes rather than an extremely short summary. Do not summarize away important content.
2. "quiz": Generate exactly ${expectedCount} multiple choice questions focusing on concepts and problem-solving.
3. "flashcards": Generate exactly ${expectedCount} flashcards covering key definitions, terminology, and facts.`;

    const userPrompt = `Generate the study package for this document.`;

    const requestContents = [
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      },
      { text: userPrompt }
    ];

    const schema = {
      type: Type.OBJECT,
      properties: {
        notes: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  points: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["heading", "points"]
              }
            }
          },
          required: ["title", "sections"]
        },
        quiz: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        },
        flashcards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ["front", "back"]
          }
        }
      },
      required: ["notes", "quiz", "flashcards"]
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    let response;
    let attempt = 0;
    const MAX_RETRIES = 3;
    
    while (attempt <= MAX_RETRIES) {
      try {
        response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: requestContents,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.2
          }
        });
        break; // Success, exit loop
      } catch (err) {
        const msg = err.message || "";
        const isTransientError = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
        
        if (isTransientError && attempt < MAX_RETRIES) {
          attempt++;
          onProgress(`Gemini is busy. Retrying... (Attempt ${attempt}/${MAX_RETRIES})`);
          // Exponential backoff: 2s, 4s, 8s
          const backoffTime = 2000 * Math.pow(2, attempt - 1);
          await delay(backoffTime);
        } else {
          // If it's not transient, or we ran out of retries, throw the error
          throw err;
        }
      }
    }

    onProgress("Saving study material...");
    
    if (!response || !response.text) {
      throw new Error("Gemini returned an invalid study-material response. Please try again.");
    }

    const finalData = JSON.parse(response.text);
    return finalData;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    
    const msg = error.message || "";
    
    if (msg.includes("API key is not configured")) {
      throw new Error(msg);
    }
    
    if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand")) {
      throw new Error("Gemini is temporarily unavailable due to high demand. Please try again later.");
    }
    
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
      throw new Error("Gemini free-tier limit reached. Please wait and try again later.");
    }
    
    if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
      throw new Error("The Gemini API key is invalid or unavailable.");
    }
    
    if (msg.includes("Failed to fetch") || msg.includes("Network") || msg.includes("fetch failed")) {
      throw new Error("Unable to connect to Gemini. Check your internet connection and try again.");
    }

    throw new Error(msg || "Gemini returned an invalid study-material response. Please try again.");
  }
};
export const askAssistant = async (pdfBlob, chatHistory, question) => {
  try {
    const ai = getGeminiClient();
    const base64Data = await blobToBase64(pdfBlob);

    const systemInstruction = `You are an AI study assistant for the uploaded course document.

Answer questions primarily and accurately using the provided PDF.

Use information from the document rather than inventing information.

You may explain concepts in simpler language, provide examples when they are supported by the document, and connect related concepts that appear in the document.

Pay attention to:
- diagrams
- formulas
- tables
- charts
- figures
- definitions
- examples

If the answer cannot be found or reasonably derived from the PDF, clearly say that the information could not be found in the provided document.

Do not pretend that information exists in the document when it does not.

When explaining formulas, preserve the mathematical meaning and make the notation readable.

When explaining diagrams or figures, describe what the visual represents and how it relates to the topic.`;

    // Construct the conversational payload
    // chatHistory is expected to be an array of { role: 'user' | 'model', text: string }
    const contents = chatHistory.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user', // Ensure correct role mapping
      parts: [{ text: msg.text }]
    }));

    // Add the new question
    contents.push({
      role: 'user',
      parts: [{ text: question }]
    });

    // Attach PDF to the VERY FIRST user message to give the model context without repeating it
    if (contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts.unshift({
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      });
    }

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    let response;
    let attempt = 0;
    const MAX_RETRIES = 3;
    
    while (attempt <= MAX_RETRIES) {
      try {
        response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.3
          }
        });
        break; // Success, exit loop
      } catch (err) {
        const msg = err.message || "";
        const isTransientError = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
        
        if (isTransientError && attempt < MAX_RETRIES) {
          attempt++;
          // Exponential backoff: 2s, 4s, 8s
          const backoffTime = 2000 * Math.pow(2, attempt - 1);
          await delay(backoffTime);
        } else {
          throw err;
        }
      }
    }

    if (!response || !response.text) {
      throw new Error("Gemini returned an invalid response. Please try again.");
    }

    return response.text;

  } catch (error) {
    console.error("Assistant Error:", error);
    
    const msg = error.message || "";
    if (msg.includes("API key is not configured")) throw new Error(msg);
    if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand")) throw new Error("Gemini is temporarily unavailable due to high demand. Please try again later.");
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) throw new Error("Gemini free-tier limit reached. Please wait and try again later.");
    if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) throw new Error("The Gemini API key is invalid or unavailable.");
    if (msg.includes("Failed to fetch") || msg.includes("Network") || msg.includes("fetch failed")) throw new Error("Unable to connect to Gemini. Check your internet connection and try again.");

    throw new Error(msg || "The assistant encountered an error. Please try again.");
  }
};

