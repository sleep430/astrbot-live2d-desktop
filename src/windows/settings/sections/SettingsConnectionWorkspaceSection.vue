<template>
  <section class="settings-section">
    <div class="settings-section__header">
      <h2>{{ $t('settings.menu.connection.workspace') }}</h2>
    </div>
    <p class="settings-section__desc">{{ $t('settings.connection.workspace.description') }}</p>

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
  </section>
</template>

<script setup lang="ts">
import { useConnectionSettingsDomain } from '../domains/createConnectionSettingsDomain'
import { useModelSettingsDomain } from '../domains/createModelSettingsDomain'

const { workspaceRows } = useConnectionSettingsDomain()
const { currentModelDisplay, sourceColor } = useModelSettingsDomain()
</script>
