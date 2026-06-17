import { BrowserWindow, type WebContents } from 'electron'

export type ModelConfigChangedPayload = {
  modelPath: string
  configPath?: string
  deleted?: boolean
}

export function notifyModelConfigChanged(
  payload: ModelConfigChangedPayload,
  options: { excludeWebContents?: WebContents } = {}
) {
  for (const window of BrowserWindow.getAllWindows()) {
    if (window.webContents === options.excludeWebContents) {
      continue
    }
    window.webContents.send('modelConfig:changed', payload)
  }
}
