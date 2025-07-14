import { computed, ref } from 'vue'
import { Member, Union } from '@/types'
import { useMemberInfo } from './useMemberInfo'

/**
 * Composable for search functionality
 * Follows the Single Responsibility Principle - handles all search-related operations
 * Implements Strategy Pattern for different search types
 */
export function useSearch() {
  const { getFullName } = useMemberInfo()

  // Search state
  const searchQuery = ref('')
  const searchResults = ref<Member[]>([])
  const showSearchResults = ref(false)

  /**
   * Search members by name with various options
   * @param members - Array of members to search
   * @param query - Search query string
   * @param options - Search options
   * @returns Filtered array of members
   */
  const searchMembers = (
    members: Member[],
    query: string,
    options?: {
      excludeIds?: string[]
      limit?: number
      includeMiddleNames?: boolean
      includeMaidenName?: boolean
    },
  ): Member[] => {
    if (!query.trim()) return members

    const normalizedQuery = query.toLowerCase().trim()
    const excludeIds = options?.excludeIds || []
    const limit = options?.limit || 10

    return members
      .filter((member) => {
        // Exclude members by ID
        if (excludeIds.includes(member.id.toString())) {
          return false
        }

        // Search by full name with options
        const fullName = getFullName(member, {
          includeMiddleNames: options?.includeMiddleNames,
          includeMaidenName: options?.includeMaidenName,
        }).toLowerCase()

        return fullName.includes(normalizedQuery)
      })
      .slice(0, limit)
  }

  /**
   * Search unions by member names
   * @param unions - Array of unions to search
   * @param members - Array of all members
   * @param query - Search query string
   * @param options - Search options
   * @returns Filtered array of unions
   */
  const searchUnions = (
    unions: Union[],
    members: Member[],
    query: string,
    options?: {
      excludeIds?: string[]
      limit?: number
    },
  ): Union[] => {
    if (!query.trim()) return unions

    const normalizedQuery = query.toLowerCase().trim()
    const excludeIds = options?.excludeIds || []
    const limit = options?.limit || 10

    return unions
      .filter((union) => {
        // Exclude unions by ID
        if (excludeIds.includes(union.id.toString())) {
          return false
        }

        // Get member names for the union
        const member1 = members.find((m) => m.id === union.member1Id)
        const member2 = members.find((m) => m.id === union.member2Id)

        const member1Name = member1 ? getFullName(member1) : 'Unknown'
        const member2Name = member2 ? getFullName(member2) : 'Unknown'

        const unionDisplayName = `${member1Name} & ${member2Name}`.toLowerCase()

        return unionDisplayName.includes(normalizedQuery)
      })
      .slice(0, limit)
  }

  /**
   * Get union display name for search results
   * @param union - Union object
   * @param members - Array of all members
   * @returns Formatted union display name
   */
  const getUnionDisplayName = (union: Union, members: Member[]): string => {
    const member1 = members.find((m) => m.id === union.member1Id)
    const member2 = members.find((m) => m.id === union.member2Id)

    const member1Name = member1 ? getFullName(member1) : 'Unknown'
    const member2Name = member2 ? getFullName(member2) : 'Unknown'

    return `${member1Name} & ${member2Name}`
  }

  /**
   * Search with fuzzy matching for better results
   * @param text - Text to search in
   * @param query - Search query
   * @returns Boolean indicating if text matches query
   */
  const fuzzySearch = (text: string, query: string): boolean => {
    const normalizedText = text.toLowerCase()
    const normalizedQuery = query.toLowerCase()

    // Simple fuzzy search - check if all query characters appear in order
    let queryIndex = 0
    for (
      let i = 0;
      i < normalizedText.length && queryIndex < normalizedQuery.length;
      i++
    ) {
      if (normalizedText[i] === normalizedQuery[queryIndex]) {
        queryIndex++
      }
    }

    return queryIndex === normalizedQuery.length
  }

  /**
   * Advanced member search with multiple criteria
   * @param members - Array of members to search
   * @param query - Search query string
   * @param options - Advanced search options
   * @returns Filtered array of members
   */
  const advancedMemberSearch = (
    members: Member[],
    query: string,
    options?: {
      excludeIds?: string[]
      limit?: number
      searchFields?: ('name' | 'birthPlace' | 'deathPlace' | 'notes')[]
      fuzzyMatch?: boolean
    },
  ): Member[] => {
    if (!query.trim()) return members

    const normalizedQuery = query.toLowerCase().trim()
    const excludeIds = options?.excludeIds || []
    const limit = options?.limit || 10
    const searchFields = options?.searchFields || ['name']
    const fuzzyMatch = options?.fuzzyMatch || false

    return members
      .filter((member) => {
        // Exclude members by ID
        if (excludeIds.includes(member.id.toString())) {
          return false
        }

        // Search in specified fields
        for (const field of searchFields) {
          let fieldValue = ''

          switch (field) {
            case 'name':
              fieldValue = getFullName(member, {
                includeMiddleNames: true,
                includeMaidenName: true,
              })
              break
            case 'birthPlace':
              fieldValue = member.birthPlace || ''
              break
            case 'deathPlace':
              fieldValue = member.deathPlace || ''
              break
            case 'notes':
              fieldValue = member.notes || ''
              break
          }

          const normalizedFieldValue = fieldValue.toLowerCase()

          if (fuzzyMatch) {
            if (fuzzySearch(normalizedFieldValue, normalizedQuery)) {
              return true
            }
          } else {
            if (normalizedFieldValue.includes(normalizedQuery)) {
              return true
            }
          }
        }

        return false
      })
      .slice(0, limit)
  }

  /**
   * Get search suggestions based on partial query
   * @param members - Array of members to search
   * @param query - Partial search query
   * @param limit - Maximum number of suggestions
   * @returns Array of search suggestions
   */
  const getSearchSuggestions = (
    members: Member[],
    query: string,
    limit: number = 5,
  ): string[] => {
    if (!query.trim()) return []

    const normalizedQuery = query.toLowerCase().trim()
    const suggestions = new Set<string>()

    members.forEach((member) => {
      const fullName = getFullName(member, {
        includeMiddleNames: true,
        includeMaidenName: true,
      }).toLowerCase()

      if (fullName.includes(normalizedQuery)) {
        // Add the full name as a suggestion
        suggestions.add(getFullName(member))

        // Add individual name parts as suggestions
        const nameParts = fullName.split(' ')
        nameParts.forEach((part) => {
          if (part.includes(normalizedQuery) && part.length > 2) {
            suggestions.add(part)
          }
        })
      }
    })

    return Array.from(suggestions).slice(0, limit)
  }

  /**
   * Highlight search terms in text
   * @param text - Original text
   * @param query - Search query
   * @returns Text with highlighted search terms
   */
  const highlightSearchTerms = (text: string, query: string): string => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  /**
   * Clear search state
   */
  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    showSearchResults.value = false
  }

  /**
   * Update search results
   * @param members - Array of all members
   * @param query - Search query
   */
  const updateSearchResults = (members: Member[], query: string) => {
    searchQuery.value = query
    searchResults.value = searchMembers(members, query, {
      includeMaidenName: true,
      includeMiddleNames: true,
    })
    showSearchResults.value = query.length > 0
  }

  // Computed properties for reactive search state
  const hasSearchResults = computed(() => searchResults.value.length > 0)
  const searchResultsCount = computed(() => searchResults.value.length)
  const isSearching = computed(() => searchQuery.value.length > 0)

  return {
    // State
    searchQuery,
    searchResults,
    showSearchResults,

    // Computed
    hasSearchResults,
    searchResultsCount,
    isSearching,

    // Methods
    searchMembers,
    searchUnions,
    getUnionDisplayName,
    fuzzySearch,
    advancedMemberSearch,
    getSearchSuggestions,
    highlightSearchTerms,
    clearSearch,
    updateSearchResults,
  }
}
