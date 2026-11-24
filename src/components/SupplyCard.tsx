import type { CSSProperties } from 'react'
import { summariseTiles, tileCount } from '../lib/format'
import type { TileType } from '../lib/tiles'
import { Tile } from './Tile'

interface SupplyCardProps {
  slot: number
  tiles: readonly TileType[] | null
  remaining: number
  size: number
  fresh: boolean
  drawKey: number
  onRefill: () => void
}

export function SupplyCard({
  slot,
  tiles,
  remaining,
  size,
  fresh,
  drawKey,
  onRefill,
}: SupplyCardProps) {
  const number = slot + 1
  const hasTiles = Boolean(tiles && tiles.length > 0)
  const summary = tiles && tiles.length > 0 ? summariseTiles(tiles) : ''
  const shortOfFullSet = remaining > 0 && remaining < size
  const buttonLabel = remaining === 0 ? 'Bag empty' : shortOfFullSet ? `Draw ${remaining}` : 'Refill'

  return (
    <article
      className={fresh ? 'supply-card is-fresh' : 'supply-card'}
      aria-labelledby={`supply-title-${number}`}
    >
      <header className="supply-card__head">
        <h2
          id={`supply-title-${number}`}
          className="supply-card__heading"
          aria-label={`Supply ${number}`}
        >
          <span className="supply-card__eyebrow">Supply</span>
          <span className="supply-card__number">{number}</span>
        </h2>
        <button
          type="button"
          className="button button--small"
          onClick={onRefill}
          disabled={remaining === 0}
          aria-label={`Refill supply ${number}`}
        >
          <svg
            className="button__icon"
            viewBox="0 0 20 20"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M4 7.5A7 7 0 0 1 17 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M16 4.5V8h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 12.5A7 7 0 0 1 3 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M4 15.5V12h3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {buttonLabel}
        </button>
      </header>

      {hasTiles ? (
        <>
          <ul className="tile-row" key={drawKey} aria-hidden="true">
            {tiles?.map((tile, index) => (
              <li
                key={`${tile.shape}-${tile.colour}-${index}`}
                className="tile-row__item"
                style={{ '--i': String(index) } as CSSProperties}
              >
                <Tile tile={tile} decorative />
              </li>
            ))}
          </ul>
          <p className="tile-summary">{summary}</p>
        </>
      ) : (
        <p className="supply-card__empty">
          {remaining === 0 ? 'The bag is empty.' : 'Not dealt yet.'}
        </p>
      )}

      {hasTiles && shortOfFullSet ? (
        <p className="supply-card__warning">
          The bag holds only {tileCount(remaining)}.
        </p>
      ) : null}
    </article>
  )
}
