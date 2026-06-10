<template>
  <SettingsPageScaffold>
    <SettingsSubsection>
      <n-form label-placement="top">
        <n-form-item :label="$t('settings.advanced.shortcut.recordingShortcut')">
          <div class="shortcut-row">
            <n-input
              v-model:value="advancedSettings.recordingShortcut"
              :placeholder="$t('settings.advanced.shortcut.pressKeys')"
              readonly
              @keydown="handleShortcutKeyDown"
            />
            <n-button @click="handleClearShortcut">{{
              $t('settings.advanced.shortcut.clear')
            }}</n-button>
            <n-button type="primary" @click="handleRegisterShortcut">
              {{
                shortcutRegistered
                  ? $t('settings.advanced.shortcut.registered')
                  : $t('settings.advanced.shortcut.register')
              }}
            </n-button>
          </div>
        </n-form-item>
        <n-form-item :label="$t('settings.advanced.shortcut.maxDuration')">
          <n-space align="center">
            <n-input-number
              v-model:value="recordingSecondsValue"
              :min="1"
              :max="60"
              :precision="0"
              @update:value="applyAdvancedSettingChange"
            />
            <span>{{ $t('settings.advanced.shortcut.maxDurationHint') }}</span>
          </n-space>
        </n-form-item>
      </n-form>
    </SettingsSubsection>
  </SettingsPageScaffold>
</template>

<script setup lang="ts">
import SettingsPageScaffold from '../shared/SettingsPageScaffold.vue'
import SettingsSubsection from '../shared/SettingsSubsection.vue'
import { useAdvancedSettingsDomain } from '../domains/createAdvancedSettingsDomain'

const {
  advancedSettings,
  applyAdvancedSettingChange,
  handleClearShortcut,
  handleRegisterShortcut,
  handleShortcutKeyDown,
  recordingSecondsValue,
  shortcutRegistered
} = useAdvancedSettingsDomain()
</script>

<style scoped>
.shortcut-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.shortcut-row :deep(.n-input) {
  flex: 1;
  min-width: 160px;
}
</style>
