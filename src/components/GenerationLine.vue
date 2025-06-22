<template>
  <div class="generation-line">
    <div class="generation-container">
      <!-- PARENTS-SPECIFIC LAYOUT -->
      <template v-if="generationType === 'parents' && mainMember">
        <!-- Main Member -->
        <div class="member-card-wrapper">
          <div
            class="member-card"
            :class="{ selected: isSelected(mainMember) }"
          >
            <div class="member-info" @click="setAsMainMember(mainMember)">
              <MemberCardContent :member="mainMember" />
              <div class="member-actions">
                <ActionButton
                  action="info"
                  @click.stop="showMemberInfo(mainMember)"
                />
                <ActionButton
                  action="edit"
                  @click.stop="editMember(mainMember)"
                />
                <ActionButton
                  action="delete"
                  @click.stop="deleteMember(mainMember)"
                />
              </div>
            </div>

            <!-- Navigation button -->
            <MoveInTreeButton
              v-if="canNavigate(mainMember)"
              :link-type="navigationType"
              @click.stop="navigateToGeneration(mainMember)"
            />
          </div>
        </div>

        <!-- Spouse connector and spouse cards -->
        <div v-if="mainMemberSpouses.length > 0" class="spouse-container">
          <div
            v-for="spouse in mainMemberSpouses"
            :key="spouse.id"
            class="member-card-wrapper"
          >
            <div class="spouse-connector"></div>
            <div class="member-card" :class="{ selected: isSelected(spouse) }">
              <div class="member-info" @click="setAsMainMember(spouse)">
                <MemberCardContent :member="spouse" />
                <div class="member-actions">
                  <ActionButton
                    action="info"
                    @click.stop="showMemberInfo(spouse)"
                  />
                  <ActionButton
                    action="edit"
                    @click.stop="editMember(spouse)"
                  />
                  <ActionButton
                    action="delete"
                    @click.stop="deleteMember(spouse)"
                  />
                </div>
              </div>

              <!-- Navigation button for spouse -->
              <MoveInTreeButton
                v-if="canNavigate(spouse)"
                :link-type="navigationType"
                @click.stop="navigateToGeneration(spouse)"
              />
            </div>
          </div>
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
            <div class="sibling-line"></div>
          </div>

          <div class="sibling-members">
            <div
              v-for="member in siblingGroup.members"
              :key="member.id"
              class="member-card-wrapper"
            >
              <div
                class="member-card"
                :class="{ selected: isSelected(member) }"
              >
                <div class="member-info" @click="setAsMainMember(member)">
                  <MemberCardContent :member="member" />
                  <div class="member-actions">
                    <ActionButton
                      action="info"
                      @click.stop="showMemberInfo(member)"
                    />
                    <ActionButton
                      action="edit"
                      @click.stop="editMember(member)"
                    />
                    <ActionButton
                      action="delete"
                      @click.stop="deleteMember(member)"
                    />
                  </div>
                </div>

                <!-- Navigation to children -->
                <MoveInTreeButton
                  v-if="canNavigate(member)"
                  link-type="children"
                  @click.stop="navigateToGeneration(member)"
                />
              </div>
            </div>
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
import ActionButton from './ActionButton.vue'
import MoveInTreeButton from './MoveInTreeButton.vue'

interface Props {
  members: Member[]
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
  return mainMember.value.spouseIds
    .map((id) => props.allMembers.find((m) => m.id === id))
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

    // Find all direct siblings (same parents)
    const siblings = children.filter((other) => {
      if (!member.parent1Id || !member.parent2Id) return other.id === member.id

      // Group members that have the same two parents, order doesn't matter
      const sameParents =
        other.parent1Id === member.parent1Id &&
        other.parent2Id === member.parent2Id
      const sameParentsSwapped =
        other.parent1Id === member.parent2Id &&
        other.parent2Id === member.parent1Id
      return sameParents || sameParentsSwapped
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
    return member.parent1Id !== undefined || member.parent2Id !== undefined
  } else {
    return member.childrenIds.length > 0
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
  @apply flex items-center justify-center gap-6 flex-wrap;
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
  @apply flex flex-col items-center;
}

.sibling-connector {
  @apply w-full flex justify-center mb-2;
  /* position: relative; */
}

.sibling-line {
  @apply h-0.5 bg-gray-600 rounded-full;
  min-width: 200px;
}

.sibling-members {
  @apply flex items-center gap-6 flex-wrap;
}
</style>
