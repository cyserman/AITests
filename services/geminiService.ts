import { GoogleGenAI, Type } from "@google/genai";

const getAi = () => {
    if (!process.env.API_KEY) {
        throw new Error("Missing GEMINI_API_KEY environment variable");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

export interface ConflictItem {
    id: string;
    statementA: string;
    statementB: string;
    analysis: string;
    severity: 'high' | 'medium' | 'low';
}

export interface Suggestion {
    id: string;
    type: 'recommendation' | 'clarification';
    text: string;
    targetId?: string;
}

export interface ProcessedRecord {
    category: string;
    entity: string;
    details: string;
    evidence: string;
    legal_relevance: string;
    date?: string;
}

export interface ChatResponse {
    text: string;
    urls?: { uri: string; title: string }[];
}

/**
 * Analyze legal statements for contradictions and truth gaps
 */
export const analyzeConflicts = async (content: string): Promise<ConflictItem[]> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
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
    } catch (error) {
        console.error('Conflict analysis failed:', error);
        return [];
    }
};

/**
 * Chat with web search grounding
 */
export const chatWithSearch = async (
    query: string,
    history: { role: string; parts: { text: string }[] }[]
): Promise<ChatResponse> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [...history, { role: 'user', parts: [{ text: query }] }],
            config: { tools: [{ googleSearch: {} }] }
        });

        const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter(Boolean) || [];

        return { text: response.text || '', urls };
    } catch (error) {
        console.error('Chat failed:', error);
        return { text: 'Error: Unable to process chat request', urls: [] };
    }
};

/**
 * Transform raw narrative into structured legal records
 */
export const structureNarrativeToJSON = async (rawContent: string): Promise<ProcessedRecord[]> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
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
    } catch (error) {
        console.error('Narrative structuring failed:', error);
        return [];
    }
};

/**
 * Generate legal suggestions from case notes
 */
export const getLegalSuggestions = async (notes: string): Promise<Suggestion[]> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
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
    } catch (error) {
        console.error('Legal suggestions failed:', error);
        return [];
    }
};
