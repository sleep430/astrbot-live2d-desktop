import { describe, expect, it } from 'vitest'

import { IdleAnimator, layeredNoise, smoothNoise } from '../src/utils/cubism/IdleAnimator'

const FRAME = 1 / 60

/** 带呼吸联动的通道：值含常开正弦分量，抑制判定需排除 */
const BREATH_SWAY_IDS = new Set(['ParamAngleY', 'ParamBodyAngleY'])

function advanceSeconds(animator: IdleAnimator, seconds: number, suppressed = false) {
  const frames = Math.round(seconds / FRAME)
  let last: readonly { parameterId: string; value: number }[] = []
  for (let i = 0; i < frames; i++) {
    last = animator.advance(FRAME, suppressed)
  }
  return last
}

describe('smoothNoise', () => {
  it('is deterministic for the same seed and time', () => {
    expect(smoothNoise(11, 12.34)).toBe(smoothNoise(11, 12.34))
    expect(layeredNoise(11, 12.34)).toBe(layeredNoise(11, 12.34))
  })

  it('differs across seeds', () => {
    const a = Array.from({ length: 16 }, (_, i) => smoothNoise(11, i * 0.7))
    const b = Array.from({ length: 16 }, (_, i) => smoothNoise(23, i * 0.7))
    expect(a).not.toEqual(b)
  })

  it('stays within [-1, 1] and changes smoothly', () => {
    let previous = smoothNoise(7, 0)
    for (let i = 1; i <= 2000; i++) {
      const value = smoothNoise(7, i * 0.01)
      expect(value).toBeGreaterThanOrEqual(-1)
      expect(value).toBeLessThanOrEqual(1)
      // 0.01 步长下的变化必须远小于值域，证明曲线连续而非随机跳变
      expect(Math.abs(value - previous)).toBeLessThan(0.06)
      previous = value
    }
  })
})

describe('IdleAnimator', () => {
  it('emits posture channels plus breath', () => {
    const animator = new IdleAnimator()
    const output = animator.advance(FRAME, false)
    const ids = output.map(entry => entry.parameterId)

    expect(ids).toEqual([
      'ParamAngleX',
      'ParamAngleY',
      'ParamAngleZ',
      'ParamBodyAngleX',
      'ParamBodyAngleY',
      'ParamBodyAngleZ',
      'ParamEyeBallX',
      'ParamEyeBallY',
      'ParamBreath'
    ])
  })

  it('is deterministic across instances on the same timeline', () => {
    const a = new IdleAnimator()
    const b = new IdleAnimator()
    for (let i = 0; i < 600; i++) {
      const outputA = a.advance(FRAME, false)
      const outputB = b.advance(FRAME, false)
      expect(outputA).toEqual(outputB)
    }
  })

  it('keeps every channel within its scaled amplitude and breath within [0, 1]', () => {
    const animator = new IdleAnimator()
    animator.setActivity(1)
    // activity=1 时幅度调制系数最大（4 倍），呼吸联动通道额外加联动幅度
    const limits: Record<string, number> = {
      ParamAngleX: 8 * 4,
      ParamAngleY: 5 * 4 + 0.8,
      ParamAngleZ: 4 * 4,
      ParamBodyAngleX: 4 * 4,
      ParamBodyAngleY: 3 * 4 + 1.5,
      ParamBodyAngleZ: 3 * 4,
      ParamEyeBallX: 0.35 * 4,
      ParamEyeBallY: 0.18 * 4
    }

    for (let i = 0; i < 3600; i++) {
      for (const entry of animator.advance(FRAME, false)) {
        if (entry.parameterId === 'ParamBreath') {
          expect(entry.value).toBeGreaterThanOrEqual(0)
          expect(entry.value).toBeLessThanOrEqual(1)
        } else {
          expect(Math.abs(entry.value)).toBeLessThanOrEqual(limits[entry.parameterId])
        }
      }
    }
  })

  it('changes smoothly between frames', () => {
    const animator = new IdleAnimator()
    animator.setActivity(1)
    let previous = animator.advance(FRAME, false).map(entry => entry.value)
    for (let i = 0; i < 1200; i++) {
      const current = animator.advance(FRAME, false).map(entry => entry.value)
      for (let channel = 0; channel < current.length; channel++) {
        expect(Math.abs(current[channel] - previous[channel])).toBeLessThan(1)
      }
      previous = current
    }
  })

  it('swings wider at higher activity settings', () => {
    const calm = new IdleAnimator()
    calm.setActivity(0)
    const lively = new IdleAnimator()
    lively.setActivity(1)

    let calmSum = 0
    let livelySum = 0
    for (let i = 0; i < 7200; i++) {
      const calmOutput = calm.advance(FRAME, false)
      const livelyOutput = lively.advance(FRAME, false)
      calmSum += Math.abs(calmOutput[0].value)
      livelySum += Math.abs(livelyOutput[0].value)
    }

    // 0 → 0.4 倍、1 → 4 倍，幅度差应接近 10 倍
    expect(livelySum).toBeGreaterThan(calmSum * 8)
  })

  it('fades posture channels out while performing and keeps breath sway alive', () => {
    const animator = new IdleAnimator()
    advanceSeconds(animator, 5)

    const suppressedOutput = advanceSeconds(animator, 1, true)
    expect(animator.getWeight()).toBe(0)
    let swayActive = false
    for (const entry of suppressedOutput) {
      if (entry.parameterId === 'ParamBreath') continue
      if (BREATH_SWAY_IDS.has(entry.parameterId)) {
        // 呼吸联动常开：抑制期间仍随呼吸起伏
        if (entry.value !== 0) swayActive = true
      } else {
        expect(entry.value === 0).toBe(true)
      }
    }
    expect(swayActive).toBe(true)
    // 呼吸不受演出抑制
    const breath = suppressedOutput.find(entry => entry.parameterId === 'ParamBreath')
    expect(breath).toBeDefined()
    expect(breath!.value).toBeGreaterThanOrEqual(0)
    expect(breath!.value).toBeLessThanOrEqual(1)

    advanceSeconds(animator, 2, false)
    expect(animator.getWeight()).toBe(1)
  })

  it('clamps invalid activity values', () => {
    const animator = new IdleAnimator()
    animator.setActivity(5)
    expect(animator.getActivity()).toBe(1)
    animator.setActivity(-2)
    expect(animator.getActivity()).toBe(0)
    animator.setActivity(Number.NaN)
    expect(animator.getActivity()).toBe(0.7)
  })

  it('tolerates invalid delta values', () => {
    const animator = new IdleAnimator()
    expect(() => animator.advance(Number.NaN, false)).not.toThrow()
    expect(() => animator.advance(-1, false)).not.toThrow()
    for (const entry of animator.advance(FRAME, false)) {
      expect(Number.isFinite(entry.value)).toBe(true)
    }
  })
})
