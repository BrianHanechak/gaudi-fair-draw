import { BagPanel } from '../components/BagPanel'
import { Brand } from '../components/Brand'
import { DrawLog } from '../components/DrawLog'
import { SupplyCard } from '../components/SupplyCard'
import {
  bagRemaining,
  canUndo,
  drawSize,
  type GameState,
} from '../lib/game'
import { tileCount } from '../lib/format'
import { MODE_LABEL, SET_SIZE } from '../lib/tiles'

interface GameScreenProps {
  state: GameState
  freshSlot: number | null
  onRefill: (slot: number) => void
  onUndo: () => void
  onNewGame: () => void
}

export function GameScreen({
  state,
  freshSlot,
  onRefill,
  onUndo,
  onNewGame,
}: GameScreenProps) {
  const remaining = bagRemaining(state)
  const size = SET_SIZE[state.mode]
  const lowBag = remaining > 0 && remaining < size * 3

  // Only the supply that received a refill should re-run its deal animation.
  // Using the whole log length as the key would remount every card.
  const refillCounts = state.log.reduce<number[]>(
    (counts, event) => {
      if (event.kind === 'refill') {
        counts[event.slot] = (counts[event.slot] ?? 0) + 1
      }
      return counts
    },
    Array.from({ length: state.supplies.length }, () => 0),
  )

  return (
    <div className="page">
      <header className="game-header">
        <div className="game-header__inner">
          <Brand compact />
          <div className="game-header__meta">
            <span className="chip">{MODE_LABEL[state.mode]}</span>
            <span className="chip">
              <span className="chip__dot" aria-hidden="true" />
              {remaining} in bag
            </span>
          </div>
          <div className="game-header__actions">
            <button
              type="button"
              className="button button--small"
              onClick={onUndo}
              disabled={!canUndo(state)}
            >
              Undo draw
            </button>
            <button
              type="button"
              className="button button--small"
              onClick={onNewGame}
            >
              New game
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="game-main">
        <div className="game-layout">
          <section className="supplies" aria-labelledby="supplies-title">
            <div className="section-head">
              <p className="eyebrow">
                {MODE_LABEL[state.mode]} · {drawSize(state.mode)} per refill
              </p>
              <h1 id="supplies-title">The five supplies</h1>
              <p className="section-head__hint">
                Tap <strong>Refill</strong> on the space that just emptied.
              </p>
            </div>

            {remaining === 0 ? (
              <p className="notice notice--strong">
                The bag is empty. No more supplies can be drawn this game.
              </p>
            ) : lowBag ? (
              <p className="notice">
                Only {tileCount(remaining)} left. The next draws give what the
                bag still holds.
              </p>
            ) : null}

            <div className="supply-grid">
              {state.supplies.map((tiles, slot) => (
                <SupplyCard
                  key={slot}
                  slot={slot}
                  tiles={tiles}
                  remaining={remaining}
                  size={size}
                  fresh={freshSlot === slot}
                  drawKey={refillCounts[slot] ?? 0}
                  onRefill={() => onRefill(slot)}
                />
              ))}
            </div>
          </section>

          <aside className="rail" aria-label="Bag and draw log">
            <BagPanel state={state} />
            <div className="rail__side">
              <DrawLog log={state.log} />
              <details className="panel help-panel">
                <summary>Table routine</summary>
                <ol>
                  <li>One player holds the app and the bag.</li>
                  <li>
                    When a supply space empties, tap <strong>Refill</strong> on
                    that space.
                  </li>
                  <li>
                    Take exactly the tiles the app names: shape and colour.
                    Place them on the board as usual.
                  </li>
                  <li>
                    If a click was a mistake, <strong>Undo draw</strong> puts
                    the tiles back and restores the previous set.
                  </li>
                  <li>
                    Changing standard/expert needs a new game, which reshuffles
                    all 96 tiles.
                  </li>
                  <li>
                    If several spaces are waiting near the end, refill them
                    left to right (1 → 5), as the rulebook says.
                  </li>
                </ol>
                <p className="fine-print">
                  Expert refills draw four tiles per space. All other expert
                  rules are unchanged. This app replaces the bag, not the game.
                  Supplies show the set that was dealt; the app does not track
                  which of those tiles have been picked up.
                </p>
              </details>
            </div>
          </aside>
        </div>

        <footer className="site-footer">
          <p>
            Saved automatically on this device: a refresh or a locked screen is
            safe.
          </p>
          <p>
            Unofficial fan-made companion. Not affiliated with Devir or the
            game's designers; no game artwork is used.
          </p>
        </footer>
      </main>
    </div>
  )
}
