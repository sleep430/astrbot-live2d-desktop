import { describe, expect, it } from 'vitest'

import { collectPersistentExpressionOps, parseExp3Text } from '../src/utils/cubism/exp3Parser'

describe('parseExp3Text', () => {
  it('parses exp3 parameters and normalizes blend types', () => {
    const parsed = parseExp3Text(
      JSON.stringify({
        FadeInTime: 0.5,
        FadeOutTime: 1.25,
        Parameters: [
          { Id: 'ParamMouthOpenY', Value: 0.8, Blend: 'Add' },
          { Id: 'ParamEyeLOpen', Value: 0.5, Blend: 'Multiply' },
          { Id: 'ParamEyeROpen', Value: 0.25, Blend: 'Set' }
        ]
      }),
      'smile',
      'smile.exp3.json'
    )

    expect(parsed.id).toBe('smile')
    expect(parsed.file).toBe('smile.exp3.json')
    expect(parsed.fadeInMs).toBe(500)
    expect(parsed.fadeOutMs).toBe(1250)
    expect(parsed.parameterIds).toEqual(['ParamMouthOpenY', 'ParamEyeLOpen', 'ParamEyeROpen'])
    expect(parsed.blendSummary).toEqual({
      additive: 1,
      multiply: 1,
      overwrite: 1
    })
    expect(parsed.parseWarnings).toEqual([])
  })

  it('returns warnings for invalid payloads', () => {
    const parsed = parseExp3Text('{', 'broken', 'broken.exp3.json')

    expect(parsed.parameters).toEqual([])
    expect(parsed.parseWarnings).toEqual([
      expect.stringContaining('表情文件解析失败'),
      '表情文件缺少 Parameters 数组'
    ])
  })
})

describe('collectPersistentExpressionOps', () => {
  const watermark = parseExp3Text(
    JSON.stringify({ Parameters: [{ Id: 'Param85', Value: 1, Blend: 'Add' }] }),
    '水印开关',
    'exp/水印开关.exp3.json'
  )
  const blush = parseExp3Text(
    JSON.stringify({ Parameters: [{ Id: 'ParamBlush', Value: 1, Blend: 'Overwrite' }] }),
    'blush',
    'blush.exp3.json'
  )
  const sources = [
    { name: '水印开关', aliases: ['watermark'], parsed: watermark },
    { name: 'blush', aliases: [], parsed: blush },
    { name: 'broken', aliases: [], parsed: null }
  ]

  it('collects parameter ops for selected expressions by name', () => {
    const ops = collectPersistentExpressionOps(sources, ['水印开关'])

    expect(ops).toEqual([{ parameterId: 'Param85', blend: 'add', value: 1 }])
  })

  it('matches names case-insensitively and via aliases', () => {
    const ops = collectPersistentExpressionOps(sources, ['WATERMARK', 'BLUSH'])

    expect(ops).toEqual([
      { parameterId: 'Param85', blend: 'add', value: 1 },
      { parameterId: 'ParamBlush', blend: 'overwrite', value: 1 }
    ])
  })

  it('ignores unknown names, blanks and entries without parsed data', () => {
    const ops = collectPersistentExpressionOps(sources, ['missing', '', '  ', 'broken'])

    expect(ops).toEqual([])
  })
})
