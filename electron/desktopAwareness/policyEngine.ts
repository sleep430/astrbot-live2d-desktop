import { appMatchesTokens } from './appIdentity'
import type {
  DesktopAwarenessSettings,
  DesktopAwarenessTransitionType,
  DesktopContextSnapshot
} from './types'

interface PolicyProfile {
  proactiveEvents: boolean
  minDwellMs: number
  cooldownMs: number
  burstWindowMs: number
  burstThreshold: number
}

export interface AwarenessDecision {
  shouldNotify: boolean
  reason: string
}

function getProfile(settings: DesktopAwarenessSettings): PolicyProfile {
  switch (settings.mode) {
    case 'quiet':
      return {
        proactiveEvents: false,
        minDwellMs: 0,
        cooldownMs: Number.POSITIVE_INFINITY,
        burstWindowMs: 20_000,
        burstThreshold: 4
      }
    case 'active':
      return {
        proactiveEvents: true,
        minDwellMs: 1_000,
        cooldownMs: 15_000,
        burstWindowMs: 10_000,
        burstThreshold: 6
      }
    case 'smart':
    default:
      return {
        proactiveEvents: true,
        minDwellMs: 2_500,
        cooldownMs: 90_000,
        burstWindowMs: 20_000,
        burstThreshold: 4
      }
  }
}

export class AwarenessPolicyEngine {
  private lastNotifiedAtByApp = new Map<string, number>()
  private recentSwitchTimestamps: number[] = []

  reset(): void {
    this.lastNotifiedAtByApp.clear()
    this.recentSwitchTimestamps = []
  }

  getMinDwellMs(settings: DesktopAwarenessSettings): number {
    return getProfile(settings).minDwellMs
  }

  evaluate(options: {
    settings: DesktopAwarenessSettings
    snapshot: DesktopContextSnapshot
    previousSnapshot: DesktopContextSnapshot | null
    transitionType: DesktopAwarenessTransitionType
    dwellMs: number
    now: number
  }): AwarenessDecision {
    const { settings, snapshot, previousSnapshot, transitionType, dwellMs, now } = options
    const app = snapshot.app
    const profile = getProfile(settings)

    if (!settings.enabled) return { shouldNotify: false, reason: 'desktop_awareness_disabled' }
    if (!profile.proactiveEvents) return { shouldNotify: false, reason: 'quiet_mode' }
    if (!app) return { shouldNotify: false, reason: 'no_active_app' }
    if (app.isSystem) return { shouldNotify: false, reason: 'system_app' }
    if (dwellMs < profile.minDwellMs) return { shouldNotify: false, reason: 'dwell_too_short' }

    if (settings.appScope.mode === 'include' && !appMatchesTokens(app, settings.appScope.apps)) {
      return { shouldNotify: false, reason: 'outside_include_scope' }
    }
    if (settings.appScope.mode === 'exclude' && appMatchesTokens(app, settings.appScope.apps)) {
      return { shouldNotify: false, reason: 'inside_exclude_scope' }
    }

    const sameApp = previousSnapshot?.app?.canonicalKey === app.canonicalKey
    if (sameApp && settings.mode !== 'active' && transitionType === 'window-switch') {
      return { shouldNotify: false, reason: 'same_app_window_switch' }
    }

    this.recentSwitchTimestamps.push(now)
    const cutoff = now - profile.burstWindowMs
    this.recentSwitchTimestamps = this.recentSwitchTimestamps.filter(ts => ts >= cutoff)
    if (this.recentSwitchTimestamps.length > profile.burstThreshold) {
      return { shouldNotify: false, reason: 'switch_burst_suppressed' }
    }

    const lastNotifiedAt = this.lastNotifiedAtByApp.get(app.canonicalKey) || 0
    if (now - lastNotifiedAt < profile.cooldownMs) {
      return { shouldNotify: false, reason: 'cooldown' }
    }

    this.lastNotifiedAtByApp.set(app.canonicalKey, now)
    return { shouldNotify: true, reason: 'context_changed' }
  }
}
