import { createRequire } from 'module'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

const nodeRequire = createRequire(import.meta.url)

let cachedBinding: any = null
let cachedActiveWinModule: any = null
let loadAttempted = false

function findBindingPath(): string | null {
  const platform = process.platform
  const arch = process.arch
  const fileName = 'node-active-win.node'

  const appPath = app.getAppPath()
  // asarUnpack: ["**/*.node"] 将 .node 文件提取到 app.asar.unpacked/
  const unpackedBase = appPath.replace('app.asar', 'app.asar.unpacked')

  const bindingRoots = [
    path.join(unpackedBase, 'node_modules', 'active-win', 'lib', 'binding'),
    path.join(appPath, 'node_modules', 'active-win', 'lib', 'binding')
  ]

  const candidates: Array<{ napi: number; path: string }> = []
  for (const root of bindingRoots) {
    try {
      if (!fs.existsSync(root)) continue
      for (const dirName of fs.readdirSync(root)) {
        const match = dirName.match(/^napi-(\d+)-(.+)-(.+)-(.+)$/)
        if (!match) continue
        const [, napiVersion, dirPlatform, , dirArch] = match
        if (dirPlatform !== platform || dirArch !== arch) continue
        const bindingPath = path.join(root, dirName, fileName)
        if (fs.existsSync(bindingPath)) {
          candidates.push({ napi: Number(napiVersion), path: bindingPath })
        }
      }
    } catch {
      // ASAR 内 existsSync/readdirSync 可能抛异常，忽略
    }
  }

  candidates.sort((a, b) => b.napi - a.napi)
  return candidates[0]?.path || null
}

function loadBinding(): any {
  if (loadAttempted) return cachedBinding
  loadAttempted = true

  const bindingPath = findBindingPath()
  if (!bindingPath) {
    console.warn('[active-win] native binding 未找到，窗口检测不可用')
    return null
  }

  try {
    cachedBinding = nodeRequire(bindingPath)
    console.log('[active-win] native binding 加载成功:', bindingPath)
  } catch (err) {
    console.warn('[active-win] native binding 加载失败:', err)
  }

  return cachedBinding
}

/**
 * 获取当前活跃窗口信息，返回值与 active-win 包一致
 */
export async function getActiveWindow(): Promise<any | undefined> {
  if (process.platform === 'win32') {
    const binding = loadBinding()
    if (binding?.getActiveWindow) {
      try {
        return binding.getActiveWindow()
      } catch {
        return undefined
      }
    }
  }

  try {
    if (!cachedActiveWinModule) {
      cachedActiveWinModule = await import('active-win')
    }
    if (typeof cachedActiveWinModule.activeWindow !== 'function') return undefined
    return await cachedActiveWinModule.activeWindow()
  } catch {
    return undefined
  }
}

/**
 * 安全版本：出错时返回 null
 */
export async function safeGetActiveWindow(): Promise<any | null> {
  try {
    return (await getActiveWindow()) ?? null
  } catch {
    return null
  }
}
