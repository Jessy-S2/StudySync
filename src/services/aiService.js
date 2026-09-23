import { GoogleGenAI, Type } from '@google/genai';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not configured in .env.local");
  }
  return new GoogleGenAI({ apiKey });
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithRetry = async (aiClient, options, stageName = 'study material') => {
  const MAX_RETRIES = 3;
  let delay = 2000;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await aiClient.models.generateContent(options);
    } catch (error) {
      const errMsg = error.message || "";
      const isTemporary = 
        errMsg.includes('503') || 
        errMsg.includes('UNAVAILABLE') || 
        errMsg.includes('high demand') ||
        errMsg.includes('Too Many Requests');
        
      if (!isTemporary || attempt === MAX_RETRIES) {
        console.log(`[StudySync AI] ${stageName} generation failed on attempt ${attempt + 1}`);
        console.log(`[StudySync AI] Error: ${errMsg}`);
        
        if (isTemporary) {
          throw new Error(`Gemini is temporarily busy while generating your ${stageName}. Please wait a moment and try again.`);
        }
        throw error;
      }
      
      console.log(`[StudySync AI] ${stageName} encountered temporary error (${errMsg}) on attempt ${attempt + 1}. Retrying in ${delay}ms...`);
      await wait(delay);
      delay *= 2;
    }
  }
};

const notesSchema = {
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
};

const quizSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.INTEGER },
      explanation: { type: Type.STRING }
    },
    required: ["question", "options", "correctAnswer", "explanation"]
  }
};

const flashcardsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      front: { type: Type.STRING },
      back: { type: Type.STRING }
    },
    required: ["front", "back"]
  }
};

const parseAIResponse = (resultText, partName) => {
  if (!resultText) {
    throw new Error(`Gemini returned an empty ${partName} response.`);
  }

  let cleanText = resultText.trim();
  
  if (cleanText.startsWith('```')) {
    const firstNewline = cleanText.indexOf('\n');
    if (firstNewline !== -1) {
      cleanText = cleanText.substring(firstNewline).trim();
    }
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.substring(0, cleanText.length - 3).trim();
  }

  let parsedData;
  try {
    parsedData = JSON.parse(cleanText);
  } catch (err) {
    console.error(`JSON Parse Error for ${partName}:`, err.message);
    throw new Error(`Gemini returned an incomplete ${partName} response. Please try generating again.`);
  }

  return parsedData;
};

export const generateStudyMaterial = async (documentText, options) => {
  try {
    const ai = getClient();
    const MAX_CHARS_PER_CHUNK = 2000000;
    
    let processedText = documentText;
    
    console.log(`[StudySync AI] PDF extracted characters: ${documentText.length}`);
    console.log(`[StudySync AI] Using direct generation: ${documentText.length <= 3000000}`);
    
    // Chunking strategy for extremely large documents
    if (documentText.length > 3000000) {
      if (documentText.length > 10000000) {
        throw new Error("This PDF is exceptionally large (over 10 million characters) and exceeds the maximum processing capacity. Please split the PDF into smaller chapters and upload them separately.");
      }
      
      const chunks = [];
      for (let i = 0; i < documentText.length; i += MAX_CHARS_PER_CHUNK) {
        chunks.push(documentText.slice(i, i + MAX_CHARS_PER_CHUNK));
      }
      
      console.log(`[StudySync AI] Number of chunks: ${chunks.length}`);
      
      let combinedSummaries = "";
      for (let i = 0; i < chunks.length; i++) {
        const chunkPrompt = `Extract all key concepts, facts, definitions, formulas, and relationships from the following text chunk. Retain as much specific detail as possible. Do not invent facts.\n\nText:\n${chunks[i]}`;
        const chunkResponse = await generateWithRetry(ai, {
          model: 'gemini-3.6-flash',
          contents: chunkPrompt,
          config: {
            maxOutputTokens: 8192
          }
        }, `chunk ${i + 1}`);
        combinedSummaries += `\n--- Chunk ${i + 1} Summary ---\n${chunkResponse.text}\n`;
      }
      
      processedText = combinedSummaries;
      console.log(`[StudySync AI] Combined summary characters: ${processedText.length}`);
    }
    
    // 1. Generate Notes
    const notesPrompt = `You are an expert academic tutor. Generate study notes based ONLY on the following text. Do not invent facts.

Settings:
- Notes Length/Detail Level: ${options.notesLevel}

Instructions based on Notes Length:
If Simple: Keep notes concise, focusing on main takeaways.
If Short: Provide a moderately summarized overview of important concepts.
If Detailed: Provide comprehensive notes, detailed explanations, essential definitions, formulas, examples, and deep relationships between concepts.

Document Text:
${processedText}`;

    console.log(`[StudySync AI] Starting Notes generation`);
    console.log(`[StudySync AI] Notes input: ${notesPrompt.length} characters`);
    const notesRes = await generateWithRetry(ai, {
      model: 'gemini-3.6-flash',
      contents: notesPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: notesSchema,
        maxOutputTokens: 16384,
      }
    }, 'detailed notes');
    const parsedNotes = parseAIResponse(notesRes.text, 'notes');
    if (!parsedNotes.title || !Array.isArray(parsedNotes.sections)) {
      throw new Error("Study material could not be generated correctly (missing valid notes).");
    }
    console.log(`[StudySync AI] Notes generation succeeded`);

    // 2. Generate Quiz
    const quizPrompt = `You are an expert academic tutor. Generate a multiple-choice quiz based ONLY on the following text. Do not invent facts.

Settings:
- Quiz Difficulty: ${options.quizDifficulty}
- Quiz Questions Count: ${options.quizCount}

Make sure there are exactly ${options.quizCount} quiz questions (or fewer if the text is too short).

Document Text:
${processedText}`;

    console.log(`[StudySync AI] Starting Quiz generation`);
    console.log(`[StudySync AI] Quiz input: ${quizPrompt.length} characters`);
    const quizRes = await generateWithRetry(ai, {
      model: 'gemini-3.6-flash',
      contents: quizPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        maxOutputTokens: 8192,
      }
    }, 'quiz');
    const parsedQuiz = parseAIResponse(quizRes.text, 'quiz');
    if (!Array.isArray(parsedQuiz)) {
      throw new Error("Study material could not be generated correctly (missing valid quiz).");
    }
    console.log(`[StudySync AI] Quiz generation succeeded`);

    // 3. Generate Flashcards
    const flashcardsPrompt = `You are an expert academic tutor. Generate study flashcards based ONLY on the following text. Do not invent facts.

Settings:
- Flashcards Count: ${options.flashcardsCount}

Make sure there are exactly ${options.flashcardsCount} flashcards (or fewer if the text is too short).

Document Text:
${processedText}`;

    console.log(`[StudySync AI] Starting Flashcards generation`);
    console.log(`[StudySync AI] Flashcards input: ${flashcardsPrompt.length} characters`);
    const flashcardsRes = await generateWithRetry(ai, {
      model: 'gemini-3.6-flash',
      contents: flashcardsPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: flashcardsSchema,
        maxOutputTokens: 8192,
      }
    }, 'flashcards');
    const parsedFlashcards = parseAIResponse(flashcardsRes.text, 'flashcards');
    if (!Array.isArray(parsedFlashcards)) {
      throw new Error("Study material could not be generated correctly (missing valid flashcards).");
    }
    console.log(`[StudySync AI] Flashcards generation succeeded`);

    // 4. Combine and return
    return {
      notes: parsedNotes,
      quiz: parsedQuiz,
      flashcards: parsedFlashcards
    };

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error(error.message || "Failed to generate study material.");
  }
};
