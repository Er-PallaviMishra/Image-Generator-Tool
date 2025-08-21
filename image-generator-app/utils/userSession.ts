/**
 * User Session Management for Image Gallery
 * Provides unique user identification without authentication
 */

export interface UserSession {
  userId: string;
  createdAt: string;
  lastActive: string;
  browserFingerprint: string;
}

/**
 * Generate a unique browser fingerprint based on various browser characteristics
 */
export function generateBrowserFingerprint(): string {
  if (typeof window === 'undefined') return 'server-side';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Canvas fingerprint
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Browser fingerprint text 🎨', 2, 2);
  const canvasFingerprint = canvas.toDataURL();
  
  // Collect browser characteristics
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasFingerprint.slice(-50), // Last 50 chars of canvas fingerprint
    webgl: getWebGLFingerprint(),
    fonts: getFontFingerprint(),
    plugins: Array.from(navigator.plugins).map(p => p.name).join(',').slice(0, 100),
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || 0,
    timestamp: Date.now()
  };
  
  // Create hash from fingerprint data
  return hashString(JSON.stringify(fingerprint));
}

/**
 * Get WebGL fingerprint
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")) as
        | WebGLRenderingContext
        | null;

    if (!gl) return "no-webgl";

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : "";
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : "";

    return `${vendor}-${renderer}`.slice(0, 50);
  } catch (e) {
    return "webgl-error";
  }
}

/**
 * Get available fonts fingerprint
 */
function getFontFingerprint(): string {
  const testFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
    'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
    'Trebuchet MS', 'Arial Black', 'Impact'
  ];
  
  const available = testFonts.filter(font => {
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const baseline = document.createElement('span');
    baseline.style.fontSize = testSize;
    baseline.style.fontFamily = 'monospace';
    baseline.textContent = testString;
    document.body.appendChild(baseline);
    const baselineWidth = baseline.offsetWidth;
    baseline.remove();
    
    const test = document.createElement('span');
    test.style.fontSize = testSize;
    test.style.fontFamily = `${font}, monospace`;
    test.textContent = testString;
    document.body.appendChild(test);
    const testWidth = test.offsetWidth;
    test.remove();
    
    return testWidth !== baselineWidth;
  });
  
  return available.join(',');
}

/**
 * Simple hash function for fingerprint data
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Get or create user session
 */
export function getUserSession(): UserSession {
  if (typeof window === 'undefined') {
    return {
      userId: 'server-user',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      browserFingerprint: 'server-side'
    };
  }

  const sessionKey = 'ai-gallery-user-session';
  const existingSession = localStorage.getItem(sessionKey);
  
  if (existingSession) {
    try {
      const session: UserSession = JSON.parse(existingSession);
      
      // Update last active timestamp
      session.lastActive = new Date().toISOString();
      localStorage.setItem(sessionKey, JSON.stringify(session));
      
      return session;
    } catch (error) {
      console.warn('Failed to parse existing session, creating new one');
    }
  }
  
  // Create new session
  const browserFingerprint = generateBrowserFingerprint();
  const now = new Date().toISOString();
  
  const newSession: UserSession = {
    userId: `user_${browserFingerprint}_${Date.now()}`,
    createdAt: now,
    lastActive: now,
    browserFingerprint
  };
  
  localStorage.setItem(sessionKey, JSON.stringify(newSession));
  return newSession;
}

/**
 * Clear user session (for testing/reset purposes)
 */
export function clearUserSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ai-gallery-user-session');
  }
}
