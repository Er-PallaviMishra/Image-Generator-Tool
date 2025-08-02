// app/api/generate-image/route.ts

import { GoogleGenAI, Modality } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory store
const generationCount: Record<string, number> = {};

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Check rate limit
  const count = generationCount[ip] || 0;
  if (count >= 1) {
    return NextResponse.json(
      {
        error:
          "You’ve reached your free limit. Please contact info@technioz.com for further access.",
      },
      { status: 403 }
    );
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];

    let imageData: string | null = null;

    for (const part of parts) {
      if (part.inlineData?.data) {
        imageData = part.inlineData.data;
      }
    }

    if (!imageData) {
      return NextResponse.json(
        { error: "No image data returned." },
        { status: 500 }
      );
    }
    generationCount[ip] = count + 1;

    return NextResponse.json({
      image: `data:image/png;base64,${imageData}`,
    });
  } catch (err: any) {
    console.error("Gemini image error:", err.message);
    return NextResponse.json(
      { error: "Failed to generate image." },
      { status: 500 }
    );
  }
}
