import { cryptoRandom, shuffle, type RandomSource } from './rng'
import {
  COPIES_PER_TYPE,
  SET_SIZE,
  SUPPLY_COUNT,
  TILE_TYPES,
  TOTAL_TILES,
  createFullBag,
  isTileType,
  tileKey,
  type Mode,
  type TileType,
} from './tiles'

/**
 * A game session is a pre-shuffled 96-tile order plus a cursor. A draw is just
 * "take the next N tiles", so it is uniform, without replacement, resumable
 * after a refresh, and easy to audit in the draw log.
 */

export const STATE_VERSION = 1

const MAX_UNDO = 25
const MAX_LOG = 200

export interface DrawEvent {
  readonly kind: 'setup' | 'refill'
  readonly slot: number
  readonly tiles: readonly TileType[]
  readonly at: number
  /** Tiles still in the bag after this draw. */
  readonly remaining: number
}

export interface UndoEntry {
  readonly slot: number
  readonly previousTiles: readonly TileType[] | null
  readonly previousCursor: number
  readonly previousLogLength: number
}

export interface GameState {
  readonly version: typeof STATE_VERSION
  readonly mode: Mode
  readonly order: readonly TileType[]
  readonly cursor: number
  readonly supplies: readonly (readonly TileType[] | null)[]
  readonly log: readonly DrawEvent[]
  readonly undo: readonly UndoEntry[]
  readonly startedAt: number
}

export function bagRemaining(state: GameState): number {
  return state.order.length - state.cursor
}

export function drawSize(mode: Mode): number {
  return SET_SIZE[mode]
}

export function remainingCounts(state: GameState): Map<string, number> {
  const counts = new Map<string, number>()
  for (const type of TILE_TYPES) counts.set(tileKey(type), 0)
  for (let index = state.cursor; index < state.order.length; index += 1) {
    const tile = state.order[index]
    const key = tileKey(tile)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

export function canUndo(state: GameState): boolean {
  return state.undo.length > 0
}

export function startGame(
  mode: Mode,
  random: RandomSource = cryptoRandom,
  now: number = Date.now(),
): GameState {
  const size = SET_SIZE[mode]
  const order = shuffle(createFullBag(), random)

  const supplies: TileType[][] = []
  const log: DrawEvent[] = []
  let cursor = 0

  for (let slot = 0; slot < SUPPLY_COUNT; slot += 1) {
    const tiles = order.slice(cursor, cursor + size)
    cursor += tiles.length
    supplies.push(tiles)
    log.push({
      kind: 'setup',
      slot,
      tiles,
      at: now,
      remaining: order.length - cursor,
    })
  }

  return {
    version: STATE_VERSION,
    mode,
    order,
    cursor,
    supplies,
    log,
    undo: [],
    startedAt: now,
  }
}

/**
 * Replaces one supply space with the next tiles from the bag.
 * If the bag holds fewer than a full set, the space gets what is left.
 */
export function refillSupply(
  state: GameState,
  slot: number,
  now: number = Date.now(),
): GameState {
  if (!Number.isInteger(slot) || slot < 0 || slot >= SUPPLY_COUNT) {
    throw new RangeError(`Supply slot must be 0–${SUPPLY_COUNT - 1}`)
  }

  const available = bagRemaining(state)
  if (available === 0) return state

  const count = Math.min(SET_SIZE[state.mode], available)
  const tiles = state.order.slice(state.cursor, state.cursor + count)
  const cursor = state.cursor + count

  const supplies = state.supplies.map((current, index) =>
    index === slot ? tiles : current,
  )

  const log = [
    ...state.log,
    {
      kind: 'refill' as const,
      slot,
      tiles,
      at: now,
      remaining: state.order.length - cursor,
    },
  ].slice(-MAX_LOG)

  const undo = [
    ...state.undo,
    {
      slot,
      previousTiles: state.supplies[slot] ?? null,
      previousCursor: state.cursor,
      previousLogLength: state.log.length,
    },
  ].slice(-MAX_UNDO)

  return { ...state, cursor, supplies, log, undo }
}

export function undoLast(state: GameState): GameState {
  const entry = state.undo[state.undo.length - 1]
  if (!entry) return state

  const supplies = state.supplies.map((current, index) =>
    index === entry.slot ? entry.previousTiles : current,
  )

  return {
    ...state,
    cursor: entry.previousCursor,
    supplies,
    log: state.log.slice(0, entry.previousLogLength),
    undo: state.undo.slice(0, -1),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isIntegerBetween(value: unknown, min: number, max: number): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  )
}

function isDrawEvent(value: unknown): value is DrawEvent {
  if (!isRecord(value)) return false
  if (value.kind !== 'setup' && value.kind !== 'refill') return false
  if (!isIntegerBetween(value.slot, 0, SUPPLY_COUNT - 1)) return false
  if (!Array.isArray(value.tiles) || !value.tiles.every(isTileType)) return false
  if (value.tiles.length > SET_SIZE.standard) return false
  if (typeof value.at !== 'number') return false
  if (!isIntegerBetween(value.remaining, 0, TOTAL_TILES)) return false
  return true
}

function isUndoEntry(value: unknown): value is UndoEntry {
  if (!isRecord(value)) return false
  if (!isIntegerBetween(value.slot, 0, SUPPLY_COUNT - 1)) return false
  if (value.previousTiles !== null) {
    if (
      !Array.isArray(value.previousTiles) ||
      !value.previousTiles.every(isTileType)
    ) {
      return false
    }
  }
  if (!isIntegerBetween(value.previousCursor, 0, TOTAL_TILES)) return false
  if (!isIntegerBetween(value.previousLogLength, 0, MAX_LOG)) return false
  return true
}

/** Strict enough to reject a tampered or half-written saved game. */
export function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false
  if (value.version !== STATE_VERSION) return false
  if (value.mode !== 'standard' && value.mode !== 'expert') return false
  if (typeof value.startedAt !== 'number') return false

  if (!Array.isArray(value.order) || value.order.length !== TOTAL_TILES) {
    return false
  }
  const counts = new Map<string, number>()
  for (const tile of value.order) {
    if (!isTileType(tile)) return false
    const key = tileKey(tile)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  if (counts.size !== TILE_TYPES.length) return false
  for (const count of counts.values()) {
    if (count !== COPIES_PER_TYPE) return false
  }

  if (!isIntegerBetween(value.cursor, 0, TOTAL_TILES)) return false

  if (
    !Array.isArray(value.supplies) ||
    value.supplies.length !== SUPPLY_COUNT
  ) {
    return false
  }
  for (const supply of value.supplies) {
    if (supply === null) continue
    if (!Array.isArray(supply)) return false
    if (supply.length > SET_SIZE[value.mode]) return false
    if (!supply.every(isTileType)) return false
  }

  if (!Array.isArray(value.log) || !value.log.every(isDrawEvent)) return false
  if (!Array.isArray(value.undo) || !value.undo.every(isUndoEntry)) return false

  return true
}
