<template>
  <div class="member-form">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="form-section">
        <h3 class="section-title">Basic Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="form-label">First Name *</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              class="form-input"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label for="lastName" class="form-label">Last Name *</label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              class="form-input"
              placeholder="Enter last name"
            />
          </div>

          <div>
            <label for="middleNames" class="form-label">Middle Names</label>
            <input
              id="middleNames"
              v-model="middleNamesString"
              type="text"
              class="form-input"
              placeholder="Enter middle names (space separated)"
            />
          </div>

          <div v-if="form.gender === 'female'">
            <label for="maidenName" class="form-label">Maiden Name</label>
            <input
              id="maidenName"
              v-model="form.maidenName"
              type="text"
              class="form-input"
              placeholder="Enter maiden name"
            />
          </div>
        </div>
      </div>

      <!-- Personal Details -->
      <div class="form-section">
        <h3 class="section-title">Personal Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="gender" class="form-label">Gender *</label>
            <select
              id="gender"
              v-model="form.gender"
              required
              class="form-select"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="form-label">Status</label>
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input
                  type="radio"
                  v-model="form.isAlive"
                  :value="true"
                  class="form-radio"
                />
                <span class="ml-2">Alive</span>
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  v-model="form.isAlive"
                  :value="false"
                  class="form-radio"
                />
                <span class="ml-2">Deceased</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Birth Information -->
      <div class="form-section">
        <h3 class="section-title">Birth Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="birthDate" class="form-label">Birth Date</label>
            <input
              id="birthDate"
              v-model="form.birthDate"
              type="date"
              class="form-input"
            />
          </div>

          <div>
            <label for="birthPlace" class="form-label">Birth Place</label>
            <input
              id="birthPlace"
              v-model="form.birthPlace"
              type="text"
              class="form-input"
              placeholder="City, State/Country"
            />
          </div>
        </div>
      </div>

      <!-- Death Information (if deceased) -->
      <div v-if="!form.isAlive" class="form-section">
        <h3 class="section-title">Death Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="deathDate" class="form-label">Death Date</label>
            <input
              id="deathDate"
              v-model="form.deathDate"
              type="date"
              class="form-input"
            />
          </div>

          <div>
            <label for="deathPlace" class="form-label">Death Place</label>
            <input
              id="deathPlace"
              v-model="form.deathPlace"
              type="text"
              class="form-input"
              placeholder="City, State/Country"
            />
          </div>
        </div>
      </div>

      <!-- Family Relationships -->
      <div class="form-section">
        <h3 class="section-title">Parents</h3>
        <div class="grid grid-cols-1 gap-4">
          <UnionAutocompleteInput
            v-model="form.parentUnionId"
            :unions="unions"
            :members="members"
            label="Parent Union"
            placeholder="Search for parent union..."
            :exclude-ids="[]"
          />
          <p class="form-hint">
            Select a union (couple) as the parents. Leave empty if you don't
            know the parents.
          </p>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="form-section">
        <h3 class="section-title">Additional Information</h3>
        <div class="space-y-4">
          <div>
            <label for="photoUrl" class="form-label">Photo URL</label>
            <input
              id="photoUrl"
              v-model="form.photoUrl"
              type="url"
              class="form-input"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div>
            <label for="notes" class="form-label">Notes</label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="form-textarea"
              placeholder="Add any additional notes about this family member..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn-primary">
          {{ isEditing ? 'Update Member' : 'Add Member' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { Member, MemberFormData, Union } from '@/types'
import AutocompleteInput from './AutocompleteInput.vue'
import UnionAutocompleteInput from './UnionAutocompleteInput.vue'

interface Props {
  member?: Member
  members: Member[]
  unions: Union[]
  isEditing?: boolean
}

interface Emits {
  (e: 'save', memberData: MemberFormData): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const lastMemberId = computed(() => {
  return props.members.reduce((max, member) => Math.max(max, member.id), 0)
})

const formId = computed(() => {
  return props.member?.id || lastMemberId.value + 1
})

const form = ref<MemberFormData>({
  id: formId.value,
  firstName: '',
  middleNames: [],
  lastName: '',
  maidenName: '',
  birthDate: '',
  birthPlace: '',
  deathDate: '',
  deathPlace: '',
  gender: 'male',
  isAlive: true,
  parentUnionId: null,
  photoUrl: '',
  notes: '',
})

const middleNamesString = ref('')

// Initialize form when editing
watch(
  () => props.member,
  (member) => {
    if (member) {
      form.value = {
        id: member.id,
        firstName: member.firstName,
        middleNames: [...member.middleNames],
        lastName: member.lastName,
        maidenName: member.maidenName || '',
        birthDate: member.birthDate || '',
        birthPlace: member.birthPlace || '',
        deathDate: member.deathDate || '',
        deathPlace: member.deathPlace || '',
        gender: member.gender,
        isAlive: member.isAlive,
        parentUnionId: member.parentUnionId,
        photoUrl: member.photoUrl || '',
        notes: member.notes || '',
      }
      middleNamesString.value = member.middleNames.join(' ')
    }
  },
  { immediate: true },
)

// Update middle names when string changes
watch(middleNamesString, (value) => {
  form.value.middleNames = value.split(' ').filter((name) => name.trim() !== '')
})

const isEditing = computed(() => props.isEditing || false)

const handleSubmit = () => {
  emit('save', { ...form.value })
}
</script>

<style scoped>
.member-form {
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

.form-input,
.form-select,
.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-hint {
  @apply text-xs text-gray-500 mt-1;
}

.form-textarea {
  @apply resize-y;
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
