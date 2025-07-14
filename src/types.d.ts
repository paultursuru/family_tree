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
  parentUnionId?: number
  photoUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Union {
  id: number
  member1Id: number
  member2Id: number
  marriageDate: string
  marriagePlace: string
  divorceDate: string
  divorcePlace: string
  childrenIds: number[]
}

export interface FamilyData {
  members: Member[]
  unions: Union[]
}

export interface FamilyNode {
  member: Member
  children: FamilyNode[]
  level: number
}

export interface MemberFormData {
  id: number
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
  parentUnionId?: number | null
  photoUrl: string
  notes: string
}

export interface UnionFormData {
  id: number
  member1Id: number
  member2Id: number
  marriageDate: string
  marriagePlace: string
  divorceDate: string
  divorcePlace: string
  childrenIds: number[]
}
