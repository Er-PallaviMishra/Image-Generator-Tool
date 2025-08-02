
import { GoogleGenAI, Modality } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { saveImageToPublic } from "../../../utils/imageUtils";
import { addImageToGallery } from "../../../utils/galleryStorage";
import fs from 'fs';
import path from 'path';

const generationCount: Record<string, number> = {};

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});


export async function POST(req: NextRequest) {
  const { prompt, uploadedImage, isEditing } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Check rate limit
  const count = generationCount[ip] || 0;
  //   if (count >= 1) {
  //     return NextResponse.json(
  //       {
  //         error:
  //           "You’ve reached your free limit. Please contact info@technioz.com for further access.",
  //       },
  //       { status: 403 }
  //     );
  //   }

  try {
    let contents: any;

    if (isEditing && uploadedImage) {
      // For image editing, we need to include the original image
      contents = [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: uploadedImage.split(',')[1], // Remove data:image/...;base64, prefix
                mimeType: "image/jpeg"
              }
            }
          ]
        }
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
    generationCount[ip] = count + 1;

    // Save image to public folder
    const timestamp = Date.now();
    const filename = `ai-generated-${timestamp}.png`;
    const savedImageUrl = await saveImageToPublic(`data:image/png;base64,${imageData}`, filename);

    // Save to gallery
    const galleryImage = {
      id: timestamp.toString(),
      url: savedImageUrl,
      filename: filename,
      prompt: prompt,
      timestamp: new Date(),
      isEdited: isEditing
    };

    console.log('About to save gallery image:', galleryImage);

    try {
      addImageToGallery(galleryImage);
      console.log('Gallery image saved successfully');
    } catch (error) {
      console.error('Error saving to gallery:', error);
      // Continue with the response even if gallery save fails
    }

    return NextResponse.json({
      image: savedImageUrl,
      filename: filename,
    });
  } catch (err: any) {
    console.error("Gemini image error:", err.message);
    return NextResponse.json(
      { error: "Failed to generate image." },
      { status: 500 }
    );
  }
}
