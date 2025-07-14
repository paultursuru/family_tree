<template>
  <div v-if="member" class="member-detail">
    <div class="detail-header">
      <div class="member-photo">
        <img
          v-if="member.photoUrl"
          :src="member.photoUrl"
          :alt="fullName"
          class="photo"
        />
        <div v-else class="photo-placeholder">
          {{ initials }}
        </div>
      </div>
      <div class="member-info">
        <h2 class="member-name">{{ fullName }}</h2>
        <p class="member-status">{{ statusText }}</p>
        <p class="member-dates">{{ birthDeathInfo }}</p>
      </div>
      <div class="member-actions">
        <button @click="$emit('edit', member)" class="action-btn edit-btn">
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path>
          </svg>
          Edit
        </button>
        <button @click="$emit('delete', member)" class="action-btn delete-btn">
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            ></path>
          </svg>
          Delete
        </button>
      </div>
    </div>

    <div class="detail-content">
      <!-- Personal Information -->
      <div class="detail-section">
        <h3 class="section-title">Personal Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Gender:</span>
            <span class="info-value">{{ member.gender }}</span>
          </div>
          <div v-if="member.maidenName" class="info-item">
            <span class="info-label">Maiden Name:</span>
            <span class="info-value">{{ member.maidenName }}</span>
          </div>
          <div v-if="member.birthPlace" class="info-item">
            <span class="info-label">Birth Place:</span>
            <span class="info-value">{{ member.birthPlace }}</span>
          </div>
          <div v-if="member.deathPlace" class="info-item">
            <span class="info-label">Death Place:</span>
            <span class="info-value">{{ member.deathPlace }}</span>
          </div>
        </div>
      </div>

      <!-- Family Relationships -->
      <div class="detail-section">
        <h3 class="section-title">Family Relationships</h3>

        <!-- Parents -->
        <div v-if="parents.length > 0" class="relationship-group">
          <h4 class="relationship-title">Parents</h4>
          <div class="relationship-list">
            <div
              v-for="parent in parents"
              :key="parent.id"
              @click="$emit('select', parent)"
              class="relationship-item clickable"
            >
              <div class="relationship-photo">
                <img
                  v-if="parent.photoUrl"
                  :src="parent.photoUrl"
                  :alt="getFullName(parent)"
                  class="photo"
                />
                <div v-else class="photo-placeholder">
                  {{ getInitials(parent) }}
                </div>
              </div>
              <div class="relationship-info">
                <span class="relationship-name">{{ getFullName(parent) }}</span>
                <span class="relationship-dates">{{
                  getBirthDeathInfo(parent)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Unions -->
        <div v-if="unions.length > 0" class="relationship-group">
          <h4 class="relationship-title">Unions</h4>
          <div class="relationship-list">
            <div
              v-for="union in unions"
              :key="union.id"
              class="relationship-item"
            >
              <div class="union-info">
                <div class="union-members">
                  <span class="union-member">{{
                    getUnionPartnerDisplayName(union, member, props.members)
                  }}</span>
                </div>
                <div class="union-dates">
                  <span v-if="union.marriageDate" class="marriage-date">
                    Married: {{ formatDate(union.marriageDate) }}
                    <span v-if="union.marriagePlace">
                      in {{ union.marriagePlace }}</span
                    >
                  </span>
                  <span v-if="union.divorceDate" class="divorce-date">
                    Divorced: {{ formatDate(union.divorceDate) }}
                    <span v-if="union.divorcePlace">
                      in {{ union.divorcePlace }}</span
                    >
                  </span>
                </div>
              </div>
              <div class="union-actions">
                <button
                  @click="$emit('edit-union', union)"
                  class="action-btn edit-btn"
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
              </div>
            </div>
          </div>
        </div>

        <!-- Add Union Button -->
        <div class="relationship-group">
          <button @click="$emit('add-union')" class="add-union-btn">
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
            Add Union
          </button>
        </div>

        <!-- Children -->
        <div v-if="children.length > 0" class="relationship-group">
          <h4 class="relationship-title">Children</h4>
          <div class="relationship-list">
            <div
              v-for="child in children"
              :key="child.id"
              @click="$emit('select', child)"
              class="relationship-item clickable"
            >
              <div class="relationship-photo">
                <img
                  v-if="child.photoUrl"
                  :src="child.photoUrl"
                  :alt="getFullName(child)"
                  class="photo"
                />
                <div v-else class="photo-placeholder">
                  {{ getInitials(child) }}
                </div>
              </div>
              <div class="relationship-info">
                <span class="relationship-name">{{ getFullName(child) }}</span>
                <span class="relationship-dates">{{
                  getBirthDeathInfo(child)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Direct Siblings -->
        <div v-if="directSiblings.length > 0" class="relationship-group">
          <h4 class="relationship-title">Direct Siblings</h4>
          <div class="relationship-list">
            <div
              v-for="sibling in directSiblings"
              :key="sibling.id"
              @click="$emit('select', sibling)"
              class="relationship-item clickable"
            >
              <div class="relationship-photo">
                <img
                  v-if="sibling.photoUrl"
                  :src="sibling.photoUrl"
                  :alt="getFullName(sibling)"
                  class="photo"
                />
                <div v-else class="photo-placeholder">
                  {{ getInitials(sibling) }}
                </div>
              </div>
              <div class="relationship-info">
                <span class="relationship-name">{{
                  getFullName(sibling)
                }}</span>
                <span class="relationship-dates">{{
                  getBirthDeathInfo(sibling)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step Siblings -->
        <div v-if="stepSiblings.length > 0" class="relationship-group">
          <h4 class="relationship-title">Step Siblings</h4>
          <div class="relationship-list">
            <div
              v-for="sibling in stepSiblings"
              :key="sibling.id"
              @click="$emit('select', sibling)"
              class="relationship-item clickable"
            >
              <div class="relationship-photo">
                <img
                  v-if="sibling.photoUrl"
                  :src="sibling.photoUrl"
                  :alt="getFullName(sibling)"
                  class="photo"
                />
                <div v-else class="photo-placeholder">
                  {{ getInitials(sibling) }}
                </div>
              </div>
              <div class="relationship-info">
                <span class="relationship-name">{{
                  getFullName(sibling)
                }}</span>
                <span class="relationship-dates">{{
                  getBirthDeathInfo(sibling)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="member.notes" class="detail-section">
        <h3 class="section-title">Notes</h3>
        <p class="notes-text">{{ member.notes }}</p>
      </div>
    </div>
  </div>

  <div v-else class="no-selection">
    <div class="no-selection-content">
      <svg
        class="w-16 h-16 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        ></path>
      </svg>
      <h3 class="no-selection-title">No Member Selected</h3>
      <p class="no-selection-text">
        Click on a family member in the tree to view their details
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Member, Union } from '@/types'
import { useMemberInfo } from '@/composables/useMemberInfo'
import { useRelationships } from '@/composables/useRelationships'
import { useDateUtils } from '@/composables/useDateUtils'

interface Props {
  member?: Member
  members: Member[]
  unions: Union[]
}

interface Emits {
  (e: 'select', member: Member): void
  (e: 'edit', member: Member): void
  (e: 'delete', member: Member): void
  (e: 'add-union'): void
  (e: 'edit-union', union: Union): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Use the member info composable
const {
  getFullName,
  getInitials,
  getStatusText,
  getBirthDeathInfo,
  getFullNameWithMiddle,
  getMemberInitials,
} = useMemberInfo()

// Use the relationships composable
const {
  getParents,
  getChildren,
  getDirectSiblings,
  getStepSiblings,
  getMemberUnions,
  getUnionPartnerName: getUnionPartnerDisplayName,
} = useRelationships()

const { formatDate } = useDateUtils()

const fullName = computed(() => {
  if (!props.member) return ''
  return getFullNameWithMiddle(props.member)
})

const initials = computed(() => {
  if (!props.member) return ''
  return getMemberInitials(props.member)
})

const statusText = computed(() => {
  if (!props.member) return ''
  return getStatusText(props.member)
})

const birthDeathInfo = computed(() => {
  if (!props.member) return ''
  return getBirthDeathInfo(props.member, 'year')
})

const parents = computed(() => {
  if (!props.member) return []
  return getParents(props.member, props.unions, props.members)
})

const children = computed(() => {
  if (!props.member) return []
  return getChildren(props.member, props.unions, props.members)
})

const unions = computed(() => {
  if (!props.member) return []
  return getMemberUnions(props.member, props.unions)
})

const directSiblings = computed(() => {
  if (!props.member) return []
  return getDirectSiblings(props.member, props.members)
})

const stepSiblings = computed(() => {
  if (!props.member) return []
  return getStepSiblings(props.member, props.members, props.unions)
})

const getMemberName = (memberId: number) => {
  const member = props.members.find((m) => m.id === memberId)
  return member
    ? getFullName(member, {
        includeMaidenName: true,
        includeMiddleNames: true,
      })
    : 'Unknown Member'
}
</script>

<style scoped>
.member-detail {
  @apply h-full pb-4;
}

.detail-header {
  @apply flex flex-col items-center p-6 border-b border-gray-700 bg-gray-900;
}

.member-photo {
  @apply mb-4;
}

.photo {
  @apply w-20 h-20 rounded-full object-cover;
}

.photo-placeholder {
  @apply w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-gray-200 font-semibold text-xl;
}

.member-info {
  @apply text-center mb-4;
}

.member-name {
  @apply text-xl font-bold text-gray-100 mb-1;
}

.member-status {
  @apply text-sm text-gray-300 mb-1;
}

.member-dates {
  @apply text-sm text-gray-400;
}

.member-actions {
  @apply flex gap-2;
}

.action-btn {
  @apply flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm;
}

.edit-btn {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.delete-btn {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.detail-content {
  @apply p-4 space-y-6 overflow-y-auto;
}

.detail-section {
  @apply space-y-4 pb-24;
}

.section-title {
  @apply text-lg font-semibold text-gray-100;
}

.info-grid {
  @apply space-y-3;
}

.info-item {
  @apply flex justify-between items-center py-2 border-b border-gray-700;
}

.info-label {
  @apply font-medium text-gray-300;
}

.info-value {
  @apply text-gray-100;
}

.relationship-group {
  @apply space-y-3;
}

.relationship-title {
  @apply text-base font-medium text-gray-300;
}

.relationship-list {
  @apply space-y-2;
}

.relationship-item {
  @apply flex items-center p-3 rounded-lg border border-gray-600;
}

.relationship-item.clickable {
  @apply cursor-pointer hover:bg-gray-700 transition-colors;
}

.relationship-photo {
  @apply mr-3;
}

.relationship-photo .photo,
.relationship-photo .photo-placeholder {
  @apply w-10 h-10 text-sm;
}

.relationship-info {
  @apply flex-1;
}

.relationship-name {
  @apply block font-medium text-gray-100;
}

.relationship-dates {
  @apply block text-sm text-gray-400;
}

.notes-text {
  @apply text-gray-300 leading-relaxed;
}

.union-info {
  @apply flex-1;
}

.union-members {
  @apply flex items-center gap-2 mb-1;
}

.union-member {
  @apply font-medium text-gray-100;
}

.union-separator {
  @apply text-gray-400 text-sm;
}

.union-dates {
  @apply text-sm text-gray-400 space-y-1;
}

.marriage-date {
  @apply text-green-400;
}

.divorce-date {
  @apply text-red-400;
}

.union-actions {
  @apply flex items-center;
}

.add-union-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm;
}

.no-selection {
  @apply flex items-center justify-center h-full bg-gray-900;
}

.no-selection-content {
  @apply text-center p-8;
}

.no-selection-title {
  @apply text-lg font-medium text-gray-100 mb-2;
}

.no-selection-text {
  @apply text-gray-400;
}
</style>
