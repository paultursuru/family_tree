import { CalendarEvent, AnniversaryInfo } from '@/types'

/**
 * Composable for calendar export functionality
 * Follows the Single Responsibility Principle - handles calendar export utilities
 */

export function useCalendarExport() {
  /**
   * Create ICS file content from calendar events
   * @param events - Array of calendar events
   * @returns ICS file content as string
   */
  const createICSFile = (events: CalendarEvent[]): string => {
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Family Tree//Anniversaries//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      '',
    ]

    events.forEach((event) => {
      ics.push(
        'BEGIN:VEVENT',
        `UID:${event.uid}`,
        `DTSTART;VALUE=DATE:${event.startDate}`,
        `DTEND;VALUE=DATE:${event.endDate}`,
        `SUMMARY:${event.summary}`,
        `DESCRIPTION:${event.description}`,
        `CATEGORIES:${event.categories.join(',')}`,
        'END:VEVENT',
        '',
      )
    })

    ics.push('END:VCALENDAR')
    return ics.join('\r\n')
  }

  /**
   * Convert anniversary info to calendar events
   * @param anniversaries - Array of anniversary information
   * @returns Array of calendar events
   */
  const convertAnniversariesToEvents = (
    anniversaries: AnniversaryInfo[],
  ): CalendarEvent[] => {
    return anniversaries.map((anniversary) => ({
      uid: `${anniversary.type}-${anniversary.id}-${new Date().getFullYear()}@familytree.com`,
      summary: anniversary.title,
      description: anniversary.details,
      startDate: anniversary.date.toISOString().slice(0, 10).replace(/-/g, ''),
      endDate: new Date(anniversary.date.getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, ''),
      categories: [anniversary.type],
    }))
  }

  /**
   * Export anniversaries to ICS file and trigger download
   * @param anniversaries - Array of anniversary information
   * @param filename - Optional filename for the download (default: 'family-anniversaries.ics')
   */
  const exportToCalendar = (
    anniversaries: AnniversaryInfo[],
    filename: string = 'family-anniversaries.ics',
  ) => {
    const events = convertAnniversariesToEvents(anniversaries)
    const icsContent = createICSFile(events)

    // Create download
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    createICSFile,
    convertAnniversariesToEvents,
    exportToCalendar,
  }
}
