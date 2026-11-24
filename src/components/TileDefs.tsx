import { COLOUR_IDS, COLOURS } from '../lib/tiles'

/** Gradients shared by every tile drawing. Rendered once. */
export function TileDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: 'absolute' }}
    >
      <defs>
        {COLOUR_IDS.map((colour) => {
          const info = COLOURS[colour]
          return (
            <linearGradient
              key={colour}
              id={`tile-${colour}`}
              x1="0"
              y1="0"
              x2="0.25"
              y2="1"
            >
              <stop offset="0%" stopColor={info.light} />
              <stop offset="55%" stopColor={info.hex} />
              <stop offset="100%" stopColor={info.dark} />
            </linearGradient>
          )
        })}
      </defs>
    </svg>
  )
}
