
import { GoogleGenAI, Type } from "@google/genai";
import { EvidenceItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
  You are the TruthTrack™ Advocate, an AI legal project manager specialized in Pro Se litigation.
  
  CORE MISSION:
  1. Forging a 'Truth Spine': Ensure every piece of evidence is immutable, timestamped, and hashed.
  2. Distilling Procedural Beats: Extract neutral, objective events. The evidence must speak for itself.
  3. Executing the 'Say Less' Strategy: Identify undeniable patterns of facts so that 'the pattern does the work' instead of emotional framing.
  
  CONTEXT: Case Firey v. Firey (Montgomery County, PA).
  LEGAL THEORY: "Manufactured Imbalance" (Removal -> Denial -> Delay -> Status Quo).
  TONE: Procedural, clinical, court-ready.
`;

export async function neutralizeText(text: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Neutralize this legal statement. Remove emotional framing. Distill the procedural beat: "${text}"`,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Neutralization Error:", error);
    return text;
  }
}

export async function analyzeEvidence(evidence: EvidenceItem[]) {
  const prompt = `
    Analyze this 'Truth Spine' for Case Firey v. Firey.
    
    TASK:
    1. Identify high-severity conflicts/contradictions.
    2. Suggest 'Say Less' strategic points.
    3. Evaluate 'Truth Spine' integrity.
    
    Evidence Data:
    ${evidence.map(e => `[${e.timestamp}] (Hash: ${e.hash}) ${e.sender}: ${e.content}`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readinessScore: { type: Type.INTEGER },
            conflicts: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            strategicAlignment: { type: Type.STRING },
            sayLessStrategy: { type: Type.STRING }
          },
          required: ["readinessScore", "conflicts", "suggestions", "summary", "strategicAlignment", "sayLessStrategy"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
