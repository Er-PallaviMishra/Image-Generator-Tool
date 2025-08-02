import { NextRequest, NextResponse } from "next/server";
import { loadGalleryImages, addImageToGallery } from "../../../utils/galleryStorage";

export async function GET() {
  try {
    const images = loadGalleryImages();
    
    // Add a test image if none exist
    if (images.length === 0) {
      const testImage = {
        id: "test-" + Date.now(),
        url: "/logo-light.png",
        filename: "test-image.png",
        prompt: "Test image for gallery",
        timestamp: new Date(),
        isEdited: false
      };
      addImageToGallery(testImage);
      
      return NextResponse.json({ 
        message: "Test image added to gallery",
        images: [testImage]
      });
    }
    
    return NextResponse.json({ 
      message: "Gallery loaded successfully",
      images: images 
    });
  } catch (error) {
    console.error('Test gallery error:', error);
    return NextResponse.json(
      { error: "Gallery test failed", details: error },
      { status: 500 }
    );
  }
} 