<script setup lang="ts">
import { Member } from '@/types'
import { ref, computed } from 'vue'

interface Props {
  showAddForm: boolean
  searchResults: Member[]
}

interface Emits {
  (e: 'import-from-json'): void
  (e: 'export-to-json'): void
  (e: 'show-add-form'): void
  (e: 'confirm-destroy-all'): void
  (e: 'search-members', query: string): void
  (e: 'select-member', member: Member): void
  (e: 'select-member-from-search', member: Member): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref('')
const showSearchResults = ref(false)
const showActionsDropdown = ref(false)

const importFromJson = () => {
  emit('import-from-json')
  showActionsDropdown.value = false
}

const exportToJson = () => {
  emit('export-to-json')
  showActionsDropdown.value = false
}

const showAddForm = () => {
  emit('show-add-form')
  showActionsDropdown.value = false
}

const confirmDestroyAll = () => {
  emit('confirm-destroy-all')
  showActionsDropdown.value = false
}

const searchMembers = (event: Event) => {
  const query = (event.target as HTMLInputElement).value
  searchQuery.value = query
  showSearchResults.value = query.length > 0
  emit('search-members', query)
}

const selectMember = (member: Member) => {
  emit('select-member-from-search', member)
  searchQuery.value = ''
  showSearchResults.value = false
}

const getFullName = (member: Member) => {
  const middleNames =
    member.middleNames.length > 0 ? ` ${member.middleNames.join(' ')}` : ''
  return `${member.firstName}${middleNames} ${member.lastName}`
}

const shouldShowResults = computed(() => {
  return showSearchResults.value && searchQuery.value.length > 0
})

const toggleActionsDropdown = () => {
  showActionsDropdown.value = !showActionsDropdown.value
}

const closeActionsDropdown = () => {
  showActionsDropdown.value = false
}

const handleSearchBlur = () => {
  window.setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

const handleActionsBlur = () => {
  window.setTimeout(() => {
    closeActionsDropdown()
  }, 200)
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <h1 class="app-title">Family Tree</h1>
      <div class="header-actions">
        <div class="search-bar">
          <input
            type="text"
            placeholder="🔍 Search"
            v-model="searchQuery"
            @input="searchMembers"
            @focus="showSearchResults = searchQuery.length > 0"
            @blur="handleSearchBlur"
            class="search-input"
          />
          <div v-if="shouldShowResults" class="search-results">
            <div v-if="searchResults.length > 0" class="search-results-list">
              <div
                v-for="result in searchResults"
                :key="result.id"
                class="search-result-item"
                @click="selectMember(result)"
              >
                <div class="search-result-name">{{ getFullName(result) }}</div>
                <div class="search-result-details">
                  {{ result.gender }} •
                  {{ result.isAlive ? 'Living' : 'Deceased' }}
                </div>
              </div>
            </div>
            <div v-else class="search-no-results">
              <div class="search-result-name">No results found</div>
            </div>
          </div>
        </div>

        <button @click="showAddForm" class="cta-btn add-item">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Add a family member
            </button>

        <!-- Actions Dropdown -->
        <div class="actions-dropdown">
          <button
            @click="toggleActionsDropdown"
            class="actions-toggle-btn"
            @blur="handleActionsBlur"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Actions
            <svg
              class="w-4 h-4 ml-1 transition-transform"
              :class="{ 'rotate-180': showActionsDropdown }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          <div v-if="showActionsDropdown" class="actions-dropdown-menu">
            <button @click="importFromJson" class="dropdown-item import-item">
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                ></path>
              </svg>
              Upload Tree Data
            </button>

            <button @click="exportToJson" class="dropdown-item export-item">
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              Download Tree Data
            </button>

            <button
              @click="confirmDestroyAll"
              class="dropdown-item destroy-item"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
              Delete All
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  @apply bg-gray-800 shadow-sm border-b border-gray-700 z-20 relative;
}

.header-content {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center;
}

.app-title {
  @apply text-2xl font-bold text-gray-100;
}

.header-actions {
  @apply flex items-center gap-3;
}

.search-bar {
  @apply relative;
}

.search-input {
  @apply px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-gray-700 text-gray-100 placeholder-gray-400;
}

.search-results {
  @apply absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-md shadow-lg mt-1 max-h-64 overflow-y-auto z-50;
}

.search-results-list {
  @apply py-2;
}

.search-result-item {
  @apply px-4 py-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0;
}

.search-result-name {
  @apply font-medium text-gray-100;
}

.search-result-details {
  @apply text-sm text-gray-400 mt-1;
}

.search-no-results {
  @apply px-4 py-3 text-gray-400 text-center;
}

/* Actions Dropdown Styles */
.actions-dropdown {
  @apply relative;
}

.actions-toggle-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors;
}

.actions-dropdown-menu {
  @apply absolute top-full right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg py-1 min-w-48 z-50;
}

.dropdown-item {
  @apply flex items-center gap-3 w-full px-4 py-2 text-left bg-gray-800  hover:bg-gray-700 focus:outline-none focus:bg-gray-700 transition-colors;
}

.dropdown-divider {
  @apply border-t border-gray-600 my-1;
}

.import-item {
  @apply text-purple-300 hover:bg-purple-900/20;
}

.export-item {
  @apply text-green-300 hover:bg-green-900/20;
}

.add-item {
  @apply text-blue-300 hover:bg-blue-900/20;
}

.destroy-item {
  @apply text-red-300 hover:bg-red-900/20;
}

.cta-btn {
  @apply bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors flex items-center gap-2;
}
</style>
