<template>
  <div class="app">
    <!-- Header -->
    <Header
      :show-add-form="showAddForm"
      @import-from-json="importFromJson"
      @export-to-json="() => exportToJson(members)"
      @show-add-form="showAddForm = true"
      @confirm-destroy-all="confirmDestroyAll"
      @search-members="searchMembers"
      @select-member="selectMember"
      @select-member-from-search="selectMemberFromSearch"
      :search-results="searchResults"
    />

    <!-- Main Content - Full Screen Family Tree -->
    <main class="app-main">
      <div class="tree-fullscreen">
        <FamilyTree
          :members="members"
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
          @select="selectMember"
          @edit="editMember"
          @delete="confirmDelete"
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
      :is-editing="!!editingMember"
      @close="closeModal"
      @save="saveMember"
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
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { Member, MemberFormData } from '@/types'
import { useFileOperations } from '@/composables/useFileOperations'
import Header from '@/components/Header.vue'
import FamilyTree from '@/components/FamilyTree.vue'
import MemberDetail from '@/components/MemberDetail.vue'
import MemberForm from '@/components/MemberForm.vue'
import FormModal from '@/components/FormModal.vue'

// State
const members = ref<Member[]>([])
const selectedMember = ref<Member | null>(null)
const showAddForm = ref(false)
const editingMember = ref<Member | null>(null)
const memberToDelete = ref<Member | null>(null)
const showDestroyAllModal = ref(false)
const familyTreeRef = ref<InstanceType<typeof FamilyTree> | null>(null)
const searchResults = ref<Member[]>([])

// File operations composable
const { fileInput, exportToJson, importFromJson, handleFileImport } =
  useFileOperations()

// Load data from localStorage or default
onMounted(() => {
  const savedMembers = localStorage.getItem('family-members')
  if (savedMembers) {
    members.value = JSON.parse(savedMembers)
  }
})

// Computed
const nextId = computed(() => {
  return members.value.length > 0
    ? Math.max(...members.value.map((m) => m.id)) + 1
    : 1
})

// Methods
const saveToLocalStorage = () => {
  localStorage.setItem('family-members', JSON.stringify(members.value))
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

  // Update relationships
  members.value.forEach((member) => {
    // Remove from spouse lists
    member.spouseIds = member.spouseIds.filter((id) => id !== memberId)

    // Remove from children lists
    member.childrenIds = member.childrenIds.filter((id) => id !== memberId)

    // Clear parent references
    if (member.parent1Id === memberId) member.parent1Id = undefined
    if (member.parent2Id === memberId) member.parent2Id = undefined
  })

  // Clear selection if deleted member was selected
  if (selectedMember.value?.id === memberId) {
    selectedMember.value = null
  }

  saveToLocalStorage()
  memberToDelete.value = null
}

const saveMember = (formData: MemberFormData) => {
  const now = new Date().toISOString()

  // --- Data Sanitization ---
  // Ensure all incoming IDs from the form are numbers, not strings
  const sanitizedFormData = {
    ...formData,
    parent1Id: formData.parent1Id ? Number(formData.parent1Id) : undefined,
    parent2Id: formData.parent2Id ? Number(formData.parent2Id) : undefined,
    spouseIds: formData.spouseIds.map(Number),
    childrenIds: formData.childrenIds.map(Number),
  }

  const memberId = editingMember.value?.id || nextId.value

  // --- Handle Parent-Child relationship changes ---
  const oldParentIds = new Set(
    editingMember.value
      ? [editingMember.value.parent1Id, editingMember.value.parent2Id].filter(
          (p): p is number => p != null,
        )
      : [],
  )
  const newParentIds = new Set(
    [sanitizedFormData.parent1Id, sanitizedFormData.parent2Id].filter(
      (p): p is number => p != null,
    ),
  )

  // Remove child from old parents that are no longer parents
  const removedParentIds = [...oldParentIds].filter(
    (id) => !newParentIds.has(id),
  )
  removedParentIds.forEach((parentId) => {
    const parent = members.value.find((p) => p.id === parentId)
    if (parent) {
      parent.childrenIds = parent.childrenIds.filter(
        (childId) => childId !== memberId,
      )
    }
  })

  // Add child to new parents
  const addedParentIds = [...newParentIds].filter((id) => !oldParentIds.has(id))
  addedParentIds.forEach((parentId) => {
    const parent = members.value.find((p) => p.id === parentId)
    if (parent && !parent.childrenIds.includes(memberId)) {
      parent.childrenIds.push(memberId)
    }
  })

  // --- Upsert the member's own data ---
  if (editingMember.value) {
    const index = members.value.findIndex((m) => m.id === memberId)
    if (index !== -1) {
      // --- Handle Spouse relationship changes ---
      const originalSpouseIds = new Set(editingMember.value.spouseIds)
      const newSpouseIds = new Set(sanitizedFormData.spouseIds)
      const addedSpouses = [...newSpouseIds].filter(
        (id) => !originalSpouseIds.has(id),
      )
      const removedSpouses = [...originalSpouseIds].filter(
        (id) => !newSpouseIds.has(id),
      )

      addedSpouses.forEach((spouseId) => {
        const spouse = members.value.find((m) => m.id === spouseId)
        if (spouse && !spouse.spouseIds.includes(memberId)) {
          spouse.spouseIds.push(memberId)
        }
      })
      removedSpouses.forEach((spouseId) => {
        const spouse = members.value.find((m) => m.id === spouseId)
        if (spouse) {
          spouse.spouseIds = spouse.spouseIds.filter((id) => id !== memberId)
        }
      })

      // --- Handle Children relationship changes ---
      const originalChildrenIds = new Set(editingMember.value.childrenIds)
      const newChildrenIds = new Set(sanitizedFormData.childrenIds)
      const addedChildren = [...newChildrenIds].filter(
        (id) => !originalChildrenIds.has(id),
      )
      const removedChildren = [...originalChildrenIds].filter(
        (id) => !newChildrenIds.has(id),
      )

      addedChildren.forEach((childId) => {
        const child = members.value.find((m) => m.id === childId)
        if (child) {
          // Set this member as parent1 or parent2 of the child
          if (!child.parent1Id) {
            child.parent1Id = memberId
          } else if (!child.parent2Id) {
            child.parent2Id = memberId
          }
        }
      })
      removedChildren.forEach((childId) => {
        const child = members.value.find((m) => m.id === childId)
        if (child) {
          // Remove this member as parent of the child
          if (child.parent1Id === memberId) {
            child.parent1Id = undefined
          }
          if (child.parent2Id === memberId) {
            child.parent2Id = undefined
          }
        }
      })

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
      childrenIds: sanitizedFormData.childrenIds, // Use the childrenIds from form data
      createdAt: now,
      updatedAt: now,
    }

    // Update spouses of the new member
    newMember.spouseIds.forEach((spouseId) => {
      const spouse = members.value.find((m) => m.id === spouseId)
      if (spouse && !spouse.spouseIds.includes(memberId)) {
        spouse.spouseIds.push(memberId)
      }
    })

    // Update children of the new member
    newMember.childrenIds.forEach((childId) => {
      const child = members.value.find((m) => m.id === childId)
      if (child) {
        // Set this member as parent1 or parent2 of the child
        if (!child.parent1Id) {
          child.parent1Id = memberId
        } else if (!child.parent2Id) {
          child.parent2Id = memberId
        }
      }
    })

    members.value.push(newMember)
    selectedMember.value = newMember
  }

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

const handleFileImportSuccess = (importedMembers: Member[]) => {
  members.value = importedMembers
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
