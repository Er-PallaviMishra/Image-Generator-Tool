import fs from 'fs';
import path from 'path';
import { loadGalleryImages, addImageToGallery } from './galleryStorage';

export interface MissingImage {
  filename: string;
  url: string;
  id: string;
  timestamp: Date;
}

export const syncGalleryWithImages = (): MissingImage[] => {
  try {
    console.log('Starting gallery sync...');
    
    // Get existing gallery data
    const existingImages = loadGalleryImages();
    console.log('Existing gallery images:', existingImages.length);
    
    // Get all image files from public/images
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      console.log('Images directory does not exist');
      return [];
    }
    
    const imageFiles = fs.readdirSync(imagesDir)
      .filter(file => file.match(/\.(png|jpg|jpeg|gif|webp)$/i))
      .map(file => file.toLowerCase());
    
    console.log('Found image files:', imageFiles);
    
    // Find missing images
    const existingFilenames = existingImages.map(img => img.filename.toLowerCase());
    const missingFiles = imageFiles.filter(filename => !existingFilenames.includes(filename));
    
    console.log('Missing files:', missingFiles);
    
    const missingImages: MissingImage[] = [];
    
    // Add missing images to gallery
    missingFiles.forEach(filename => {
      try {
        // Extract timestamp from filename (ai-generated-1234567890.png)
        const timestampMatch = filename.match(/ai-generated-(\d+)\./);
        let timestamp: Date;
        let id: string;
        
        if (timestampMatch) {
          const timestampValue = parseInt(timestampMatch[1]);
          timestamp = new Date(timestampValue);
          id = timestampValue.toString();
        } else {
          // Fallback: use file creation time or current time
          const filePath = path.join(imagesDir, filename);
          const stats = fs.statSync(filePath);
          timestamp = stats.birthtime;
          id = Date.now().toString();
        }
        
        const missingImage = {
          id: id,
          url: `/images/${filename}`,
          filename: filename,
          prompt: `AI Generated Image - ${filename}`, // Default prompt
          timestamp: timestamp,
          isEdited: false
        };
        
        console.log('Adding missing image:', missingImage);
        addImageToGallery(missingImage);
        missingImages.push({
          filename: filename,
          url: `/images/${filename}`,
          id: id,
          timestamp: timestamp
        });
        
      } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
      }
    });
    
    console.log(`Sync completed. Added ${missingImages.length} missing images.`);
    return missingImages;
    
  } catch (error) {
    console.error('Error syncing gallery:', error);
    return [];
  }
};

export const getGalleryStats = () => {
  try {
    const existingImages = loadGalleryImages();
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    
    let imageFilesCount = 0;
    if (fs.existsSync(imagesDir)) {
      imageFilesCount = fs.readdirSync(imagesDir)
        .filter(file => file.match(/\.(png|jpg|jpeg|gif|webp)$/i))
        .length;
    }
    
    return {
      galleryEntries: existingImages.length,
      imageFiles: imageFilesCount,
      missing: imageFilesCount - existingImages.length
    };
  } catch (error) {
    console.error('Error getting gallery stats:', error);
    return { galleryEntries: 0, imageFiles: 0, missing: 0 };
  }
}; 