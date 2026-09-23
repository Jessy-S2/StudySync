import * as pdfjsLib from 'pdfjs-dist';
// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const extractTextFromPdf = async (fileBlob) => {
  try {
    const arrayBuffer = await fileBlob.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text page by page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += `\n--- Page ${pageNum} ---\n` + pageText;
    }
    
    if (!fullText.trim()) {
      throw new Error("No readable text found in this PDF. It might be a scanned image.");
    }
    
    return fullText;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error(error.message || "Failed to extract text from PDF.");
  }
};
