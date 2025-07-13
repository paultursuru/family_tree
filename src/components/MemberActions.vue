<template>
  <div class="member-actions">
    <ActionButton action="info" @click.stop="$emit('info', member)" />
    <ActionButton action="edit" @click.stop="$emit('edit', member)" />
    <ActionButton action="delete" @click.stop="$emit('delete', member)" />
  </div>
</template>

<script lang="ts" setup>
import { Member } from '@/types'
import ActionButton from './ActionButton.vue'

interface Props {
  member: Member
}

interface Emits {
  (e: 'info', member: Member): void
  (e: 'edit', member: Member): void
  (e: 'delete', member: Member): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.member-actions {
  @apply flex gap-1 absolute top-2 right-2 transition-all duration-200 ease-in-out opacity-0;
}
</style>
