import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface DetectionResult {
  disease: string;
  confidence: string;
  description: string;
  recommendations: string[];
  rawAnalysis: string;
}

export async function analyzeLeafImage(base64Image: string): Promise<DetectionResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an expert plant pathologist specializing in medicinal plants, specifically Andrographis paniculata (Kalmegh).
    Analyze the provided image of a Kalmegh leaf and identify if it is healthy or if it shows signs of disease.
    
    Common diseases in Kalmegh include:
    - Leaf Spot (Cercospora)
    - Downy Mildew
    - Powdery Mildew
    - Bacterial Blight
    - Viral Mosaic
    
    Please provide your analysis in the following JSON format:
    {
      "disease": "Name of the disease or 'Healthy'",
      "confidence": "High/Medium/Low",
      "description": "A brief description of the symptoms observed",
      "recommendations": ["Step 1", "Step 2", ...],
      "rawAnalysis": "A detailed markdown explanation of the findings"
    }
    
    Only return the JSON object.
  `;

  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }, imagePart] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI model");
    
    return JSON.parse(text) as DetectionResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}
