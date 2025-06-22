import { ref } from 'vue'
import { Member } from '@/types'

export function useFileOperations() {
  const fileInput = ref<HTMLInputElement>()

  const exportToJson = (members: Member[]) => {
    const jsonData = JSON.stringify(members, null, 2)
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
    onImportSuccess: (members: Member[]) => void,
  ) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)

        // Validate the JSON structure
        if (!Array.isArray(jsonData)) {
          throw new Error('JSON file must contain an array of members')
        }

        // Validate each member has required fields
        const validMembers = jsonData.filter((member: any) => {
          return (
            member &&
            typeof member.id === 'number' &&
            typeof member.firstName === 'string' &&
            typeof member.lastName === 'string' &&
            typeof member.gender === 'string' &&
            typeof member.isAlive === 'boolean' &&
            Array.isArray(member.spouseIds) &&
            Array.isArray(member.childrenIds) &&
            Array.isArray(member.middleNames)
          )
        })

        if (validMembers.length === 0) {
          throw new Error('No valid members found in the JSON file')
        }

        if (validMembers.length !== jsonData.length) {
          console.warn(
            `Warning: ${jsonData.length - validMembers.length} invalid members were skipped`,
          )
        }

        // Clear the file input
        if (target) {
          target.value = ''
        }

        // Call the success callback
        onImportSuccess(validMembers)

        // Show success message
        alert(`Successfully imported ${validMembers.length} family members!`)
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
