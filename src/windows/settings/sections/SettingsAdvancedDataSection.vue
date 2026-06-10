<template>
  <SettingsPageScaffold>
    <SettingsSubsection>
      <div class="settings-section__actions">
        <n-button @click="handleOpenLogs">{{ $t('settings.advanced.data.openLogs') }}</n-button>
        <n-button @click="handleExportLogs">{{ $t('settings.advanced.data.exportLogs') }}</n-button>
        <n-button @click="handleDownloadCubismCore">{{
          $t('settings.advanced.data.downloadCubismCore')
        }}</n-button>
        <n-button @click="handleExportConfig">{{
          $t('settings.advanced.data.exportConfig')
        }}</n-button>
        <n-button @click="handleImportConfig">{{
          $t('settings.advanced.data.importConfig')
        }}</n-button>
        <n-button @click="handleClearCache">{{ $t('settings.advanced.data.clearCache') }}</n-button>
        <n-button type="error" @click="handleResetSettings">{{
          $t('settings.advanced.data.resetSettings')
        }}</n-button>
      </div>
    </SettingsSubsection>
  </SettingsPageScaffold>
</template>

<script setup lang="ts">
import SettingsPageScaffold from '../shared/SettingsPageScaffold.vue'
import SettingsSubsection from '../shared/SettingsSubsection.vue'
import { useMaintenanceSettingsDomain } from '../domains/createMaintenanceSettingsDomain'

const {
  handleClearCache,
  handleDownloadCubismCore,
  handleExportConfig,
  handleExportLogs,
  handleImportConfig,
  handleOpenLogs,
  handleResetSettings
} = useMaintenanceSettingsDomain()
</script>
