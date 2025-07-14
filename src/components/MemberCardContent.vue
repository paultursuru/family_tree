<template>
  <div class="member-card-content">
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
    <div class="member-details">
      <h3 class="member-name">{{ fullName }}</h3>
      <p class="member-dates">{{ birthDeathInfo }}</p>
      <p v-if="member.notes" class="member-notes">{{ member.notes }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Member } from '@/types'
import { useMemberInfo } from '@/composables/useMemberInfo'

interface Props {
  member: Member
}

const props = defineProps<Props>()

// Use the member info composable
const { getShortName, getMemberInitials, getShortBirthDeathInfo } =
  useMemberInfo()

const fullName = computed(() => {
  return getShortName(props.member)
})

const initials = computed(() => {
  return getMemberInitials(props.member)
})

const birthDeathInfo = computed(() => {
  return getShortBirthDeathInfo(props.member)
})
</script>

<style scoped>
.member-card-content {
  @apply flex items-center flex-1;
}
.member-photo {
  @apply mr-3 shrink-0;
}
.photo {
  @apply w-12 h-12 rounded-full object-cover;
}
.photo-placeholder {
  @apply w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-gray-200 font-semibold text-sm;
}
.member-details {
  @apply flex-1;
}
.member-name {
  @apply text-base font-semibold text-gray-100;
}
.member-dates {
  @apply text-sm text-gray-300;
}
.member-notes {
  @apply text-xs text-gray-400 italic mt-1;
}
</style>
