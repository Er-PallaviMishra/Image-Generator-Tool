/**
 * React Hook for Local Gallery Management
 * Provides state management and real-time updates for user-specific galleries
 */

import { useState, useEffect, useCallback } from 'react';
import {
  LocalGalleryImage,
  GalleryStats,
  getLocalGalleryImages,
  addImageToLocalGallery,
  removeImageFromLocalGallery,
  clearLocalGallery,
  getGalleryStats,
  exportGalleryData,
  importGalleryData,
  checkStorageAvailability
} from '../utils/localGallery';
import { getUserSession } from '../utils/userSession';

export interface UseLocalGalleryReturn {
  // State
  images: LocalGalleryImage[];
  stats: GalleryStats;
  isLoading: boolean;
  error: string | null;
  storageInfo: { available: boolean; spaceLeft: number };
  
  // Actions
  addImage: (image: Omit<LocalGalleryImage, 'userId'>) => boolean;
  removeImage: (imageId: string) => boolean;
  clearGallery: () => boolean;
  refreshGallery: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  
  // Utilities
  getUserId: () => string;
  formatStorageSize: (bytes: number) => string;
}

export function useLocalGallery(): UseLocalGalleryReturn {
  const [images, setImages] = useState<LocalGalleryImage[]>([]);
  const [stats, setStats] = useState<GalleryStats>({
    totalImages: 0,
    generatedImages: 0,
    editedImages: 0,
    oldestImage: null,
    newestImage: null,
    storageSize: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState({ available: false, spaceLeft: 0 });

  // Load gallery data
  const loadGallery = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      const galleryImages = getLocalGalleryImages();
      const galleryStats = getGalleryStats();
      const storage = checkStorageAvailability();
      
      setImages(galleryImages);
      setStats(galleryStats);
      setStorageInfo(storage);
      
      console.log(`Loaded ${galleryImages.length} images for current user`);
    } catch (err) {
      console.error('Error loading gallery:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize gallery on mount
  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  // Listen for gallery updates from other parts of the app
  useEffect(() => {
    const handleGalleryUpdate = (event: CustomEvent) => {
      console.log('Gallery update event received:', event.detail);
      loadGallery();
    };

    window.addEventListener('localGalleryUpdated', handleGalleryUpdate as EventListener);
    
    return () => {
      window.removeEventListener('localGalleryUpdated', handleGalleryUpdate as EventListener);
    };
  }, [loadGallery]);

  // Listen for storage events (when user opens multiple tabs)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'ai-gallery-images') {
        console.log('Gallery updated in another tab, refreshing...');
        loadGallery();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadGallery]);

  // Add image to gallery
  const addImage = useCallback((image: Omit<LocalGalleryImage, 'userId'>): boolean => {
    try {
      setError(null);
      const success = addImageToLocalGallery(image);
      
      if (success) {
        // Update local state immediately for better UX
        const session = getUserSession();
        const newImage: LocalGalleryImage = {
          ...image,
          userId: session.userId,
          timestamp: new Date(image.timestamp)
        };
        
        setImages(prev => [newImage, ...prev]);
        
        // Refresh stats
        const newStats = getGalleryStats();
        setStats(newStats);
        
        // Update storage info
        const storage = checkStorageAvailability();
        setStorageInfo(storage);
        
        console.log('Image added successfully to local gallery');
      } else {
        setError('Failed to add image to gallery');
      }
      
      return success;
    } catch (err) {
      console.error('Error adding image:', err);
      setError(err instanceof Error ? err.message : 'Failed to add image');
      return false;
    }
  }, []);

  // Remove image from gallery
  const removeImage = useCallback((imageId: string): boolean => {
    try {
      setError(null);
      const success = removeImageFromLocalGallery(imageId);
      
      if (success) {
        // Update local state immediately
        setImages(prev => prev.filter(img => img.id !== imageId));
        
        // Refresh stats
        const newStats = getGalleryStats();
        setStats(newStats);
        
        // Update storage info
        const storage = checkStorageAvailability();
        setStorageInfo(storage);
        
        console.log('Image removed successfully from local gallery');
      } else {
        setError('Failed to remove image from gallery');
      }
      
      return success;
    } catch (err) {
      console.error('Error removing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove image');
      return false;
    }
  }, []);

  // Clear entire gallery
  const clearGalleryHandler = useCallback((): boolean => {
    try {
      setError(null);
      const success = clearLocalGallery();
      
      if (success) {
        // Update local state immediately
        setImages([]);
        setStats({
          totalImages: 0,
          generatedImages: 0,
          editedImages: 0,
          oldestImage: null,
          newestImage: null,
          storageSize: 0
        });
        
        // Update storage info
        const storage = checkStorageAvailability();
        setStorageInfo(storage);
        
        console.log('Gallery cleared successfully');
      } else {
        setError('Failed to clear gallery');
      }
      
      return success;
    } catch (err) {
      console.error('Error clearing gallery:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear gallery');
      return false;
    }
  }, []);

  // Refresh gallery manually
  const refreshGallery = useCallback(() => {
    loadGallery();
  }, [loadGallery]);

  // Export gallery data
  const exportData = useCallback((): string => {
    try {
      setError(null);
      return exportGalleryData();
    } catch (err) {
      console.error('Error exporting gallery:', err);
      setError(err instanceof Error ? err.message : 'Failed to export gallery');
      return '';
    }
  }, []);

  // Import gallery data
  const importData = useCallback((jsonData: string): boolean => {
    try {
      setError(null);
      const success = importGalleryData(jsonData);
      
      if (success) {
        loadGallery(); // Refresh after import
        console.log('Gallery data imported successfully');
      } else {
        setError('Failed to import gallery data');
      }
      
      return success;
    } catch (err) {
      console.error('Error importing gallery:', err);
      setError(err instanceof Error ? err.message : 'Failed to import gallery');
      return false;
    }
  }, [loadGallery]);

  // Get current user ID
  const getUserId = useCallback((): string => {
    const session = getUserSession();
    return session.userId;
  }, []);

  // Format storage size for display
  const formatStorageSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    // State
    images,
    stats,
    isLoading,
    error,
    storageInfo,
    
    // Actions
    addImage,
    removeImage,
    clearGallery: clearGalleryHandler,
    refreshGallery,
    exportData,
    importData,
    
    // Utilities
    getUserId,
    formatStorageSize
  };
}
