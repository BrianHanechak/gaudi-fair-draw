interface BrandProps {
  compact?: boolean
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className={compact ? 'brand brand--compact' : 'brand'}>
      <svg
        className="brand__mark"
        viewBox="0 0 48 48"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="1" y="1" width="46" height="46" rx="12" fill="#1d3f6b" />
        <path d="M13 16 L22 11 L27 25 L17 29 Z" fill="#b8b9b2" />
        <path d="M26 12 H36 V23 H26 Z" fill="#efc23f" />
        <path d="M12 27 H23 L17.5 37 Z" fill="#4da96a" />
        <path d="M27 26 L37 29 L33 38 L26 35 Z" fill="#efe2cb" />
      </svg>
      <span className="brand__text">
        <span className="brand__name">Gaudí</span>
        <span className="brand__sub">Fair Draw</span>
      </span>
    </div>
  )
}
