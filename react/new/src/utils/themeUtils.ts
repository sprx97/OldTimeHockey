export function generateColorShades(
  baseColor: string
): [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
] {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  const adjustBrightness = (color: string, factor: number) => {
    const rgb = hexToRgb(color)
    const r = Math.round(Math.min(255, Math.max(0, rgb.r * factor)))
    const g = Math.round(Math.min(255, Math.max(0, rgb.g * factor)))
    const b = Math.round(Math.min(255, Math.max(0, rgb.b * factor)))
    return rgbToHex(r, g, b)
  }

  return [
    adjustBrightness(baseColor, 1.8),
    adjustBrightness(baseColor, 1.6),
    adjustBrightness(baseColor, 1.4),
    adjustBrightness(baseColor, 1.2),
    adjustBrightness(baseColor, 1.1),
    baseColor,
    adjustBrightness(baseColor, 0.9),
    adjustBrightness(baseColor, 0.8),
    adjustBrightness(baseColor, 0.7),
    adjustBrightness(baseColor, 0.6),
  ]
}
