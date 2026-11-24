import { useEffect, useState } from 'react'
import { ConfirmDialog } from './components/ConfirmDialog'
import { TileDefs } from './components/TileDefs'
import { GameScreen } from './screens/GameScreen'
import { SetupScreen } from './screens/SetupScreen'
import { summariseTiles, tileCount } from './lib/format'
import {
  bagRemaining,
  refillSupply,
  startGame,
  undoLast,
  type GameState,
} from './lib/game'
import { loadGame, saveGame } from './lib/storage'
import type { Mode } from './lib/tiles'

function App() {
  const [game, setGame] = useState<GameState | null>(() => loadGame())
  const [mode, setMode] = useState<Mode>(() => game?.mode ?? 'standard')
  const [freshSlot, setFreshSlot] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [confirmNewGame, setConfirmNewGame] = useState(false)

  useEffect(() => {
    saveGame(game)
  }, [game])

  useEffect(() => {
    if (freshSlot === null) return
    const timer = window.setTimeout(() => setFreshSlot(null), 2200)
    return () => window.clearTimeout(timer)
  }, [freshSlot])

  const view = game ? `game-${game.startedAt}` : 'setup'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  function handleStart() {
    const next = startGame(mode)
    setGame(next)
    setFreshSlot(null)
    setAnnouncement(
      `Five supplies dealt. ${tileCount(bagRemaining(next))} left in the bag.`,
    )
  }

  function handleRefill(slot: number) {
    if (!game) return
    const next = refillSupply(game, slot)
    if (next === game) {
      setAnnouncement('The bag is empty. No tiles can be drawn.')
      return
    }
    setGame(next)
    setFreshSlot(slot)
    setAnnouncement(
      `Supply ${slot + 1}: ${summariseTiles(next.supplies[slot] ?? [])}. ${tileCount(bagRemaining(next))} left in the bag.`,
    )
  }

  function handleUndo() {
    if (!game) return
    const next = undoLast(game)
    if (next === game) return
    setGame(next)
    setFreshSlot(null)
    setAnnouncement('Last draw undone. The tiles are back in the bag.')
  }

  function handleNewGame() {
    setConfirmNewGame(false)
    setGame(null)
    setFreshSlot(null)
    setAnnouncement('Ready for a new game. Choose a mode.')
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <TileDefs />
      {game ? (
        <GameScreen
          state={game}
          freshSlot={freshSlot}
          onRefill={handleRefill}
          onUndo={handleUndo}
          onNewGame={() => setConfirmNewGame(true)}
        />
      ) : (
        <SetupScreen mode={mode} onModeChange={setMode} onStart={handleStart} />
      )}
      <ConfirmDialog
        open={confirmNewGame}
        title="Start a new game?"
        confirmLabel="Start a new game"
        onConfirm={handleNewGame}
        onClose={() => setConfirmNewGame(false)}
      >
        <p>
          This clears the bag, the five supplies and the draw log on this
          device. The next game reshuffles all 96 tiles.
        </p>
      </ConfirmDialog>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </>
  )
}

export default App
