/**
 * Local Gallery Storage Management
 * Handles user-specific image galleries using localStorage
 */

import { getUserSession } from './userSession';

export interface LocalGalleryImage {
  id: string;
  url: string;
  filename: string;
  prompt: string;
  timestamp: Date;
  isEdited: boolean;
  userId: string;
}

export interface GalleryStats {
  totalImages: number;
  generatedImages: number;
  editedImages: number;
  oldestImage: Date | null;
  newestImage: Date | null;
  storageSize: number; // in bytes
}

const GALLERY_STORAGE_KEY = 'ai-gallery-images';
const MAX_IMAGES_PER_USER = 100; // Prevent localStorage from growing too large
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit for localStorage

/**
 * Get current user's gallery images from localStorage
 */
export function getLocalGalleryImages(): LocalGalleryImage[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const session = getUserSession();
    const allImagesData = localStorage.getItem(GALLERY_STORAGE_KEY);
    
    if (!allImagesData) return [];
    
    const allImages: LocalGalleryImage[] = JSON.parse(allImagesData);
    
    // Filter images for current user and convert timestamp strings to Date objects
    const userImages = allImages
      .filter(img => img.userId === session.userId)
      .map(img => ({
        ...img,
        timestamp: new Date(img.timestamp)
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by newest first
    
    return userImages;
  } catch (error) {
    console.error('Error loading local gallery images:', error);
    return [];
  }
}

/**
 * Add a new image to the current user's gallery
 */
export function addImageToLocalGallery(image: Omit<LocalGalleryImage, 'userId'>): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const session = getUserSession();
    const allImagesData = localStorage.getItem(GALLERY_STORAGE_KEY);
    let allImages: LocalGalleryImage[] = allImagesData ? JSON.parse(allImagesData) : [];
    
    // Create new image with user ID
    const newImage: LocalGalleryImage = {
      ...image,
      userId: session.userId,
      timestamp: new Date(image.timestamp)
    };
    
    // Add new image at the beginning
    allImages.unshift(newImage);
    
    // Clean up old images if necessary
    allImages = cleanupGalleryStorage(allImages);
    
    // Check storage size limit
    const newDataString = JSON.stringify(allImages);
    if (newDataString.length > MAX_STORAGE_SIZE) {
      console.warn('Gallery storage size limit reached, removing oldest images');
      allImages = allImages.slice(0, Math.floor(allImages.length * 0.8)); // Remove 20% oldest
    }
    
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(allImages));
    
    // Dispatch custom event for gallery updates
    window.dispatchEvent(new CustomEvent('localGalleryUpdated', {
      detail: { action: 'add', imageId: newImage.id, userId: session.userId }
    }));
    
    return true;
  } catch (error) {
    console.error('Error adding image to local gallery:', error);
    return false;
  }
}

/**
 * Remove an image from the current user's gallery
 */
export function removeImageFromLocalGallery(imageId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const session = getUserSession();
    const allImagesData = localStorage.getItem(GALLERY_STORAGE_KEY);
    
    if (!allImagesData) return false;
    
    let allImages: LocalGalleryImage[] = JSON.parse(allImagesData);
    
    // Remove the image (only if it belongs to current user)
    const initialLength = allImages.length;
    allImages = allImages.filter(img => !(img.id === imageId && img.userId === session.userId));
    
    if (allImages.length === initialLength) {
      console.warn('Image not found or does not belong to current user');
      return false;
    }
    
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(allImages));
    
    // Dispatch custom event for gallery updates
    window.dispatchEvent(new CustomEvent('localGalleryUpdated', {
      detail: { action: 'remove', imageId, userId: session.userId }
    }));
    
    return true;
  } catch (error) {
    console.error('Error removing image from local gallery:', error);
    return false;
  }
}

/**
 * Clear all images for the current user
 */
export function clearLocalGallery(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const session = getUserSession();
    const allImagesData = localStorage.getItem(GALLERY_STORAGE_KEY);
    
    if (!allImagesData) return true;
    
    let allImages: LocalGalleryImage[] = JSON.parse(allImagesData);
    
    // Remove all images for current user
    allImages = allImages.filter(img => img.userId !== session.userId);
    
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(allImages));
    
    // Dispatch custom event for gallery updates
    window.dispatchEvent(new CustomEvent('localGalleryUpdated', {
      detail: { action: 'clear', userId: session.userId }
    }));
    
    return true;
  } catch (error) {
    console.error('Error clearing local gallery:', error);
    return false;
  }
}

/**
 * Get gallery statistics for the current user
 */
export function getGalleryStats(): GalleryStats {
  const images = getLocalGalleryImages();
  
  if (images.length === 0) {
    return {
      totalImages: 0,
      generatedImages: 0,
      editedImages: 0,
      oldestImage: null,
      newestImage: null,
      storageSize: 0
    };
  }
  
  const generatedImages = images.filter(img => !img.isEdited).length;
  const editedImages = images.filter(img => img.isEdited).length;
  const timestamps = images.map(img => img.timestamp.getTime());
  const oldestImage = new Date(Math.min(...timestamps));
  const newestImage = new Date(Math.max(...timestamps));
  
  // Calculate storage size
  const storageData = localStorage.getItem(GALLERY_STORAGE_KEY) || '';
  const storageSize = new Blob([storageData]).size;
  
  return {
    totalImages: images.length,
    generatedImages,
    editedImages,
    oldestImage,
    newestImage,
    storageSize
  };
}

/**
 * Clean up gallery storage by removing excess images
 */
function cleanupGalleryStorage(allImages: LocalGalleryImage[]): LocalGalleryImage[] {
  const session = getUserSession();
  
  // Group images by user
  const imagesByUser = allImages.reduce((acc, img) => {
    if (!acc[img.userId]) acc[img.userId] = [];
    acc[img.userId].push(img);
    return acc;
  }, {} as Record<string, LocalGalleryImage[]>);
  
  // Limit images per user
  Object.keys(imagesByUser).forEach(userId => {
    const userImages = imagesByUser[userId];
    if (userImages.length > MAX_IMAGES_PER_USER) {
      // Sort by timestamp (newest first) and keep only the latest MAX_IMAGES_PER_USER
      userImages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      imagesByUser[userId] = userImages.slice(0, MAX_IMAGES_PER_USER);
    }
  });
  
  // Flatten back to single array
  return Object.values(imagesByUser).flat();
}

/**
 * Export gallery data for backup
 */
export function exportGalleryData(): string {
  const images = getLocalGalleryImages();
  const session = getUserSession();
  
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    userId: session.userId,
    images: images,
    stats: getGalleryStats()
  }, null, 2);
}

/**
 * Import gallery data from backup
 */
export function importGalleryData(jsonData: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const importData = JSON.parse(jsonData);
    const session = getUserSession();
    
    if (!importData.images || !Array.isArray(importData.images)) {
      throw new Error('Invalid import data format');
    }
    
    // Import images with current user ID
    const imagesToImport = importData.images.map((img: any) => ({
      ...img,
      userId: session.userId,
      timestamp: new Date(img.timestamp),
      id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    // Get existing images
    const allImagesData = localStorage.getItem(GALLERY_STORAGE_KEY);
    let allImages: LocalGalleryImage[] = allImagesData ? JSON.parse(allImagesData) : [];
    
    // Add imported images
    allImages = [...imagesToImport, ...allImages];
    
    // Clean up
    allImages = cleanupGalleryStorage(allImages);
    
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(allImages));
    
    // Dispatch custom event for gallery updates
    window.dispatchEvent(new CustomEvent('localGalleryUpdated', {
      detail: { action: 'import', userId: session.userId, count: imagesToImport.length }
    }));
    
    return true;
  } catch (error) {
    console.error('Error importing gallery data:', error);
    return false;
  }
}

/**
 * Check if localStorage is available and has enough space
 */
export function checkStorageAvailability(): { available: boolean; spaceLeft: number } {
  if (typeof window === 'undefined') {
    return { available: false, spaceLeft: 0 };
  }
  
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // Estimate available space (rough calculation)
    const currentData = localStorage.getItem(GALLERY_STORAGE_KEY) || '';
    const currentSize = new Blob([currentData]).size;
    const spaceLeft = MAX_STORAGE_SIZE - currentSize;
    
    return {
      available: true,
      spaceLeft: Math.max(0, spaceLeft)
    };
  } catch (error) {
    return { available: false, spaceLeft: 0 };
  }
}
