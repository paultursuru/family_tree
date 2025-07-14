<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Member, UnionFormData } from '@/types'
import AutocompleteInput from './AutocompleteInput.vue'

interface Props {
  union?: UnionFormData
  members: Member[]
  isEditing?: boolean
}

interface Emits {
  (e: 'save', union: UnionFormData): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const lastUnionId = computed(() => {
  // This would need to be passed from parent or calculated differently
  return 1 // For now, we'll handle ID generation in the parent
})

const formId = computed(() => {
  return props.union?.id || lastUnionId.value
})

const form = ref<UnionFormData>({
  id: formId.value,
  member1Id: 0,
  member2Id: 0,
  marriageDate: '',
  marriagePlace: '',
  divorceDate: '',
  divorcePlace: '',
  childrenIds: [],
})

// Initialize form when editing
watch(
  () => props.union,
  (union) => {
    if (union) {
      form.value = {
        id: union.id,
        member1Id: union.member1Id,
        member2Id: union.member2Id,
        marriageDate: union.marriageDate,
        marriagePlace: union.marriagePlace,
        divorceDate: union.divorceDate,
        divorcePlace: union.divorcePlace,
        childrenIds: union.childrenIds || [],
      }
    } else {
      // Reset form for new union
      form.value = {
        id: formId.value,
        member1Id: 0,
        member2Id: 0,
        marriageDate: '',
        marriagePlace: '',
        divorceDate: '',
        divorcePlace: '',
        childrenIds: [],
      }
    }
  },
  { immediate: true },
)

const availableMembers = computed(() => {
  return props.members.filter((member) => {
    // Cannot be the first member in the union
    if (form.value.member1Id && member.id === form.value.member1Id) {
      return false
    }
    return true
  })
})

const availableChildren = computed(() => {
  return props.members.filter((member) => {
    // Cannot be either member in the union
    if (
      member.id === form.value.member1Id ||
      member.id === form.value.member2Id
    ) {
      return false
    }
    return true
  })
})

const member2ExcludeIds = computed(() => {
  return form.value.member1Id ? [form.value.member1Id.toString()] : []
})

const childrenExcludeIds = computed(() => {
  const excludeIds = []
  if (form.value.member1Id) excludeIds.push(form.value.member1Id.toString())
  if (form.value.member2Id) excludeIds.push(form.value.member2Id.toString())
  return excludeIds
})

const isEditing = computed(() => props.isEditing || false)

const getMemberName = (memberId: number) => {
  const member = props.members.find((m) => m.id === memberId)
  return member ? `${member.firstName} ${member.lastName}` : 'Unknown Member'
}

const handleSubmit = () => {
  // Validate that both members are selected
  if (!form.value.member1Id || !form.value.member2Id) {
    console.error('Both members must be selected')
    alert('Please select both members for the union')
    return
  }

  if (form.value.member1Id === form.value.member2Id) {
    console.error('Cannot create union with same member')
    alert('Cannot create union with the same member')
    return
  }

  emit('save', { ...form.value })
}
</script>

<template>
  <div class="union-form">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Union Members -->
      <div class="form-section">
        <h3 class="section-title">Union Members</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="member1" class="form-label">Member 1</label>
            <div class="member-display">
              <span class="member-name">{{
                getMemberName(form.member1Id)
              }}</span>
              <span class="member-note">(Current member)</span>
            </div>
          </div>
          <AutocompleteInput
            v-model="form.member2Id"
            :options="availableMembers"
            label="Member 2"
            placeholder="Search for member 2..."
            :multiple="false"
            :exclude-ids="member2ExcludeIds"
          />
        </div>
      </div>

      <!-- Marriage Information -->
      <div class="form-section">
        <h3 class="section-title">Marriage Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="marriageDate" class="form-label">Marriage Date</label>
            <input
              id="marriageDate"
              v-model="form.marriageDate"
              type="date"
              class="form-input"
              placeholder="Enter marriage date..."
            />
          </div>
          <div>
            <label for="marriagePlace" class="form-label">Marriage Place</label>
            <input
              id="marriagePlace"
              v-model="form.marriagePlace"
              type="text"
              class="form-input"
              placeholder="Enter marriage place..."
            />
          </div>
        </div>
      </div>

      <!-- Divorce Information -->
      <div class="form-section">
        <h3 class="section-title">Divorce Information (Optional)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="divorceDate" class="form-label">Divorce Date</label>
            <input
              id="divorceDate"
              v-model="form.divorceDate"
              type="date"
              class="form-input"
              placeholder="Enter divorce date..."
            />
          </div>
          <div>
            <label for="divorcePlace" class="form-label">Divorce Place</label>
            <input
              id="divorcePlace"
              v-model="form.divorcePlace"
              type="text"
              class="form-input"
              placeholder="Enter divorce place..."
            />
          </div>
        </div>
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

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn-primary">
          {{ isEditing ? 'Update Union' : 'Create Union' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.union-form {
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

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
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

.member-display {
  @apply px-3 py-2 border border-gray-300 rounded-md bg-gray-700 text-gray-100;
}

.member-name {
  @apply font-medium text-gray-100;
}

.member-note {
  @apply text-sm text-gray-400 ml-2;
}
</style>
