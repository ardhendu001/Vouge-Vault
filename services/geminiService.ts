
import { GoogleGenAI, Type } from "@google/genai";
import { WardrobeItem, GatekeeperVerdict } from '../types';

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

// -- FASHION MIXER (Style DNA Blending) --
export const mixFashionStyles = async (
  images: { data: string, mimeType: string }[]
): Promise<{ text: string, image: string | null }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Act as a master fashion designer and creative director. 
  Task: Mix the style DNA of the provided images into ONE NEW cohesive high-fashion outfit or garment.
  Aesthetics to blend: ${images.length} distinct source references.
  Focus on: Innovative silhouettes, material contrast, and sustainable futuristic luxury.
  Provide:
  1. A photorealistic generation of the new mixed design.
  2. A designer's note explaining the blend.`;

  try {
    const parts = images.map(img => ({
      inlineData: { data: img.data, mimeType: img.mimeType }
    }));
    parts.push({ text: prompt } as any);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });

    let text = "";
    let image = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) text += part.text;
        if (part.inlineData) image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return { text, image };
  } catch (e) {
    console.error(e);
    return { text: "Blending failed. Ensure images are high quality.", image: null };
  }
};

// -- ADVANCED DESIGN LAB (Gemini 3 Pro) --
export const generateProDesign = async (
  prompt: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16" = "1:1",
  referenceImage?: { data: string, mimeType: string }
): Promise<{ text: string, image: string | null }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const basePrompt = `HIGH-FASHION DESIGN STUDIO.
  Subject: ${prompt}
  Style: Photorealistic luxury editorial, studio lighting, 8k resolution, haute couture.
  ${referenceImage ? "Heavily reference the aesthetic, color palette, and textures from the provided reference asset." : ""}`;

  try {
    const parts: any[] = [{ text: basePrompt }];
    if (referenceImage) {
      parts.unshift({ inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: { parts },
      config: {
        imageConfig: { aspectRatio, imageSize: "1K" }
      },
    });

    let text = "";
    let image = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) text += part.text;
        if (part.inlineData) image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return { text, image };
  } catch (e) {
    console.error(e);
    return { text: "Pro Generation failed. Ensure API Key is active.", image: null };
  }
};

export const analyzeGatekeeperItem = async (
  base64Image: string, 
  currentWardrobe: WardrobeItem[],
  mimeType: string = "image/png"
): Promise<GatekeeperVerdict> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const wardrobeContext = JSON.stringify(currentWardrobe.map(item => ({
      id: item.id,
      title: item.title,
      color: item.color,
      category: item.category,
      tags: item.tags
    })));

    const prompt = `Act as "The Gatekeeper", a strict sustainable fashion AI. Compare this new item to the wardrobe: ${wardrobeContext}. REJECT if similar. Output JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
          },
          required: ["decision", "reason", "carbonImpact", "potentialOutfits"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error(e);
    return { decision: 'APPROVED', reason: "Unknown error.", carbonImpact: 'Medium', potentialOutfits: 0 };
  }
};

export const suggestOutfit = async (wardrobe: WardrobeItem[], context: string, inputImages?: { mimeType: string, data: string }[]): Promise<{text: string, image?: string}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const wardrobeList = wardrobe.map(i => `- ${i.title} (${i.color} ${i.category})`).join('\n');
    const prompt = `INVENTORY: ${wardrobeList}\nCONTEXT: ${context}\nStyle a complete look and generate a visual preview.`;

    const parts: any[] = [{ text: prompt }];
    if (inputImages) {
      inputImages.forEach(img => parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } }));
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    let text = "";
    let image = undefined;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.text) text += part.text;
      if (part.inlineData) image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return { text: text || "Outfit generated.", image };
  } catch (e) {
    return { text: "Error." };
  }
};

export const getLookOfTheDay = (wardrobe: WardrobeItem[], weatherCondition: string): WardrobeItem[] => {
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

export const analyzeClothingItem = async (base64Image: string, mimeType: string = "image/png"): Promise<Partial<WardrobeItem>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `Analyze garment. Return JSON: title, category, color, fabric, tags, sustainability (rating A-F, carbonFootprint, waterUsage, materialAnalysis).`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [{ inlineData: { mimeType, data: base64Image } }, { text: prompt }],
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { title: "New Item" };
  }
};

export const generateSustainablePrototype = async (prompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `High fashion sustainable prototype: ${prompt}, photorealistic, studio lighting` }]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) {
    return null;
  }
};
