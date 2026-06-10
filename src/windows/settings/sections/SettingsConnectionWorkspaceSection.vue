<template>
  <SettingsPageScaffold>
    <SettingsSubsection>
      <div class="settings-kv-list">
        <div v-for="row in workspaceRows" :key="row.label" class="settings-kv-list__row">
          <span>{{ row.label }}</span>
          <strong>{{ row.value }}</strong>
        </div>
        <div class="settings-kv-list__row">
          <span>{{ $t('settings.connection.workspace.currentModel') }}</span>
          <strong>{{ currentModelDisplay }}</strong>
        </div>
        <div class="settings-kv-list__row">
          <span>{{ $t('settings.connection.workspace.sourceColor') }}</span>
          <strong>{{ sourceColor.toUpperCase() }}</strong>
        </div>
      </div>
    </SettingsSubsection>
  </SettingsPageScaffold>
</template>

<script setup lang="ts">
import SettingsPageScaffold from '../shared/SettingsPageScaffold.vue'
import SettingsSubsection from '../shared/SettingsSubsection.vue'
import { useConnectionSettingsDomain } from '../domains/createConnectionSettingsDomain'
import { useModelSettingsDomain } from '../domains/createModelSettingsDomain'

const { workspaceRows } = useConnectionSettingsDomain()
const { currentModelDisplay, sourceColor } = useModelSettingsDomain()
</script>
