
import { GoogleGenAI, Type } from "@google/genai";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeConflicts = async (content: string) => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these legal statements for contradictions and truth gaps. Return a JSON array. Content: ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            statementA: { type: Type.STRING },
            statementB: { type: Type.STRING },
            analysis: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
          },
          required: ["id", "statementA", "statementB", "analysis", "severity"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const chatWithSearch = async (query: string, history: {role: string, parts: {text: string}[]}[]) => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...history, { role: 'user', parts: [{ text: query }] }],
    config: { tools: [{ googleSearch: {} }] }
  });
  const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];
  return { text: response.text, urls };
};

export const structureNarrativeToJSON = async (rawContent: string) => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transform this raw narrative into structured legal records for Litigation Abuse, Economic Sabotage, Emotional Alienation, and Bad Faith Allegations. Content: ${rawContent}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            entity: { type: Type.STRING },
            details: { type: Type.STRING },
            evidence: { type: Type.STRING },
            legal_relevance: { type: Type.STRING },
            date: { type: Type.STRING }
          },
          required: ["category", "entity", "details", "evidence", "legal_relevance"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getLegalSuggestions = async (notes: string) => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Review these legal case notes. Suggest missing documents and highlight areas needing clarification. Return a JSON array. Notes: ${notes}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['recommendation', 'clarification'] },
            text: { type: Type.STRING },
            targetId: { type: Type.STRING }
          },
          required: ["id", "type", "text"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};
