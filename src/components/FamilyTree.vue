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
          :unions="unions"
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
          :unions="unions"
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
import { Member, Union } from '@/types'
import { useMemberInfo } from '@/composables/useMemberInfo'
import GenerationLine from './GenerationLine.vue'

interface Props {
  members: Member[]
  unions: Union[]
  selectedMemberId?: number
}

interface Emits {
  (e: 'select-member', member: Member): void
  (e: 'edit-member', member: Member): void
  (e: 'delete-member', member: Member): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Use the member utils composable
const { getFullName } = useMemberInfo()

// Navigation state
const currentFocusMember = ref<Member | null>(null)
const currentMainMember = ref<Member | null>(null)
const navigationHistory = ref<
  Array<{ member: Member; type: 'parents' | 'children' }>
>([])

// Initialize with root members (those without parents)
const initializeTree = () => {
  const rootMembers = props.members.filter((m) => !m.parentUnionId)
  if (rootMembers.length > 0) {
    currentFocusMember.value = rootMembers[0]
    currentMainMember.value = rootMembers[0]
  }
}

// Computed properties for current view
const currentParents = computed(() => {
  if (!currentFocusMember.value) {
    // Show root members as parents
    return props.members.filter((m) => !m.parentUnionId)
  }

  // Show the current focus member and their union partners as parents
  const uniqueParentIds = new Set<number>()
  const parents: Member[] = []

  // Add the focus member
  uniqueParentIds.add(currentFocusMember.value.id)
  parents.push(currentFocusMember.value)

  // Add union partners (avoiding duplicates)
  const memberUnions = props.unions.filter(
    (union) =>
      union.member1Id === currentFocusMember.value!.id ||
      union.member2Id === currentFocusMember.value!.id,
  )

  memberUnions.forEach((union) => {
    const partnerId =
      union.member1Id === currentFocusMember.value!.id
        ? union.member2Id
        : union.member1Id
    if (!uniqueParentIds.has(partnerId)) {
      const partner = props.members.find((m) => m.id === partnerId)
      if (partner) {
        uniqueParentIds.add(partnerId)
        parents.push(partner)
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

  // Find unions that involve the current main member
  const memberUnions = props.unions.filter(
    (union) =>
      union.member1Id === currentMainMember.value?.id ||
      union.member2Id === currentMainMember.value?.id,
  )

  // Get all children from these unions
  const childIds = new Set<number>()
  memberUnions.forEach((union) => {
    if (union.childrenIds && Array.isArray(union.childrenIds)) {
      union.childrenIds.forEach((childId) => childIds.add(childId))
    }
  })

  // Return the actual member objects
  return props.members.filter((member) => childIds.has(member.id))
})

// Navigation methods
const navigateToParents = (member: Member) => {
  if (member.parentUnionId) {
    const parentUnion = props.unions.find((u) => u.id === member.parentUnionId)
    if (parentUnion) {
      // Add to navigation history
      navigationHistory.value.push({ member, type: 'parents' })

      // Set the first parent as focus
      const parent1 = props.members.find((m) => m.id === parentUnion.member1Id)
      const parent2 = props.members.find((m) => m.id === parentUnion.member2Id)
      const newFocusMember = parent1 || parent2 || member
      currentFocusMember.value = newFocusMember
      currentMainMember.value = newFocusMember
    }
  }
}

const navigateToChildren = (member: Member) => {
  // Check if member has children through unions
  const memberUnions = props.unions.filter(
    (union) => union.member1Id === member.id || union.member2Id === member.id,
  )

  const hasChildren = memberUnions.some(
    (union) =>
      union.childrenIds &&
      Array.isArray(union.childrenIds) &&
      union.childrenIds.length > 0,
  )

  if (hasChildren) {
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
