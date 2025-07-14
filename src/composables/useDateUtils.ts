import { Member } from '@/types'

/**
 * Composable for date utility functions
 * Follows the Single Responsibility Principle - handles date-related utilities
 */
export function useDateUtils() {
  /**
   * Format a date to a readable string
   * @param date - Date object or date string
   * @param format - Format type: 'long' (Month Day), 'short' (MM/DD), 'year' (YYYY)
   * @returns Formatted date string
   */
  const formatDate = (
    date: Date | string,
    format: 'long' | 'short' | 'year' = 'long',
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }

    switch (format) {
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        })
      case 'short':
        return dateObj.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
        })
      case 'year':
        return dateObj.getFullYear().toString()
      default:
        return dateObj.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        })
    }
  }

  /**
   * Get age from birth date
   * @param birthDate - Birth date string
   * @param targetDate - Optional target date (defaults to today)
   * @returns Age as number
   */
  const getAge = (birthDate: string, targetDate: Date = new Date()): number => {
    const birth = new Date(birthDate)
    if (isNaN(birth.getTime())) {
      return 0
    }

    const age = targetDate.getFullYear() - birth.getFullYear()
    const monthDiff = targetDate.getMonth() - birth.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && targetDate.getDate() < birth.getDate())
    ) {
      return age - 1
    }

    return age
  }

  /**
   * Get years between two dates
   * @param startDate - Start date string
   * @param endDate - End date string or Date object
   * @returns Number of years
   */
  const getYearsBetween = (
    startDate: string,
    endDate: string | Date,
  ): number => {
    const start = new Date(startDate)
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0
    }

    const years = end.getFullYear() - start.getFullYear()
    const monthDiff = end.getMonth() - start.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) {
      return years - 1
    }

    return years
  }

  /**
   * Format birth and death information for a member
   * @param member - Member object
   * @param format - Date format type
   * @returns Formatted birth/death string
   */
  const formatBirthDeathInfo = (
    member: Member,
    format: 'long' | 'short' | 'year' = 'year',
  ): string => {
    if (member.isAlive) {
      return member.birthDate
        ? `Born ${formatDate(member.birthDate, format)}`
        : 'Birth date unknown'
    } else {
      const birth = member.birthDate
        ? formatDate(member.birthDate, format)
        : '?'
      const death = member.deathDate
        ? formatDate(member.deathDate, format)
        : '?'
      return `${birth} - ${death}`
    }
  }

  /**
   * Get short birth/death info (used in member cards)
   * @param member - Member object
   * @returns Short formatted string
   */
  const getShortBirthDeathInfo = (member: Member): string => {
    const birthYear = member.birthDate
      ? new Date(member.birthDate).getFullYear()
      : '?'

    if (member.isAlive) {
      return member.birthDate ? `b. ${birthYear}` : 'Birth date unknown'
    }

    const deathYear = member.deathDate
      ? new Date(member.deathDate).getFullYear()
      : '?'
    return `${birthYear} - ${deathYear}`
  }

  /**
   * Check if a date is valid
   * @param date - Date string or Date object
   * @returns Boolean indicating if date is valid
   */
  const isValidDate = (date: string | Date): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return !isNaN(dateObj.getTime())
  }

  /**
   * Get days until a specific date
   * @param targetDate - Target date
   * @param fromDate - Optional start date (defaults to today)
   * @returns Number of days until target date
   */
  const getDaysUntil = (
    targetDate: Date,
    fromDate: Date = new Date(),
  ): number => {
    const timeDiff = targetDate.getTime() - fromDate.getTime()
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  }

  /**
   * Get next anniversary date for a given date
   * @param originalDate - Original date string
   * @param currentYear - Optional current year (defaults to current year)
   * @returns Next anniversary date
   */
  const getNextAnniversary = (
    originalDate: string,
    currentYear: number = new Date().getFullYear(),
  ): Date => {
    const original = new Date(originalDate)
    if (isNaN(original.getTime())) {
      return new Date()
    }

    const nextAnniversary = new Date(
      currentYear,
      original.getMonth(),
      original.getDate(),
    )
    const today = new Date()

    // If anniversary has passed this year, get next year's
    if (nextAnniversary < today) {
      nextAnniversary.setFullYear(currentYear + 1)
    }

    return nextAnniversary
  }

  return {
    formatDate,
    getAge,
    getYearsBetween,
    formatBirthDeathInfo,
    getShortBirthDeathInfo,
    isValidDate,
    getDaysUntil,
    getNextAnniversary,
  }
}
