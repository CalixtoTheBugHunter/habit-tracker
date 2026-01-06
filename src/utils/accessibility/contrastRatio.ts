/**
 * Converts a hex color string to RGB values
 * @param hex - Hex color string (with or without #)
 * @returns RGB object or null if invalid
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '')
  
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0]! + cleaned[0]!, 16)
    const g = parseInt(cleaned[1]! + cleaned[1]!, 16)
    const b = parseInt(cleaned[2]! + cleaned[2]!, 16)
    return { r, g, b }
  }
  
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.substring(0, 2), 16)
    const g = parseInt(cleaned.substring(2, 4), 16)
    const b = parseInt(cleaned.substring(4, 6), 16)
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null
    }
    
    return { r, g, b }
  }
  
  return null
}

/**
 * Calculates the relative luminance of an RGB color (WCAG 2.1 formula)
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Relative luminance (0-1)
 */
export function getLuminance(r: number, g: number, b: number): number {
  const normalize = (value: number): number => {
    const normalized = value / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  }
  
  const rNorm = normalize(r)
  const gNorm = normalize(g)
  const bNorm = normalize(b)
  
  return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm
}

/**
 * Calculates the contrast ratio between two colors (WCAG 2.1 formula)
 * @param color1 - First color (hex string)
 * @param color2 - Second color (hex string)
 * @returns Contrast ratio (1:1 to 21:1)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) {
    return 1
  }
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Checks if a contrast ratio meets WCAG AA standards
 * @param contrastRatio - The contrast ratio to check
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns True if meets WCAG AA standards
 */
export function meetsWCAGAA(contrastRatio: number, isLargeText: boolean = false): boolean {
  if (isLargeText) {
    return contrastRatio >= 3
  }
  return contrastRatio >= 4.5
}


