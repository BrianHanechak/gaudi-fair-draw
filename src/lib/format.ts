import { tileName, type TileType } from './tiles'

/**
 * "Blue square ×2 · Green pentagon · Yellow triangle"
 * Groups duplicates while keeping the order tiles were drawn in.
 */
export function summariseTiles(tiles: readonly TileType[]): string {
  const groups = new Map<string, { name: string; count: number }>()

  for (const tile of tiles) {
    const name = tileName(tile)
    const group = groups.get(name)
    if (group) group.count += 1
    else groups.set(name, { name, count: 1 })
  }

  return [...groups.values()]
    .map(({ name, count }) => (count > 1 ? `${name} ×${count}` : name))
    .join(' · ')
}

const clock = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
})

export function formatTime(at: number): string {
  return clock.format(new Date(at))
}

export function tileCount(count: number): string {
  return `${count} ${count === 1 ? 'tile' : 'tiles'}`
}
