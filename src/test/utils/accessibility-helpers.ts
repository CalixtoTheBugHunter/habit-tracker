import { vi } from 'vitest'
import { getContrastRatio } from '../../utils/accessibility/contrastRatio'

/**
 * Mocks window.getComputedStyle for testing contrast ratios.
 * 
 * This helper function sets up a mock for getComputedStyle that returns
 * specific color values for elements matching the given className or predicate.
 * 
 * @param matcher - CSS class name (string) or function that returns true if the element should be mocked
 * @param color - Text color value (e.g., "rgb(0, 0, 0)")
 * @param backgroundColor - Background color value (e.g., "rgb(25, 118, 210)")
 * @returns Cleanup function to restore the original getComputedStyle
 * 
 * @example
 * ```typescript
 * // Using a class name
 * const cleanup = mockComputedStyleForElement(
 *   'habit-form-button-primary',
 *   'rgb(0, 0, 0)',
 *   'rgb(25, 118, 210)'
 * )
 * 
 * // Using a predicate function
 * const cleanup2 = mockComputedStyleForElement(
 *   (el) => el.classList.contains('completion-toggle') && el.classList.contains('completed'),
 *   'rgb(0, 0, 0)',
 *   'rgb(25, 118, 210)'
 * )
 * 
 * // ... test code ...
 * 
 * cleanup() // Restore original
 * ```
 */
export function mockComputedStyleForElement(
  matcher: string | ((element: Element) => boolean),
  color: string,
  backgroundColor: string
): () => void {
  const original = window.getComputedStyle
  const matches = typeof matcher === 'string' 
    ? (element: Element) => element.classList.contains(matcher)
    : matcher
  
  window.getComputedStyle = vi.fn((element: Element) => {
    const style = original(element)
    if (matches(element)) {
      return {
        ...style,
        color,
        backgroundColor,
        getPropertyValue: (prop: string) => {
          if (prop === 'color') return color
          if (prop === 'background-color') return backgroundColor
          return style.getPropertyValue(prop)
        },
      } as CSSStyleDeclaration
    }
    return style
  }) as typeof window.getComputedStyle
  
  return () => { window.getComputedStyle = original }
}

/**
 * Converts RGB/RGBA color string to hex format
 * @param color - RGB/RGBA color string (e.g., "rgb(0, 0, 0)" or "rgba(255, 255, 255, 1)")
 * @returns Hex color string (e.g., "#000000")
 */
function rgbToHex(color: string): string {
  const rgbMatch = color.match(/\d+/g)
  if (!rgbMatch || rgbMatch.length < 3) {
    return '#000000'
  }
  
  const r = parseInt(rgbMatch[0]!, 10)
  const g = parseInt(rgbMatch[1]!, 10)
  const b = parseInt(rgbMatch[2]!, 10)
  
  const toHex = (value: number): string => {
    const hex = value.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Gets the computed color value for an element
 * @param element - HTML element
 * @param property - CSS property to get ('color' or 'background-color')
 * @returns Hex color string
 */
export function getComputedColor(
  element: HTMLElement,
  property: 'color' | 'background-color'
): string {
  const computedStyle = window.getComputedStyle(element)
  const colorValue = computedStyle.getPropertyValue(property) || computedStyle[property as keyof CSSStyleDeclaration]
  
  if (typeof colorValue !== 'string') {
    return '#000000'
  }
  
  if (colorValue.startsWith('#')) {
    return colorValue
  }
  
  if (colorValue.startsWith('rgb')) {
    return rgbToHex(colorValue)
  }
  
  return '#000000'
}

/**
 * Gets the contrast ratio between text and background for a button element
 * @param button - Button HTML element
 * @returns Contrast ratio (1:1 to 21:1)
 */
export function getButtonContrastRatio(button: HTMLElement): number {
  const textColor = getComputedColor(button, 'color')
  const backgroundColor = getComputedColor(button, 'background-color')
  
  return getContrastRatio(textColor, backgroundColor)
}

/**
 * Verifies that a button meets the minimum contrast ratio requirement
 * @param button - Button HTML element
 * @param minRatio - Minimum contrast ratio (default 4.5 for WCAG AA)
 * @returns True if contrast ratio meets or exceeds minimum
 */
export function verifyButtonContrast(button: HTMLElement, minRatio: number = 4.5): boolean {
  const contrastRatio = getButtonContrastRatio(button)
  return contrastRatio >= minRatio
}


