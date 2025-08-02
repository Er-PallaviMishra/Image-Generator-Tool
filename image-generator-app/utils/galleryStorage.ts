import fs from 'fs';
import path from 'path';

export interface GalleryImage {
  id: string;
  url: string;
  filename: string;
  prompt: string;
  timestamp: Date;
  isEdited: boolean;
}

const GALLERY_FILE = path.join(process.cwd(), 'data', 'gallery.json');

export const loadGalleryImages = (): GalleryImage[] => {
  try {
    console.log('Loading gallery from:', GALLERY_FILE);
    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(GALLERY_FILE);
    if (!fs.existsSync(dataDir)) {
      console.log('Creating data directory:', dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create gallery file if it doesn't exist
    if (!fs.existsSync(GALLERY_FILE)) {
      console.log('Creating new gallery file');
      fs.writeFileSync(GALLERY_FILE, JSON.stringify([], null, 2));
      return [];
    }

    const data = fs.readFileSync(GALLERY_FILE, 'utf8');
    console.log('Raw gallery data:', data);
    const images = JSON.parse(data);
    console.log('Parsed images:', images);
    
    // Convert timestamp strings back to Date objects
    const processedImages = images.map((img: any) => ({
      ...img,
      timestamp: new Date(img.timestamp)
    }));
    
    console.log('Processed images:', processedImages);
    return processedImages;
  } catch (error) {
    console.error('Error loading gallery:', error);
    return [];
  }
};

export const saveGalleryImages = (images: GalleryImage[]): void => {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(GALLERY_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(GALLERY_FILE, JSON.stringify(images, null, 2));
  } catch (error) {
    console.error('Error saving gallery:', error);
  }
};

export const addImageToGallery = (image: GalleryImage): void => {
  console.log('Adding image to gallery:', image);
  const images = loadGalleryImages();
  images.unshift(image); // Add to beginning
  console.log('Updated gallery with', images.length, 'images');
  saveGalleryImages(images);
};

export const removeImageFromGallery = (id: string): void => {
  const images = loadGalleryImages();
  const filteredImages = images.filter(img => img.id !== id);
  saveGalleryImages(filteredImages);
};

export const clearGallery = (): void => {
  saveGalleryImages([]);
}; 