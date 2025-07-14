<template>
  <div class="app">
    <!-- Header -->
    <Header
      :show-add-form="showAddForm"
      @import-from-json="importFromJson"
      @export-to-json="() => exportToJson(members, unions)"
      @show-add-form="showAddForm = true"
      @confirm-destroy-all="confirmDestroyAll"
      @open-settings="openSettings"
      @search-members="searchMembers"
      @select-member="selectMember"
      @select-member-from-search="selectMemberFromSearch"
      :search-results="searchResults"
    />

    <!-- Anniversary Toggle Button -->
    <AnniversaryToggleButton
      :is-open="showAnniversaryDrawer"
      @toggle="toggleAnniversaryDrawer"
    />

    <!-- Main Content - Full Screen Family Tree -->
    <main class="app-main">
      <div class="tree-fullscreen">
        <FamilyTree
          :members="members"
          :unions="unions"
          :selected-member-id="selectedMember?.id"
          @select-member="selectMember"
          @edit-member="editMember"
          @delete-member="confirmDelete"
          ref="familyTreeRef"
        />
      </div>
    </main>

    <!-- Sliding Drawer for Member Details -->
    <div
      class="drawer-overlay"
      :class="{ 'drawer-open': selectedMember }"
      @click="closeDrawer"
    ></div>

    <aside class="member-drawer" :class="{ 'drawer-open': selectedMember }">
      <div class="drawer-header">
        <h2 class="drawer-title">Member Details</h2>
        <button @click="closeDrawer" class="drawer-close">
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
      <div class="drawer-content">
        <MemberDetail
          :member="selectedMember || undefined"
          :members="members"
          :unions="unions"
          @select="selectMember"
          @edit="editMember"
          @delete="confirmDelete"
          @add-union="addUnion"
          @edit-union="editUnion"
        />
      </div>
    </aside>

    <!-- Hidden file input for import -->
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      @change="(event) => handleFileImport(event, handleFileImportSuccess)"
      class="hidden"
    />

    <!-- Modal for Add/Edit Member -->
    <FormModal
      :show="showAddForm || !!editingMember"
      :member="editingMember"
      :members="members"
      :unions="unions"
      :is-editing="!!editingMember"
      @close="closeModal"
      @save="saveMember"
    />

    <!-- Modal for Add/Edit Union -->
    <FormModal
      :show="showUnionForm || !!editingUnion"
      :union="editingUnion"
      :members="members"
      :unions="unions"
      :is-editing="!!editingUnion"
      @close="closeUnionModal"
      @save="saveUnion"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="memberToDelete" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title text-red-600">Confirm Delete</h2>
          <button @click="cancelDelete" class="modal-close">
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
          <div class="delete-content">
            <svg
              class="w-16 h-16 text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
            <h3 class="delete-title">
              Are you sure you want to delete this family member?
            </h3>
            <p class="delete-text">
              This will permanently remove
              <strong>{{ getFullName(memberToDelete) }}</strong> and all their
              relationships from the family tree.
            </p>
            <div class="delete-actions">
              <button @click="cancelDelete" class="btn-secondary">
                Cancel
              </button>
              <button @click="deleteMember" class="btn-danger">
                Delete Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Destroy All Confirmation Modal -->
    <div
      v-if="showDestroyAllModal"
      class="modal-overlay"
      @click="cancelDestroyAll"
    >
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title text-red-600">⚠️ Remove all family members</h2>
          <button @click="cancelDestroyAll" class="modal-close">
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
          <div class="delete-content">
            <div class="flex justify-center w-full">
              <svg
                class="w-16 h-16 text-red-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
            </div>
            <h3 class="delete-title text-red-600">
              ⚠️ WARNING: This action cannot be undone!
            </h3>
            <p class="delete-text">
              This will permanently delete
              <strong>ALL {{ members.length }} family members</strong> and
              completely clear your family tree. All relationships, data, and
              history will be lost forever.
            </p>
            <p class="delete-text text-red-600 font-semibold">
              Are you absolutely sure you want to destroy everything?
            </p>
            <div class="delete-actions">
              <button @click="cancelDestroyAll" class="btn-secondary">
                Cancel
              </button>
              <button @click="destroyAllMembers" class="btn-danger">
                Delete all members
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div
      v-if="showSettingsModal"
      class="modal-overlay"
      @click="closeSettingsModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Settings</h2>
          <button @click="closeSettingsModal" class="modal-close">
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
          <SettingsForm
            :members="members"
            :current-settings="settings"
            @save="saveSettings"
            @cancel="closeSettingsModal"
          />
        </div>
      </div>
    </div>

    <!-- Anniversary Drawer -->
    <AnniversaryDrawer
      :members="members"
      :unions="unions"
      :is-open="showAnniversaryDrawer"
      :show-birthdays="anniversarySettings.showBirthdays"
      :show-marriages="anniversarySettings.showMarriages"
      :show-deaths="anniversarySettings.showDeaths"
      @close="closeAnniversaryDrawer"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  Member,
  MemberFormData,
  Union,
  UnionFormData,
  FamilyData,
} from '@/types'
import { useFileOperations } from '@/composables/useFileOperations'
import Header from '@/components/Header.vue'
import FamilyTree from '@/components/FamilyTree.vue'
import MemberDetail from '@/components/MemberDetail.vue'
import MemberForm from '@/components/MemberForm.vue'
import UnionForm from '@/components/UnionForm.vue'
import FormModal from '@/components/FormModal.vue'
import SettingsForm from '@/components/SettingsForm.vue'
import AnniversaryDrawer from '@/components/AnniversaryDrawer.vue'
import AnniversaryToggleButton from '@/components/AnniversaryToggleButton.vue'

// State
const members = ref<Member[]>([])
const unions = ref<Union[]>([])
const selectedMember = ref<Member | null>(null)
const showAddForm = ref(false)
const editingMember = ref<Member | null>(null)
const editingUnion = ref<Union | null>(null)
const showUnionForm = ref(false)
const memberToDelete = ref<Member | null>(null)
const showDestroyAllModal = ref(false)
const showSettingsModal = ref(false)
const familyTreeRef = ref<InstanceType<typeof FamilyTree> | null>(null)
const searchResults = ref<Member[]>([])

// Settings state
const settings = ref({
  defaultMemberId: null as number | null,
  showDates: true,
})

// Anniversary drawer state
const showAnniversaryDrawer = ref(false)
const anniversarySettings = ref({
  showBirthdays: true,
  showMarriages: false,
  showDeaths: false,
})

// File operations composable
const { fileInput, exportToJson, importFromJson, handleFileImport } =
  useFileOperations()

// Load data from localStorage or default
onMounted(() => {
  const savedData = localStorage.getItem('family-data')
  if (savedData) {
    const parsedData = JSON.parse(savedData)
    // Migrate existing data to ensure proper structure
    const migratedData = migrateData(parsedData)
    members.value = migratedData.members
    unions.value = migratedData.unions
  }

  // Load settings
  const savedSettings = localStorage.getItem('family-settings')
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
  }

  // Set default selected member if specified
  if (settings.value.defaultMemberId) {
    const defaultMember = members.value.find(
      (m) => m.id === settings.value.defaultMemberId,
    )
    if (defaultMember) {
      // Use nextTick to ensure the FamilyTree component is mounted
      nextTick(() => {
        if (familyTreeRef.value) {
          // Set as main member in the tree without opening the drawer
          familyTreeRef.value.setMainMemberById(defaultMember.id)
        }
      })
    }
  }
})

// Migration function to ensure proper data structure
const migrateData = (data: any): FamilyData => {
  let members: any[] = []
  let unions: Union[] = []

  // Handle old format where unions were embedded in members
  if (Array.isArray(data)) {
    // Old format: array of members with embedded unions
    members = data.map((member) => ({
      ...member,
      unions: member.unions || [],
      spouseIds: member.spouseIds || [], // Keep for backward compatibility
    }))

    // Extract unions from members
    members.forEach((member) => {
      if (member.unions && Array.isArray(member.unions)) {
        member.unions.forEach((union: any) => {
          // Avoid duplicates
          if (!unions.find((u) => u.id === union.id)) {
            unions.push(union)
          }
        })
      }
    })
  } else if (data.members && data.unions) {
    // New format: separate members and unions
    members = data.members.map((member: any) => ({
      ...member,
      unions: member.unions || [],
      spouseIds: member.spouseIds || [],
    }))
    unions = data.unions || []
  } else {
    // Fallback: empty data
    return { members: [], unions: [] }
  }

  // Migrate parent1Id/parent2Id to parentUnionId
  members = members.map((member) => {
    const migratedMember = { ...member }

    // Remove old parent properties
    delete migratedMember.parent1Id
    delete migratedMember.parent2Id

    // Ensure parentUnionId exists (will be undefined if no parents)
    if (!migratedMember.hasOwnProperty('parentUnionId')) {
      migratedMember.parentUnionId = undefined
    }

    // Ensure middleNames is an array
    if (!Array.isArray(migratedMember.middleNames)) {
      migratedMember.middleNames = []
    }

    return migratedMember
  })

  // Ensure all unions have childrenIds array
  unions = unions.map((union) => ({
    ...union,
    childrenIds: Array.isArray(union.childrenIds) ? union.childrenIds : [],
  }))

  // Build parentUnionId dynamically from unions
  members = buildParentUnionIds(members, unions)

  return { members, unions }
}

// Function to build parentUnionId dynamically from unions
const buildParentUnionIds = (members: Member[], unions: Union[]): Member[] => {
  return members.map((member) => {
    // Find which union has this member as a child
    const parentUnion = unions.find(
      (union) =>
        union.childrenIds &&
        Array.isArray(union.childrenIds) &&
        union.childrenIds.includes(member.id),
    )

    return {
      ...member,
      parentUnionId: parentUnion?.id || undefined,
    }
  })
}

// Computed
const nextId = computed(() => {
  return members.value.length > 0
    ? Math.max(...members.value.map((m) => m.id)) + 1
    : 1
})

// Methods
const saveToLocalStorage = () => {
  const familyData: FamilyData = {
    members: members.value,
    unions: unions.value,
  }
  localStorage.setItem('family-data', JSON.stringify(familyData))
}

const selectMember = (member: Member) => {
  selectedMember.value = member
}

const selectMemberFromSearch = (member: Member) => {
  // Center the tree on this member as the main parent
  if (familyTreeRef.value) {
    familyTreeRef.value.setMainMemberById(member.id)
  }

  // Don't open the drawer when selecting from search
  // Users can click the info button on the member card to see details
}

const closeDrawer = () => {
  selectedMember.value = null
}

const editMember = (member: Member) => {
  editingMember.value = member
}

const confirmDelete = (member: Member) => {
  memberToDelete.value = member
}

const cancelDelete = () => {
  memberToDelete.value = null
}

const deleteMember = () => {
  if (!memberToDelete.value) return

  const memberId = memberToDelete.value.id

  // Remove from members array
  members.value = members.value.filter((m) => m.id !== memberId)

  // Remove unions that involve the deleted member
  unions.value = unions.value.filter(
    (union) => union.member1Id !== memberId && union.member2Id !== memberId,
  )

  // Update relationships - remove member from parent unions
  members.value.forEach((member) => {
    if (member.parentUnionId) {
      const parentUnion = unions.value.find(
        (u) => u.id === member.parentUnionId,
      )
      if (
        parentUnion &&
        parentUnion.childrenIds &&
        Array.isArray(parentUnion.childrenIds)
      ) {
        parentUnion.childrenIds = parentUnion.childrenIds.filter(
          (id) => id !== memberId,
        )
      }
    }
  })

  // Remove the member from any union's children lists
  unions.value.forEach((union) => {
    if (union.childrenIds && Array.isArray(union.childrenIds)) {
      union.childrenIds = union.childrenIds.filter(
        (childId) => childId !== memberId,
      )
    }
  })

  // Clear selection if deleted member was selected
  if (selectedMember.value?.id === memberId) {
    selectedMember.value = null
  }

  saveToLocalStorage()
  memberToDelete.value = null
}

const editUnion = (union: Union) => {
  editingUnion.value = union
  showUnionForm.value = true
}

const addUnion = () => {
  const currentMemberId = selectedMember.value?.id || 0
  editingUnion.value = {
    id: 0, // Explicitly 0 to indicate new union
    member1Id: currentMemberId,
    member2Id: 0,
    marriageDate: '',
    marriagePlace: '',
    divorceDate: '',
    divorcePlace: '',
    childrenIds: [],
  }
  showUnionForm.value = true
}

const saveUnion = (formData: UnionFormData) => {
  console.log('saveUnion called with:', formData)
  const now = new Date().toISOString()
  const unionId =
    editingUnion.value?.id && editingUnion.value.id > 0
      ? editingUnion.value.id
      : nextId.value

  // Create or update the union
  const union: Union = {
    id: unionId,
    member1Id: Number(formData.member1Id),
    member2Id: Number(formData.member2Id),
    marriageDate: formData.marriageDate,
    marriagePlace: formData.marriagePlace,
    divorceDate: formData.divorceDate,
    divorcePlace: formData.divorcePlace,
    childrenIds: formData.childrenIds.map(Number),
  }

  console.log('Created union:', union)

  // Check if we're editing an existing union (has real ID) or creating new one
  const isEditingExisting = editingUnion.value && editingUnion.value.id > 0

  if (isEditingExisting) {
    // Update existing union
    const unionIndex = unions.value.findIndex((u) => u.id === unionId)
    if (unionIndex !== -1) {
      // Handle children relationship changes for existing union
      const oldUnion = unions.value[unionIndex]
      const oldChildrenIds = new Set(oldUnion.childrenIds || [])
      const newChildrenIds = new Set(union.childrenIds || [])

      // Remove children from old parent union
      const removedChildren = [...oldChildrenIds].filter(
        (id) => !newChildrenIds.has(id),
      )
      removedChildren.forEach((childId) => {
        const child = members.value.find((m) => m.id === childId)
        if (child && child.parentUnionId === oldUnion.id) {
          child.parentUnionId = undefined
        }
      })

      // Add children to new parent union
      const addedChildren = [...newChildrenIds].filter(
        (id) => !oldChildrenIds.has(id),
      )
      addedChildren.forEach((childId) => {
        const child = members.value.find((m) => m.id === childId)
        if (child) {
          child.parentUnionId = union.id
        }
      })

      unions.value[unionIndex] = union
    }
  } else {
    // Add new union and set up parent-child relationships
    if (union.childrenIds && Array.isArray(union.childrenIds)) {
      union.childrenIds.forEach((childId) => {
        const child = members.value.find((m) => m.id === childId)
        if (child) {
          child.parentUnionId = union.id
        }
      })
    }

    unions.value.push(union)
  }

  console.log('Updated unions array:', {
    totalUnions: unions.value.length,
    isEditingExisting,
  })

  // Rebuild parentUnionIds to ensure consistency
  members.value = buildParentUnionIds(members.value, unions.value)

  saveToLocalStorage()
  closeUnionModal()
}

const closeUnionModal = () => {
  showUnionForm.value = false
  editingUnion.value = null
}

const saveMember = (formData: MemberFormData) => {
  const now = new Date().toISOString()

  // --- Data Sanitization ---
  // Ensure all incoming IDs from the form are numbers, not strings
  const sanitizedFormData = {
    ...formData,
    parentUnionId: formData.parentUnionId
      ? Number(formData.parentUnionId)
      : undefined,
  }

  const memberId = editingMember.value?.id || nextId.value

  // --- Handle Parent-Child relationship changes ---
  const oldParentUnionId = editingMember.value?.parentUnionId
  const newParentUnionId = sanitizedFormData.parentUnionId

  // If parent union changed, we need to update the union's children list
  if (oldParentUnionId !== newParentUnionId) {
    // Remove from old parent union
    if (oldParentUnionId) {
      const oldUnion = unions.value.find((u) => u.id === oldParentUnionId)
      if (
        oldUnion &&
        oldUnion.childrenIds &&
        Array.isArray(oldUnion.childrenIds)
      ) {
        oldUnion.childrenIds = oldUnion.childrenIds.filter(
          (id) => id !== memberId,
        )
      }
    }

    // Add to new parent union
    if (newParentUnionId) {
      const newUnion = unions.value.find((u) => u.id === newParentUnionId)
      if (newUnion) {
        if (!newUnion.childrenIds) {
          newUnion.childrenIds = []
        }
        if (!newUnion.childrenIds.includes(memberId)) {
          newUnion.childrenIds.push(memberId)
        }
      }
    }
  }

  // --- Upsert the member's own data ---
  if (editingMember.value) {
    const index = members.value.findIndex((m) => m.id === memberId)
    if (index !== -1) {
      // Update the member
      members.value[index] = {
        ...members.value[index],
        ...sanitizedFormData,
        updatedAt: now,
      }
    }
  } else {
    // Create new member
    const newMember: Member = {
      id: memberId,
      ...sanitizedFormData,
      createdAt: now,
      updatedAt: now,
    }

    members.value.push(newMember)
    selectedMember.value = newMember

    // Add to parent union if specified
    if (newParentUnionId) {
      const parentUnion = unions.value.find((u) => u.id === newParentUnionId)
      if (parentUnion) {
        if (!parentUnion.childrenIds) {
          parentUnion.childrenIds = []
        }
        if (!parentUnion.childrenIds.includes(memberId)) {
          parentUnion.childrenIds.push(memberId)
        }
      }
    }
  }

  // Rebuild parentUnionIds to ensure consistency
  members.value = buildParentUnionIds(members.value, unions.value)

  saveToLocalStorage()
  closeModal()
}

const closeModal = () => {
  showAddForm.value = false
  editingMember.value = null
}

const getFullName = (member: Member) => {
  const middleNames =
    member.middleNames.length > 0 ? ` ${member.middleNames.join(' ')}` : ''
  return `${member.firstName}${middleNames} ${member.lastName}`
}

const handleFileImportSuccess = (familyData: FamilyData) => {
  members.value = familyData.members
  unions.value = familyData.unions
  saveToLocalStorage()
}

const confirmDestroyAll = () => {
  showDestroyAllModal.value = true
}

const cancelDestroyAll = () => {
  showDestroyAllModal.value = false
}

const destroyAllMembers = () => {
  // Clear all reactive state
  members.value = []
  unions.value = []
  selectedMember.value = null
  showAddForm.value = false
  editingMember.value = null
  memberToDelete.value = null
  showDestroyAllModal.value = false

  // Save empty state to localStorage
  saveToLocalStorage()

  // Reset the FamilyTree component
  familyTreeRef.value?.reset()
}

const searchMembers = (query: string) => {
  searchResults.value = members.value.filter((member) => {
    return getFullName(member).toLowerCase().includes(query.toLowerCase())
  })
  console.log('Search results:', searchResults.value)
}

// Settings functions
const openSettings = () => {
  showSettingsModal.value = true
}

const closeSettingsModal = () => {
  showSettingsModal.value = false
}

const saveSettings = (newSettings: any) => {
  settings.value = { ...settings.value, ...newSettings }
  localStorage.setItem('family-settings', JSON.stringify(settings.value))
  closeSettingsModal()
}

// Anniversary drawer methods
const toggleAnniversaryDrawer = () => {
  showAnniversaryDrawer.value = !showAnniversaryDrawer.value
}

const closeAnniversaryDrawer = () => {
  showAnniversaryDrawer.value = false
}
</script>

<style scoped>
.app {
  @apply min-h-screen bg-gray-900 pb-10;
}

.app-main {
  @apply h-screen pt-16;
}

.tree-fullscreen {
  @apply w-full h-full overflow-auto;
}

/* Drawer Styles */
.drawer-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300;
  opacity: 0;
  pointer-events: none;
}

.drawer-overlay.drawer-open {
  opacity: 1;
  pointer-events: auto;
}

.member-drawer {
  @apply fixed top-0 right-0 h-full w-96 bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out;
  transform: translateX(100%);
}

.member-drawer.drawer-open {
  transform: translateX(0);
}

.drawer-header {
  @apply flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900;
}

.drawer-title {
  @apply text-lg font-semibold text-gray-100;
}

.drawer-close {
  @apply text-gray-400 hover:text-gray-200 transition-colors p-1;
}

.drawer-content {
  @apply h-full overflow-y-auto;
}

/* Delete Modal Styles */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm;
}

.modal-content {
  @apply bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto;
}

.delete-modal {
  @apply max-w-md;
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

.delete-content {
  @apply text-center;
}

.delete-title {
  @apply text-lg font-medium text-gray-100 mb-4;
}

.delete-text {
  @apply text-gray-300 mb-6;
}

.delete-actions {
  @apply flex justify-center space-x-4;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors;
}
</style>
