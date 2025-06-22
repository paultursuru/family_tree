<template>
  <button
    @click.stop="$emit('click', $event)"
    class="action-btn"
    :class="colorClass"
    :title="title"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        :d="iconPath"
      ></path>
    </svg>
  </button>
</template>

<script lang="ts" setup>
interface Props {
  action: 'edit' | 'delete' | 'info'
  title?: string
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
})

const emit = defineEmits<Emits>()

// Icon paths for different actions
const iconPaths = {
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  delete:
    'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

// Color classes for different actions
const colorClasses = {
  edit: 'text-blue-600 hover:text-blue-800',
  delete: 'text-red-600 hover:text-red-800',
  info: 'text-gray-600 hover:text-gray-800',
}

// Default titles for different actions
const defaultTitles = {
  edit: 'Edit member',
  delete: 'Delete member',
  info: 'View details',
}

const iconPath = iconPaths[props.action]
const colorClass = colorClasses[props.action]
const title = props.title || defaultTitles[props.action]
</script>

<style scoped>
.action-btn {
  @apply p-1.5 rounded bg-gray-100/80 hover:bg-gray-200 transition-colors;
}
</style>
