import { ref, computed } from 'vue'
import {
  Member,
  Union,
  FamilyData,
  MemberFormData,
  UnionFormData,
} from '@/types'

/**
 * Composable for data persistence and management
 * Follows the Single Responsibility Principle - handles all data persistence operations
 * Implements the Repository Pattern for data access
 */
export function useDataPersistence() {
  // Reactive state
  const members = ref<Member[]>([])
  const unions = ref<Union[]>([])

  /**
   * Get next available ID for new entities
   * @returns Next available ID
   */
  const getNextId = computed(() => {
    const memberMaxId =
      members.value.length > 0 ? Math.max(...members.value.map((m) => m.id)) : 0
    const unionMaxId =
      unions.value.length > 0 ? Math.max(...unions.value.map((u) => u.id)) : 0
    return Math.max(memberMaxId, unionMaxId) + 1
  })

  /**
   * Save family data to localStorage
   * @param data - Family data to save
   */
  const saveToLocalStorage = (data?: FamilyData) => {
    const familyData: FamilyData = data || {
      members: members.value,
      unions: unions.value,
    }
    localStorage.setItem('family-data', JSON.stringify(familyData))
  }

  /**
   * Load family data from localStorage
   * @returns Loaded family data or null if not found
   */
  const loadFromLocalStorage = (): FamilyData | null => {
    const savedData = localStorage.getItem('family-data')
    if (!savedData) return null

    try {
      const parsedData = JSON.parse(savedData)
      return migrateData(parsedData)
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
      return null
    }
  }

  /**
   * Save settings to localStorage
   * @param settings - Settings object to save
   */
  const saveSettings = (settings: any) => {
    localStorage.setItem('family-settings', JSON.stringify(settings))
  }

  /**
   * Load settings from localStorage
   * @param defaultSettings - Default settings to use if none found
   * @returns Loaded settings merged with defaults
   */
  const loadSettings = (defaultSettings: any) => {
    const savedSettings = localStorage.getItem('family-settings')
    if (!savedSettings) return defaultSettings

    try {
      const parsedSettings = JSON.parse(savedSettings)
      return {
        ...defaultSettings,
        ...parsedSettings,
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error)
      return defaultSettings
    }
  }

  /**
   * Clear all data from localStorage
   */
  const clearAllData = () => {
    localStorage.removeItem('family-data')
    localStorage.removeItem('family-settings')
    members.value = []
    unions.value = []
  }

  /**
   * Migrate data to ensure proper structure
   * Handles backward compatibility with old data formats
   * @param data - Raw data to migrate
   * @returns Migrated family data
   */
  const migrateData = (data: any): FamilyData => {
    let members: any[] = []
    let unions: Union[] = []

    // Handle old format where unions were embedded in members
    if (Array.isArray(data)) {
      // Old format: array of members with embedded unions
      members = data.map((member) => ({
        ...member,
        unions: member.unions || [],
        spouseIds: member.spouseIds || [], // Keep for backward compatibility
      }))

      // Extract unions from members
      members.forEach((member) => {
        if (member.unions && Array.isArray(member.unions)) {
          member.unions.forEach((union: any) => {
            // Avoid duplicates
            if (!unions.find((u) => u.id === union.id)) {
              unions.push(union)
            }
          })
        }
      })
    } else if (data.members && data.unions) {
      // New format: separate members and unions
      members = data.members.map((member: any) => ({
        ...member,
        unions: member.unions || [],
        spouseIds: member.spouseIds || [],
      }))
      unions = data.unions || []
    } else {
      // Fallback: empty data
      return { members: [], unions: [] }
    }

    // Migrate parent1Id/parent2Id to parentUnionId
    members = members.map((member) => {
      const migratedMember = { ...member }

      // Remove old parent properties
      delete migratedMember.parent1Id
      delete migratedMember.parent2Id

      // Ensure parentUnionId exists (will be undefined if no parents)
      if (!migratedMember.hasOwnProperty('parentUnionId')) {
        migratedMember.parentUnionId = undefined
      }

      // Ensure middleNames is an array
      if (!Array.isArray(migratedMember.middleNames)) {
        migratedMember.middleNames = []
      }

      return migratedMember
    })

    // Ensure all unions have childrenIds array
    unions = unions.map((union) => ({
      ...union,
      childrenIds: Array.isArray(union.childrenIds) ? union.childrenIds : [],
    }))

    // Build parentUnionId dynamically from unions
    members = buildParentUnionIds(members, unions)

    return { members, unions }
  }

  /**
   * Build parentUnionId relationships from unions
   * @param members - Array of members
   * @param unions - Array of unions
   * @returns Members with updated parentUnionId
   */
  const buildParentUnionIds = (
    members: Member[],
    unions: Union[],
  ): Member[] => {
    return members.map((member) => {
      // Find which union has this member as a child
      const parentUnion = unions.find(
        (union) =>
          union.childrenIds &&
          Array.isArray(union.childrenIds) &&
          union.childrenIds.includes(member.id),
      )

      return {
        ...member,
        parentUnionId: parentUnion?.id || undefined,
      }
    })
  }

  /**
   * Create or update a member
   * @param formData - Member form data
   * @param isEditing - Whether editing existing member
   * @returns Created/updated member
   */
  const saveMember = (
    formData: MemberFormData,
    isEditing: boolean = false,
  ): Member => {
    const now = new Date().toISOString()

    // Data sanitization
    const sanitizedFormData = {
      ...formData,
      parentUnionId: formData.parentUnionId
        ? Number(formData.parentUnionId)
        : undefined,
    }

    const memberId = isEditing ? formData.id : getNextId.value

    // Handle parent-child relationship changes
    const oldParentUnionId = isEditing
      ? members.value.find((m) => m.id === memberId)?.parentUnionId
      : undefined
    const newParentUnionId = sanitizedFormData.parentUnionId

    if (oldParentUnionId !== newParentUnionId) {
      // Remove from old parent union
      if (oldParentUnionId) {
        const oldUnion = unions.value.find((u) => u.id === oldParentUnionId)
        if (oldUnion?.childrenIds && Array.isArray(oldUnion.childrenIds)) {
          oldUnion.childrenIds = oldUnion.childrenIds.filter(
            (id) => id !== memberId,
          )
        }
      }

      // Add to new parent union
      if (newParentUnionId) {
        const newUnion = unions.value.find((u) => u.id === newParentUnionId)
        if (newUnion) {
          if (!newUnion.childrenIds) {
            newUnion.childrenIds = []
          }
          if (!newUnion.childrenIds.includes(memberId)) {
            newUnion.childrenIds.push(memberId)
          }
        }
      }
    }

    // Create or update member
    if (isEditing) {
      const index = members.value.findIndex((m) => m.id === memberId)
      if (index !== -1) {
        members.value[index] = {
          ...members.value[index],
          ...sanitizedFormData,
          updatedAt: now,
        }
        return members.value[index]
      }
    }

    // Create new member
    const newMember: Member = {
      id: memberId,
      ...sanitizedFormData,
      createdAt: now,
      updatedAt: now,
    }

    members.value.push(newMember)

    // Add to parent union if specified
    if (newParentUnionId) {
      const parentUnion = unions.value.find((u) => u.id === newParentUnionId)
      if (parentUnion) {
        if (!parentUnion.childrenIds) {
          parentUnion.childrenIds = []
        }
        if (!parentUnion.childrenIds.includes(memberId)) {
          parentUnion.childrenIds.push(memberId)
        }
      }
    }

    // Rebuild parentUnionIds to ensure consistency
    members.value = buildParentUnionIds(members.value, unions.value)

    return newMember
  }

  /**
   * Delete a member and all related data
   * @param memberId - ID of member to delete
   */
  const deleteMember = (memberId: number) => {
    // Remove from members array
    members.value = members.value.filter((m) => m.id !== memberId)

    // Remove unions that involve the deleted member
    unions.value = unions.value.filter(
      (union) => union.member1Id !== memberId && union.member2Id !== memberId,
    )

    // Update relationships - remove member from parent unions
    members.value.forEach((member) => {
      if (member.parentUnionId) {
        const parentUnion = unions.value.find(
          (u) => u.id === member.parentUnionId,
        )
        if (
          parentUnion?.childrenIds &&
          Array.isArray(parentUnion.childrenIds)
        ) {
          parentUnion.childrenIds = parentUnion.childrenIds.filter(
            (id) => id !== memberId,
          )
        }
      }
    })

    // Remove the member from any union's children lists
    unions.value.forEach((union) => {
      if (union.childrenIds && Array.isArray(union.childrenIds)) {
        union.childrenIds = union.childrenIds.filter(
          (childId) => childId !== memberId,
        )
      }
    })
  }

  /**
   * Create or update a union
   * @param formData - Union form data
   * @param isEditing - Whether editing existing union
   * @returns Created/updated union
   */
  const saveUnion = (
    formData: UnionFormData,
    isEditing: boolean = false,
  ): Union => {
    const unionId = isEditing ? formData.id : getNextId.value

    // Create or update the union
    const union: Union = {
      id: unionId,
      member1Id: Number(formData.member1Id),
      member2Id: Number(formData.member2Id),
      marriageDate: formData.marriageDate,
      marriagePlace: formData.marriagePlace,
      divorceDate: formData.divorceDate,
      divorcePlace: formData.divorcePlace,
      childrenIds: formData.childrenIds.map(Number),
    }

    if (isEditing) {
      // Update existing union
      const unionIndex = unions.value.findIndex((u) => u.id === unionId)
      if (unionIndex !== -1) {
        // Handle children relationship changes for existing union
        const oldUnion = unions.value[unionIndex]
        const oldChildrenIds = new Set(oldUnion.childrenIds || [])
        const newChildrenIds = new Set(union.childrenIds || [])

        // Remove children from old parent union
        const removedChildren = [...oldChildrenIds].filter(
          (id) => !newChildrenIds.has(id),
        )
        removedChildren.forEach((childId) => {
          const child = members.value.find((m) => m.id === childId)
          if (child && child.parentUnionId === oldUnion.id) {
            child.parentUnionId = undefined
          }
        })

        // Add children to new parent union
        const addedChildren = [...newChildrenIds].filter(
          (id) => !oldChildrenIds.has(id),
        )
        addedChildren.forEach((childId) => {
          const child = members.value.find((m) => m.id === childId)
          if (child) {
            child.parentUnionId = union.id
          }
        })

        unions.value[unionIndex] = union
      }
    } else {
      // Add new union and set up parent-child relationships
      if (union.childrenIds && Array.isArray(union.childrenIds)) {
        union.childrenIds.forEach((childId) => {
          const child = members.value.find((m) => m.id === childId)
          if (child) {
            child.parentUnionId = union.id
          }
        })
      }

      unions.value.push(union)
    }

    // Rebuild parentUnionIds to ensure consistency
    members.value = buildParentUnionIds(members.value, unions.value)

    return union
  }

  /**
   * Initialize data from localStorage
   * @returns Loaded family data
   */
  const initializeData = (): FamilyData => {
    const loadedData = loadFromLocalStorage()
    if (loadedData) {
      members.value = loadedData.members
      unions.value = loadedData.unions
      return loadedData
    }
    return { members: [], unions: [] }
  }

  /**
   * Get member by ID
   * @param id - Member ID
   * @returns Member or undefined
   */
  const getMemberById = (id: number): Member | undefined => {
    return members.value.find((m) => m.id === id)
  }

  /**
   * Get union by ID
   * @param id - Union ID
   * @returns Union or undefined
   */
  const getUnionById = (id: number): Union | undefined => {
    return unions.value.find((u) => u.id === id)
  }

  /**
   * Get all members
   * @returns Array of all members
   */
  const getAllMembers = (): Member[] => {
    return members.value
  }

  /**
   * Get all unions
   * @returns Array of all unions
   */
  const getAllUnions = (): Union[] => {
    return unions.value
  }

  /**
   * Get family data object
   * @returns Current family data
   */
  const getFamilyData = (): FamilyData => {
    return {
      members: members.value,
      unions: unions.value,
    }
  }

  /**
   * Set family data
   * @param data - Family data to set
   */
  const setFamilyData = (data: FamilyData) => {
    members.value = data.members
    unions.value = data.unions
  }

  return {
    // State
    members,
    unions,

    // Computed
    getNextId,

    // Core operations
    saveToLocalStorage,
    loadFromLocalStorage,
    saveSettings,
    loadSettings,
    clearAllData,

    // Data management
    saveMember,
    deleteMember,
    saveUnion,
    initializeData,

    // Queries
    getMemberById,
    getUnionById,
    getAllMembers,
    getAllUnions,
    getFamilyData,
    setFamilyData,

    // Utilities
    migrateData,
    buildParentUnionIds,
  }
}
