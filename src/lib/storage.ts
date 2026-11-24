import type { GameState } from './game'
import { isGameState } from './game'

const STORAGE_KEY = 'gaudi-fair-draw/v1'

export function loadGame(): GameState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isGameState(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveGame(state: GameState | null): void {
  try {
    if (state) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Private mode or a full quota: the app still works for this session.
  }
}
