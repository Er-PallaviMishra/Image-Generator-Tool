import { GoogleGenAI, Modality } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { saveImageToPublic } from "../../../utils/imageUtils";
import { addImageToGallery } from "../../../utils/galleryStorage";
import fs from "fs";
import path from "path";

// Note: localStorage-based gallery management happens client-side
// This API continues to save to the server for backup purposes
// but the main gallery display will come from localStorage

// Server-side generation tracking (fallback for users without localStorage)
const generationCount: Record<string, { count: number; resetTime: number }> = {};
const MAX_GENERATIONS_PER_USER = 3;
const RESET_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(req: NextRequest) {
  const { prompt, uploadedImage, isEditing, userId } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  
  // Use userId for rate limiting if provided, otherwise fall back to IP
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitKey = userId || ip;

  const instruction =
    `You are a professional AI image generator. Your primary role is to create high-quality, visually appealing, and contextually accurate images based on the provided prompt.
    If an image is uploaded, edit or enhance it according to the instructions.Always generate images in English language only (for any text, labels, or typography).
    For product requests: generate professional, production-ready product images that are clean, realistic, and suitable for marketing or e-commerce.
    For logos: create unique, modern, and professional logo designs.
    For memes: generate humorous, engaging, and shareable meme-style images.
    For illustrations: create detailed, artistic, and visually appealing illustrations.
    For landscapes: generate beautiful, realistic, and immersive landscapes.
    If the user’s request is unclear, ask for clarification before generating. Do not generate images that are offensive, illegal, or violate any guidelines.`;

  // Combine instruction with user prompt
  const combinedPrompt = `${instruction}\nPrompt: ${prompt}`;

  // Check rate limit (server-side fallback)
  const now = Date.now();
  const userGeneration = generationCount[rateLimitKey];
  
  if (userGeneration) {
    // Check if limit should be reset
    if (now > userGeneration.resetTime) {
      // Reset the count
      generationCount[rateLimitKey] = { count: 0, resetTime: now + RESET_PERIOD_MS };
    } else if (userGeneration.count >= MAX_GENERATIONS_PER_USER) {
      return NextResponse.json(
        {
          error: "You've reached your free limit of 3 images. Please contact info@technioz.com for further access.",
          limitInfo: {
            current: userGeneration.count,
            max: MAX_GENERATIONS_PER_USER,
            remaining: 0
          }
        },
        { status: 403 }
      );
    }
  } else {
    // Initialize user generation tracking
    generationCount[rateLimitKey] = { count: 0, resetTime: now + RESET_PERIOD_MS };
  }

  try {
    let contents: any;

    if (isEditing && uploadedImage) {
      // For image editing, we need to include the original image
      contents = [
        {
          role: "user",
          parts: [
            { text: combinedPrompt },
            {
              inlineData: {
                data: uploadedImage.split(",")[1], // Remove data:image/...;base64, prefix
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      ];
    } else {
      // For text-to-image generation
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: contents,
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
    // Increment generation count
    const userGeneration = generationCount[rateLimitKey];
    if (userGeneration) {
      generationCount[rateLimitKey].count = userGeneration.count + 1;
    } else {
      generationCount[rateLimitKey] = { count: 1, resetTime: now + RESET_PERIOD_MS };
    }

    // Save image to public folder
    const timestamp = Date.now();
    const filename = `ai-generated-${timestamp}.png`;
    const savedImageUrl = await saveImageToPublic(
      `data:image/png;base64,${imageData}`,
      filename
    );

    // Save to gallery
    const galleryImage = {
      id: timestamp.toString(),
      url: savedImageUrl,
      filename: filename,
      prompt: prompt,
      timestamp: new Date(),
      isEdited: isEditing,
    };

    console.log("About to save gallery image:", galleryImage);

    try {
      addImageToGallery(galleryImage);
      console.log("Gallery image saved successfully");
    } catch (error) {
      console.error("Error saving to gallery:", error);
      // Continue with the response even if gallery save fails
    }

    return NextResponse.json({
      image: savedImageUrl,
      filename: filename,
      id: timestamp.toString(),
      timestamp: new Date().toISOString(),
      prompt: prompt,
      isEdited: isEditing,
      limitInfo: {
        current: generationCount[rateLimitKey]?.count || 1,
        max: MAX_GENERATIONS_PER_USER,
        remaining: Math.max(0, MAX_GENERATIONS_PER_USER - (generationCount[rateLimitKey]?.count || 1))
      }
    });
  } catch (err: any) {
    console.error("Gemini image error:", err.message);
    return NextResponse.json(
      { error: "Failed to generate image." },
      { status: 500 }
    );
  }
}
