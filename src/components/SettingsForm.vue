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

      <!-- Anniversary Settings -->
      <div class="form-section">
        <h3 class="section-title">📅 Anniversary Display</h3>
        <p class="form-hint">
          Choose which types of anniversaries to display in the anniversary
          drawer.
        </p>
        <div class="mt-4 space-y-3">
          <div class="anniversary-option">
            <label class="anniversary-option-label">
              <input
                v-model="form.showBirthdays"
                type="checkbox"
                class="form-checkbox"
              />
              <div class="flex items-center m-auto">
                <div>
                  <span class="text-lg pr-2">🎂</span>
                  <span class="font-medium text-gray-100">Birthdays</span>
                  <p class="text-sm text-gray-400">
                    Show upcoming birthdays with ages
                  </p>
                </div>
              </div>
            </label>
          </div>

          <div class="anniversary-option">
            <label class="anniversary-option-label">
              <input
                v-model="form.showMarriages"
                type="checkbox"
                class="form-checkbox"
              />
              <div class="flex items-center m-auto">
                <div>
                  <span class="text-lg pr-2">💍</span>
                  <span class="font-medium text-gray-100"
                    >Marriage Anniversaries</span
                  >
                  <p class="text-sm text-gray-400">
                    Show upcoming marriage anniversaries
                  </p>
                </div>
              </div>
            </label>
          </div>

          <div class="anniversary-option">
            <label class="anniversary-option-label">
              <input
                v-model="form.showDeaths"
                type="checkbox"
                class="form-checkbox"
              />
              <div class="flex items-center m-auto">
                <div>
                  <span class="text-lg pr-2">😢</span>
                  <span class="font-medium text-gray-100">Memorial Dates</span>
                  <p class="text-sm text-gray-400">
                    Show upcoming memorial dates for deceased members
                  </p>
                </div>
              </div>
            </label>
          </div>
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
  showBirthdays?: boolean
  showMarriages?: boolean
  showDeaths?: boolean
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
  showBirthdays: true,
  showMarriages: false,
  showDeaths: false,
})

// Initialize form when settings change
watch(
  () => props.currentSettings,
  (settings) => {
    if (settings) {
      form.value = {
        defaultMemberId: settings.defaultMemberId,
        showBirthdays: settings.showBirthdays ?? true,
        showMarriages: settings.showMarriages ?? false,
        showDeaths: settings.showDeaths ?? false,
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

.form-checkbox {
  @apply h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded;
}

.anniversary-option {
  @apply p-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors;
}

.anniversary-option-label {
  @apply flex items-center cursor-pointer;
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
