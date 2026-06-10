/**
 * 程序化待机动画
 *
 * 用平滑值噪声（而非随机数或固定正弦）直接驱动头部、眼球、身体的姿态起伏：
 * - 噪声曲线天然有缓急变化，姿态梯度时大时小，不会匀速摇摆
 * - 头部与眼球使用同一套算法但频率/幅度配置不同（眼球更快更碎，头部更慢更缓）
 * - 「待机活跃度」直接调制摆动幅度（0.4~4 倍）
 * - 呼吸保持正弦周期（生理上本就是周期行为）；头部/身体 Y 向带呼吸联动，
 *   躯干有持续起伏感
 * - 动作演出期间姿态噪声淡出让位，结束后淡入恢复（呼吸不中断）
 *
 * 纯 TypeScript、确定性输出（同一时间轴输出一致），便于单元测试。
 */

export type IdleParameterValue = {
  parameterId: string
  value: number
}

type IdleChannelConfig = {
  parameterId: string
  /** 基准偏移幅度（参数单位：角度参数为度，眼球为 -1..1 归一值），实际幅度随活跃度缩放 */
  amplitude: number
  /** 噪声时间频率，值越大姿态变化越快 */
  frequency: number
  /** 噪声种子，错开各通道相位 */
  seed: number
  /** 呼吸正弦联动幅度：该参数随呼吸轻微起伏，不受活跃度与演出抑制 */
  breathSway?: number
}

/** 整数格点确定性哈希 → [-1, 1] */
function hashLattice(seed: number, index: number): number {
  let h = Math.imul(index | 0, 0x9e3779b1) ^ Math.imul(seed | 0, 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  h ^= h >>> 16
  return ((h >>> 0) / 0xffffffff) * 2 - 1
}

/** 一维平滑值噪声（quintic 插值），输出 [-1, 1]、对 t 连续 */
export function smoothNoise(seed: number, t: number): number {
  const i = Math.floor(t)
  const f = t - i
  const u = f * f * f * (f * (f * 6 - 15) + 10)
  return hashLattice(seed, i) * (1 - u) + hashLattice(seed, i + 1) * u
}

/** 两层叠加噪声：主层定走向，半幅高频层添细节，输出仍在 [-1, 1] */
export function layeredNoise(seed: number, t: number): number {
  return (smoothNoise(seed, t) + 0.5 * smoothNoise(seed + 7919, t * 2.17)) / 1.5
}

/**
 * 默认通道。身体三轴是物理引擎的主要输入：很多模型的手臂、衣服、尾巴等
 * 没有独立可驱动参数，而是由物理跟随身体摆动，因此身体通道是"全身在动"的关键。
 * 头部/身体的 Y 向通道带呼吸联动，让躯干有持续的呼吸起伏感。
 */
const DEFAULT_CHANNELS: IdleChannelConfig[] = [
  { parameterId: 'ParamAngleX', amplitude: 8, frequency: 0.28, seed: 11 },
  { parameterId: 'ParamAngleY', amplitude: 5, frequency: 0.35, seed: 23, breathSway: 0.8 },
  { parameterId: 'ParamAngleZ', amplitude: 4, frequency: 0.22, seed: 37 },
  { parameterId: 'ParamBodyAngleX', amplitude: 4, frequency: 0.16, seed: 53 },
  { parameterId: 'ParamBodyAngleY', amplitude: 3, frequency: 0.18, seed: 89, breathSway: 1.5 },
  { parameterId: 'ParamBodyAngleZ', amplitude: 3, frequency: 0.14, seed: 97 },
  { parameterId: 'ParamEyeBallX', amplitude: 0.35, frequency: 0.7, seed: 67 },
  { parameterId: 'ParamEyeBallY', amplitude: 0.18, frequency: 0.8, seed: 79 }
]

const BREATH_PARAMETER_ID = 'ParamBreath'
const BREATH_CYCLE_SECONDS = 4.2345
/** 演出打断后的淡出时长（快让位） */
const FADE_OUT_SECONDS = 0.25
/** 演出结束后的淡入时长（缓恢复） */
const FADE_IN_SECONDS = 0.6

/** 待机活跃度默认值 */
export const DEFAULT_IDLE_ACTIVITY = 0.7
/** activity 对幅度的调制范围：0 → 0.4 倍，1 → 4 倍 */
const AMPLITUDE_SCALE_BASE = 0.4
const AMPLITUDE_SCALE_SPAN = 3.6

export class IdleAnimator {
  private readonly channels: IdleChannelConfig[]
  private readonly output: IdleParameterValue[]
  private time = 0
  private weight = 1
  private activity = DEFAULT_IDLE_ACTIVITY

  constructor(channels: IdleChannelConfig[] = DEFAULT_CHANNELS) {
    this.channels = channels
    this.output = [
      ...channels.map(channel => ({ parameterId: channel.parameterId, value: 0 })),
      { parameterId: BREATH_PARAMETER_ID, value: 0 }
    ]
  }

  /** 当前演出抑制权重（0=完全让位，1=完全活跃），仅用于观测与测试 */
  getWeight(): number {
    return this.weight
  }

  /** 设置待机活跃度（0~1）：直接调制摆动幅度 */
  setActivity(value: number): void {
    this.activity = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULT_IDLE_ACTIVITY
  }

  getActivity(): number {
    return this.activity
  }

  /**
   * 推进时间并计算本帧各参数偏移。
   * @param deltaSeconds 帧间隔
   * @param suppressed 是否被演出打断（动作播放中），打断期间姿态通道淡出
   */
  advance(deltaSeconds: number, suppressed: boolean): readonly IdleParameterValue[] {
    const dt = Number.isFinite(deltaSeconds) ? Math.max(0, deltaSeconds) : 0
    this.time += dt

    const fadeRate = suppressed ? -1 / FADE_OUT_SECONDS : 1 / FADE_IN_SECONDS
    this.weight = Math.min(1, Math.max(0, this.weight + fadeRate * dt))

    const amplitudeScale = AMPLITUDE_SCALE_BASE + AMPLITUDE_SCALE_SPAN * this.activity
    const breathPhase = Math.sin((2 * Math.PI * this.time) / BREATH_CYCLE_SECONDS)

    for (let i = 0; i < this.channels.length; i++) {
      const channel = this.channels[i]
      const value = layeredNoise(channel.seed, this.time * channel.frequency)
      let output = value * channel.amplitude * amplitudeScale * this.weight
      // 呼吸联动与 ParamBreath 同语义：常开，不受活跃度与演出抑制
      if (channel.breathSway) {
        output += breathPhase * channel.breathSway
      }
      this.output[i].value = output
    }

    // 呼吸为周期行为且与动作参数几乎不冲突，保持常开不受演出抑制
    const breath = this.output[this.output.length - 1]
    breath.value = 0.5 + 0.5 * breathPhase

    return this.output
  }
}
