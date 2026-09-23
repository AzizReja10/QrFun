import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { getMatrix, THEMES, sceneBg } from './qrUtils'
import { checkScannable } from './scanCheck'
import QRScene from './QRScene'
import Header from './components/Header'
import StudioControls from './components/StudioControls'
import './App.css'

function useDebounced(value, ms) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}

export default function App() {
  const [url, setUrl] = useState('https://icqr.com/')
  const [expanded, setExpanded] = useState(false)
  const [sea, setSea] = useState(0.35)
  const [themeKey, setThemeKey] = useState('meadow')
  const [align2DTrigger, setAlign2DTrigger] = useState(0)
  const theme = THEMES[themeKey] || THEMES.meadow

  const handleAlign2D = () => {
    setExpanded(false)
    setAlign2DTrigger((c) => c + 1)
  }

  const debouncedUrl = useDebounced(url, 350)
  const matrix = useMemo(() => getMatrix(debouncedUrl.trim()), [debouncedUrl])
  const matrixSize = matrix ? matrix.length : 29

  const scannable = useMemo(
    () =>
      matrix
        ? checkScannable(
            matrix,
            debouncedUrl.trim(),
            theme,
            sceneBg(theme),
          )
        : null,
    [matrix, debouncedUrl, theme],
  )

  useEffect(() => {
    document.body.style.background = sceneBg(theme)
    document.body.style.color = '#111'
  }, [theme])

  const handleExport = () => {
    const canvas =
      document.querySelector('.stage canvas') || document.querySelector('canvas')
    if (!canvas) return

    const out = document.createElement('canvas')
    out.width = canvas.width
    out.height = canvas.height
    const ctx = out.getContext('2d')
    ctx.fillStyle = theme?.bg || '#f3efe4'
    ctx.fillRect(0, 0, out.width, out.height)
    ctx.drawImage(canvas, 0, 0)

    const a = document.createElement('a')
    a.download = 'qr-terrain.png'
    a.href = out.toDataURL('image/png')
    a.click()
  }

  return (
    <div className="app-root">
      {/* Background Ambience / Mesh Glow */}
      <div className="ambient-radial" />
      <div className="ambient-grid-overlay" />

      {/* Top Studio Navbar */}
      <Header scannable={scannable} />

      {/* Main Studio Viewport */}
      <div className="main-viewport">
        <motion.div
          className="studio-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <main className="stage">
            {matrix && (
              <QRScene
                matrix={matrix}
                expanded={expanded}
                sea={sea}
                theme={theme}
                onToggle={() => setExpanded((v) => !v)}
                align2DTrigger={align2DTrigger}
              />
            )}
          </main>

          <StudioControls
            url={url}
            setUrl={setUrl}
            expanded={expanded}
            setExpanded={setExpanded}
            sea={sea}
            setSea={setSea}
            themeKey={themeKey}
            setThemeKey={setThemeKey}
            exportPng={handleExport}
            matrixSize={matrixSize}
            onAlign2D={handleAlign2D}
          />
        </motion.div>
      </div>
    </div>
  )
}