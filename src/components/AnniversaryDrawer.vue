<template>
  <div
    class="anniversary-drawer-overlay"
    :class="{ 'drawer-open': isOpen }"
    @click="closeDrawer"
  ></div>

  <aside class="anniversary-drawer" :class="{ 'drawer-open': isOpen }">
    <div class="drawer-header">
      <h2 class="drawer-title">📅 Upcoming Anniversaries</h2>
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
      <div v-if="upcomingAnniversaries.length === 0" class="empty-state">
        <p class="text-gray-400">No upcoming anniversaries</p>
      </div>

      <div v-else>
        <!-- Export Button -->
        <div class="export-section">
          <button
            @click="handleExportToCalendar"
            class="export-btn"
            title="Export anniversaries to calendar file"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Export to Calendar
          </button>
        </div>

        <div class="anniversary-list">
          <div
            v-for="anniversary in upcomingAnniversaries"
            :key="`${anniversary.type}-${anniversary.id}`"
            class="anniversary-item"
            :class="`anniversary-${anniversary.type}`"
          >
            <div class="anniversary-icon">
              <span v-if="anniversary.type === 'birthday'">🎂</span>
              <span v-else-if="anniversary.type === 'marriage'">💍</span>
              <span v-else-if="anniversary.type === 'death'">😢</span>
              <span v-else>📅</span>
            </div>

            <div class="anniversary-info">
              <h3 class="member-name">{{ anniversary.title }}</h3>
              <p class="anniversary-date">{{ formatDate(anniversary.date) }}</p>
              <p class="anniversary-details">{{ anniversary.details }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Member, Union, AnniversaryInfo } from '@/types'
import { useMemberUtils } from '@/composables/useMemberUtils'
import { useCalendarExport } from '@/composables/useCalendarExport'

interface Props {
  members: Member[]
  unions: Union[]
  isOpen: boolean
  showBirthdays?: boolean
  showMarriages?: boolean
  showDeaths?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  showBirthdays: true,
  showMarriages: false,
  showDeaths: false,
})

const emit = defineEmits<Emits>()

// Use the member utils composable
const { getFullName } = useMemberUtils()

// Use the calendar export composable
const { exportToCalendar } = useCalendarExport()

const closeDrawer = () => {
  emit('close')
}

const handleExportToCalendar = () => {
  exportToCalendar(upcomingAnniversaries.value)
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })
}

const upcomingAnniversaries = computed((): AnniversaryInfo[] => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const anniversaries: AnniversaryInfo[] = []

  // Add birthdays
  if (props.showBirthdays) {
    props.members
      .filter((member) => member.birthDate && member.isAlive)
      .forEach((member) => {
        const birthDate = new Date(member.birthDate!)
        const nextBirthday = new Date(
          currentYear,
          birthDate.getMonth(),
          birthDate.getDate(),
        )

        if (nextBirthday < today) {
          nextBirthday.setFullYear(currentYear + 1)
        }

        const daysUntil = Math.ceil(
          (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        )
        const age = nextBirthday.getFullYear() - birthDate.getFullYear()

        anniversaries.push({
          id: `birthday-${member.id}`,
          type: 'birthday',
          title: getFullName(member),
          date: nextBirthday,
          details: `Age: ${age}`,
          daysUntil,
        })
      })
  }

  // Add marriage anniversaries
  if (props.showMarriages) {
    props.unions
      .filter((union) => union.marriageDate)
      .forEach((union) => {
        const marriageDate = new Date(union.marriageDate)
        const nextAnniversary = new Date(
          currentYear,
          marriageDate.getMonth(),
          marriageDate.getDate(),
        )

        if (nextAnniversary < today) {
          nextAnniversary.setFullYear(currentYear + 1)
        }

        const daysUntil = Math.ceil(
          (nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        )
        const years = nextAnniversary.getFullYear() - marriageDate.getFullYear()

        const member1 = props.members.find((m) => m.id === union.member1Id)
        const member2 = props.members.find((m) => m.id === union.member2Id)

        if (member1 && member2) {
          anniversaries.push({
            id: `marriage-${union.id}`,
            type: 'marriage',
            title: `${getFullName(member1)} & ${getFullName(member2)}`,
            date: nextAnniversary,
            details: `${years} year${years !== 1 ? 's' : ''} anniversary`,
            daysUntil,
          })
        }
      })
  }

  // Add death anniversaries (for deceased members)
  if (props.showDeaths) {
    props.members
      .filter((member) => member.deathDate && !member.isAlive)
      .forEach((member) => {
        const deathDate = new Date(member.deathDate!)
        const nextAnniversary = new Date(
          currentYear,
          deathDate.getMonth(),
          deathDate.getDate(),
        )

        if (nextAnniversary < today) {
          nextAnniversary.setFullYear(currentYear + 1)
        }

        const daysUntil = Math.ceil(
          (nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        )
        const years = nextAnniversary.getFullYear() - deathDate.getFullYear()

        anniversaries.push({
          id: `death-${member.id}`,
          type: 'death',
          title: getFullName(member),
          date: nextAnniversary,
          details: `${years} year${years !== 1 ? 's' : ''} memorial`,
          daysUntil,
        })
      })
  }

  return anniversaries.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 15) // Show next 15 anniversaries
})
</script>

<style scoped>
.anniversary-drawer-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300;
  opacity: 0;
  pointer-events: none;
}

.anniversary-drawer-overlay.drawer-open {
  opacity: 1;
  pointer-events: auto;
}

.anniversary-drawer {
  @apply fixed left-0 top-0 h-full w-96 bg-gray-800 border-r border-gray-600 shadow-lg z-50 transform transition-transform duration-300;
  transform: translateX(-100%);
}

.anniversary-drawer.drawer-open {
  transform: translateX(0);
}

.drawer-header {
  @apply flex items-center justify-between p-4 border-b border-gray-600;
}

.drawer-title {
  @apply text-lg font-semibold text-gray-100;
}

.drawer-close {
  @apply p-2 text-gray-400 hover:text-gray-100 transition-colors;
}

.drawer-content {
  @apply px-4 pt-2 pb-96 overflow-y-auto h-full;
}

.empty-state {
  @apply text-center py-8;
}

.anniversary-list {
  @apply space-y-3;
}

.anniversary-item {
  @apply bg-gray-700 rounded-lg p-4 border border-gray-600 flex items-start space-x-3;
}

.anniversary-birthday {
  @apply border-l-4 border-l-blue-500;
}

.anniversary-marriage {
  @apply border-l-4 border-l-pink-500;
}

.anniversary-death {
  @apply border-l-4 border-l-gray-500;
}

.anniversary-icon {
  @apply text-2xl flex-shrink-0;
}

.anniversary-info {
  @apply flex-1 space-y-1;
}

.member-name {
  @apply text-lg font-semibold text-gray-100;
}

.anniversary-date {
  @apply text-blue-400 font-medium;
}

.anniversary-details {
  @apply text-sm text-gray-400;
}

.export-section {
  @apply mb-4 pb-4 border-b border-gray-600;
}

.export-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium;
}
</style>
