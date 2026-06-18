<template>
  <n-modal
    v-model:show="visible"
    :mask-closable="true"
    transform-origin="center"
    @after-leave="query = ''"
  >
    <div
      class="settings-command-palette window-no-drag"
      role="dialog"
      :aria-label="$t('settings.search.placeholder')"
    >
      <div class="settings-command-palette__input-wrap">
        <Search :size="18" class="settings-command-palette__icon" />
        <input
          ref="inputRef"
          v-model="query"
          class="settings-command-palette__input"
          type="text"
          :placeholder="$t('settings.search.placeholder')"
          @keydown.down.prevent="moveHighlight(1)"
          @keydown.up.prevent="moveHighlight(-1)"
          @keydown.enter.prevent="selectHighlighted"
          @keydown.esc="visible = false"
        />
      </div>

      <ul class="settings-command-palette__list" role="listbox">
        <li
          v-for="(item, index) in filtered"
          :key="item.id"
          class="settings-command-palette__item"
          :class="{ 'settings-command-palette__item--active': index === highlightIndex }"
          role="option"
          @mouseenter="highlightIndex = index"
          @click="selectItem(item)"
        >
          <span class="settings-command-palette__item-title">{{ item.title }}</span>
          <span class="settings-command-palette__item-group">{{
            $t(`settings.menu.groupLabel.${item.group}`)
          }}</span>
        </li>
        <li v-if="filtered.length === 0" class="settings-command-palette__empty">
          {{ $t('settings.search.noResults') }}
        </li>
      </ul>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import {
  useSettingsSearchIndex,
  type SettingsSearchItem
} from '../composables/useSettingsSearchIndex'
import type { SettingsChildKey, SettingsGroupKey } from '../settingsMenu'

const visible = defineModel<boolean>('show', { required: true })

const emit = defineEmits<{
  (event: 'select', group: SettingsGroupKey, child: SettingsChildKey): void
}>()

const { filterItems } = useSettingsSearchIndex()
const query = ref('')
const highlightIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const filtered = computed(() => filterItems(query.value))

watch(query, () => {
  highlightIndex.value = 0
})

watch(visible, async open => {
  if (open) {
    highlightIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  }
})

function moveHighlight(delta: number) {
  if (filtered.value.length === 0) {
    return
  }

  highlightIndex.value =
    (highlightIndex.value + delta + filtered.value.length) % filtered.value.length
}

function selectItem(item: SettingsSearchItem) {
  emit('select', item.group, item.child)
  visible.value = false
}

function selectHighlighted() {
  const item = filtered.value[highlightIndex.value]
  if (item) {
    selectItem(item)
  }
}
</script>

<style scoped>
.settings-command-palette {
  width: min(480px, 92vw);
  padding: 0;
  border-radius: 16px;
  border: 1px solid var(--settings-border-strong);
  background: var(--settings-bg-elevated);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.5),
    0 8px 24px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
  animation: settings-palette-in 0.32s var(--ease-spring);
}

@keyframes settings-palette-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.settings-command-palette__input-wrap {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 15px 18px;
  border-bottom: 1px solid var(--settings-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent);
}

.settings-command-palette__icon {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  transition: color var(--duration-fast) var(--ease-out);
}

.settings-command-palette__input-wrap:focus-within .settings-command-palette__icon {
  color: var(--color-accent);
}

.settings-command-palette__input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  outline: none;
  letter-spacing: -0.005em;
}

.settings-command-palette__input::placeholder {
  color: var(--color-text-tertiary);
  font-weight: 400;
}

.settings-command-palette__list {
  list-style: none;
  margin: 0;
  padding: 8px;
  max-height: 320px;
  overflow-y: auto;
}

.settings-command-palette__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition:
    background var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.settings-command-palette__item:hover,
.settings-command-palette__item--active {
  background: var(--settings-bg-active);
  transform: translateX(2px);
}

.settings-command-palette__item--active {
  box-shadow: inset 0 0 0 1px rgba(var(--color-accent-rgb), 0.2);
}

.settings-command-palette__item-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
}

.settings-command-palette__item-group {
  font-size: 10.5px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.settings-command-palette__empty {
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-tertiary);
}
</style>
