<script setup lang="ts">
import { Member, Union } from '@/types'
import MemberCardContent from './MemberCardContent.vue'
import MemberActions from './MemberActions.vue'
import MoveInTreeButton from './MoveInTreeButton.vue'

interface Props {
  member: Member
  selectedMemberId: string
  cardType: 'parents' | 'children'
  isSpouse?: boolean | false
  unions?: Union[]
  allMembers?: Member[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'set-main-member', member: Member): void
  (e: 'select-member', member: Member): void
  (e: 'edit-member', member: Member): void
  (e: 'delete-member', member: Member): void
  (e: 'show-member-info', member: Member): void
  (e: 'navigate-to-parents', member: Member): void
  (e: 'navigate-to-children', member: Member): void
}>()

const isSelected = (member: Member) => {
  return props.selectedMemberId === member.id
}

const canNavigate = (member: Member) => {
  if (props.cardType === 'parents') {
    return member.parentUnionId !== undefined
  } else {
    // Check for children through unions
    if (!props.unions || !props.allMembers) return false

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
  if (props.cardType === 'parents') {
    emit('navigate-to-parents', member)
  } else {
    emit('navigate-to-children', member)
  }
}
</script>

<template>
  <div class="member-card-wrapper">
    <div v-if="isSpouse" class="spouse-connector"></div>
    <div class="member-card" :class="{ selected: isSelected(member) }">
      <MoveInTreeButton
        v-if="canNavigate(member) && props.cardType === 'parents'"
        link-type="parents"
        @click.stop="navigateToGeneration(member)"
      />
      <div class="member-info" @click="setAsMainMember(member)">
        <MemberCardContent :member="member" />
        <MemberActions
          :member="member"
          @info="showMemberInfo"
          @edit="editMember"
          @delete="deleteMember"
        />
      </div>

      <!-- Navigation to children -->
      <MoveInTreeButton
        v-if="canNavigate(member) && props.cardType === 'children'"
        link-type="children"
        @click.stop="navigateToGeneration(member)"
      />
    </div>
  </div>
</template>

<style scoped>
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
.spouse-connector {
  @apply w-8 h-0.5 bg-gray-600;
}
</style>
