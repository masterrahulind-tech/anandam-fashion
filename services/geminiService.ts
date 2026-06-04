
import { GoogleGenAI } from "@google/genai";

// Always use a named parameter for apiKey and use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFashionAdvice = async (productName: string, description: string) => {
  try {
    // Using gemini-3-flash-preview for simple text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As an expert fashion stylist for Anandam Fashion, provide 3 styling tips for this product: "${productName}" - ${description}. Focus on accessories, footwear, and occasion. Keep it concise and trendy.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Our AI stylist is currently busy. Please try again later!";
  }
};

export const generateProductDescription = async (name: string, category: string) => {
  try {
    // Using gemini-3-flash-preview for product descriptions
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a luxury product description for a fashion item named "${name}" in the "${category}" category. Focus on comfort, quality, and style. Max 50 words.`,
    });
    return response.text;
  } catch (error) {
    return "High quality fashion item carefully curated for your needs.";
  }
};
