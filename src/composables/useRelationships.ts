import { computed } from 'vue'
import { Member, Union } from '@/types'

/**
 * Composable for relationship logic and calculations
 * Follows the Single Responsibility Principle - handles all relationship operations
 * Implements the Strategy Pattern for different relationship types
 */
export function useRelationships() {
  /**
   * Get parents of a member
   * @param member - Member object
   * @param unions - Array of unions
   * @param members - Array of all members
   * @returns Array of parent members
   */
  const getParents = (
    member: Member,
    unions: Union[],
    members: Member[],
  ): Member[] => {
    if (!member.parentUnionId) return []

    const parentUnion = unions.find((u) => u.id === member.parentUnionId)
    if (!parentUnion) return []

    const parent1 = members.find((m) => m.id === parentUnion.member1Id)
    const parent2 = members.find((m) => m.id === parentUnion.member2Id)

    return [parent1, parent2].filter((p): p is Member => !!p)
  }

  /**
   * Get children of a member
   * @param member - Member object
   * @param unions - Array of unions
   * @param members - Array of all members
   * @returns Array of child members
   */
  const getChildren = (
    member: Member,
    unions: Union[],
    members: Member[],
  ): Member[] => {
    // Find unions that involve the current member
    const memberUnions = unions.filter(
      (union) => union.member1Id === member.id || union.member2Id === member.id,
    )

    // Get all children from these unions
    const childIds = new Set<number>()
    memberUnions.forEach((union) => {
      if (union.childrenIds && Array.isArray(union.childrenIds)) {
        union.childrenIds.forEach((childId) => childIds.add(childId))
      }
    })

    // Return the actual member objects
    return members.filter((member) => childIds.has(member.id))
  }

  /**
   * Get direct siblings (same parent union)
   * @param member - Member object
   * @param members - Array of all members
   * @returns Array of direct sibling members
   */
  const getDirectSiblings = (member: Member, members: Member[]): Member[] => {
    if (!member.parentUnionId) return []

    return members.filter((sibling) => {
      // Skip self
      if (sibling.id === member.id) return false

      // Check if they share the same parent union (direct/full siblings)
      return sibling.parentUnionId === member.parentUnionId
    })
  }

  /**
   * Get step siblings (share one parent through different unions)
   * @param member - Member object
   * @param members - Array of all members
   * @param unions - Array of unions
   * @returns Array of step sibling members
   */
  const getStepSiblings = (
    member: Member,
    members: Member[],
    unions: Union[],
  ): Member[] => {
    if (!member.parentUnionId) return []

    const memberParentUnion = unions.find((u) => u.id === member.parentUnionId)
    if (!memberParentUnion) return []

    return members.filter((sibling) => {
      // Skip self
      if (sibling.id === member.id) return false

      // Skip direct siblings (they're handled separately)
      if (sibling.parentUnionId === member.parentUnionId) return false

      // Check if they share one parent through a different union
      const siblingParentUnion = sibling.parentUnionId
        ? unions.find((u) => u.id === sibling.parentUnionId)
        : null
      if (!siblingParentUnion) return false

      // They share one parent if their parent unions have a member in common
      const memberParentIds = [
        memberParentUnion.member1Id,
        memberParentUnion.member2Id,
      ]
      const siblingParentIds = [
        siblingParentUnion.member1Id,
        siblingParentUnion.member2Id,
      ]

      const sharedParentId = memberParentIds.find((id) =>
        siblingParentIds.includes(id),
      )
      return !!sharedParentId
    })
  }

  /**
   * Get all siblings (direct + step)
   * @param member - Member object
   * @param members - Array of all members
   * @param unions - Array of unions
   * @returns Array of all sibling members
   */
  const getAllSiblings = (
    member: Member,
    members: Member[],
    unions: Union[],
  ): Member[] => {
    const directSiblings = getDirectSiblings(member, members)
    const stepSiblings = getStepSiblings(member, members, unions)
    return [...directSiblings, ...stepSiblings]
  }

  /**
   * Get spouses/partners of a member
   * @param member - Member object
   * @param unions - Array of unions
   * @param members - Array of all members
   * @returns Array of spouse members
   */
  const getSpouses = (
    member: Member,
    unions: Union[],
    members: Member[],
  ): Member[] => {
    const memberUnions = unions.filter(
      (union) => union.member1Id === member.id || union.member2Id === member.id,
    )

    return memberUnions
      .map((union) => {
        const partnerId =
          union.member1Id === member.id ? union.member2Id : union.member1Id
        return members.find((m) => m.id === partnerId)
      })
      .filter((m): m is Member => !!m)
  }

  /**
   * Get unions for a member
   * @param member - Member object
   * @param unions - Array of unions
   * @returns Array of unions involving the member
   */
  const getMemberUnions = (member: Member, unions: Union[]): Union[] => {
    return unions.filter(
      (union) => union.member1Id === member.id || union.member2Id === member.id,
    )
  }

  /**
   * Get partner name for a union
   * @param union - Union object
   * @param member - Current member
   * @param members - Array of all members
   * @returns Partner name string
   */
  const getUnionPartnerName = (
    union: Union,
    member: Member,
    members: Member[],
  ): string => {
    // Find the partner (the other person in the union)
    const partnerId =
      union.member1Id === member.id ? union.member2Id : union.member1Id
    const partner = members.find((m) => m.id === partnerId)
    return partner
      ? `${partner.firstName} ${partner.lastName}`
      : 'Unknown Partner'
  }

  /**
   * Get sibling groups for display
   * @param members - Array of members to group
   * @returns Array of sibling groups
   */
  const getSiblingGroups = (
    members: Member[],
  ): { id: string; members: Member[] }[] => {
    const groups: { id: string; members: Member[] }[] = []
    const processed = new Set<number>()

    members.forEach((member) => {
      if (processed.has(member.id)) return

      // Find all direct siblings (same parent union)
      const siblings = members.filter((other) => {
        if (!member.parentUnionId) return other.id === member.id

        // Group members that have the same parent union
        return other.parentUnionId === member.parentUnionId
      })

      if (siblings.length > 0) {
        const groupId = siblings
          .map((s) => s.id)
          .sort()
          .join('-')
        groups.push({
          id: groupId,
          members: siblings,
        })

        // Mark all siblings as processed
        siblings.forEach((s) => processed.add(s.id))
      }
    })

    return groups
  }

  /**
   * Check if member can navigate to parents
   * @param member - Member object
   * @returns Boolean indicating if member has parents
   */
  const canNavigateToParents = (member: Member): boolean => {
    return member.parentUnionId !== undefined
  }

  /**
   * Check if member can navigate to children
   * @param member - Member object
   * @param unions - Array of unions
   * @returns Boolean indicating if member has children
   */
  const canNavigateToChildren = (member: Member, unions: Union[]): boolean => {
    const memberUnions = unions.filter(
      (union) => union.member1Id === member.id || union.member2Id === member.id,
    )

    return memberUnions.some(
      (union) =>
        union.childrenIds &&
        Array.isArray(union.childrenIds) &&
        union.childrenIds.length > 0,
    )
  }

  /**
   * Get ancestors (parents, grandparents, etc.)
   * @param member - Member object
   * @param members - Array of all members
   * @param unions - Array of unions
   * @param generations - Number of generations to go back (default: 2)
   * @returns Array of ancestor members with generation info
   */
  const getAncestors = (
    member: Member,
    members: Member[],
    unions: Union[],
    generations: number = 2,
  ): Array<{ member: Member; generation: number }> => {
    const ancestors: Array<{ member: Member; generation: number }> = []
    const visited = new Set<number>()

    const traverse = (currentMember: Member, currentGeneration: number) => {
      if (currentGeneration > generations || visited.has(currentMember.id))
        return

      visited.add(currentMember.id)
      const parents = getParents(currentMember, unions, members)

      parents.forEach((parent) => {
        ancestors.push({ member: parent, generation: currentGeneration })
        traverse(parent, currentGeneration + 1)
      })
    }

    traverse(member, 1)
    return ancestors
  }

  /**
   * Get descendants (children, grandchildren, etc.)
   * @param member - Member object
   * @param members - Array of all members
   * @param unions - Array of unions
   * @param generations - Number of generations to go forward (default: 2)
   * @returns Array of descendant members with generation info
   */
  const getDescendants = (
    member: Member,
    members: Member[],
    unions: Union[],
    generations: number = 2,
  ): Array<{ member: Member; generation: number }> => {
    const descendants: Array<{ member: Member; generation: number }> = []
    const visited = new Set<number>()

    const traverse = (currentMember: Member, currentGeneration: number) => {
      if (currentGeneration > generations || visited.has(currentMember.id))
        return

      visited.add(currentMember.id)
      const children = getChildren(currentMember, unions, members)

      children.forEach((child) => {
        descendants.push({ member: child, generation: currentGeneration })
        traverse(child, currentGeneration + 1)
      })
    }

    traverse(member, 1)
    return descendants
  }

  /**
   * Get family tree structure for a member
   * @param member - Member object
   * @param members - Array of all members
   * @param unions - Array of unions
   * @param depth - Depth of tree to generate (default: 2)
   * @returns Family tree structure
   */
  const getFamilyTree = (
    member: Member,
    members: Member[],
    unions: Union[],
    depth: number = 2,
  ) => {
    const ancestors = getAncestors(member, members, unions, depth)
    const descendants = getDescendants(member, members, unions, depth)

    return {
      member,
      ancestors: ancestors.sort((a, b) => a.generation - b.generation),
      descendants: descendants.sort((a, b) => a.generation - b.generation),
      spouses: getSpouses(member, unions, members),
      siblings: getAllSiblings(member, members, unions),
    }
  }

  /**
   * Get relationship type between two members
   * @param member1 - First member
   * @param member2 - Second member
   * @param members - Array of all members
   * @param unions - Array of unions
   * @returns Relationship type string
   */
  const getRelationshipType = (
    member1: Member,
    member2: Member,
    members: Member[],
    unions: Union[],
  ): string => {
    // Check if they're the same person
    if (member1.id === member2.id) return 'self'

    // Check if they're spouses
    const member1Spouses = getSpouses(member1, unions, members)
    if (member1Spouses.some((spouse) => spouse.id === member2.id))
      return 'spouse'

    // Check if they're parent-child
    const member1Parents = getParents(member1, unions, members)
    if (member1Parents.some((parent) => parent.id === member2.id))
      return 'parent'

    const member1Children = getChildren(member1, unions, members)
    if (member1Children.some((child) => child.id === member2.id)) return 'child'

    // Check if they're siblings
    const member1Siblings = getAllSiblings(member1, members, unions)
    if (member1Siblings.some((sibling) => sibling.id === member2.id))
      return 'sibling'

    // Check if they're grandparent-grandchild
    const member1Ancestors = getAncestors(member1, members, unions, 2)
    if (
      member1Ancestors.some((ancestor) => ancestor.member.id === member2.id)
    ) {
      return ancestor.generation === 1 ? 'grandparent' : 'great-grandparent'
    }

    const member1Descendants = getDescendants(member1, members, unions, 2)
    if (
      member1Descendants.some(
        (descendant) => descendant.member.id === member2.id,
      )
    ) {
      return descendant.generation === 1 ? 'grandchild' : 'great-grandchild'
    }

    return 'unrelated'
  }

  /**
   * Get relationship summary for a member
   * @param member - Member object
   * @param members - Array of all members
   * @param unions - Array of unions
   * @returns Relationship summary object
   */
  const getRelationshipSummary = (
    member: Member,
    members: Member[],
    unions: Union[],
  ) => {
    return {
      parents: getParents(member, unions, members).length,
      children: getChildren(member, unions, members).length,
      siblings: getAllSiblings(member, members, unions).length,
      spouses: getSpouses(member, unions, members).length,
      directSiblings: getDirectSiblings(member, members).length,
      stepSiblings: getStepSiblings(member, members, unions).length,
      canNavigateToParents: canNavigateToParents(member),
      canNavigateToChildren: canNavigateToChildren(member, unions),
    }
  }

  return {
    // Basic relationships
    getParents,
    getChildren,
    getDirectSiblings,
    getStepSiblings,
    getAllSiblings,
    getSpouses,
    getMemberUnions,
    getUnionPartnerName,

    // Navigation helpers
    canNavigateToParents,
    canNavigateToChildren,

    // Display helpers
    getSiblingGroups,

    // Advanced relationships
    getAncestors,
    getDescendants,
    getFamilyTree,
    getRelationshipType,
    getRelationshipSummary,
  }
}
