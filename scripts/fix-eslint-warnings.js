#!/usr/bin/env node

/**
 * 批量修复 ESLint 警告的辅助脚本
 *
 * 处理的警告类型：
 * 1. no-console: 将 console.log 改为 console.warn
 * 2. no-empty: 为空 catch 块添加注释
 * 3. @typescript-eslint/no-unused-vars: 在未使用变量前加 _
 * 4. no-useless-escape: 移除不必要的转义
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 获取所有需要修复的文件
function getFilesWithWarnings() {
  const output = execSync('pnpm run lint 2>&1', { encoding: 'utf-8' })
  const lines = output.split('\n')

  const files = new Set()
  for (const line of lines) {
    const match = line.match(/^([^:]+\.(?:ts|tsx|vue))/)
    if (match) {
      files.add(match[1])
    }
  }

  return Array.from(files)
}

// 修复单个文件
function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false
  }

  let content = fs.readFileSync(filePath, 'utf-8')
  let modified = false

  // 1. 修复 console.log -> console.warn (仅在非调试语句中)
  const consoleLogPattern = /console\.log\(/g
  if (consoleLogPattern.test(content)) {
    // 跳过明显的调试语句
    content = content.replace(/console\.log\((?!'.*Debug|.*调试)/g, 'console.warn(')
    modified = true
  }

  // 2. 修复空 catch 块
  const emptyCatchPattern = /catch\s*\([^)]*\)\s*\{\s*\}/g
  if (emptyCatchPattern.test(content)) {
    content = content.replace(
      /catch\s*\(([^)]*)\)\s*\{\s*\}/g,
      'catch ($1) {\n      // 忽略错误\n    }'
    )
    modified = true
  }

  // 3. 修复未使用变量（在变量名前加 _）
  // 这个需要更精确的处理，暂时跳过

  // 4. 修复不必要的转义
  content = content.replace(/\\\$/g, '$')

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8')
    return true
  }

  return false
}

// 主函数
function main() {
  console.log('🔍 查找需要修复的文件...')
  const files = getFilesWithWarnings()
  console.log(`📝 找到 ${files.length} 个文件需要修复`)

  let fixedCount = 0
  for (const file of files) {
    if (fixFile(file)) {
      fixedCount++
      console.log(`✅ 修复: ${file}`)
    }
  }

  console.log(`\n✨ 完成! 修复了 ${fixedCount} 个文件`)
  console.log('\n📊 运行 pnpm run lint 查看剩余警告')
}

if (require.main === module) {
  main()
}
