/**
 * React Hook for User Generation Limit Management
 * Provides real-time tracking of user's image generation limits
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getUserLimitInfo, 
  canUserGenerateImage, 
  incrementUserGenerationCount,
  resetUserGenerationCount,
  getUserGenerationCount
} from '../utils/userGenerationLimit';
import { getUserSession } from '../utils/userSession';

export interface LimitInfo {
  current: number;
  max: number;
  remaining: number;
  canGenerate: boolean;
  resetDate: Date | null;
}

export interface UseUserGenerationLimitReturn {
  limitInfo: LimitInfo;
  canGenerate: boolean;
  remaining: number;
  checkLimit: () => void;
  incrementCount: () => boolean;
  resetCount: () => boolean;
  refreshLimitInfo: () => void;
  isLoading: boolean;
}

export function useUserGenerationLimit(): UseUserGenerationLimitReturn {
  const [limitInfo, setLimitInfo] = useState<LimitInfo>({
    current: 0,
    max: 3,
    remaining: 3,
    canGenerate: true,
    resetDate: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Refresh limit information
  const refreshLimitInfo = useCallback(() => {
    setIsLoading(true);
    try {
      const info = getUserLimitInfo();
      setLimitInfo(info);
    } catch (error) {
      console.error('Error refreshing limit info:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user can generate an image
  const checkLimit = useCallback(() => {
    const canGenerate = canUserGenerateImage();
    const current = getUserGenerationCount();
    const remaining = Math.max(0, 3 - current);
    
    setLimitInfo(prev => ({
      ...prev,
      current,
      remaining,
      canGenerate
    }));
  }, []);

  // Increment generation count
  const incrementCount = useCallback((): boolean => {
    const success = incrementUserGenerationCount();
    if (success) {
      refreshLimitInfo();
    }
    return success;
  }, [refreshLimitInfo]);

  // Reset generation count
  const resetCount = useCallback((): boolean => {
    const success = resetUserGenerationCount();
    if (success) {
      refreshLimitInfo();
    }
    return success;
  }, [refreshLimitInfo]);

  // Listen for limit updates
  useEffect(() => {
    const handleLimitUpdate = (event: CustomEvent) => {
      const { userId, count, remaining } = event.detail;
      const currentSession = getUserSession();
      
      if (userId === currentSession.userId || userId === 'all') {
        setLimitInfo(prev => ({
          ...prev,
          current: count,
          remaining: remaining,
          canGenerate: remaining > 0
        }));
      }
    };

    window.addEventListener('generationLimitUpdated', handleLimitUpdate as EventListener);
    
    return () => {
      window.removeEventListener('generationLimitUpdated', handleLimitUpdate as EventListener);
    };
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    refreshLimitInfo();

    // Refresh limit info every minute to check for resets
    const interval = setInterval(() => {
      refreshLimitInfo();
    }, 60000);

    return () => clearInterval(interval);
  }, [refreshLimitInfo]);

  // Listen for storage changes (across tabs)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'ai-gallery-generation-limits') {
        refreshLimitInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshLimitInfo]);

  return {
    limitInfo,
    canGenerate: limitInfo.canGenerate,
    remaining: limitInfo.remaining,
    checkLimit,
    incrementCount,
    resetCount,
    refreshLimitInfo,
    isLoading
  };
}
