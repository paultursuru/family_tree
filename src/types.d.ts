export interface Member {
  id: number
  firstName: string
  middleNames: string[]
  lastName: string
  maidenName?: string
  birthDate?: string
  birthPlace?: string
  deathDate?: string
  deathPlace?: string
  gender: 'male' | 'female' | 'other'
  isAlive: boolean
  parent1Id?: number
  parent2Id?: number
  spouseIds: number[]
  childrenIds: number[]
  photoUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface FamilyNode {
  member: Member
  children: FamilyNode[]
  level: number
}

export interface MemberFormData {
  firstName: string
  middleNames: string[]
  lastName: string
  maidenName: string
  birthDate: string
  birthPlace: string
  deathDate: string
  deathPlace: string
  gender: 'male' | 'female' | 'other'
  isAlive: boolean
  parent1Id?: number | null
  parent2Id?: number | null
  photoUrl: string
  notes: string
  spouseIds: number[]
  childrenIds: number[]
}
