<template>
  <div class="family-node">
    <div class="node-content">
      <div class="parents-container">
        <div class="member-card-wrapper">
          <div
            class="member-card"
            :class="{ selected: isSelected(node.member) }"
          >
            <div class="member-info" @click="selectMember(node.member)">
              <MemberCardContent :member="node.member" />
              <div class="member-actions">
                <button
                  @click.stop="editMember(node.member)"
                  class="action-btn edit-btn"
                  title="Edit member"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </button>
                <button
                  @click.stop="deleteMember(node.member)"
                  class="action-btn delete-btn"
                  title="Delete member"
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
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="spouses.length > 0" class="spouse-container">
          <div
            v-for="spouse in spouses"
            :key="spouse.id"
            class="member-card-wrapper"
          >
            <div class="spouse-connector"></div>
            <div class="member-card" :class="{ selected: isSelected(spouse) }">
              <div class="member-info" @click="selectMember(spouse)">
                <MemberCardContent :member="spouse" />
                <div class="member-actions">
                  <button
                    @click.stop="editMember(spouse)"
                    class="action-btn edit-btn"
                    title="Edit member"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </button>
                  <button
                    @click.stop="deleteMember(spouse)"
                    class="action-btn delete-btn"
                    title="Delete member"
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
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Children -->
    <div v-if="node.children.length > 0" class="children-branch">
      <div class="children-connector"></div>
      <div class="children-container">
        <FamilyNodeComponent
          v-for="childNode in node.children"
          :key="childNode.member.id"
          :node="childNode"
          :members="members"
          :unions="unions"
          :selected-member-id="selectedMemberId"
          @select-member="$emit('select-member', $event)"
          @edit-member="$emit('edit-member', $event)"
          @delete-member="$emit('delete-member', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Member, FamilyNode as FamilyNodeType, Union } from '@/types'
import FamilyNodeComponent from './FamilyNode.vue'
import MemberCardContent from './MemberCardContent.vue'

interface Props {
  node: FamilyNodeType
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

const spouses = computed(() => {
  const memberUnions = props.unions.filter(
    (union) =>
      union.member1Id === props.node.member.id ||
      union.member2Id === props.node.member.id,
  )

  return memberUnions
    .map((union) => {
      const partnerId =
        union.member1Id === props.node.member.id
          ? union.member2Id
          : union.member1Id
      return props.members.find((m) => m.id === partnerId)
    })
    .filter((m): m is Member => !!m)
})

const isSelected = (member: Member) => {
  return props.selectedMemberId === member.id
}

const selectMember = (member: Member) => emit('select-member', member)
const editMember = (member: Member) => emit('edit-member', member)
const deleteMember = (member: Member) => emit('delete-member', member)
</script>

<style scoped>
.family-node {
  @apply flex flex-col items-center;
}
.node-content {
  @apply flex items-center;
}
.parents-container {
  @apply flex items-center;
}
.member-card-wrapper {
  @apply flex items-center;
}
.member-card {
  @apply bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 min-w-[280px] max-w-xs relative;
}
.member-card.selected {
  @apply border-blue-500 shadow-lg;
}
.member-info {
  @apply p-3 cursor-pointer flex items-center;
}
.member-actions {
  @apply flex flex-col gap-1 absolute top-2 right-2;
}
.action-btn {
  @apply p-1.5 rounded bg-gray-100/80 hover:bg-gray-200 transition-colors;
}
.edit-btn {
  @apply text-blue-600 hover:text-blue-800;
}
.delete-btn {
  @apply text-red-600 hover:text-red-800;
}
.spouse-container {
  @apply flex items-center;
}
.spouse-connector {
  @apply w-8 h-0.5 bg-gray-300;
}

/* Children */
.children-branch {
  @apply pt-4 w-full flex flex-col items-center;
}
.children-connector {
  @apply w-px h-6 bg-gray-300;
}
.children-container {
  @apply flex gap-6 justify-center flex-wrap;
}
</style>
