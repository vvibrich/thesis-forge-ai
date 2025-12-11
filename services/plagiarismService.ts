import { PlagiarismResult, PlagiarismMatch } from '../types';

/**
 * Simulates a call to a Plagiarism Checker API (e.g., Copyleaks, Unicheck, Turnitin).
 * In a real production environment, this would make an HTTP POST request to the provider's API.
 * 
 * For this demo, we simulate the analysis to demonstrate the UI workflow and handling.
 */
export const checkPlagiarism = async (text: string): Promise<PlagiarismResult> => {
  return new Promise((resolve) => {
    // Simulate API latency
    setTimeout(() => {
      // 1. Strip HTML to analyze raw text
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = text;
      const plainText = tempDiv.innerText || tempDiv.textContent || "";
      
      const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const matches: PlagiarismMatch[] = [];
      
      if (sentences.length < 3) {
        resolve({ score: 0, matches: [], scannedAt: Date.now() });
        return;
      }

      // 2. Simulation Logic: randomly flag some sentences if text is long enough
      // This creates a realistic "demo" experience without needing a paid API key
      const threshold = 0.2; // 20% chance a sentence is flagged in this simulation
      let flaggedCharCount = 0;

      sentences.forEach((sentence) => {
        if (Math.random() < threshold) {
          // Mock sources
          const sources = [
            { name: "Wikipedia - Enciclopédia Livre", url: "https://pt.wikipedia.org" },
            { name: "Scielo - Scientific Electronic Library", url: "https://scielo.br" },
            { name: "Repositório Institucional USP", url: "https://teses.usp.br" },
            { name: "Google Books", url: "https://books.google.com" }
          ];
          const randomSource = sources[Math.floor(Math.random() * sources.length)];
          const similarity = Math.floor(Math.random() * (100 - 60 + 1) + 60); // 60-100%

          matches.push({
            text: sentence.trim(),
            source: randomSource.name,
            url: randomSource.url,
            similarity: similarity
          });
          
          flaggedCharCount += sentence.length;
        }
      });

      // Calculate overall score based on flagged content length vs total length
      const totalLength = plainText.length;
      const score = totalLength > 0 ? Math.round((flaggedCharCount / totalLength) * 100) : 0;

      resolve({
        score: Math.min(score, 100), // Cap at 100
        matches: matches.sort((a, b) => b.similarity - a.similarity),
        scannedAt: Date.now()
      });
    }, 2500); // 2.5s delay
  });
};