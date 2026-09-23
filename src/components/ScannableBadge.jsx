import { CheckCircle2, AlertTriangle } from 'lucide-react'

export default function ScannableBadge({ scannable }) {
  if (scannable === null) return null

  return (
    <div className={`scan-badge ${scannable ? 'is-valid' : 'is-warning'}`}>
      <span className="beacon">
        <span className="beacon-ping" />
        <span className="beacon-dot" />
      </span>
      {scannable ? (
        <>
          <CheckCircle2 size={14} className="badge-icon" />
          <span>Verified Scannable</span>
        </>
      ) : (
        <>
          <AlertTriangle size={14} className="badge-icon" />
          <span>Contrast Warning</span>
        </>
      )}
    </div>
  )
}
