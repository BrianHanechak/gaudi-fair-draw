import { describe, expect, it } from 'vitest'
import { startGame } from './game'
import { createSeededRandom, randomInt, shuffle } from './rng'
import { TILE_TYPES, TOTAL_TILES, tileKey } from './tiles'

describe('randomInt', () => {
  it('rejects impossible ranges', () => {
    expect(() => randomInt(0)).toThrow(RangeError)
    expect(() => randomInt(-4)).toThrow(RangeError)
    expect(() => randomInt(2.5)).toThrow(RangeError)
  })

  it('returns values inside the range', () => {
    const random = createSeededRandom(4)
    for (let index = 0; index < 500; index += 1) {
      const value = randomInt(7, random)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(7)
    }
  })
})

describe('shuffle', () => {
  it('is a permutation and does not mutate the input', () => {
    const input = Array.from({ length: 40 }, (_, index) => index)
    const result = shuffle(input, createSeededRandom(11))

    expect(result).not.toBe(input)
    expect([...result].sort((a, b) => a - b)).toEqual(input)
    expect(input).toEqual(Array.from({ length: 40 }, (_, index) => index))
  })

  it('is reproducible with the same seed', () => {
    const input = Array.from({ length: 20 }, (_, index) => index)
    expect(shuffle(input, createSeededRandom(5))).toEqual(
      shuffle(input, createSeededRandom(5)),
    )
  })

  it('spreads the first tile evenly over the whole multiset', () => {
    const games = 2400
    const expected = games / TILE_TYPES.length
    const counts = new Map<string, number>(
      TILE_TYPES.map((type) => [tileKey(type), 0]),
    )
    const random = createSeededRandom(2026)

    for (let index = 0; index < games; index += 1) {
      const state = startGame('standard', random, 0)
      const first = state.order[0]
      expect(state.order).toHaveLength(TOTAL_TILES)
      const key = tileKey(first)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    for (const count of counts.values()) {
      // A generous bound: catches a broken shuffle without being flaky.
      expect(Math.abs(count - expected)).toBeLessThan(expected * 0.35)
    }
  })
})
