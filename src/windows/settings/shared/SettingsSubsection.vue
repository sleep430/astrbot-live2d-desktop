<template>
  <section class="settings-section settings-subsection">
    <header v-if="title" class="settings-subsection__head">
      <h3>{{ title }}</h3>
      <slot name="actions" />
    </header>
    <p v-if="description" class="settings-section__desc">{{ description }}</p>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<style scoped>
.settings-subsection__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.settings-subsection__head h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  position: relative;
  padding-left: 11px;
  line-height: 1.4;
}

.settings-subsection__head h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 13px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--color-accent-hover), var(--color-accent));
  opacity: 0.85;
}
</style>
