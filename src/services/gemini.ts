import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface LanguageData {
  text: string;
  pronunciation: string; // Phonetic or Syllable-based as requested
  grammarNote?: string;
  meanings?: string[]; // For dictionary usage (English only)
}

export interface ExampleSentence {
  text: string;
  pronunciation: string;
}

export interface ExampleGroup {
  english: ExampleSentence;
  tamil: ExampleSentence;
  sinhala: ExampleSentence;
}

export interface TranslationResult {
  english: LanguageData;
  tamil: LanguageData;
  sinhala: LanguageData;
  examples: ExampleGroup[];
}

export const getTranslations = async (input: string): Promise<TranslationResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate and provide grammatically correct versions for the following input in English, Tamil, and Sinhala. 
    1. Provide the translation for all three languages.
    2. For English: Provide the pronunciation broken down into syllables using English letters (e.g., for 'Education', show 'ed-ju-kay-shun').
    3. For Tamil and Sinhala: Provide clear phonetic pronunciation in English letters.
    4. If the input is a single word, provide dictionary meanings for the English version.
    5. Provide exactly 5 real-world example sentences. For each example, provide the translation and pronunciation (syllable-based for English, phonetic for others) in all three languages.
    
    Input: "${input}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          english: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              pronunciation: { type: Type.STRING, description: "Syllable-based pronunciation (e.g., ed-ju-kay-shun)" },
              grammarNote: { type: Type.STRING },
              meanings: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["text", "pronunciation"]
          },
          tamil: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              grammarNote: { type: Type.STRING }
            },
            required: ["text", "pronunciation"]
          },
          sinhala: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              grammarNote: { type: Type.STRING }
            },
            required: ["text", "pronunciation"]
          },
          examples: {
            type: Type.ARRAY,
            minItems: 5,
            maxItems: 5,
            items: {
              type: Type.OBJECT,
              properties: {
                english: {
                  type: Type.OBJECT,
                  properties: { text: { type: Type.STRING }, pronunciation: { type: Type.STRING, description: "Syllable-based pronunciation" } },
                  required: ["text", "pronunciation"]
                },
                tamil: {
                  type: Type.OBJECT,
                  properties: { text: { type: Type.STRING }, pronunciation: { type: Type.STRING } },
                  required: ["text", "pronunciation"]
                },
                sinhala: {
                  type: Type.OBJECT,
                  properties: { text: { type: Type.STRING }, pronunciation: { type: Type.STRING } },
                  required: ["text", "pronunciation"]
                }
              },
              required: ["english", "tamil", "sinhala"]
            }
          }
        },
        required: ["english", "tamil", "sinhala", "examples"]
      }
    },
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to process your request. Please try again.");
  }
};
