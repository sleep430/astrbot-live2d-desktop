import { ipcMain } from 'electron'
import { setMainLocale } from '../../src/i18n/mainProcess'
import type { SupportedLocale } from '../../src/i18n'

ipcMain.handle('locale:set', async (_event, locale: string) => {
  if (locale === 'zh-CN' || locale === 'en') {
    setMainLocale(locale as SupportedLocale)
  }
  return { success: true }
})
