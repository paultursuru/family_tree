<template>
  <div class="autocomplete-container">
    <label v-if="label" :for="inputId" class="form-label">{{ label }}</label>
    <div class="autocomplete-input-wrapper">
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
        :class="{ 'has-selected': selectedItems.length > 0 }"
        :readonly="!props.multiple && selectedItems.length > 0"
      />
      <!-- Clear button for single selection -->
      <button
        v-if="!props.multiple && selectedItems.length > 0"
        @click="clearSelection"
        class="clear-button"
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
      <div
        v-if="showDropdown && filteredOptions.length > 0"
        class="autocomplete-dropdown"
      >
        <div
          v-for="(option, index) in filteredOptions"
          :key="option.id"
          class="autocomplete-option"
          :class="{ highlighted: index === highlightedIndex }"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          <div class="option-name">{{ getFullName(option) }}</div>
          <div class="option-details">
            {{ option.gender }} • {{ option.isAlive ? 'Living' : 'Deceased' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Items Display - Only for multiple selection -->
    <div
      v-if="props.multiple && selectedItems.length > 0"
      class="selected-items"
    >
      <div v-for="item in selectedItems" :key="item.id" class="selected-item">
        <span class="selected-item-name">{{ getFullName(item) }}</span>
        <button
          @click="removeItem(item)"
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
import { Member } from '@/types'

interface Props {
  modelValue: string[] | string | number | number[] | undefined | null
  options: Member[]
  label?: string
  placeholder?: string
  multiple?: boolean
  excludeIds?: string[]
}

interface Emits {
  (
    e: 'update:modelValue',
    value: string[] | string | number | number[] | undefined | null,
  ): void
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Search...',
  multiple: false,
  excludeIds: () => [],
})

const emit = defineEmits<Emits>()

const inputRef = ref<HTMLInputElement>()
const searchQuery = ref('')
const showDropdown = ref(false)
const highlightedIndex = ref(0)

const inputId = computed(
  () => `autocomplete-${Math.random().toString(36).substr(2, 9)}`,
)

const displayValue = computed({
  get() {
    if (props.multiple) {
      return searchQuery.value
    } else {
      // For single selection, show the selected item name or search query
      if (selectedItems.value.length > 0) {
        return getFullName(selectedItems.value[0])
      }
      return searchQuery.value
    }
  },
  set(value) {
    searchQuery.value = value
  },
})

const selectedItems = computed(() => {
  if (!props.modelValue) return []

  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.options.filter((option) => {
      const optionId = option.id.toString()
      return props.modelValue.some((id) => id.toString() === optionId)
    })
  } else if (
    !props.multiple &&
    (typeof props.modelValue === 'string' ||
      typeof props.modelValue === 'number')
  ) {
    const member = props.options.find(
      (option) => option.id.toString() === props.modelValue.toString(),
    )
    return member ? [member] : []
  }

  return []
})

const filteredOptions = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const selectedIds = selectedItems.value.map((item) => item.id)

  return props.options
    .filter((option) => {
      // Exclude already selected items
      if (selectedIds.includes(option.id)) return false

      // Exclude items in excludeIds
      if (props.excludeIds.includes(option.id)) return false

      // Filter by search query
      if (query) {
        const fullName = getFullName(option).toLowerCase()
        return fullName.includes(query)
      }

      return true
    })
    .slice(0, 10) // Limit to 10 results
})

const getFullName = (member: Member) => {
  const middleNames =
    member.middleNames.length > 0 ? ` ${member.middleNames.join(' ')}` : ''
  return `${member.firstName}${middleNames} ${member.lastName}`
}

const handleInput = () => {
  // For single selection, if user starts typing and there's a selected item, clear the selection
  if (
    !props.multiple &&
    selectedItems.value.length > 0 &&
    searchQuery.value !== getFullName(selectedItems.value[0])
  ) {
    emit('update:modelValue', null)
  }

  showDropdown.value = true
  highlightedIndex.value = 0
}

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
    // Only clear search query for multiple selection or when no item is selected
    if (props.multiple || selectedItems.value.length === 0) {
      searchQuery.value = ''
    }
  }, 200)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showDropdown.value || filteredOptions.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filteredOptions.value.length - 1,
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (filteredOptions.value[highlightedIndex.value]) {
        selectOption(filteredOptions.value[highlightedIndex.value])
      }
      break
    case 'Escape':
      showDropdown.value = false
      searchQuery.value = ''
      break
  }
}

const selectOption = (option: Member) => {
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : []
    const optionId =
      typeof option.id === 'number' ? option.id : parseInt(option.id)
    if (!currentValue.some((id) => id.toString() === optionId.toString())) {
      currentValue.push(optionId)
      emit('update:modelValue', currentValue)
    }
  } else {
    const optionId =
      typeof option.id === 'number' ? option.id : parseInt(option.id)
    emit('update:modelValue', optionId)
  }

  searchQuery.value = ''
  showDropdown.value = false
  highlightedIndex.value = 0

  // Focus back to input for multiple selection
  if (props.multiple) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

const removeItem = (item: Member) => {
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : []
    const itemId = typeof item.id === 'number' ? item.id : parseInt(item.id)
    const newValue = currentValue.filter(
      (id) => id.toString() !== itemId.toString(),
    )
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', null)
  }
}

const clearSelection = () => {
  emit('update:modelValue', null)
  searchQuery.value = ''
}

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  () => {
    searchQuery.value = ''
  },
  { deep: true },
)
</script>

<style scoped>
.autocomplete-container {
  @apply relative;
}

.autocomplete-input-wrapper {
  @apply relative flex items-center;
}

.autocomplete-input {
  @apply w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.autocomplete-input.has-selected {
  @apply border-blue-500;
}

.autocomplete-dropdown {
  @apply absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto;
}

.autocomplete-option {
  @apply px-3 py-2 cursor-pointer hover:bg-gray-600 transition-colors;
}

.autocomplete-option.highlighted {
  @apply bg-gray-600;
}

.option-name {
  @apply text-gray-100 font-medium;
}

.option-details {
  @apply text-xs text-gray-400 mt-1;
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

.clear-button {
  @apply absolute right-2 text-gray-400 hover:text-gray-200 transition-colors p-1;
}
</style>
