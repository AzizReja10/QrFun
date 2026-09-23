import QRCode from 'qrcode'

export const THEMES = {
  meadow: {
    label: 'Meadow',
    bg: '#f3efe4',
    light: '#f3efe4',
    qrHue: 285,
    finderHue: 105,
    waterHue: 205,
    grassHue: 108,
    sand: '#e6d7a3',
    snow: '#f4f6f8',
  },
  desert: {
    label: 'Desert',
    bg: '#f6ead8',
    light: '#f6ead8',
    qrHue: 18,
    finderHue: 35,
    waterHue: 185,
    grassHue: 70,
    sand: '#efd9a0',
    snow: '#fff4e0',
  },
  arctic: {
    label: 'Arctic',
    bg: '#eaf1f6',
    light: '#eaf1f6',
    qrHue: 215,
    finderHue: 190,
    waterHue: 210,
    grassHue: 170,
    sand: '#d9e6ee',
    snow: '#ffffff',
  },
  sunset: {
    label: 'Sunset',
    bg: '#fbece5',
    light: '#fbece5',
    qrHue: 335,
    finderHue: 15,
    waterHue: 245,
    grassHue: 25,
    sand: '#ffd4a3',
    snow: '#fff0f5',
  },
}

export const NIGHT_BG = '#0e1322'
export const sceneBg = (theme, night) => (night ? NIGHT_BG : theme.bg)

export function getMatrix(text) {
  if (!text) return null
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' })
  const size = qr.modules.size
  const rows = []
  for (let r = 0; r < size; r++) {
    const row = []
    for (let c = 0; c < size; c++) {
      row.push(qr.modules.get(r, c) ? 1 : 0)
    }
    rows.push(row)
  }
  return rows
}

export function jitter(r, c) {
  // deterministic "random" in [0, 1) based on position
  const n = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453
  return n - Math.floor(n)
}

function isFinder(r, c, size) {
  const top = r < 7
  const bottom = r >= size - 7
  const left = c < 7
  const right = c >= size - 7
  return (top && left) || (top && right) || (bottom && left)
}

export function moduleColor(r, c, size, on, theme) {
  if (!on) return theme.light
  const j = jitter(r, c)
  return isFinder(r, c, size)
    ? `hsl(${theme.finderHue}, 55%, ${24 + j * 8}%)`
    : `hsl(${theme.qrHue}, 45%, ${30 + j * 12}%)`
}


export const FLAT = 0.2
export const MAX_H = 10

export function heightAt(r, c, size, on) {
  if (!on) return FLAT // light modules stay flat
  const dx = c - size / 2 + 0.5
  const dz = r - size / 2 + 0.5
  const d = Math.sqrt(dx * dx + dz * dz) // distance from centre
  const cone = Math.max(0, 1 - d / (size / 2))
  return FLAT + cone * 12 * (0.6 + 0.4 * jitter(r, c))
}

export function buildTerrain(matrix) {
  const size = matrix.length
  let grid = matrix.map((row) => row.slice())

  // two passes of a 3x3 average blur
  for (let pass = 0; pass < 2; pass++) {
    const next = grid.map((row) => row.slice())
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let sum = 0
        let n = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr
            const cc = c + dc
            if (rr >= 0 && rr < size && cc >= 0 && cc < size) {
              sum += grid[rr][cc]
              n++
            }
          }
        }
        next[r][c] = sum / n
      }
    }
    grid = next
  }

  // add a little noise, then stretch values to fill 0..1
  let min = Infinity
  let max = -Infinity
  grid = grid.map((row, r) =>
    row.map((v, c) => {
      const x = v + (jitter(r, c) - 0.5) * 0.2
      min = Math.min(min, x)
      max = Math.max(max, x)
      return x
    }),
  )
  return grid.map((row) => row.map((v) => (v - min) / (max - min || 1)))
}

export function terrainHeight(t, sea) {
  return FLAT + Math.max(t, sea) * MAX_H // water sits flat at sea level
}

export function terrainColor(t, sea, j, theme) {
  if (t < sea) {
    const depth = (sea - t) / Math.max(sea, 0.001)
    return `hsl(${theme.waterHue}, 70%, ${58 - depth * 28}%)`
  }
  const a = (t - sea) / Math.max(1 - sea, 0.001)
  if (a < 0.08) return theme.sand
  if (a < 0.5) return `hsl(${theme.grassHue}, 45%, ${30 + j * 8}%)`
  if (a < 0.8) return `hsl(30, 14%, ${38 + j * 10}%)`
  return theme.snow
}
