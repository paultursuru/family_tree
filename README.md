# Family Tree Application

A modern, interactive family tree visualization and management application built with Vue 3, TypeScript, and Tailwind CSS. This application allows users to create, manage, and visualize complex family relationships with an intuitive interface.

## 🌟 Features

### Core Functionality

- **Interactive Family Tree Visualization**: Navigate through generations with a dynamic tree view
- **Comprehensive Member Management**: Add, edit, and delete family members with detailed information
- **Complex Relationship Support**: Handle multiple spouses, children, and parent relationships
- **Search & Navigation**: Quick search functionality to find and navigate to specific family members
- **Data Persistence**: Automatic local storage with import/export capabilities

### Member Information

- **Personal Details**: First name, middle names, last name, maiden name
- **Vital Information**: Birth/death dates and places, gender, living status
- **Family Relationships**: Parents, spouses, and children with bidirectional relationship management
- **Additional Data**: Photo URLs, personal notes, creation/update timestamps

### User Interface

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Modern dark interface with excellent contrast and readability
- **Sliding Drawer**: Detailed member information in a side panel
- **Modal Forms**: Clean, organized forms for adding and editing members
- **Search Results**: Real-time search with member details and quick navigation

## 🏗️ Architecture

### Technology Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for utility-first styling
- **Build Tool**: Vite for fast development and building
- **State Management**: Vue's reactive system with localStorage persistence

### Project Structure

```
src/
├── components/          # Vue components
│   ├── FamilyTree.vue   # Main tree visualization
│   ├── FamilyNode.vue   # Individual member cards
│   ├── GenerationLine.vue # Horizontal generation display
│   ├── Header.vue       # Application header with search
│   ├── MemberForm.vue   # Add/edit member form
│   ├── MemberDetail.vue # Member information display
│   └── ...              # Other UI components
├── composables/         # Reusable Vue composables
│   └── useFileOperations.ts # File import/export logic
├── types.d.ts          # TypeScript type definitions
└── App.vue             # Main application component
```

## 📦 Dependencies

- **Vue 3**: Core framework for building the UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Fast build tool for development and production
- **TypeScript**: Strongly typed programming language for better code quality

## 🔧 How It Works

### 1. Data Model

The application uses a flexible data model that supports complex family structures:

```typescript
interface Member {
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
  childrenIds: number[]
  photoUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### 2. Tree Navigation

The family tree uses a navigation system that allows users to explore different generations:

- **Root View**: Shows members without parents
- **Parent Navigation**: Click to view a member's parents
- **Child Navigation**: Click to view a member's children
- **Search Navigation**: Jump directly to any member via search

### 3. Relationship Management

The application maintains bidirectional relationships automatically:

- **Parent-Child**: When you set a parent, the child is automatically added to the parent's children list
- **Spouse Relationships**: When you add a spouse, both members are updated with the relationship
- **Cascade Updates**: Deleting a member automatically updates all related members

### 4. Data Persistence

- **Local Storage**: All data is automatically saved to browser localStorage
- **Import/Export**: Full JSON import/export functionality with validation
- **Data Validation**: Robust validation ensures data integrity during import

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd family_tree
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

## 📖 Usage Guide

### Adding Family Members

1. Click the "Add a family member" button in the header
2. Fill in the required information (first name, last name, gender)
3. Optionally add birth/death information, parents, spouses, and children
4. Click "Save" to create the member

### Navigating the Tree

- **View Parents**: Click the "Parents" button on any member card
- **View Children**: Click the "Children" button on any member card
- **Return to Root**: Use the navigation breadcrumbs or search for a root member

### Searching

1. Use the search bar in the header
2. Type any part of a member's name
3. Click on a search result to navigate to that member in the tree

### Managing Data

- **Export**: Use the "Actions" dropdown → "Download Tree Data" to save your family tree
- **Import**: Use the "Actions" dropdown → "Upload Tree Data" to load a previously exported file
- **Clear All**: Use the "Actions" dropdown → "Remove all family members" to start fresh

## 🎨 UI/UX Features

### Responsive Design

- **Desktop**: Full-featured interface with side drawer for member details
- **Mobile**: Optimized layout with collapsible sections and touch-friendly controls

### Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **High Contrast**: Dark theme with excellent contrast ratios

### Performance

- **Virtual Scrolling**: Efficient rendering of large family trees
- **Lazy Loading**: Components load only when needed
- **Optimized Updates**: Minimal re-renders through Vue's reactivity system

## 🔮 Future Enhancements

The application is designed with extensibility in mind. Potential future features include:

- **Photo Management**: Upload and manage family photos
- **Timeline View**: Chronological view of family events
- **Collaboration**: Share family trees with other users
- **Advanced Search**: Search by dates, locations, or relationships
- **Export Formats**: PDF, GEDCOM, or other genealogy formats
- **Undo/Redo**: Action history and reversal capabilities
- **Desktop App**: Build a desktop app using Electron

## 🤝 Contributing

This project follows Vue.js best practices and design patterns. When contributing:

1. Follow the existing code structure and patterns
2. Use TypeScript for type safety
3. Maintain the dark theme design
4. Ensure responsive design works on all screen sizes
5. Add proper error handling and validation
6. Write clear, descriptive commit messages

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using Vue 3, TypeScript, and Tailwind CSS
