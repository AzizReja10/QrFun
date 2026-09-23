import { useEffect, useMemo, useState } from 'react'
import { getMatrix, THEMES, sceneBg } from './qrUtils'
import { checkScannable } from './scanCheck'
import QRScene from './QRScene'
import './App.css'

function useDebounced(value, ms) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}

function exportPng() {
  const canvas = document.querySelector('.scene canvas')
  if (!canvas) return
  const a = document.createElement('a')
  a.download = 'qr-terrain.png'
  a.href = canvas.toDataURL('image/png')
  a.click()
}

export default function App() {
  const [url, setUrl] = useState('https://icqr.com/')
  const [expanded, setExpanded] = useState(false)
  const [sea, setSea] = useState(0.35)
  const [themeKey, setThemeKey] = useState('meadow')
  const [night, setNight] = useState(false)
  const theme = THEMES[themeKey]

  const debouncedUrl = useDebounced(url, 350)
  const matrix = useMemo(() => getMatrix(debouncedUrl.trim()), [debouncedUrl])

  const scannable = useMemo(
    () =>
      matrix
        ? checkScannable(
            matrix,
            debouncedUrl.trim(),
            theme,
            sceneBg(theme, night),
          )
        : null,
    [matrix, debouncedUrl, theme, night],
  )

  useEffect(() => {
    document.body.style.background = sceneBg(theme, night)
    document.body.style.color = night ? '#e6e9f5' : '#111'
  }, [theme, night])

  return (
    <main>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a URL"
      />
      <p>
        Tap the code to {expanded ? 'return to the QR' : 'reveal the island'}
      </p>
      <div className="controls">
        <label>
          Sea level
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.01"
            value={sea}
            onChange={(e) => setSea(Number(e.target.value))}
          />
        </label>
        <select value={themeKey} onChange={(e) => setThemeKey(e.target.value)}>
          {Object.entries(THEMES).map(([key, t]) => (
            <option key={key} value={key}>
              {t.label}
            </option>
          ))}
        </select>
        <button onClick={() => setNight((n) => !n)}>
          {night ? 'Day' : 'Night'}
        </button>
        <button onClick={exportPng}>Save PNG</button>
      </div>
      {scannable !== null && (
        <p className={`badge ${scannable ? 'ok' : 'bad'}`}>
          {scannable ? '✓ QR scans' : '⚠ QR may not scan'}
        </p>
      )}
      {matrix && (
        <div className="scene">
          <QRScene
            matrix={matrix}
            expanded={expanded}
            sea={sea}
            theme={theme}
            night={night}
            onToggle={() => setExpanded((v) => !v)}
          />
        </div>
      )}
    </main>
  )
}