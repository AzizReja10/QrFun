import jsQR from 'jsqr'
import { moduleColor } from './qrUtils'

const PX = 8 // pixels per module: enough for the decoder to see detail
const QUIET = 4 // quiet zone in modules (the QR standard asks for 4)

export function checkScannable(matrix, text, theme, borderColor) {
  const size = matrix.length
  const total = (size + QUIET * 2) * PX
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = total
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  // the border is whatever sits behind the QR in the real scene
  ctx.fillStyle = borderColor
  ctx.fillRect(0, 0, total, total)

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      ctx.fillStyle = moduleColor(r, c, size, matrix[r][c], theme)
      ctx.fillRect((c + QUIET) * PX, (r + QUIET) * PX, PX, PX)
    }
  }

  const img = ctx.getImageData(0, 0, total, total)
  const result = jsQR(img.data, total, total, {
    inversionAttempts: 'dontInvert',
  })
  return !!result && result.data === text
}
