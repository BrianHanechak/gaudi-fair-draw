/**
 * Randomness for the draw.
 *
 * A fairness app should not lean on Math.random() rounding, so indices are
 * picked from crypto uint32 values with rejection sampling. The result is an
 * exact uniform shuffle. A seeded source is exported for tests and for
 * reproducible simulations.
 */

export interface RandomSource {
  nextUint32(): number
}

const UINT32_RANGE = 0x1_0000_0000

export const cryptoRandom: RandomSource = {
  nextUint32() {
    const buffer = new Uint32Array(1)
    crypto.getRandomValues(buffer)
    return buffer[0]
  },
}

/** Uniform integer in [0, maxExclusive), without modulo bias. */
export function randomInt(
  maxExclusive: number,
  random: RandomSource = cryptoRandom,
): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError('maxExclusive must be a positive integer')
  }
  const limit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive
  let value = random.nextUint32()
  while (value >= limit) value = random.nextUint32()
  return value % maxExclusive
}

/** Fisher–Yates, returning a new array. */
export function shuffle<T>(
  items: readonly T[],
  random: RandomSource = cryptoRandom,
): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1, random)
    const current = result[i]
    result[i] = result[j]
    result[j] = current
  }
  return result
}

/** Mulberry32: small, fast, deterministic — for tests only. */
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0
  return {
    nextUint32() {
      state = (state + 0x6d2b79f5) >>> 0
      let value = state
      value = Math.imul(value ^ (value >>> 15), value | 1)
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
      return (value ^ (value >>> 14)) >>> 0
    },
  }
}
