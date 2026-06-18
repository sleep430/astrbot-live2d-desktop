import fs from 'fs/promises'
import path from 'path'
import { getAppDataPath } from '../utils/appPaths'
import type { WindowWatcherConfig } from '../utils/windowWatcherConfig'
import { loadConfig as loadLegacyWatcherConfig } from '../utils/windowWatcherConfig'
import type {
  DesktopAwarenessMode,
  DesktopAwarenessScopeMode,
  DesktopAwarenessSettings
} from './types'

export const DEFAULT_DESKTOP_AWARENESS_SETTINGS: DesktopAwarenessSettings = {
  enabled: true,
  mode: 'smart',
  appScope: {
    mode: 'all',
    apps: []
  },
  privacy: {
    shareWindowTitle: false,
    allowScreenshotOnRequest: true
  }
}

const MODE_SET = new Set<DesktopAwarenessMode>(['quiet', 'smart', 'active'])
const SCOPE_MODE_SET = new Set<DesktopAwarenessScopeMode>(['all', 'include', 'exclude'])

function getConfigPath(): string {
  return path.join(getAppDataPath(), 'desktop-awareness-config.json')
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map(item => item.trim())
        .filter(Boolean)
    )
  )
}

export function validateDesktopAwarenessSettings(
  config: Partial<DesktopAwarenessSettings> | null | undefined
): DesktopAwarenessSettings {
  const source = config && typeof config === 'object' ? config : {}
  const appScope: Partial<DesktopAwarenessSettings['appScope']> =
    source.appScope && typeof source.appScope === 'object' ? source.appScope : {}
  const privacy: Partial<DesktopAwarenessSettings['privacy']> =
    source.privacy && typeof source.privacy === 'object' ? source.privacy : {}

  const mode = MODE_SET.has(source.mode as DesktopAwarenessMode)
    ? (source.mode as DesktopAwarenessMode)
    : DEFAULT_DESKTOP_AWARENESS_SETTINGS.mode
  const scopeMode = SCOPE_MODE_SET.has(appScope.mode as DesktopAwarenessScopeMode)
    ? (appScope.mode as DesktopAwarenessScopeMode)
    : DEFAULT_DESKTOP_AWARENESS_SETTINGS.appScope.mode

  return {
    enabled:
      typeof source.enabled === 'boolean'
        ? source.enabled
        : DEFAULT_DESKTOP_AWARENESS_SETTINGS.enabled,
    mode,
    appScope: {
      mode: scopeMode,
      apps: normalizeStringList(appScope.apps)
    },
    privacy: {
      shareWindowTitle:
        typeof privacy.shareWindowTitle === 'boolean'
          ? privacy.shareWindowTitle
          : DEFAULT_DESKTOP_AWARENESS_SETTINGS.privacy.shareWindowTitle,
      allowScreenshotOnRequest:
        typeof privacy.allowScreenshotOnRequest === 'boolean'
          ? privacy.allowScreenshotOnRequest
          : DEFAULT_DESKTOP_AWARENESS_SETTINGS.privacy.allowScreenshotOnRequest
    }
  }
}

export function migrateLegacyWatcherConfig(legacy: WindowWatcherConfig): DesktopAwarenessSettings {
  const mode: DesktopAwarenessMode = (() => {
    if (!legacy.appLaunchEnabled) return 'quiet'
    if (legacy.aiResponse.mode === 'every-switch') return 'active'
    return 'smart'
  })()

  return validateDesktopAwarenessSettings({
    enabled: legacy.enabled,
    mode,
    appScope: {
      mode: legacy.aiResponse.mode === 'specific-apps' ? 'include' : 'all',
      apps:
        legacy.aiResponse.mode === 'specific-apps'
          ? legacy.aiResponse.specificApps
          : legacy.ignore.processNames
    },
    privacy: DEFAULT_DESKTOP_AWARENESS_SETTINGS.privacy
  })
}

export function toLegacyWatcherConfig(
  settings: DesktopAwarenessSettings,
  base?: WindowWatcherConfig
): WindowWatcherConfig {
  const throttle =
    settings.mode === 'active'
      ? { globalInterval: 250, perWindowInterval: 500, minInterval: 50 }
      : { globalInterval: 1000, perWindowInterval: 1000, minInterval: 100 }

  return {
    ...(base || ({} as WindowWatcherConfig)),
    enabled: settings.enabled,
    appLaunchEnabled: false,
    throttle,
    events: {
      focus: true,
      blur: false,
      create: false,
      destroy: false,
      fullscreen: true,
      windowed: true,
      resize: false,
      move: false,
      minimize: false,
      maximize: true,
      restore: true
    },
    ignore: {
      processNames: [],
      titleKeywords: []
    },
    aiResponse: {
      mode: 'every-switch',
      specificApps: []
    }
  }
}

export async function loadDesktopAwarenessSettings(): Promise<DesktopAwarenessSettings> {
  try {
    const content = await fs.readFile(getConfigPath(), 'utf-8')
    return validateDesktopAwarenessSettings(JSON.parse(content))
  } catch {
    const legacy = await loadLegacyWatcherConfig()
    const migrated = migrateLegacyWatcherConfig(legacy)
    return saveDesktopAwarenessSettings(migrated)
  }
}

export async function saveDesktopAwarenessSettings(
  config: DesktopAwarenessSettings
): Promise<DesktopAwarenessSettings> {
  const validated = validateDesktopAwarenessSettings(config)
  const configPath = getConfigPath()
  await fs.mkdir(path.dirname(configPath), { recursive: true })
  await fs.writeFile(configPath, JSON.stringify(validated, null, 2), 'utf-8')
  return validated
}

export async function resetDesktopAwarenessSettings(): Promise<DesktopAwarenessSettings> {
  return saveDesktopAwarenessSettings(DEFAULT_DESKTOP_AWARENESS_SETTINGS)
}
