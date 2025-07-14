import { computed } from 'vue'
import { Member, Union } from '@/types'
import { useMemberUtils } from './useMemberUtils'
import { useDateUtils } from './useDateUtils'

/**
 * Composable for member information utilities
 * Extends useMemberUtils with additional member info functions
 * Follows the Single Responsibility Principle - handles member information display
 */
export function useMemberInfo() {
  const { getFullName, getInitials, getShortName, hasCompleteName } =
    useMemberUtils()
  const { formatBirthDeathInfo, getShortBirthDeathInfo, getAge } =
    useDateUtils()

  /**
   * Get member status text (Living/Deceased)
   * @param member - Member object
   * @returns Status text string
   */
  const getStatusText = (member: Member): string => {
    return member.isAlive ? 'Living' : 'Deceased'
  }

  /**
   * Get formatted birth/death information
   * @param member - Member object
   * @param format - Date format type
   * @returns Formatted birth/death string
   */
  const getBirthDeathInfo = (
    member: Member,
    format: 'long' | 'short' | 'year' = 'year',
  ): string => {
    return formatBirthDeathInfo(member, format)
  }

  /**
   * Get short birth/death info for cards
   * @param member - Member object
   * @returns Short formatted string
   */
  const getShortBirthDeathInfoForMember = (member: Member): string => {
    return getShortBirthDeathInfo(member)
  }

  /**
   * Get member's current age
   * @param member - Member object
   * @returns Age as number or null if no birth date
   */
  const getCurrentAge = (member: Member): number | null => {
    if (!member.birthDate) return null
    return getAge(member.birthDate)
  }

  /**
   * Get member's age at death
   * @param member - Member object
   * @returns Age at death or null if not deceased or missing dates
   */
  const getAgeAtDeath = (member: Member): number | null => {
    if (member.isAlive || !member.birthDate || !member.deathDate) return null
    return getAge(member.birthDate, new Date(member.deathDate))
  }

  /**
   * Get member's full name with middle names
   * @param member - Member object
   * @returns Full name with middle names
   */
  const getFullNameWithMiddle = (member: Member): string => {
    const middleNames =
      member.middleNames.length > 0 ? ` ${member.middleNames.join(' ')}` : ''
    return `${member.firstName}${middleNames} ${member.lastName}`
  }

  /**
   * Get member's display name (with maiden name if applicable)
   * @param member - Member object
   * @returns Display name string
   */
  const getDisplayName = (member: Member): string => {
    return getFullName(member, {
      includeMaidenName: true,
      includeMiddleNames: true,
    })
  }

  /**
   * Get member's initials
   * @param member - Member object
   * @returns Initials string
   */
  const getMemberInitials = (member: Member): string => {
    return getInitials(member)
  }

  /**
   * Check if member has photo
   * @param member - Member object
   * @returns Boolean indicating if member has photo
   */
  const hasPhoto = (member: Member): boolean => {
    return !!member.photoUrl && member.photoUrl.trim() !== ''
  }

  /**
   * Check if member has birth information
   * @param member - Member object
   * @returns Boolean indicating if member has birth info
   */
  const hasBirthInfo = (member: Member): boolean => {
    return !!member.birthDate || !!member.birthPlace
  }

  /**
   * Check if member has death information
   * @param member - Member object
   * @returns Boolean indicating if member has death info
   */
  const hasDeathInfo = (member: Member): boolean => {
    return !member.isAlive && (!!member.deathDate || !!member.deathPlace)
  }

  /**
   * Check if member has maiden name
   * @param member - Member object
   * @returns Boolean indicating if member has maiden name
   */
  const hasMaidenName = (member: Member): boolean => {
    return !!member.maidenName && member.maidenName.trim() !== ''
  }

  /**
   * Check if member has notes
   * @param member - Member object
   * @returns Boolean indicating if member has notes
   */
  const hasNotes = (member: Member): boolean => {
    return !!member.notes && member.notes.trim() !== ''
  }

  /**
   * Get member's relationship status
   * @param member - Member object
   * @param unions - Array of unions
   * @returns Relationship status string
   */
  const getRelationshipStatus = (member: Member, unions: Union[]): string => {
    const memberUnions = unions.filter(
      (union) => union.member1Id === member.id || union.member2Id === member.id,
    )

    if (memberUnions.length === 0) return 'Single'
    if (memberUnions.length === 1) return 'Married'
    return `Multiple relationships (${memberUnions.length})`
  }

  /**
   * Get member's parent count
   * @param member - Member object
   * @param unions - Array of unions
   * @returns Number of parents
   */
  const getParentCount = (member: Member, unions: Union[]): number => {
    if (!member.parentUnionId) return 0

    const parentUnion = unions.find((u) => u.id === member.parentUnionId)
    if (!parentUnion) return 0

    return [parentUnion.member1Id, parentUnion.member2Id].filter(
      (id) => id !== 0,
    ).length
  }

  /**
   * Get member's children count
   * @param member - Member object
   * @param unions - Array of unions
   * @returns Number of children
   */
  const getChildrenCount = (member: Member, unions: Union[]): number => {
    const memberUnions = unions.filter(
      (union) => union.member1Id === member.id || union.member2Id === member.id,
    )

    return memberUnions.reduce((total, union) => {
      return total + (union.childrenIds?.length || 0)
    }, 0)
  }

  /**
   * Get member's sibling count
   * @param member - Member object
   * @param members - Array of all members
   * @returns Number of siblings
   */
  const getSiblingCount = (member: Member, members: Member[]): number => {
    if (!member.parentUnionId) return 0

    return members.filter(
      (sibling) =>
        sibling.id !== member.id &&
        sibling.parentUnionId === member.parentUnionId,
    ).length
  }

  /**
   * Get member's spouse count
   * @param member - Member object
   * @param unions - Array of unions
   * @returns Number of spouses
   */
  const getSpouseCount = (member: Member, unions: Union[]): number => {
    return unions.filter(
      (union) => union.member1Id === member.id || union.member2Id === member.id,
    ).length
  }

  /**
   * Get member's family summary
   * @param member - Member object
   * @param members - Array of all members
   * @param unions - Array of unions
   * @returns Family summary object
   */
  const getFamilySummary = (
    member: Member,
    members: Member[],
    unions: Union[],
  ) => {
    return {
      parents: getParentCount(member, unions),
      children: getChildrenCount(member, unions),
      siblings: getSiblingCount(member, members),
      spouses: getSpouseCount(member, unions),
      relationshipStatus: getRelationshipStatus(member, unions),
    }
  }

  /**
   * Get member's life span text
   * @param member - Member object
   * @returns Life span text
   */
  const getLifeSpanText = (member: Member): string => {
    if (member.isAlive) {
      const age = getCurrentAge(member)
      return age ? `${age} years old` : 'Age unknown'
    } else {
      const ageAtDeath = getAgeAtDeath(member)
      return ageAtDeath ? `Died at age ${ageAtDeath}` : 'Age at death unknown'
    }
  }

  /**
   * Get member's location info
   * @param member - Member object
   * @returns Location information
   */
  const getLocationInfo = (member: Member) => {
    return {
      birthPlace: member.birthPlace || null,
      deathPlace: member.deathPlace || null,
      hasBirthPlace: !!member.birthPlace,
      hasDeathPlace: !!member.deathPlace,
    }
  }

  /**
   * Get member's personal info summary
   * @param member - Member object
   * @returns Personal info summary
   */
  const getPersonalInfoSummary = (member: Member) => {
    return {
      hasPhoto: hasPhoto(member),
      hasBirthInfo: hasBirthInfo(member),
      hasDeathInfo: hasDeathInfo(member),
      hasMaidenName: hasMaidenName(member),
      hasNotes: hasNotes(member),
      hasCompleteName: hasCompleteName(member),
      status: getStatusText(member),
      lifeSpan: getLifeSpanText(member),
      location: getLocationInfo(member),
    }
  }

  return {
    // Basic member info
    getStatusText,
    getBirthDeathInfo,
    getShortBirthDeathInfo: getShortBirthDeathInfoForMember,
    getCurrentAge,
    getAgeAtDeath,
    getFullNameWithMiddle,
    getDisplayName,
    getMemberInitials,
    getLifeSpanText,

    // Member checks
    hasPhoto,
    hasBirthInfo,
    hasDeathInfo,
    hasMaidenName,
    hasNotes,
    hasCompleteName,

    // Relationship info
    getRelationshipStatus,
    getParentCount,
    getChildrenCount,
    getSiblingCount,
    getSpouseCount,
    getFamilySummary,

    // Location info
    getLocationInfo,

    // Personal info summary
    getPersonalInfoSummary,

    // Re-export useMemberUtils functions for convenience
    getFullName,
    getShortName,
    getInitials,
  }
}
