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
