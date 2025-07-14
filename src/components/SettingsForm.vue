<template>
  <div class="settings-form">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Default Member Selection -->
      <div class="form-section">
        <h3 class="section-title">Default Member</h3>
        <p class="form-hint">
          Choose which family member should be selected by default when the app
          loads.
        </p>
        <div class="mt-4">
          <AutocompleteInput
            v-model="form.defaultMemberId"
            :options="availableMembers"
            label="Default Selected Member"
            placeholder="Search for a family member..."
            :multiple="false"
            :exclude-ids="[]"
          />
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn-primary">Save Settings</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { Member } from '@/types'
import AutocompleteInput from './AutocompleteInput.vue'

interface SettingsFormData {
  defaultMemberId?: number | null
}

interface Props {
  members: Member[]
  currentSettings?: SettingsFormData
}

interface Emits {
  (e: 'save', settings: SettingsFormData): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref<SettingsFormData>({
  defaultMemberId: null,
})

// Initialize form when settings change
watch(
  () => props.currentSettings,
  (settings) => {
    if (settings) {
      form.value = {
        defaultMemberId: settings.defaultMemberId,
      }
    }
  },
  { immediate: true },
)

const availableMembers = computed(() => {
  return props.members
})

const handleSubmit = () => {
  emit('save', { ...form.value })
}
</script>

<style scoped>
.settings-form {
  @apply max-w-4xl mx-auto p-6;
}

.form-section {
  @apply bg-gray-800 rounded-lg shadow-sm border border-gray-600 p-6;
}

.section-title {
  @apply text-lg font-semibold text-gray-100 mb-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-100 mb-2;
}

.form-hint {
  @apply text-sm text-gray-400;
}

.form-radio {
  @apply h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300;
}

.form-actions {
  @apply flex justify-end space-x-4 pt-6;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors;
}
</style>
