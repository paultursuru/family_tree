import { ref } from 'vue'
import { Member, FamilyData } from '@/types'

export function useFileOperations() {
  const fileInput = ref<HTMLInputElement>()

  const exportToJson = (members: Member[], unions: any[]) => {
    const familyData: FamilyData = {
      members,
      unions,
    }
    const jsonData = JSON.stringify(familyData, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'family_tree_data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importFromJson = () => {
    fileInput.value?.click()
  }

  const handleFileImport = (
    event: Event,
    onImportSuccess: (familyData: FamilyData) => void,
  ) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)

        // Handle both old and new formats
        let familyData: FamilyData

        if (jsonData.members && jsonData.unions) {
          // New format: separate members and unions
          familyData = jsonData
        } else if (Array.isArray(jsonData)) {
          // Old format: array of members with embedded unions
          const members = jsonData
          const unions: any[] = []
          members.forEach((member: any) => {
            if (member.unions && Array.isArray(member.unions)) {
              member.unions.forEach((union: any) => {
                if (!unions.find((u) => u.id === union.id)) {
                  unions.push(union)
                }
              })
            }
          })
          familyData = { members, unions }
        } else {
          throw new Error('Invalid JSON structure')
        }

        // Validate the JSON structure
        if (!Array.isArray(familyData.members)) {
          throw new Error('JSON file must contain a members array')
        }

        if (!Array.isArray(familyData.unions)) {
          throw new Error('JSON file must contain a unions array')
        }

        // Validate each member has required fields
        const validMembers = familyData.members.filter((member: any) => {
          return (
            member &&
            typeof member.id === 'number' &&
            typeof member.firstName === 'string' &&
            typeof member.lastName === 'string' &&
            typeof member.gender === 'string' &&
            typeof member.isAlive === 'boolean' &&
            Array.isArray(member.middleNames)
          )
        })

        if (validMembers.length === 0) {
          throw new Error('No valid members found in the JSON file')
        }

        if (validMembers.length !== familyData.members.length) {
          console.warn(
            `Warning: ${familyData.members.length - validMembers.length} invalid members were skipped`,
          )
        }

        // Clear the file input
        if (target) {
          target.value = ''
        }

        // Call the success callback
        onImportSuccess({ members: validMembers, unions: familyData.unions })

        // Show success message
        alert(
          `Successfully imported ${validMembers.length} family members and ${familyData.unions.length} unions!`,
        )
      } catch (error) {
        console.error('Import error:', error)
        alert(
          `Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )

        // Clear the file input on error
        if (target) {
          target.value = ''
        }
      }
    }

    reader.onerror = () => {
      alert('Error reading the file. Please try again.')
      if (target) {
        target.value = ''
      }
    }

    reader.readAsText(file)
  }

  return {
    fileInput,
    exportToJson,
    importFromJson,
    handleFileImport,
  }
}
