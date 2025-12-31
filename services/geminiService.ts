
import { GoogleGenAI, Type } from "@google/genai";
import { WardrobeItem, GatekeeperVerdict } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// -- THE GATEKEEPER LOGIC --
export const analyzeGatekeeperItem = async (
  base64Image: string, 
  currentWardrobe: WardrobeItem[],
  mimeType: string = "image/png"
): Promise<GatekeeperVerdict> => {
  if (!apiKey) {
    // Mock Response for Demo without Key
    await new Promise(r => setTimeout(r, 2000));
    return {
      decision: 'REJECTED',
      reason: "Duplicate Detected! You already own the 'Classic Blue Oxford' and 'Chambray Button Down' which serve the same aesthetic function.",
      similarItemId: '5',
      carbonImpact: 'High',
      potentialOutfits: 0
    };
  }

  try {
    const wardrobeContext = JSON.stringify(currentWardrobe.map(item => ({
      id: item.id,
      title: item.title,
      color: item.color,
      category: item.category,
      tags: item.tags
    })));

    const prompt = `
      Act as "The Gatekeeper", a strict sustainable fashion AI.
      
      Task: Analyze this image of a POTENTIAL NEW PURCHASE and compare it against the user's CURRENT WARDROBE.
      
      CURRENT WARDROBE JSON:
      ${wardrobeContext}

      Rules:
      1. If the user already owns something very similar (same color, category, and vibe), REJECT it. Sustainability is about reducing consumption.
      2. If it is unique and fills a gap, APPROVE it.
      
      Output JSON format:
      {
        "decision": "APPROVED" | "REJECTED",
        "reason": "Short punchy explanation.",
        "similarItemId": "ID of the most similar item if REJECTED, else null",
        "carbonImpact": "Low" | "Medium" | "High",
        "potentialOutfits": Number (estimated new combos)
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision: { type: Type.STRING, enum: ["APPROVED", "REJECTED"] },
            reason: { type: Type.STRING },
            similarItemId: { type: Type.STRING },
            carbonImpact: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            potentialOutfits: { type: Type.INTEGER }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GatekeeperVerdict;
    }
    throw new Error("No verdict generated");
  } catch (e) {
    console.error("Gatekeeper Error:", e);
    // Fallback
    return {
      decision: 'APPROVED',
      reason: "Analysis error, but it looks stylish. Proceed with caution.",
      carbonImpact: 'Medium',
      potentialOutfits: 3
    };
  }
};

export const suggestOutfit = async (wardrobe: WardrobeItem[], context: string, inputImages?: { mimeType: string, data: string }[]): Promise<{text: string, image?: string}> => {
  if (!apiKey) return { text: "Stylist unavailable (Missing API Key). Try pairing the Denim Jacket with the White Tee." };

  try {
    const wardrobeList = wardrobe.map(i => `- ${i.title} (${i.color} ${i.category})`).join('\n');
    
    const prompt = `You are VogueVault, a conscious stylist.
    INVENTORY: ${wardrobeList}
    CONTEXT: ${context}
    
    1. Generate a photorealistic image of the outfit.
    2. Provide text advice:
    *Vogue's Verdict:* [Summary]
    **The Look:** [Name]
    **Why it works:** [Theory]
    `;

    const parts: any[] = [{ text: prompt }];

    if (inputImages && inputImages.length > 0) {
      inputImages.forEach(img => {
        parts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data
          }
        });
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    let text = "";
    let image = undefined;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) text += part.text;
        if (part.inlineData) image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    return { text: text || "Outfit generated.", image };

  } catch (e) {
    console.error(e);
    return { text: "Error contacting the digital stylist." };
  }
};

// -- HELPER FOR SHOP YOUR CLOSET (Look of the Day) --
export const getLookOfTheDay = (wardrobe: WardrobeItem[], weatherCondition: string): WardrobeItem[] => {
  // Simple heuristic logic instead of AI for speed in Dashboard
  const tops = wardrobe.filter(i => i.category === 'Tops');
  const bottoms = wardrobe.filter(i => i.category === 'Bottoms');
  const outerwear = wardrobe.filter(i => i.category === 'Outerwear');
  
  const randomTop = tops[Math.floor(Math.random() * tops.length)];
  const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
  
  const look = [randomTop, randomBottom];
  
  if (weatherCondition.includes('Rain') || weatherCondition.includes('Cold')) {
    const jacket = outerwear[0];
    if (jacket) look.push(jacket);
  }
  
  return look.filter(Boolean);
};

// -- ANALYZE CLOTHING ITEM --
export const analyzeClothingItem = async (base64Image: string, mimeType: string = "image/png"): Promise<Partial<WardrobeItem>> => {
  if (!apiKey) {
    // Mock data for demo
    await new Promise(r => setTimeout(r, 1000));
    return {
      title: "Scanned Garment",
      category: "Tops",
      color: "Black",
      fabric: "Cotton",
      tags: ["#Scanned", "#Sustainable"],
      sustainability: {
        rating: "B",
        carbonFootprint: "5 kg CO2",
        waterUsage: "500 L",
        materialAnalysis: "Standard cotton production."
      }
    };
  }

  const prompt = `Analyze this clothing item for a wardrobe app.
  Return JSON with: title, category (Tops, Bottoms, Shoes, Accessories, Outerwear), color, fabric, tags (array of strings), and sustainability metrics (rating A-F, carbonFootprint, waterUsage, materialAnalysis).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["Tops", "Bottoms", "Shoes", "Accessories", "Outerwear"] },
            color: { type: Type.STRING },
            fabric: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            sustainability: {
              type: Type.OBJECT,
              properties: {
                rating: { type: Type.STRING },
                carbonFootprint: { type: Type.STRING },
                waterUsage: { type: Type.STRING },
                materialAnalysis: { type: Type.STRING },
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Analysis failed");
  } catch (e) {
    console.error("Analyze Item Error:", e);
    return {
      title: "New Item",
      category: "Tops",
      color: "Unknown",
      fabric: "Unknown",
      tags: []
    };
  }
};

// -- GENERATE SUSTAINABLE PROTOTYPE --
export const generateSustainablePrototype = async (prompt: string): Promise<string | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `High fashion sustainable prototype: ${prompt}, photorealistic, studio lighting, clean background` }]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Generate Prototype Error:", e);
    return null;
  }
};
