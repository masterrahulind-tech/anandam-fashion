
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  // Log a clear warning for developers; runtime callers will get a friendly message.
  // Avoid throwing during import so the app can still run without the model.
  console.warn('Google GenAI API key (process.env.API_KEY) is not set. Gemini calls will be disabled.');
}

export const getFashionAdvice = async (productName: string, description: string) => {
  if (!ai) return "AI unavailable: missing API key. Try again later.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As an expert fashion stylist for Anandam Fashion, provide 3 styling tips for this product: "${productName}" - ${description}. Focus on accessories, footwear, and occasion. Keep it concise and trendy.`,
    });
    return response?.text ?? "Our AI stylist is currently busy. Please try again later!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Our AI stylist is currently busy. Please try again later!";
  }
};

export const generateProductDescription = async (name: string, category: string) => {
  if (!ai) return "AI unavailable: missing API key. Try again later.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a luxury product description for a fashion item named "${name}" in the "${category}" category. Focus on comfort, quality, and style. Max 50 words.`,
    });
    return response?.text ?? "High quality fashion item carefully curated for your needs.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "High quality fashion item carefully curated for your needs.";
  }
};
