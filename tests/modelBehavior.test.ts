import { describe, expect, it } from 'vitest'

import {
  buildDefaultModelBehavior,
  normalizeModelBehavior,
  normalizeModelBehaviorMap
} from '../src/shared/modelBehavior'

describe('normalizeModelBehavior', () => {
  it('returns defaults for invalid input', () => {
    expect(normalizeModelBehavior(null)).toEqual(buildDefaultModelBehavior())
    expect(normalizeModelBehavior('x')).toEqual(buildDefaultModelBehavior())
    expect(normalizeModelBehavior([])).toEqual(buildDefaultModelBehavior())
  })

  it('ignores legacy idleMotion field from older versions', () => {
    const behavior = normalizeModelBehavior({
      idleMotion: { group: 'Idle', index: 0 },
      persistentExpressions: ['水印开关']
    })

    expect(behavior).toEqual({ idleActivity: 0.7, persistentExpressions: ['水印开关'] })
  })

  it('clamps idle activity and falls back to default for invalid values', () => {
    expect(normalizeModelBehavior({ idleActivity: 0.4 }).idleActivity).toBe(0.4)
    expect(normalizeModelBehavior({ idleActivity: 7 }).idleActivity).toBe(1)
    expect(normalizeModelBehavior({ idleActivity: -1 }).idleActivity).toBe(0)
    expect(normalizeModelBehavior({ idleActivity: 'high' }).idleActivity).toBe(0.7)
    expect(normalizeModelBehavior({}).idleActivity).toBe(0.7)
  })

  it('dedupes and trims persistent expressions', () => {
    const behavior = normalizeModelBehavior({
      persistentExpressions: ['水印开关', ' 水印开关 ', 'BLUSH', 'blush', '', 42]
    })

    expect(behavior.persistentExpressions).toEqual(['水印开关', 'BLUSH'])
  })
})

describe('normalizeModelBehaviorMap', () => {
  it('normalizes each entry and drops empty paths', () => {
    const map = normalizeModelBehaviorMap({
      '/models/a.model3.json': { persistentExpressions: ['水印开关'] },
      '': { persistentExpressions: [] },
      '/models/b.model3.json': 'garbage'
    })

    expect(Object.keys(map)).toEqual(['/models/a.model3.json', '/models/b.model3.json'])
    expect(map['/models/a.model3.json']).toEqual({
      idleActivity: 0.7,
      persistentExpressions: ['水印开关']
    })
    expect(map['/models/b.model3.json']).toEqual(buildDefaultModelBehavior())
  })

  it('returns empty map for invalid input', () => {
    expect(normalizeModelBehaviorMap(null)).toEqual({})
    expect(normalizeModelBehaviorMap([1, 2])).toEqual({})
  })
})
