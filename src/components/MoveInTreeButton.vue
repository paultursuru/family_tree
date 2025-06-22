<template>
  <div :class="linkType === 'parents' ? '-top-8' : '-bottom-8'" class="move-in-tree-button">
    <span v-if="linkType === 'parents'" class="nav-text">Parents</span>
    <svg :class="linkType === 'children' ? 'rotate-180' : ''" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 15l7-7 7 7"
      ></path>
    </svg>
    <span v-if="linkType === 'children'" class="nav-text">Children</span>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps<{
  linkType: 'parents' | 'children'
}>()
</script>
<style scoped>
.move-in-tree-button {
  @apply absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer text-gray-500 hover:text-blue-600 transition-colors;
}
.nav-text {
  @apply text-xs font-medium;
}
</style>
