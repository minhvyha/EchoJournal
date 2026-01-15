// utils/moodColor.ts
export type Mood = { label: string; score: number }

const MOOD_HSL: Record<string, { h: number; s: number; l: number }> = {
  desire: { h: 330, s: 70, l: 55 },
  love: { h: 345, s: 75, l: 58 },
  joy: { h: 48, s: 85, l: 55 },
  optimism: { h: 50, s: 90, l: 55 },
  excitement: { h: 18, s: 85, l: 55 },
  curiosity: { h: 260, s: 60, l: 55 },
  neutral: { h: 210, s: 8, l: 60 },
  sadness: { h: 220, s: 30, l: 42 },
  anger: { h: 10, s: 75, l: 45 },
  fear: { h: 260, s: 30, l: 40 },
  caring: { h: 160, s: 55, l: 50 },
  gratitude: { h: 160, s: 65, l: 55 },
  surprise: { h: 200, s: 70, l: 60 },
  approval: { h: 140, s: 50, l: 50 },
  annoyance: { h: 25, s: 40, l: 45 },
  // add more moods as needed
}

function getBaseHSL(label: string) {
  return MOOD_HSL[label] ?? { h: 210, s: 8, l: 60 }
}

// circular average of hues and weighted average of saturation and lightness
export function blendMoodsToHSL(moods: Mood[]) {
  const top = moods.slice(0, 3)
  const sumW = top.reduce((s, m) => s + m.score, 0) || 1

  let x = 0
  let y = 0
  let sAcc = 0
  let lAcc = 0

  for (const m of top) {
    const w = m.score / sumW
    const { h, s, l } = getBaseHSL(m.label)
    const rad = (h * Math.PI) / 180
    x += Math.cos(rad) * w
    y += Math.sin(rad) * w
    sAcc += s * w
    lAcc += l * w
  }

  let hue = (Math.atan2(y, x) * 180) / Math.PI
  if (isNaN(hue)) hue = 210
  if (hue < 0) hue += 360

  const sat = Math.max(8, Math.min(95, Math.round(sAcc)))
  const light = Math.max(6, Math.min(92, Math.round(lAcc)))

  return { h: Math.round(hue), s: sat, l: light }
}

export function hslToString(h: number, s: number, l: number) {
  // use CSS modern space-separated HSL for improved browser parsing
  return `hsl(${h} ${s}% ${l}%)`
}

// Build a gradient using the top-3 colors and scores. Returns either a solid hsl string or a linear-gradient.
export function moodsToGradient(moods: Mood[], direction = "to right") {
  const top = moods.slice(0, 3)
  if (top.length === 0) return hslToString(210, 8, 60)

  if (top.length === 1) {
    const { h, s, l } = getBaseHSL(top[0].label)
    return hslToString(h, s, l)
  }

  const sumW = top.reduce((s, m) => s + m.score, 0) || 1
  let accum = 0
  const stops: string[] = []

  for (const m of top) {
    const w = m.score / sumW
    const { h, s, l } = getBaseHSL(m.label)
    const color = hslToString(h, s, l)
    const start = Math.round(accum * 100)
    accum += w
    const end = Math.round(accum * 100)
    // two stops per color create a tighter band for each mood
    stops.push(`${color} ${start}%`)
    stops.push(`${color} ${end}%`)
  }

  return `linear-gradient(${direction}, ${stops.join(", ")})`
}

/* helpers for accessibility */

// convert HSL to RGB (values 0..255)
export function hslToRgb(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const r = Math.round(255 * f(0))
  const g = Math.round(255 * f(8))
  const b = Math.round(255 * f(4))
  return { r, g, b }
}

// relative luminance for RGB 0..255
export function getLuminance(r: number, g: number, b: number) {
  const srgb = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

// pick text color (black or white) based on background HSL
export function pickTextColorFromHSL(h: number, s: number, l: number) {
  const { r, g, b } = hslToRgb(h, s, l)
  const luminance = getLuminance(r, g, b)
  // WCAG contrast approximate threshold; return black for light backgrounds, white for dark
  return luminance > 0.25 ? "black" : "white"
}
