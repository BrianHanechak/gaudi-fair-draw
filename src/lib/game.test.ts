import { describe, expect, it } from 'vitest'
import {
  STATE_VERSION,
  bagRemaining,
  isGameState,
  refillSupply,
  remainingCounts,
  startGame,
  undoLast,
  type GameState,
} from './game'
import { createSeededRandom } from './rng'
import {
  COPIES_PER_TYPE,
  SUPPLY_COUNT,
  TILE_TYPES,
  TOTAL_TILES,
  tileKey,
} from './tiles'

function seededGame(seed = 20261124, mode: 'standard' | 'expert' = 'standard') {
  return startGame(mode, createSeededRandom(seed), 1_700_000_000_000)
}

function typeCounts(state: GameState): Map<string, number> {
  const counts = new Map<string, number>(
    TILE_TYPES.map((type) => [tileKey(type), 0]),
  )
  for (const supply of state.supplies) {
    for (const tile of supply ?? []) {
      const key = tileKey(tile)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  for (const [key, count] of remainingCounts(state)) {
    counts.set(key, (counts.get(key) ?? 0) + count)
  }
  return counts
}

describe('startGame', () => {
  it('deals five supplies of five in standard mode', () => {
    const state = seededGame()

    expect(state.supplies).toHaveLength(SUPPLY_COUNT)
    for (const supply of state.supplies) expect(supply).toHaveLength(5)
    expect(state.cursor).toBe(25)
    expect(bagRemaining(state)).toBe(TOTAL_TILES - 25)
    expect(state.log).toHaveLength(SUPPLY_COUNT)
    expect(state.log.every((event) => event.kind === 'setup')).toBe(true)
    expect(state.undo).toHaveLength(0)
    expect(state.version).toBe(STATE_VERSION)
  })

  it('deals four per supply in expert mode', () => {
    const state = seededGame(7, 'expert')

    for (const supply of state.supplies) expect(supply).toHaveLength(4)
    expect(state.cursor).toBe(20)
    expect(bagRemaining(state)).toBe(TOTAL_TILES - 20)
  })

  it('accounts for every tile exactly six times per type', () => {
    const state = seededGame()
    const counts = typeCounts(state)

    expect(counts.size).toBe(TILE_TYPES.length)
    let total = 0
    for (const count of counts.values()) {
      expect(count).toBe(COPIES_PER_TYPE)
      total += count
    }
    expect(total).toBe(TOTAL_TILES)
  })

  it('is deterministic for a seeded source', () => {
    expect(seededGame(123).order).toEqual(seededGame(123).order)
    expect(seededGame(123).order).not.toEqual(seededGame(124).order)
  })
})

describe('refillSupply', () => {
  it('replaces one supply with a full set and reduces the bag', () => {
    const state = seededGame()
    const next = refillSupply(state, 2, 1_700_000_001_000)

    expect(next.supplies[2]).toHaveLength(5)
    expect(next.supplies[2]).not.toEqual(state.supplies[2])
    expect(next.cursor).toBe(30)
    expect(bagRemaining(next)).toBe(TOTAL_TILES - 30)
    expect(next.log).toHaveLength(SUPPLY_COUNT + 1)
    expect(next.log.at(-1)).toMatchObject({
      kind: 'refill',
      slot: 2,
      remaining: TOTAL_TILES - 30,
    })
    expect(next.undo).toHaveLength(1)
    expect(next.supplies.filter((_, index) => index !== 2)).toEqual(
      state.supplies.filter((_, index) => index !== 2),
    )
  })

  it('uses four tiles per refill in expert mode', () => {
    const state = seededGame(9, 'expert')
    const next = refillSupply(state, 0)

    expect(next.supplies[0]).toHaveLength(4)
    expect(next.cursor).toBe(24)
  })

  it('draws only what remains when the bag runs low', () => {
    const state = seededGame()
    const nearEnd: GameState = { ...state, cursor: TOTAL_TILES - 3 }
    const next = refillSupply(nearEnd, 1)

    expect(next.supplies[1]).toHaveLength(3)
    expect(next.cursor).toBe(TOTAL_TILES)
    expect(bagRemaining(next)).toBe(0)
    expect(refillSupply(next, 2)).toBe(next)
  })

  it('rejects an invalid supply number', () => {
    const state = seededGame()
    expect(() => refillSupply(state, -1)).toThrow(RangeError)
    expect(() => refillSupply(state, SUPPLY_COUNT)).toThrow(RangeError)
    expect(() => refillSupply(state, 1.5)).toThrow(RangeError)
  })
})

describe('undoLast', () => {
  it('restores the previous supply, cursor and log', () => {
    const state = seededGame()
    const refilled = refillSupply(state, 3)
    const undone = undoLast(refilled)

    expect(undone.supplies).toEqual(state.supplies)
    expect(undone.cursor).toBe(state.cursor)
    expect(undone.log).toEqual(state.log)
    expect(undone.undo).toHaveLength(0)
  })

  it('does nothing with an empty history', () => {
    const state = seededGame()
    expect(undoLast(state)).toBe(state)
  })

  it('supports several refills and undoes them one at a time', () => {
    const state = seededGame()
    const once = refillSupply(state, 0)
    const twice = refillSupply(once, 1)

    const backToOnce = undoLast(twice)
    expect(backToOnce.supplies).toEqual(once.supplies)
    expect(backToOnce.cursor).toBe(once.cursor)

    const backToStart = undoLast(backToOnce)
    expect(backToStart.supplies).toEqual(state.supplies)
    expect(backToStart.cursor).toBe(state.cursor)
  })
})

describe('isGameState', () => {
  it('accepts a real state and its JSON round trip', () => {
    const state = seededGame()
    const restored: unknown = JSON.parse(JSON.stringify(state))

    expect(isGameState(state)).toBe(true)
    expect(isGameState(restored)).toBe(true)
    expect(restored).toEqual(state)
  })

  it('rejects a state with a broken tile count', () => {
    const state = seededGame()
    const first = tileKey(state.order[0])
    const other = state.order.find((tile) => tileKey(tile) !== first)
    expect(other).toBeDefined()

    const tampered = {
      ...state,
      order: state.order.map((tile, index) => (index === 0 ? other : tile)),
    }

    expect(isGameState(tampered)).toBe(false)
  })

  it('rejects an out-of-range cursor and an unknown version', () => {
    const state = seededGame()
    expect(isGameState({ ...state, cursor: TOTAL_TILES + 1 })).toBe(false)
    expect(isGameState({ ...state, version: 99 })).toBe(false)
    expect(isGameState(null)).toBe(false)
    expect(isGameState('nope')).toBe(false)
  })
})
