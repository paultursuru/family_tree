<template>
  <div class="autocomplete-container">
    <label v-if="label" :for="inputId" class="form-label">{{ label }}</label>
    <!-- Input field - only show when no union is selected -->
    <div v-if="!selectedUnion" class="autocomplete-input-wrapper">
      <input
        :id="inputId"
        ref="inputRef"
        v-model="displayValue"
        type="text"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="showDropdown = true"
        @blur="handleBlur"
        @keydown="handleKeydown"
        class="autocomplete-input"
      />
      <div
        v-if="showDropdown && filteredUnions.length > 0"
        class="autocomplete-dropdown"
      >
        <div
          v-for="(union, index) in filteredUnions"
          :key="union.id"
          class="autocomplete-option"
          :class="{ highlighted: index === highlightedIndex }"
          @click="selectUnion(union)"
          @mouseenter="highlightedIndex = index"
        >
          <div class="option-name">{{ getLocalUnionDisplayName(union) }}</div>
          <div class="option-details">
            {{ union.childrenIds?.length || 0 }} children
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Items Display -->
    <div v-if="selectedUnion" class="selected-items">
      <div class="selected-item">
        <span class="selected-item-name">{{
          getLocalUnionDisplayName(selectedUnion)
        }}</span>
        <button
          @click="clearSelection"
          class="selected-item-remove"
          type="button"
        >
          <svg
            class="w-4 h-4"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Union, Member } from '@/types'
import { useSearch } from '@/composables/useSearch'

interface Props {
  modelValue: number | undefined | null
  unions: Union[]
  members: Member[]
  label?: string
  placeholder?: string
  excludeIds?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: number | undefined | null): void
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Search...',
  excludeIds: () => [],
})

const emit = defineEmits<Emits>()

// Use the search composable
const { searchUnions, getUnionDisplayName } = useSearch()

const inputRef = ref<HTMLInputElement>()
const searchQuery = ref('')
const showDropdown = ref(false)
const highlightedIndex = ref(0)

const inputId = computed(
  () => `union-autocomplete-${Math.random().toString(36).substr(2, 9)}`,
)

const selectedUnion = computed(() => {
  if (!props.modelValue) return null
  return props.unions.find((union) => union.id === props.modelValue) || null
})

const displayValue = computed({
  get() {
    if (selectedUnion.value) {
      return getUnionDisplayName(selectedUnion.value, props.members)
    }
    return searchQuery.value
  },
  set(value) {
    searchQuery.value = value
  },
})

const filteredUnions = computed(() => {
  const query = searchQuery.value

  // Use the search composable for filtering unions
  return searchUnions(props.unions, props.members, query, {
    excludeIds: props.excludeIds,
    limit: 10,
  })
})

const getLocalUnionDisplayName = (union: Union) => {
  return getUnionDisplayName(union, props.members)
}

const handleInput = () => {
  // If user starts typing and there's a selected union, clear the selection
  if (
    selectedUnion.value &&
    searchQuery.value !== getLocalUnionDisplayName(selectedUnion.value)
  ) {
    emit('update:modelValue', null)
  }
  showDropdown.value = true
  highlightedIndex.value = 0
}

const handleBlur = () => {
  // Delay hiding dropdown to allow for clicks
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showDropdown.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filteredUnions.value.length - 1,
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (filteredUnions.value[highlightedIndex.value]) {
        selectUnion(filteredUnions.value[highlightedIndex.value])
      }
      break
    case 'Escape':
      showDropdown.value = false
      break
  }
}

const selectUnion = (union: Union) => {
  emit('update:modelValue', union.id)
  searchQuery.value = ''
  showDropdown.value = false
  nextTick(() => {
    inputRef.value?.blur()
  })
}

const clearSelection = () => {
  emit('update:modelValue', null)
  searchQuery.value = ''
  showDropdown.value = false
}

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      searchQuery.value = ''
    }
  },
)
</script>

<style scoped>
.autocomplete-container {
  @apply relative;
}

.form-label {
  @apply block text-sm font-medium text-gray-100 mb-2;
}

.autocomplete-input-wrapper {
  @apply relative;
}

.autocomplete-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.autocomplete-input.has-selected {
  @apply bg-blue-50 border-blue-500;
}

.clear-button {
  @apply absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors;
}

.autocomplete-dropdown {
  @apply absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto;
}

.autocomplete-option {
  @apply px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors;
}

.autocomplete-option.highlighted {
  @apply bg-blue-100;
}

.option-name {
  @apply font-medium text-gray-900;
}

.option-details {
  @apply text-sm text-gray-500;
}

.selected-items {
  @apply mt-2 space-y-1;
}

.selected-item {
  @apply flex items-center justify-between bg-blue-600 text-white px-2 py-1 rounded text-sm;
}

.selected-item-name {
  @apply flex-1;
}

.selected-item-remove {
  @apply ml-2 text-blue-200 hover:text-white transition-colors;
}
</style>
