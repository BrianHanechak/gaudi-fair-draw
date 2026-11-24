/**
 * The physical contents of Gaudí's bag.
 *
 * The rulebook says 96 Trencadís pieces, "6 of each colour and shape".
 * That is 4 shapes × 4 colours × 6 copies. The app draws from exactly this
 * multiset, so shape sizes (the thing that skews a real bag) cannot matter.
 */

export const SHAPE_IDS = ['shard', 'square', 'pentagon', 'triangle'] as const
export type ShapeId = (typeof SHAPE_IDS)[number]

export const COLOUR_IDS = ['blue', 'gray', 'green', 'yellow'] as const
export type ColourId = (typeof COLOUR_IDS)[number]

export interface TileType {
  readonly shape: ShapeId
  readonly colour: ColourId
}

export interface ShapeInfo {
  readonly name: string
  readonly description: string
  /** Outline for the 100 × 100 tile drawing. */
  readonly path: string
}

export interface ColourInfo {
  readonly name: string
  readonly shortName: string
  readonly hex: string
  readonly light: string
  readonly dark: string
}

export const SHAPES: Record<ShapeId, ShapeInfo> = {
  shard: {
    name: 'Shard',
    description: 'slanted quadrilateral',
    path: 'M57 7 L90 25 L46 93 L12 42 Z',
  },
  square: {
    name: 'Square',
    description: 'square',
    path: 'M24 18 H76 Q82 18 82 24 V76 Q82 82 76 82 H24 Q18 82 18 76 V24 Q18 18 24 18 Z',
  },
  pentagon: {
    name: 'Pentagon',
    description: 'five-sided piece',
    path: 'M50 12 L85 38 L72 82 L28 82 L15 38 Z',
  },
  triangle: {
    name: 'Triangle',
    description: 'wide triangle',
    path: 'M14 24 H86 L50 90 Z',
  },
}

export const COLOURS: Record<ColourId, ColourInfo> = {
  blue: {
    name: 'Blue',
    shortName: 'Blue',
    hex: '#2e5e9c',
    light: '#4a7cb9',
    dark: '#1e4069',
  },
  gray: {
    name: 'Gray',
    shortName: 'Gray',
    hex: '#b8b9b2',
    light: '#d9dad3',
    dark: '#8a8b84',
  },
  green: {
    name: 'Green',
    shortName: 'Green',
    hex: '#4da96a',
    light: '#74c58c',
    dark: '#327a4c',
  },
  yellow: {
    name: 'Yellow',
    shortName: 'Yellow',
    hex: '#efc23f',
    light: '#f9dd80',
    dark: '#c3961f',
  },
}

export const COPIES_PER_TYPE = 6

export const TILE_TYPES: readonly TileType[] = SHAPE_IDS.flatMap((shape) =>
  COLOUR_IDS.map((colour) => ({ shape, colour })),
)

export const TOTAL_TILES = TILE_TYPES.length * COPIES_PER_TYPE

export type Mode = 'standard' | 'expert'

export const MODES: readonly Mode[] = ['standard', 'expert']

export const SET_SIZE: Record<Mode, number> = {
  standard: 5,
  expert: 4,
}

export const MODE_LABEL: Record<Mode, string> = {
  standard: 'Standard',
  expert: 'Expert',
}

export const MODE_NOTE: Record<Mode, string> = {
  standard: '5 tiles per supply',
  expert: '4 tiles per supply',
}

export const SUPPLY_COUNT = 5

export function tileKey(tile: TileType): string {
  return `${tile.shape}:${tile.colour}`
}

export function tileName(tile: TileType): string {
  return `${COLOURS[tile.colour].name} ${SHAPES[tile.shape].name.toLowerCase()}`
}

export function tileShapeName(tile: TileType): string {
  return SHAPES[tile.shape].name
}

export function isTileType(value: unknown): value is TileType {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    SHAPE_IDS.includes(record.shape as ShapeId) &&
    COLOUR_IDS.includes(record.colour as ColourId)
  )
}

export function createFullBag(): TileType[] {
  const bag: TileType[] = []
  for (const type of TILE_TYPES) {
    for (let copy = 0; copy < COPIES_PER_TYPE; copy += 1) {
      bag.push({ shape: type.shape, colour: type.colour })
    }
  }
  return bag
}
