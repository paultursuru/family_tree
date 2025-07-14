<template>
  <button
    @click="$emit('toggle')"
    class="anniversary-toggle-btn"
    :class="{ active: isOpen }"
    title="Show upcoming anniversaries"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      ></path>
    </svg>
  </button>
</template>

<script lang="ts" setup>
interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'toggle'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.anniversary-toggle-btn {
  @apply fixed left-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-blue-900/75 text-white rounded-r-lg shadow-lg hover:bg-blue-700 transition-all duration-200;
}

.anniversary-toggle-btn.active {
  @apply bg-green-600 hover:bg-green-700;
}
</style>
