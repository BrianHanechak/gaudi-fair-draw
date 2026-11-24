import type { CSSProperties } from 'react'
import { Brand } from '../components/Brand'
import { Tile } from '../components/Tile'
import {
  MODES,
  MODE_LABEL,
  MODE_NOTE,
  SET_SIZE,
  SUPPLY_COUNT,
  TOTAL_TILES,
  type Mode,
  type TileType,
} from '../lib/tiles'

interface SetupScreenProps {
  mode: Mode
  onModeChange: (mode: Mode) => void
  onStart: () => void
}

const PREVIEW_TILES: readonly TileType[] = [
  { shape: 'shard', colour: 'blue' },
  { shape: 'square', colour: 'green' },
  { shape: 'pentagon', colour: 'amber' },
  { shape: 'triangle', colour: 'sky' },
  { shape: 'square', colour: 'blue' },
]

const MODE_DESCRIPTION: Record<Mode, string> = {
  standard: 'The base game. Five tiles in each of the five supplies at setup.',
  expert: 'Tighter supplies. Four tiles per space, at setup and on every refill.',
}

export function SetupScreen({ mode, onModeChange, onStart }: SetupScreenProps) {
  return (
    <div className="page">
      <header className="site-header">
        <Brand />
        <span className="site-header__tag">Unofficial table companion</span>
      </header>

      <main id="main" className="setup">
        <div className="intro">
          <section className="hero">
            <p className="eyebrow">Gaudí · trencadís draw</p>
            <h1>A fair bag for Gaudí.</h1>
            <p className="lede">
              The real bag is not a neutral draw: bigger trencadís pieces are
              easier to grab, so supplies skew toward them. This app shuffles
              all {TOTAL_TILES} pieces uniformly and names every tile to take —
              the draw the bag should have given you.
            </p>
          </section>

          <section
            className="benefits-section"
            aria-label="Why the draw is fair"
          >
            <ul className="benefits">
              <li>
                <strong>Mathematically uniform.</strong> Every remaining tile is
                equally likely, with six copies of each of the sixteen shapes and
                colours.
              </li>
              <li>
                <strong>Names shape and colour.</strong> One player fishes the
                tiles out; the table gets an exact, visible set every time.
              </li>
              <li>
                <strong>Keeps the bag honest.</strong> Five supplies, refills,
                undo and a resume-proof draw log — all on this device.
              </li>
            </ul>
          </section>
        </div>

        <section className="panel setup-panel" aria-labelledby="mode-title">
          <h2 id="mode-title">Choose a mode</h2>
          <div
            className="mode-grid"
            role="radiogroup"
            aria-labelledby="mode-title"
          >
            {MODES.map((option) => {
              const selected = option === mode
              return (
                <label
                  key={option}
                  className={
                    selected ? 'mode-card is-selected' : 'mode-card'
                  }
                >
                  <input
                    className="mode-card__input"
                    type="radio"
                    name="mode"
                    value={option}
                    checked={selected}
                    onChange={() => onModeChange(option)}
                  />
                  <span className="mode-card__top">
                    <span className="mode-card__name">
                      {MODE_LABEL[option]}
                    </span>
                    <span className="mode-card__size">
                      {MODE_NOTE[option]}
                    </span>
                  </span>
                  <span className="mode-card__desc">
                    {MODE_DESCRIPTION[option]}
                  </span>
                  <span className="mode-card__tiles" aria-hidden="true">
                    {PREVIEW_TILES.slice(0, SET_SIZE[option]).map(
                      (tile, index) => (
                        <span
                          key={`${tile.shape}-${tile.colour}`}
                          className="mode-card__tile"
                          style={{ '--i': String(index) } as CSSProperties}
                        >
                          <Tile tile={tile} decorative />
                        </span>
                      ),
                    )}
                  </span>
                </label>
              )
            })}
          </div>

          <button
            type="button"
            className="button button--primary button--wide button--large"
            onClick={onStart}
          >
            Deal the five supplies
          </button>
          <p className="fine-print">
            {SUPPLY_COUNT} supplies · {SUPPLY_COUNT * SET_SIZE[mode]} tiles
            dealt at setup · the bag starts with {TOTAL_TILES}.
          </p>
        </section>

        <section className="how" aria-labelledby="how-title">
          <h2 id="how-title">How it works at the table</h2>
          <ol className="steps">
            <li>
              <span className="steps__number">1</span>
              <span>
                <strong>Pick a mode, deal the five supplies.</strong> Put the
                app where everyone can see it.
              </span>
            </li>
            <li>
              <span className="steps__number">2</span>
              <span>
                <strong>Pull exactly the named tiles.</strong> One player holds
                the bag and fishes out the five (or four) pieces.
              </span>
            </li>
            <li>
              <span className="steps__number">3</span>
              <span>
                <strong>Refill a space when it empties.</strong> Tap{' '}
                <em>Refill</em> on that supply; the app draws the next set and
                updates the bag.
              </span>
            </li>
            <li>
              <span className="steps__number">4</span>
              <span>
                <strong>Undo covers slips, not turns.</strong> Use it if a draw
                was tapped by mistake; start a new game to reshuffle all{' '}
                {TOTAL_TILES}.
              </span>
            </li>
          </ol>
        </section>

        <footer className="site-footer">
          <p>
            Install it from your browser's menu to keep it on the table offline
            — nothing leaves this device.
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
