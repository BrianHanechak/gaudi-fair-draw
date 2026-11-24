import type { CSSProperties } from 'react'
import {
  bagRemaining,
  remainingCounts,
  type GameState,
} from '../lib/game'
import {
  COLOURS,
  COLOUR_IDS,
  SHAPES,
  SHAPE_IDS,
  TOTAL_TILES,
  tileKey,
} from '../lib/tiles'

interface BagPanelProps {
  state: GameState
}

export function BagPanel({ state }: BagPanelProps) {
  const counts = remainingCounts(state)
  const remaining = bagRemaining(state)
  const percent = (remaining / TOTAL_TILES) * 100

  return (
    <section className="panel bag-panel" aria-labelledby="bag-title">
      <div className="panel__head">
        <h2 id="bag-title">In the bag</h2>
        <span className="bag-panel__count">
          {remaining}
          <span className="bag-panel__total"> / {TOTAL_TILES}</span>
        </span>
      </div>

      <div
        className="bag-bar"
        role="img"
        aria-label={`${remaining} of ${TOTAL_TILES} tiles left in the bag`}
      >
        <span style={{ width: `${percent}%` }} />
      </div>

      <table className="bag-table">
        <caption className="sr-only">
          Tiles left in the bag, by shape and colour
        </caption>
        <thead>
          <tr>
            <td />
            {COLOUR_IDS.map((colour) => (
              <th key={colour} scope="col">
                <span
                  className="bag-swatch"
                  style={{ background: COLOURS[colour].hex }}
                  aria-hidden="true"
                />
                {COLOURS[colour].shortName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SHAPE_IDS.map((shape) => (
            <tr key={shape}>
              <th scope="row">{SHAPES[shape].name}</th>
              {COLOUR_IDS.map((colour) => {
                const count = counts.get(tileKey({ shape, colour })) ?? 0
                return (
                  <td
                    key={colour}
                    className={count === 0 ? 'is-zero' : undefined}
                    style={
                      { '--cell': COLOURS[colour].hex } as CSSProperties
                    }
                  >
                    {count}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="fine-print">
        Exact counts: 96 tiles minus everything already dealt. No hidden
        information.
      </p>
    </section>
  )
}
