import { NextRequest, NextResponse } from "next/server";
import { loadGalleryImages, clearGallery } from "../../../utils/galleryStorage";

export async function GET() {
  try {
    const images = loadGalleryImages();
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error loading gallery:', error);
    return NextResponse.json(
      { error: "Failed to load gallery" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearGallery();
    return NextResponse.json({ message: "Gallery cleared successfully" });
  } catch (error) {
    console.error('Error clearing gallery:', error);
    return NextResponse.json(
      { error: "Failed to clear gallery" },
      { status: 500 }
    );
  }
} 