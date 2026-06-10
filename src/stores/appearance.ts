import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { readJsonStorage, writeJsonStorage } from '@/utils/storage'

export type ColorSchemePreference = 'light' | 'dark' | 'system'
export type ResolvedColorScheme = 'light' | 'dark'

const STORAGE_KEY = 'astrbot-live2d:appearance'
const STORAGE_VERSION = 1

type PersistedAppearance = {
  colorScheme: ColorSchemePreference
  settingsSidebarCollapsed: boolean
}

function readPersisted(): PersistedAppearance {
  if (typeof window === 'undefined') {
    return { colorScheme: 'light', settingsSidebarCollapsed: false }
  }

  return readJsonStorage(STORAGE_KEY, {
    fallback: { colorScheme: 'light', settingsSidebarCollapsed: false },
    normalize: value => {
      const parsed =
        value && typeof value === 'object' ? (value as Partial<PersistedAppearance>) : {}
      const scheme = parsed.colorScheme
      const colorScheme: ColorSchemePreference =
        scheme === 'dark' || scheme === 'system' || scheme === 'light' ? scheme : 'light'

      return {
        colorScheme,
        settingsSidebarCollapsed: Boolean(parsed.settingsSidebarCollapsed)
      }
    },
    version: STORAGE_VERSION
  })
}

function getSystemScheme(): ResolvedColorScheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

let systemMediaQuery: MediaQueryList | null = null
let systemListenerBound = false

export const useAppearanceStore = defineStore('appearance', () => {
  const persisted = readPersisted()
  const colorSchemePreference = ref<ColorSchemePreference>(persisted.colorScheme)
  const settingsSidebarCollapsed = ref(persisted.settingsSidebarCollapsed)
  const systemScheme = ref<ResolvedColorScheme>(getSystemScheme())

  const resolvedColorScheme = computed<ResolvedColorScheme>(() => {
    if (colorSchemePreference.value === 'system') {
      return systemScheme.value
    }

    return colorSchemePreference.value
  })

  function persist() {
    if (typeof window === 'undefined') {
      return
    }

    writeJsonStorage(
      STORAGE_KEY,
      {
        colorScheme: colorSchemePreference.value,
        settingsSidebarCollapsed: settingsSidebarCollapsed.value
      },
      { version: STORAGE_VERSION }
    )
  }

  function setColorSchemePreference(value: ColorSchemePreference) {
    colorSchemePreference.value = value
    persist()
  }

  function setSettingsSidebarCollapsed(value: boolean) {
    settingsSidebarCollapsed.value = value
    persist()
  }

  function toggleSettingsSidebarCollapsed() {
    setSettingsSidebarCollapsed(!settingsSidebarCollapsed.value)
  }

  function bindSystemSchemeListener() {
    if (typeof window === 'undefined' || !window.matchMedia || systemListenerBound) {
      return
    }

    systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      systemScheme.value = getSystemScheme()
    }

    systemMediaQuery.addEventListener('change', handler)
    systemListenerBound = true
    systemScheme.value = getSystemScheme()
  }

  return {
    colorSchemePreference,
    resolvedColorScheme,
    settingsSidebarCollapsed,
    setColorSchemePreference,
    setSettingsSidebarCollapsed,
    toggleSettingsSidebarCollapsed,
    bindSystemSchemeListener
  }
})
