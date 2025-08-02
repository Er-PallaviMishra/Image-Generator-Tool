import { NextRequest, NextResponse } from "next/server";
import { syncGalleryWithImages, getGalleryStats } from "../../../utils/syncGallery";

export async function POST() {
  try {
    console.log('Starting gallery sync via API...');
    
    // Get stats before sync
    const statsBefore = getGalleryStats();
    console.log('Stats before sync:', statsBefore);
    
    // Perform sync
    const missingImages = syncGalleryWithImages();
    
    // Get stats after sync
    const statsAfter = getGalleryStats();
    console.log('Stats after sync:', statsAfter);
    
    return NextResponse.json({
      success: true,
      message: `Sync completed. Added ${missingImages.length} missing images.`,
      addedImages: missingImages,
      stats: {
        before: statsBefore,
        after: statsAfter
      }
    });
    
  } catch (error: any) {
    console.error('Error in sync gallery API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to sync gallery",
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = getGalleryStats();
    
    return NextResponse.json({
      success: true,
      stats: stats,
      message: `Gallery has ${stats.galleryEntries} entries, ${stats.imageFiles} image files, ${stats.missing} missing entries.`
    });
    
  } catch (error: any) {
    console.error('Error getting gallery stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to get gallery stats",
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 