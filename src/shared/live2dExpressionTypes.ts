import type { CubismModelDiscoverySource } from './cubismModelDiscovery'

export const LIVE2D_EXPRESSION_TYPES = [
  'neutral',
  'happy',
  'sad',
  'angry',
  'anxious',
  'surprised',
  'thinking',
  'tired',
  'disgusted',
  'blush',
  'playful',
  'sweat',
  'special',
  'speaking',
] as const

export type Live2DExpressionType = typeof LIVE2D_EXPRESSION_TYPES[number]

export type Live2DExpressionTypeMeta = {
  key: Live2DExpressionType
  label: string
  group: '基础' | '情绪' | '状态' | '效果'
}

export const LIVE2D_EXPRESSION_TYPE_META: Live2DExpressionTypeMeta[] = [
  { key: 'neutral', label: '中性', group: '基础' },
  { key: 'happy', label: '开心', group: '情绪' },
  { key: 'sad', label: '难过', group: '情绪' },
  { key: 'angry', label: '生气', group: '情绪' },
  { key: 'anxious', label: '紧张/害怕', group: '情绪' },
  { key: 'surprised', label: '惊讶', group: '状态' },
  { key: 'thinking', label: '思考/困惑', group: '状态' },
  { key: 'tired', label: '疲惫/困倦', group: '状态' },
  { key: 'disgusted', label: '厌恶/嫌弃', group: '状态' },
  { key: 'blush', label: '脸红/害羞', group: '效果' },
  { key: 'playful', label: '俏皮', group: '效果' },
  { key: 'sweat', label: '流汗', group: '效果' },
  { key: 'special', label: '特殊效果', group: '效果' },
  { key: 'speaking', label: '说话', group: '效果' },
]

export type Live2DExpressionTypePresetMap = Record<Live2DExpressionType, string[]>

export type Live2DExpressionTypeEntry = {
  id: string
  file: string
  aliases: string[]
  source: CubismModelDiscoverySource
}

export type Live2DExpressionTypesLoadResult = {
  success: boolean
  modelPath?: string
  profilePath?: string
  expressions?: Live2DExpressionTypeEntry[]
  presets?: Live2DExpressionTypePresetMap
  error?: string
}

export type Live2DExpressionTypesSaveResult = {
  success: boolean
  profilePath?: string
  error?: string
}

export function createEmptyExpressionTypePresets(): Live2DExpressionTypePresetMap {
  return LIVE2D_EXPRESSION_TYPES.reduce((result, key) => {
    result[key] = []
    return result
  }, {} as Live2DExpressionTypePresetMap)
}

export function cloneExpressionTypePresets(
  presets: Partial<Record<Live2DExpressionType, readonly string[] | undefined>>
): Live2DExpressionTypePresetMap {
  return LIVE2D_EXPRESSION_TYPES.reduce((result, key) => {
    const items = presets[key]
    result[key] = Array.isArray(items)
      ? items.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : []
    return result
  }, {} as Live2DExpressionTypePresetMap)
}

export function isLive2DExpressionType(value: string): value is Live2DExpressionType {
  return (LIVE2D_EXPRESSION_TYPES as readonly string[]).includes(value)
}
