/**
 * User-specific Generation Limit Management
 * Tracks image generation attempts per user using localStorage
 */

import { getUserSession } from './userSession';

export interface GenerationLimit {
  userId: string;
  count: number;
  lastGenerated: string;
  // No reset date - this is a permanent limit
}

const GENERATION_LIMIT_KEY = 'ai-gallery-generation-limits';
const MAX_GENERATIONS_PER_USER = 3;
// No reset period - users get 3 images total, ever

/**
 * Get current generation count for the user
 */
export function getUserGenerationCount(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const session = getUserSession();
    const limitsData = localStorage.getItem(GENERATION_LIMIT_KEY);
    
    if (!limitsData) return 0;
    
    const limits: GenerationLimit[] = JSON.parse(limitsData);
    const userLimit = limits.find(limit => limit.userId === session.userId);
    
    if (!userLimit) return 0;
    
    // No reset - permanent limit
    return userLimit.count;
  } catch (error) {
    console.error('Error getting user generation count:', error);
    return 0;
  }
}

/**
 * Check if user can generate more images
 */
export function canUserGenerateImage(): boolean {
  const currentCount = getUserGenerationCount();
  return currentCount < MAX_GENERATIONS_PER_USER;
}

/**
 * Get remaining generations for the user
 */
export function getRemainingGenerations(): number {
  const currentCount = getUserGenerationCount();
  return Math.max(0, MAX_GENERATIONS_PER_USER - currentCount);
}

/**
 * Increment user's generation count
 */
export function incrementUserGenerationCount(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const session = getUserSession();
    const limitsData = localStorage.getItem(GENERATION_LIMIT_KEY);
    let limits: GenerationLimit[] = limitsData ? JSON.parse(limitsData) : [];
    
    // Find existing limit for user
    const existingLimitIndex = limits.findIndex(limit => limit.userId === session.userId);
    const now = new Date();
    
    if (existingLimitIndex >= 0) {
      // Increment existing count (no reset)
      limits[existingLimitIndex] = {
        ...limits[existingLimitIndex],
        count: limits[existingLimitIndex].count + 1,
        lastGenerated: now.toISOString()
      };
    } else {
      // Create new limit entry
      limits.push({
        userId: session.userId,
        count: 1,
        lastGenerated: now.toISOString()
      });
    }
    
    localStorage.setItem(GENERATION_LIMIT_KEY, JSON.stringify(limits));
    
    // Dispatch event for UI updates
    const updatedUserLimit = limits.find(l => l.userId === session.userId);
    window.dispatchEvent(new CustomEvent('generationLimitUpdated', {
      detail: { 
        userId: session.userId, 
        count: updatedUserLimit?.count || 0,
        remaining: Math.max(0, MAX_GENERATIONS_PER_USER - (updatedUserLimit?.count || 0))
      }
    }));
    
    return true;
  } catch (error) {
    console.error('Error incrementing user generation count:', error);
    return false;
  }
}

/**
 * Reset user's generation count
 */
export function resetUserGenerationCount(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const session = getUserSession();
    const limitsData = localStorage.getItem(GENERATION_LIMIT_KEY);
    
    if (!limitsData) return true;
    
    let limits: GenerationLimit[] = JSON.parse(limitsData);
    
    // Remove or reset user's limit
    limits = limits.filter(limit => limit.userId !== session.userId);
    
    localStorage.setItem(GENERATION_LIMIT_KEY, JSON.stringify(limits));
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('generationLimitUpdated', {
      detail: { 
        userId: session.userId, 
        count: 0,
        remaining: MAX_GENERATIONS_PER_USER
      }
    }));
    
    return true;
  } catch (error) {
    console.error('Error resetting user generation count:', error);
    return false;
  }
}

/**
 * Get limit info for the current user
 */
export function getUserLimitInfo(): {
  current: number;
  max: number;
  remaining: number;
  canGenerate: boolean;
  resetDate: Date | null;
} {
  if (typeof window === 'undefined') {
    return {
      current: 0,
      max: MAX_GENERATIONS_PER_USER,
      remaining: MAX_GENERATIONS_PER_USER,
      canGenerate: true,
      resetDate: null
    };
  }
  
  try {
    const session = getUserSession();
    const limitsData = localStorage.getItem(GENERATION_LIMIT_KEY);
    
    if (!limitsData) {
      return {
        current: 0,
        max: MAX_GENERATIONS_PER_USER,
        remaining: MAX_GENERATIONS_PER_USER,
        canGenerate: true,
        resetDate: null
      };
    }
    
    const limits: GenerationLimit[] = JSON.parse(limitsData);
    const userLimit = limits.find(limit => limit.userId === session.userId);
    
    if (!userLimit) {
      return {
        current: 0,
        max: MAX_GENERATIONS_PER_USER,
        remaining: MAX_GENERATIONS_PER_USER,
        canGenerate: true,
        resetDate: null
      };
    }
    
    // No reset - permanent limit
    const current = userLimit.count;
    const remaining = Math.max(0, MAX_GENERATIONS_PER_USER - current);
    
    return {
      current,
      max: MAX_GENERATIONS_PER_USER,
      remaining,
      canGenerate: remaining > 0,
      resetDate: null // No reset date since it's a permanent limit
    };
  } catch (error) {
    console.error('Error getting user limit info:', error);
    return {
      current: 0,
      max: MAX_GENERATIONS_PER_USER,
      remaining: MAX_GENERATIONS_PER_USER,
      canGenerate: true,
      resetDate: null
    };
  }
}

/**
 * Get all users' generation stats (for admin purposes)
 */
export function getAllUsersGenerationStats(): GenerationLimit[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const limitsData = localStorage.getItem(GENERATION_LIMIT_KEY);
    
    if (!limitsData) return [];
    
    const limits: GenerationLimit[] = JSON.parse(limitsData);
    
    // Return all limits (no expiration since it's permanent)
    return limits;
  } catch (error) {
    console.error('Error getting all users generation stats:', error);
    return [];
  }
}

/**
 * Clear all generation limits (for admin/testing purposes)
 */
export function clearAllGenerationLimits(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(GENERATION_LIMIT_KEY);
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('generationLimitUpdated', {
      detail: { 
        userId: 'all', 
        count: 0,
        remaining: MAX_GENERATIONS_PER_USER
      }
    }));
    
    return true;
  } catch (error) {
    console.error('Error clearing all generation limits:', error);
    return false;
  }
}

/**
 * Export generation limits data
 */
export function exportGenerationLimitsData(): string {
  const limits = getAllUsersGenerationStats();
  const session = getUserSession();
  
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    currentUserId: session.userId,
    limits: limits,
    maxGenerationsPerUser: MAX_GENERATIONS_PER_USER,
    limitType: 'permanent' // No reset - permanent limit
  }, null, 2);
}
