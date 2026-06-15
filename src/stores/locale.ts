import { defineStore } from 'pinia'
import { ref, watch, getCurrentInstance } from 'vue'
import type { SupportedLocale } from '@/i18n'

const STORAGE_KEY = 'app_locale'

function detectLocale(): SupportedLocale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh-CN' || stored === 'en') return stored
  } catch {
    // localStorage may be unavailable
  }
  if (typeof navigator !== 'undefined' && navigator.language.startsWith('zh')) return 'zh-CN'
  return 'en'
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<SupportedLocale>(detectLocale())

  function applyLocale(val: SupportedLocale) {
    try {
      localStorage.setItem(STORAGE_KEY, val)
    } catch {
      // ignore
    }
    document.documentElement.lang = val
  }

  // Apply on creation
  applyLocale(locale.value)

  watch(locale, val => {
    applyLocale(val)
  })

  // Sync with vue-i18n instance (called after i18n plugin is installed)
  function bindI18n() {
    try {
      const instance = getCurrentInstance()
      const i18n = instance?.appContext.config.globalProperties.$i18n
      if (i18n && i18n.locale) {
        watch(
          locale,
          val => {
            i18n.locale = val as 'en' | 'zh-CN'
          },
          { immediate: true }
        )
      }
    } catch {
      // i18n may not be available yet during initial app setup
    }
  }

  function setLocale(next: SupportedLocale) {
    locale.value = next
  }

  return { locale, setLocale, bindI18n }
})
