<template>
  <div class="generation-line">
    <div class="generation-container">
      <!-- PARENTS-SPECIFIC LAYOUT -->
      <template v-if="generationType === 'parents' && mainMember">
        <!-- Main Member -->
        <MemberCard
          :member="mainMember"
          :selected-member-id="selectedMemberId"
          :card-type="generationType"
          :unions="unions"
          :all-members="allMembers"
          @set-main-member="setAsMainMember"
          @select-member="selectMember"
          @edit-member="editMember"
          @delete-member="deleteMember"
          @show-member-info="showMemberInfo"
          @navigate-to-parents="navigateToGeneration"
          @navigate-to-children="navigateToGeneration"
        />

        <!-- Spouse connector and spouse cards -->
        <div v-if="mainMemberSpouses.length > 0" class="spouse-container">
          <MemberCard
            v-for="member in mainMemberSpouses"
            :key="member.id"
            :member="member"
            :selected-member-id="selectedMemberId"
            :card-type="generationType"
            :is-spouse="true"
            :unions="unions"
            :all-members="allMembers"
            @set-main-member="setAsMainMember"
            @select-member="selectMember"
            @edit-member="editMember"
            @delete-member="deleteMember"
            @show-member-info="showMemberInfo"
            @navigate-to-parents="navigateToGeneration"
            @navigate-to-children="navigateToGeneration"
          />
        </div>
      </template>

      <!-- CHILDREN-SPECIFIC LAYOUT -->
      <template v-if="generationType === 'children'">
        <div
          v-for="siblingGroup in siblingGroups"
          :key="siblingGroup.id"
          class="sibling-group"
        >
          <!-- Sibling connector line -->
          <div v-if="siblingGroup.members.length > 1" class="sibling-connector">
            <div class="sibling-line-single"></div>
            <div class="sibling-bottom-line"></div>
          </div>
          <div v-else class="sibling-connector">
            <div class="sibling-line-single"></div>
          </div>

          <div class="sibling-members">
            <MemberCard
              v-for="member in siblingGroup.members"
              :key="member.id"
              :member="member"
              :selected-member-id="selectedMemberId"
              :card-type="generationType"
              :unions="unions"
              :all-members="allMembers"
              @set-main-member="setAsMainMember"
              @select-member="selectMember"
              @edit-member="editMember"
              @delete-member="deleteMember"
              @show-member-info="showMemberInfo"
              @navigate-to-parents="navigateToGeneration"
              @navigate-to-children="navigateToGeneration"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Member } from '@/types'
import MemberCardContent from './MemberCardContent.vue'
import MemberActions from './MemberActions.vue'
import MoveInTreeButton from './MoveInTreeButton.vue'
import MemberCard from './MemberCard.vue'

interface Props {
  members: Member[]
  unions: Union[]
  allMembers: Member[]
  selectedMemberId?: number
  mainMemberId?: number
  generationType: 'parents' | 'children'
}

interface Emits {
  (e: 'select-member', member: Member): void
  (e: 'edit-member', member: Member): void
  (e: 'delete-member', member: Member): void
  (e: 'navigate-to-parents', member: Member): void
  (e: 'navigate-to-children', member: Member): void
  (e: 'set-main-member', member: Member): void
  (e: 'show-member-info', member: Member): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties
const mainMember = computed(() => {
  if (props.generationType !== 'parents' || !props.mainMemberId) return null
  return (
    props.allMembers.find((m) => m.id === props.mainMemberId) ||
    props.members[0]
  )
})

const mainMemberSpouses = computed(() => {
  if (!mainMember.value) return []
  const memberUnions = props.unions.filter(
    (union) =>
      union.member1Id === mainMember.value!.id ||
      union.member2Id === mainMember.value!.id,
  )

  return memberUnions
    .map((union) => {
      const partnerId =
        union.member1Id === mainMember.value!.id
          ? union.member2Id
          : union.member1Id
      return props.allMembers.find((m) => m.id === partnerId)
    })
    .filter((m): m is Member => !!m)
})

const navigationType = computed(() => props.generationType)

// Sibling groups logic (for children line)
const siblingGroups = computed(() => {
  if (props.generationType !== 'children') return []

  const children = props.members
  const groups: { id: string; members: Member[] }[] = []
  const processed = new Set<number>()

  children.forEach((member) => {
    if (processed.has(member.id)) return

    // Find all direct siblings (same parent union)
    const siblings = children.filter((other) => {
      if (!member.parentUnionId) return other.id === member.id

      // Group members that have the same parent union
      return other.parentUnionId === member.parentUnionId
    })

    if (siblings.length > 0) {
      const groupId = siblings
        .map((s) => s.id)
        .sort()
        .join('-')
      groups.push({
        id: groupId,
        members: siblings,
      })

      // Mark all siblings as processed
      siblings.forEach((s) => processed.add(s.id))
    }
  })

  return groups
})

// Methods
const isSelected = (member: Member) => {
  return props.selectedMemberId === member.id
}

const canNavigate = (member: Member) => {
  if (props.generationType === 'parents') {
    return member.parentUnionId !== undefined
  } else {
    // Check for children through unions
    const memberUnions = props.unions.filter(
      (union) => union.member1Id === member.id || union.member2Id === member.id,
    )

    return memberUnions.some(
      (union) =>
        union.childrenIds &&
        Array.isArray(union.childrenIds) &&
        union.childrenIds.length > 0,
    )
  }
}

const setAsMainMember = (member: Member) => emit('set-main-member', member)
const selectMember = (member: Member) => emit('select-member', member)
const editMember = (member: Member) => emit('edit-member', member)
const deleteMember = (member: Member) => emit('delete-member', member)
const showMemberInfo = (member: Member) => emit('show-member-info', member)

const navigateToGeneration = (member: Member) => {
  if (props.generationType === 'parents') {
    emit('navigate-to-parents', member)
  } else {
    emit('navigate-to-children', member)
  }
}
</script>

<style scoped>
.generation-line {
  @apply w-full;
}

.generation-container {
  @apply flex items-center justify-center flex-wrap;
}

.member-card-wrapper {
  @apply flex items-center;
}

.member-card {
  @apply bg-gray-800 rounded-lg shadow-md border-2 border-gray-600 hover:border-blue-400 transition-all duration-200 min-w-[280px] relative;
}

.member-card.selected {
  @apply border-blue-500 shadow-lg;
}

.member-info {
  @apply p-3 cursor-pointer flex items-center;
}

.member-actions {
  @apply flex gap-1 absolute top-2 right-2 transition-all duration-200 ease-in-out opacity-0;
}
.member-card:hover .member-actions {
  @apply opacity-100;
}

.spouse-container {
  @apply flex items-center;
}

.spouse-connector {
  @apply w-8 h-0.5 bg-gray-600;
}

.sibling-group {
  @apply flex flex-col items-center mr-6;
}

.sibling-connector {
  @apply w-full flex flex-col justify-center mb-2 items-center;
  /* position: relative; */
}

.sibling-line-single {
  @apply h-5 w-0.5 bg-gray-600 rounded-full;
}

.sibling-bottom-line {
  @apply h-0.5 bg-gray-600 rounded-full w-48;
}

.sibling-members {
  @apply flex items-center gap-6 flex-wrap;
}
</style>
