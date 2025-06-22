<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isEditing ? 'Edit Family Member' : 'Add New Family Member' }}
        </h2>
        <button @click="$emit('close')" class="modal-close">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <MemberForm
          :member="member"
          :members="members"
          :is-editing="isEditing"
          @save="$emit('save', $event)"
          @cancel="$emit('close')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Member, MemberFormData } from '@/types'
import MemberForm from './MemberForm.vue'

interface Props {
  show: boolean
  member?: Member | null
  members: Member[]
  isEditing: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', formData: MemberFormData): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto;
}

.modal-header {
  @apply flex justify-between items-center p-6 border-b border-gray-700;
}

.modal-title {
  @apply text-xl font-semibold text-gray-100;
}

.modal-close {
  @apply text-gray-400 hover:text-gray-200 transition-colors;
}

.modal-body {
  @apply p-6;
}
</style>
