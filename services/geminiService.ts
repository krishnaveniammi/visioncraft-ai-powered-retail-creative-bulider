import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

// Helper to clean base64 string (remove data URL prefix if present)
const cleanBase64 = (base64: string): string => {
  if (base64.includes(',')) {
    return base64.split(',')[1];
  }
  return base64;
};

export const generateAdvertisementImage = async (
  apiKey: string,
  description: string,
  productBase64: string,
  productMimeType: string,
  logoBase64: string | null,
  logoMimeType: string | null,
  aspectRatio: AspectRatio,
  useProModel: boolean = false
): Promise<string> => {
  
  const ai = new GoogleGenAI({ apiKey });

  // Prompt Engineering
  const prompt = `
    You are a world-class advertising creative director.
    
    Task: Create a high-end, aesthetic advertisement image based on the user's description.
    
    Inputs Provided:
    1. A Product Image (primary focus).
    ${logoBase64 ? "2. A Brand Logo (MUST be applied to the product)." : ""}
    3. Design Brief: "${description}"

    Directives:
    - The product should be the star of the show, integrated naturally into a generated background that matches the brief.
    - Lighting and composition must be photorealistic and cinematic.
    ${logoBase64 ? "- CRITICAL: The provided Brand Logo must be DIGITALLY COMPOSITED DIRECTLY ONTO THE PRODUCT SURFACE. It must look like it is physically printed, embossed, or labeled on the product itself. Respect the product's 3D geometry, curvature, and lighting. Do NOT place the logo as a floating watermark in the corner." : ""}
    - Do not generate text overlays unless specifically asked in the brief, as AI text can be imperfect. Focus on visual impact.
    - Style: Professional, Clean, High Resolution.
  `;

  const parts = [];

  // Add Product Image
  parts.push({
    inlineData: {
      data: cleanBase64(productBase64),
      mimeType: productMimeType,
    },
  });
  parts.push({ text: "This is the product image." });

  // Add Logo Image if provided
  if (logoBase64 && logoMimeType) {
    parts.push({
      inlineData: {
        data: cleanBase64(logoBase64),
        mimeType: logoMimeType,
      },
    });
    parts.push({ text: "This is the brand logo." });
  }

  // Add Text Prompt
  parts.push({ text: prompt });

  try {
    // Select model based on user preference
    // gemini-3-pro-image-preview: High fidelity, requires paid billing.
    // gemini-2.5-flash-image: Fast, standard quality, usually available on free tier.
    const modelName = useProModel ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    // Configure image options
    const imageConfig: any = {
      aspectRatio: aspectRatio,
    };

    // Only add imageSize for Pro model, Flash does not support it
    if (useProModel) {
      imageConfig.imageSize = "1K";
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: imageConfig
      },
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64String = part.inlineData.data;
        return `data:image/png;base64,${base64String}`;
      }
    }

    throw new Error("No image was generated. The model might have returned only text.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Enhance error message for common issues
    if (error.message?.includes("403") || error.message?.includes("PERMISSION_DENIED")) {
      throw new Error(`Permission denied. ${useProModel ? "The Pro model requires a billed Google Cloud project." : "Please check your API key."}`);
    }
    throw new Error(error.message || "Failed to generate advertisement.");
  }
};