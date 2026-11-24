import { SHAPES, tileName, type TileType } from '../lib/tiles'

interface TileProps {
  tile: TileType
  decorative?: boolean
  className?: string
}

export function Tile({ tile, decorative = false, className }: TileProps) {
  const shape = SHAPES[tile.shape]
  const label = tileName(tile)
  const a11y = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': label } as const)

  return (
    <span className={className ? `tile ${className}` : 'tile'}>
      <svg viewBox="0 0 100 100" className="tile__svg" {...a11y}>
        <path
          d={shape.path}
          fill={`url(#tile-${tile.colour})`}
          stroke="rgba(35, 27, 16, 0.42)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <path
          d={shape.path}
          fill="none"
          stroke="rgba(255, 255, 255, 0.42)"
          strokeWidth={2}
          strokeLinejoin="round"
          transform="translate(50 50) scale(0.8) translate(-50 -50)"
        />
      </svg>
    </span>
  )
}
