function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function getLuminance(color: { r: number; g: number; b: number }): number {
  const { r, g, b } = color
  const [R, G, B] = [r, g, b].map((c) => {
    const val = c / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(hexToRgb(color1))
  const lum2 = getLuminance(hexToRgb(color2))
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex)
  const r1 = r / 255
  const g1 = g / 255
  const b1 = b / 255

  const max = Math.max(r1, g1, b1)
  const min = Math.min(r1, g1, b1)
  let h = 0,
    s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r1:
        h = (g1 - b1) / d + (g1 < b1 ? 6 : 0)
        break
      case g1:
        h = (b1 - r1) / d + 2
        break
      case b1:
        h = (r1 - g1) / d + 4
        break
    }

    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255))
}

function getAccessibleColor(
  backgroundColor: string,
  baseColor: string,
  minContrast: number = 4.5
): string {
  let contrast = getContrastRatio(backgroundColor, baseColor)

  if (contrast >= minContrast) {
    return baseColor
  }

  const colorHsl = hexToHsl(baseColor)
  const bgLuminance = getLuminance(hexToRgb(backgroundColor))
  const needLighter = bgLuminance < 0.5

  let adjustedL = colorHsl.l
  const step = needLighter ? 5 : -5
  let maxIterations = 20

  while (contrast < minContrast && maxIterations > 0) {
    adjustedL = Math.max(0, Math.min(100, adjustedL + step))
    const adjustedColor = hslToHex(colorHsl.h, colorHsl.s, adjustedL)
    contrast = getContrastRatio(backgroundColor, adjustedColor)
    maxIterations--

    // If we've reached the limit of lightness/darkness and still don't have enough contrast
    if ((needLighter && adjustedL >= 95) || (!needLighter && adjustedL <= 5)) {
      // Try adjusting saturation as a last resort
      const adjustedS = Math.max(0, Math.min(100, colorHsl.s - 10))
      const satAdjustedColor = hslToHex(colorHsl.h, adjustedS, adjustedL)
      const satContrast = getContrastRatio(backgroundColor, satAdjustedColor)

      if (satContrast > contrast) {
        return satAdjustedColor
      }
      break
    }
  }

  return hslToHex(colorHsl.h, colorHsl.s, adjustedL)
}

export {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  getLuminance,
  getContrastRatio,
  getAccessibleColor,
}
