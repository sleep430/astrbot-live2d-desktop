export type ExpressionBlendType = 'add' | 'multiply' | 'overwrite'

export type ExpressionParameterOp = {
  parameterId: string
  blend: ExpressionBlendType
  value: number
}

export type ParsedExpressionFile = {
  id: string
  file: string
  fadeInMs?: number
  fadeOutMs?: number
  parameters: ExpressionParameterOp[]
  parameterIds: string[]
  blendSummary: {
    additive: number
    multiply: number
    overwrite: number
  }
  parseWarnings: string[]
}

type RawExpressionParameter = {
  Id?: string
  Value?: number
  Blend?: string
}

type RawExp3Json = {
  FadeInTime?: number
  FadeOutTime?: number
  Parameters?: RawExpressionParameter[]
}

function normalizeBlendType(rawBlend: unknown): ExpressionBlendType {
  const normalized = typeof rawBlend === 'string' ? rawBlend.trim().toLowerCase() : ''
  if (normalized === 'multiply') {
    return 'multiply'
  }
  if (normalized === 'overwrite' || normalized === 'set') {
    return 'overwrite'
  }
  return 'add'
}

function normalizeFadeTimeMs(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined
  }
  return Math.max(0, Math.round(value * 1000))
}

export type PersistentExpressionSource = {
  name: string
  aliases: string[]
  parsed?: ParsedExpressionFile | null
}

/**
 * 按名称/别名从已解析的表情文件中收集常驻表情的参数操作。
 * 用于"水印开关"这类需要长期生效的开关型表情：参数由模型每帧直接注入，
 * 不进入表情运行时状态机。未匹配或无解析数据的名称会被静默忽略。
 */
export function collectPersistentExpressionOps(
  sources: PersistentExpressionSource[],
  selectedNames: string[]
): ExpressionParameterOp[] {
  const ops: ExpressionParameterOp[] = []

  for (const rawName of selectedNames) {
    const normalized = typeof rawName === 'string' ? rawName.trim().toLowerCase() : ''
    if (!normalized) {
      continue
    }

    const entry = sources.find(source => {
      if (source.name.trim().toLowerCase() === normalized) {
        return true
      }
      return source.aliases.some(alias => alias.trim().toLowerCase() === normalized)
    })

    if (!entry?.parsed) {
      continue
    }

    ops.push(...entry.parsed.parameters)
  }

  return ops
}

export function parseExp3Text(text: string, id: string, file: string): ParsedExpressionFile {
  const parseWarnings: string[] = []
  const parameters: ExpressionParameterOp[] = []

  let parsed: RawExp3Json = {}
  try {
    parsed = JSON.parse(text) as RawExp3Json
  } catch (error) {
    parseWarnings.push(
      `表情文件解析失败: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  if (!Array.isArray(parsed.Parameters)) {
    parseWarnings.push('表情文件缺少 Parameters 数组')
  } else {
    for (const item of parsed.Parameters) {
      const parameterId = typeof item?.Id === 'string' ? item.Id.trim() : ''
      if (!parameterId) {
        parseWarnings.push('发现缺少 Id 的表情参数项')
        continue
      }

      const value = typeof item?.Value === 'number' && Number.isFinite(item.Value) ? item.Value : 0
      const blend = normalizeBlendType(item?.Blend)

      parameters.push({
        parameterId,
        blend,
        value
      })
    }
  }

  const parameterIds = [...new Set(parameters.map(item => item.parameterId))]

  return {
    id,
    file,
    fadeInMs: normalizeFadeTimeMs(parsed.FadeInTime),
    fadeOutMs: normalizeFadeTimeMs(parsed.FadeOutTime),
    parameters,
    parameterIds,
    blendSummary: {
      additive: parameters.filter(item => item.blend === 'add').length,
      multiply: parameters.filter(item => item.blend === 'multiply').length,
      overwrite: parameters.filter(item => item.blend === 'overwrite').length
    },
    parseWarnings
  }
}
