import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getMovieReward = async (bookTitle: string, author: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Unable to generate reward.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `I just finished reading the book "${bookTitle}" by ${author}. 
      Based on the intellectual depth, themes, and complexity of this book, recommend ONE specific, eye-opening movie.
      
      The movie should be:
      1. Intellectually stimulating (like Fight Club, The Matrix, Inception, Primer, etc.).
      2. Thematically resonant with the book I read.
      
      Provide the response in this format:
      "**[Movie Title]**
      
      [A short, compelling paragraph explaining why this movie is the perfect visual successor to the book, highlighting the shared philosophy or mind-bending nature.]"
      `,
    });
    
    return response.text || "Could not generate a recommendation at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while communicating with the Oracle. Please try again later.";
  }
};