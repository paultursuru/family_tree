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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AutocompleteInput
            v-model="form.parent1Id"
            :options="availableParents"
            label="Parent 1"
            placeholder="Search for parent 1..."
            :multiple="false"
            :exclude-ids="parent1ExcludeIds"
          />

          <AutocompleteInput
            v-model="form.parent2Id"
            :options="availableParents"
            label="Parent 2"
            placeholder="Search for parent 2..."
            :multiple="false"
            :exclude-ids="parent2ExcludeIds"
          />
        </div>
      </div>

      <!-- Spouses -->
      <div class="form-section">
        <h3 class="section-title">Spouses</h3>
        <AutocompleteInput
          v-model="form.spouseIds"
          :options="availableSpouses"
          label="Select Spouses"
          placeholder="Search for spouses..."
          :multiple="true"
          :exclude-ids="spousesExcludeIds"
        />
      </div>

      <!-- Children -->
      <div class="form-section">
        <h3 class="section-title">Children</h3>
        <AutocompleteInput
          v-model="form.childrenIds"
          :options="availableChildren"
          label="Select Children"
          placeholder="Search for children..."
          :multiple="true"
          :exclude-ids="childrenExcludeIds"
        />
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
import { Member, MemberFormData } from '@/types'
import AutocompleteInput from './AutocompleteInput.vue'

interface Props {
  member?: Member
  members: Member[]
  isEditing?: boolean
}

interface Emits {
  (e: 'save', memberData: MemberFormData): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref<MemberFormData>({
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
  parent1Id: null,
  parent2Id: null,
  photoUrl: '',
  notes: '',
  spouseIds: [],
  childrenIds: [],
})

const middleNamesString = ref('')

// Initialize form when editing
watch(
  () => props.member,
  (member) => {
    if (member) {
      form.value = {
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
        parent1Id: member.parent1Id,
        parent2Id: member.parent2Id,
        photoUrl: member.photoUrl || '',
        notes: member.notes || '',
        spouseIds: [...member.spouseIds],
        childrenIds: [...member.childrenIds],
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

const availableParents = computed(() => {
  return props.members.filter(
    (member) => !props.member || member.id !== props.member.id,
  )
})

const availableSpouses = computed(() => {
  return props.members.filter((member) => {
    // Cannot be self
    if (props.member && member.id === props.member.id) {
      return false
    }
    // Cannot be a parent
    if (
      member.id === form.value.parent1Id ||
      member.id === form.value.parent2Id
    ) {
      return false
    }
    return true
  })
})

const availableChildren = computed(() => {
  return props.members.filter((member) => {
    // Cannot be self
    if (props.member && member.id === props.member.id) {
      return false
    }
    // Cannot be a parent
    if (
      member.id === form.value.parent1Id ||
      member.id === form.value.parent2Id
    ) {
      return false
    }
    // Cannot be a spouse
    if (form.value.spouseIds.includes(member.id)) {
      return false
    }
    return true
  })
})

// Computed properties for exclude IDs to handle undefined values
const parent1ExcludeIds = computed(() => {
  return form.value.parent2Id ? [form.value.parent2Id.toString()] : []
})

const parent2ExcludeIds = computed(() => {
  return form.value.parent1Id ? [form.value.parent1Id.toString()] : []
})

const spousesExcludeIds = computed(() => {
  const excludeIds = []
  if (form.value.parent1Id) excludeIds.push(form.value.parent1Id.toString())
  if (form.value.parent2Id) excludeIds.push(form.value.parent2Id.toString())
  return excludeIds
})

const childrenExcludeIds = computed(() => {
  const excludeIds = []
  if (form.value.parent1Id) excludeIds.push(form.value.parent1Id.toString())
  if (form.value.parent2Id) excludeIds.push(form.value.parent2Id.toString())
  return [...excludeIds, ...form.value.spouseIds.map((id) => id.toString())]
})

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
