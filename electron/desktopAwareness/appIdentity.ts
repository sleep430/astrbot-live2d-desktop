import path from 'path'
import type { WindowInfo } from '../utils/windowWatcher'
import type { AppIdentity } from './types'

const KNOWN_APP_ALIASES: Array<{
  canonicalKey: string
  displayName: string
  aliases: string[]
}> = [
  {
    canonicalKey: 'chrome',
    displayName: 'Chrome',
    aliases: ['chrome', 'chrome.exe', 'google chrome', 'com.google.chrome', 'google-chrome']
  },
  {
    canonicalKey: 'edge',
    displayName: 'Microsoft Edge',
    aliases: ['msedge', 'msedge.exe', 'microsoft edge', 'com.microsoft.edgemac']
  },
  {
    canonicalKey: 'firefox',
    displayName: 'Firefox',
    aliases: ['firefox', 'firefox.exe', 'mozilla firefox', 'org.mozilla.firefox']
  },
  {
    canonicalKey: 'vscode',
    displayName: 'VS Code',
    aliases: ['code', 'code.exe', 'visual studio code', 'com.microsoft.vscode']
  },
  {
    canonicalKey: 'wechat',
    displayName: 'WeChat',
    aliases: ['wechat', 'wechat.exe', 'weixin', 'weixin.exe', '微信', 'com.tencent.xinwechat']
  },
  {
    canonicalKey: 'qq',
    displayName: 'QQ',
    aliases: ['qq', 'qq.exe', '腾讯qq', 'com.tencent.qq']
  }
]

const SYSTEM_APP_ALIASES = [
  'action center',
  'calculator',
  'calendar',
  'csrss',
  'csrss.exe',
  'desktop window manager',
  'dwm',
  'dwm.exe',
  'explorer',
  'explorer.exe',
  'file explorer',
  'input indicator',
  'lock screen',
  'lockapp',
  'mail',
  'microsoft store',
  'microsoft text input application',
  'notification center',
  'photos',
  'program manager',
  'screenclippinghost',
  'screenclippinghost.exe',
  'search',
  'searchui.exe',
  'settings',
  'shellexperiencehost.exe',
  'snipping tool',
  'snippingtool.exe',
  'start',
  'startmenuexperiencehost.exe',
  'task manager',
  'task switching',
  'task view',
  'textinputhost.exe',
  'windows default lock screen',
  'windows explorer',
  'windows input experience',
  'windows security',
  'windows shell experience host',
  '文件资源管理器',
  '资源管理器',
  '锁屏'
]

function normalizeToken(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\\/g, '/')
    .replace(/\s+/g, ' ')
}

function stripExecutableExtension(value: string): string {
  return value.replace(/\.(exe|app|bin)$/i, '')
}

function titleCaseFallback(value: string): string {
  const cleaned = stripExecutableExtension(value)
    .replace(/[-_.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return 'Unknown App'
  if (/^[A-Z0-9\s]+$/.test(cleaned) && cleaned.length <= 6) return cleaned

  return cleaned.replace(/\b\w/g, char => char.toUpperCase())
}

function getBaseName(value: string): string {
  const normalized = value.replace(/\\/g, '/')
  return path.posix.basename(normalized)
}

function uniqueTokens(tokens: string[]): string[] {
  return Array.from(new Set(tokens.map(normalizeToken).filter(Boolean)))
}

function findKnownApp(tokens: string[]) {
  const tokenSet = new Set(tokens)
  return KNOWN_APP_ALIASES.find(entry =>
    entry.aliases.some(alias => tokenSet.has(normalizeToken(alias)))
  )
}

export function toAppMatchKey(value: string): string {
  return stripExecutableExtension(normalizeToken(value))
}

export function resolveAppIdentity(input: {
  processName?: string
  processPath?: string
  title?: string
  bundleId?: string
  appId?: string
}): AppIdentity {
  const processName = String(input.processName || '').trim()
  const processPath = String(input.processPath || '').trim()
  const title = String(input.title || '').trim()
  const pathBaseName = processPath ? getBaseName(processPath) : ''

  const rawTokens = uniqueTokens([
    processName,
    pathBaseName,
    stripExecutableExtension(processName),
    stripExecutableExtension(pathBaseName),
    input.bundleId || '',
    input.appId || ''
  ])

  const knownApp = findKnownApp(rawTokens)
  const canonicalKey =
    knownApp?.canonicalKey ||
    toAppMatchKey(processName || pathBaseName || input.appId || input.bundleId || title)
  const displayName =
    knownApp?.displayName || titleCaseFallback(processName || pathBaseName || title || canonicalKey)

  const matchKeys = uniqueTokens([
    canonicalKey,
    processName,
    stripExecutableExtension(processName),
    pathBaseName,
    stripExecutableExtension(pathBaseName),
    input.bundleId || '',
    input.appId || '',
    ...(knownApp?.aliases || [])
  ])

  const systemTokens = new Set(SYSTEM_APP_ALIASES.map(normalizeToken))
  const isSystem = matchKeys.some(token => systemTokens.has(token)) || !canonicalKey

  return {
    displayName,
    canonicalKey,
    processName,
    processPath,
    bundleId: input.bundleId,
    appId: input.appId,
    matchKeys,
    confidence: knownApp ? 'high' : processName || pathBaseName ? 'medium' : 'low',
    isSystem
  }
}

export function resolveWindowAppIdentity(window: WindowInfo): AppIdentity {
  return resolveAppIdentity({
    processName: window.processName,
    processPath: window.processPath,
    title: window.title
  })
}

export function appMatchesTokens(app: AppIdentity, rawMatchers: string[]): boolean {
  const appTokens = new Set(app.matchKeys.map(toAppMatchKey))
  return rawMatchers
    .map(toAppMatchKey)
    .filter(Boolean)
    .some(matcher => appTokens.has(matcher) || app.matchKeys.some(token => token.includes(matcher)))
}
