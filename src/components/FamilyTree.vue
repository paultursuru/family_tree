<template>
  <div
    class="family-tree"
    v-if="currentParents.length > 0 || currentChildren.length > 0"
  >
    <div class="tree-container">
      <!-- Parents Line -->
      <div class="parents-section">
        <GenerationLine
          :members="currentParents"
          :all-members="members"
          :selected-member-id="selectedMemberId"
          :main-member-id="currentMainMember?.id"
          generation-type="parents"
          @select-member="$emit('select-member', $event)"
          @edit-member="$emit('edit-member', $event)"
          @delete-member="$emit('delete-member', $event)"
          @navigate-to-parents="navigateToParents"
          @set-main-member="setMainMember"
          @show-member-info="$emit('select-member', $event)"
        />
      </div>

      <!-- Children Line -->
      <div v-if="currentChildren.length > 0" class="children-section">
        <GenerationLine
          :members="currentChildren"
          :all-members="members"
          :selected-member-id="selectedMemberId"
          :main-member-id="currentMainMember?.id"
          generation-type="children"
          @select-member="$emit('select-member', $event)"
          @edit-member="$emit('edit-member', $event)"
          @delete-member="$emit('delete-member', $event)"
          @navigate-to-children="navigateToChildren"
          @set-main-member="setMainMember"
          @show-member-info="$emit('select-member', $event)"
        />
      </div>
    </div>
  </div>
  <div v-else class="no-members">
    <p>No family members found. Start by adding a member.</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Member } from '@/types'
import GenerationLine from './GenerationLine.vue'

interface Props {
  members: Member[]
  selectedMemberId?: number
}

interface Emits {
  (e: 'select-member', member: Member): void
  (e: 'edit-member', member: Member): void
  (e: 'delete-member', member: Member): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Navigation state
const currentFocusMember = ref<Member | null>(null)
const currentMainMember = ref<Member | null>(null)
const navigationHistory = ref<
  Array<{ member: Member; type: 'parents' | 'children' }>
>([])

// Initialize with root members (those without parents)
const initializeTree = () => {
  const rootMembers = props.members.filter((m) => !m.parent1Id && !m.parent2Id)
  if (rootMembers.length > 0) {
    currentFocusMember.value = rootMembers[0]
    currentMainMember.value = rootMembers[0]
  }
}

// Computed properties for current view
const currentParents = computed(() => {
  if (!currentFocusMember.value) {
    // Show root members as parents
    return props.members.filter((m) => !m.parent1Id && !m.parent2Id)
  }

  // Show the current focus member and their spouses as parents
  const uniqueParentIds = new Set<number>()
  const parents: Member[] = []

  // Add the focus member
  uniqueParentIds.add(currentFocusMember.value.id)
  parents.push(currentFocusMember.value)

  // Add spouses (avoiding duplicates)
  currentFocusMember.value.spouseIds.forEach((spouseId) => {
    if (!uniqueParentIds.has(spouseId)) {
      const spouse = props.members.find((m) => m.id === spouseId)
      if (spouse) {
        uniqueParentIds.add(spouseId)
        parents.push(spouse)
      }
    }
  })

  return parents
})

const currentChildren = computed(() => {
  // We must have a focus member to find children for.
  if (!currentFocusMember.value) {
    return []
  }

  // filter members to find all child with either parent1Id or parent2Id equal to currentMainMember id
  return props.members.filter((member) => {
    return (
      member.parent1Id === currentMainMember.value?.id ||
      member.parent2Id === currentMainMember.value?.id
    )
  })
})

// Navigation methods
const navigateToParents = (member: Member) => {
  const parent1 = member.parent1Id
    ? props.members.find((m) => m.id === member.parent1Id)
    : null
  const parent2 = member.parent2Id
    ? props.members.find((m) => m.id === member.parent2Id)
    : null

  if (parent1 || parent2) {
    // Add to navigation history
    navigationHistory.value.push({ member, type: 'parents' })

    // Set the first available parent as focus, or the member itself if no parents
    const newFocusMember = parent1 || parent2 || member
    currentFocusMember.value = newFocusMember
    currentMainMember.value = newFocusMember
  }
}

const navigateToChildren = (member: Member) => {
  if (member.childrenIds.length > 0) {
    // Add to navigation history
    navigationHistory.value.push({ member, type: 'children' })

    // Set the member as focus to show their children
    currentFocusMember.value = member
    currentMainMember.value = member
  }
}

const goBack = () => {
  if (navigationHistory.value.length > 0) {
    // Remove the last navigation step
    navigationHistory.value.pop()

    // Set focus to the previous member in history, or null for root
    if (navigationHistory.value.length > 0) {
      const lastStep =
        navigationHistory.value[navigationHistory.value.length - 1]
      currentFocusMember.value = lastStep.member
      currentMainMember.value = lastStep.member
    } else {
      currentFocusMember.value = null
      currentMainMember.value = null
    }
  }
}

const setMainMember = (member: Member) => {
  currentMainMember.value = member
  currentFocusMember.value = member
}

const setMainMemberById = (memberId: number) => {
  const member = props.members.find((m) => m.id === memberId)
  if (member) {
    setMainMember(member)
  }
}

const reset = () => {
  currentFocusMember.value = null
  currentMainMember.value = null
  navigationHistory.value = []
}

const getFullName = (member: Member) => {
  const middleNames =
    member.middleNames.length > 0 ? ` ${member.middleNames.join(' ')}` : ''
  return `${member.firstName}${middleNames} ${member.lastName}`
}

// Initialize the tree when component mounts or members change
import { watch, onMounted } from 'vue'

onMounted(() => {
  initializeTree()
})

watch(
  () => props.members,
  () => {
    if (props.members.length > 0 && !currentFocusMember.value) {
      initializeTree()
    }
  },
  { immediate: true },
)

// Expose methods to parent component
defineExpose({
  reset,
  setMainMember,
  setMainMemberById,
})
</script>

<style scoped>
.family-tree {
  @apply w-full h-full p-8;
}

.tree-container {
  @apply flex flex-col items-center gap-8 min-h-full;
}

.parents-section {
  @apply w-full;
}

.children-section {
  @apply w-full;
}

.navigation-history {
  @apply flex items-center gap-4 mt-4 p-3 bg-gray-800 rounded-lg;
}

.back-btn {
  @apply flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.breadcrumb {
  @apply flex items-center gap-2 text-sm text-gray-300;
}

.breadcrumb-item {
  @apply flex items-center gap-2;
}

.separator {
  @apply text-gray-500;
}

.no-members {
  @apply text-center text-gray-400 p-8;
}
</style>
