import type { ResolvedColorScheme } from '@/stores/appearance'

/** 浅色：纸感、高对比正文 */
const LIGHT: Record<string, string> = {
  '--settings-bg-base': '#f0eeea',
  '--settings-bg-elevated': '#ffffff',
  '--settings-bg-sidebar': '#f7f6f3',
  '--settings-bg-content': '#f4f3f0',
  '--settings-bg-surface': '#ffffff',
  '--settings-bg-surface-hover': '#ebe9e4',
  '--settings-bg-active': 'rgba(var(--color-accent-rgb), 0.12)',
  '--settings-border': 'rgba(15, 23, 42, 0.1)',
  '--settings-border-strong': 'rgba(15, 23, 42, 0.16)',
  '--settings-text-muted': 'rgba(15, 23, 42, 0.5)',
  '--settings-shadow': '0 4px 24px rgba(15, 23, 42, 0.07)',
  '--settings-hero-glow': 'rgba(var(--color-accent-rgb), 0.1)',
  '--settings-titlebar-bg': '#faf9f7',
  '--settings-mesh-1': 'rgba(var(--color-accent-rgb), 0.06)',
  '--settings-mesh-2': 'rgba(148, 130, 220, 0.05)',
  '--settings-control-bg': '#ffffff',
  '--settings-control-border': 'rgba(15, 23, 42, 0.14)',
  '--desktop-panel-bg': '#ffffff',
  '--desktop-panel-border': 'rgba(15, 23, 42, 0.1)',
  '--desktop-panel-border-strong': 'rgba(15, 23, 42, 0.16)',
  '--desktop-divider': 'rgba(15, 23, 42, 0.08)',
  '--desktop-shadow': '0 4px 20px rgba(15, 23, 42, 0.07)',
  '--color-text-primary': '#0f172a',
  '--color-text-secondary': '#334155',
  '--color-text-tertiary': '#64748b'
}

/**
 * 暗色：冷灰蓝「编辑台」风格，非旧暖棕；面板与控件不透明，保证可读性
 */
const DARK: Record<string, string> = {
  '--settings-bg-base': '#121820',
  '--settings-bg-elevated': '#1a2230',
  '--settings-bg-sidebar': '#151c28',
  '--settings-bg-content': '#141a26',
  '--settings-bg-surface': '#1e2634',
  '--settings-bg-surface-hover': '#283244',
  '--settings-bg-active': 'rgba(var(--color-accent-rgb), 0.16)',
  '--settings-border': 'rgba(226, 232, 240, 0.1)',
  '--settings-border-strong': 'rgba(226, 232, 240, 0.16)',
  '--settings-text-muted': 'rgba(203, 213, 225, 0.55)',
  '--settings-shadow': '0 8px 32px rgba(0, 0, 0, 0.4)',
  '--settings-hero-glow': 'rgba(var(--color-accent-rgb), 0.14)',
  '--settings-titlebar-bg': '#151c28',
  '--settings-mesh-1': 'rgba(var(--color-accent-rgb), 0.08)',
  '--settings-mesh-2': 'rgba(99, 102, 241, 0.06)',
  '--settings-control-bg': '#222a38',
  '--settings-control-border': 'rgba(226, 232, 240, 0.14)',
  '--desktop-panel-bg': '#1e2634',
  '--desktop-panel-border': 'rgba(226, 232, 240, 0.1)',
  '--desktop-panel-border-strong': 'rgba(226, 232, 240, 0.16)',
  '--desktop-divider': 'rgba(226, 232, 240, 0.08)',
  '--desktop-shadow': '0 8px 28px rgba(0, 0, 0, 0.35)',
  '--color-text-primary': '#f8fafc',
  '--color-text-secondary': '#cbd5e1',
  '--color-text-tertiary': '#94a3b8'
}

export function buildSettingsAppearanceCssVars(
  scheme: ResolvedColorScheme
): Record<string, string> {
  return scheme === 'light' ? { ...LIGHT } : { ...DARK }
}

export function applySettingsAppearanceClass(scheme: ResolvedColorScheme): void {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.classList.toggle('color-scheme-light', scheme === 'light')
  document.documentElement.classList.toggle('color-scheme-dark', scheme === 'dark')
}
