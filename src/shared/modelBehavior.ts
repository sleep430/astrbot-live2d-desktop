/**
 * 按模型的播放行为配置（待机活跃度 + 常驻表情）
 *
 * 存储于 localStorage（modelBehaviors），主窗口与设置窗口共享。
 */

/** 待机活跃度默认值，与 IdleAnimator 的 DEFAULT_IDLE_ACTIVITY 保持一致 */
export const DEFAULT_IDLE_ACTIVITY = 0.7

export type ModelBehaviorConfig = {
  /** 待机活跃度（0~1）：越高待机微动越频繁，越低静止时段越多 */
  idleActivity: number
  /** 常驻表情名列表（如水印开关），参数每帧注入 */
  persistentExpressions: string[]
}

export function buildDefaultModelBehavior(): ModelBehaviorConfig {
  return {
    idleActivity: DEFAULT_IDLE_ACTIVITY,
    persistentExpressions: []
  }
}

function normalizeIdleActivity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_IDLE_ACTIVITY
  }
  return Math.min(1, Math.max(0, value))
}

function normalizePersistentExpressions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()
  const result: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') {
      continue
    }
    const normalized = item.trim()
    if (!normalized) {
      continue
    }
    const key = normalized.toLowerCase()
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    result.push(normalized)
  }
  return result
}

export function normalizeModelBehavior(value: unknown): ModelBehaviorConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return buildDefaultModelBehavior()
  }

  const candidate = value as { idleActivity?: unknown; persistentExpressions?: unknown }
  return {
    idleActivity: normalizeIdleActivity(candidate.idleActivity),
    persistentExpressions: normalizePersistentExpressions(candidate.persistentExpressions)
  }
}

export function normalizeModelBehaviorMap(value: unknown): Record<string, ModelBehaviorConfig> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  const result: Record<string, ModelBehaviorConfig> = {}
  for (const [path, behavior] of Object.entries(value)) {
    const normalizedPath = path.trim()
    if (!normalizedPath) {
      continue
    }
    result[normalizedPath] = normalizeModelBehavior(behavior)
  }
  return result
}
