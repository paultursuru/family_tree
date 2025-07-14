import { Member } from '@/types'

/**
 * Composable for member utility functions
 * Follows the Single Responsibility Principle - handles member-related utilities
 */
export function useMemberUtils() {
  /**
   * Get the full name of a member without middle names
   * @param member - The member object
   * @returns Full name string
   */
  const getFullName = (
    member: Member,
    options?: { includeMaidenName?: boolean; includeMiddleNames?: boolean },
  ): string => {
    const names = [member.firstName]
    if (options?.includeMiddleNames && member.middleNames.length > 0) {
      names.push(...member.middleNames)
    }
    if (member.lastName) {
      names.push(member.lastName)
    }
    if (options?.includeMaidenName && member.maidenName) {
      names.push(`(b. ${member.maidenName})`)
    }
    return names.filter((name) => name.trim()).join(' ')
  }

  /**
   * Get the full name of a member including middle names
   * @param member - The member object
   * @returns Full name string with middle names
   */
  const getFullNameWithMiddle = (member: Member): string => {
    const middleNames =
      member.middleNames.length > 0 ? ` ${member.middleNames.join(' ')}` : ''
    return `${member.firstName}${middleNames} ${member.lastName}`
  }

  /**
   * Get a short name (first + last only)
   * @param member - The member object
   * @returns Short name string
   */
  const getShortName = (member: Member): string => {
    return `${member.firstName} ${member.lastName}`
  }

  /**
   * Get initials from member name
   * @param member - The member object
   * @returns Initials string
   */
  const getInitials = (member: Member): string => {
    const firstInitial = member.firstName.charAt(0).toUpperCase()
    const lastInitial = member.lastName.charAt(0).toUpperCase()
    return `${firstInitial}${lastInitial}`
  }

  /**
   * Check if member has a complete name
   * @param member - The member object
   * @returns Boolean indicating if name is complete
   */
  const hasCompleteName = (member: Member): boolean => {
    return member.firstName.trim() !== '' && member.lastName.trim() !== ''
  }

  return {
    getFullName,
    getFullNameWithMiddle,
    getShortName,
    getInitials,
    hasCompleteName,
  }
}
