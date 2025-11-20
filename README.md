# habit-tracker

A simple, free and offline habit tracker

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v11 or higher)

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Testing

Run tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Linting

This project uses ESLint with strict rules for code quality and consistency. ESLint is configured with React and TypeScript support.

Run linting:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint:fix
```

The linting check runs automatically in CI/CD for all pull requests to ensure code quality standards are maintained.

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Main Dependencies

### Runtime Dependencies

- **react** (^18.3.1) - React library for building user interfaces
- **react-dom** (^18.3.1) - React DOM renderer

### Development Dependencies

- **vite** (^6.0.5) - Next generation frontend tooling
- **@vitejs/plugin-react** (^4.3.3) - Vite plugin for React support
- **vitest** (^2.1.8) - Fast unit test framework
- **@testing-library/react** (^16.1.0) - React testing utilities
- **@testing-library/jest-dom** (^6.6.3) - Custom jest matchers for DOM
- **@testing-library/user-event** (^14.5.2) - User interaction simulation
- **jsdom** (^25.0.1) - DOM implementation for Node.js (used in tests)
- **eslint** - JavaScript and TypeScript linter
- **eslint-plugin-react** - React-specific linting rules
- **eslint-plugin-react-hooks** - React Hooks linting rules
- **@typescript-eslint/eslint-plugin** - TypeScript-specific linting rules
- **@typescript-eslint/parser** - TypeScript parser for ESLint

## Project Structure

```
habit-tracker/
├── src/
│   ├── App.jsx          # Main App component
│   ├── App.css          # App styles
│   ├── App.test.jsx     # App component tests
│   ├── main.jsx         # Application entry point
│   ├── index.css        # Global styles
│   ├── services/
│   │   ├── indexedDB.js      # IndexedDB service for offline storage
│   │   └── indexedDB.test.js # IndexedDB service tests
│   └── test/
│       └── setup.js     # Test setup configuration
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── vitest.config.js     # Vitest configuration
├── eslint.config.js     # ESLint configuration
└── package.json         # Project dependencies
```

## Styling

This project uses **plain CSS** for styling. No CSS frameworks or preprocessors are used.

## Offline Storage (IndexedDB)

The app uses IndexedDB for offline storage, allowing users to track habits without an internet connection. All data is stored locally in the browser.

### IndexedDB Service

The IndexedDB service (`src/services/indexedDB.js`) provides a complete CRUD API for managing habit objects:

#### Database Schema

- **Database Name**: `habit-tracker`
- **Version**: `1`
- **Object Store**: `habits`
- **Key Path**: `id` (primary key)

#### Habit Object Structure

```javascript
{
  id: string,              // Unique identifier (required)
  name: string,            // Habit name
  description: string,     // Optional description
  createdAt: string,      // ISO timestamp
  // ... other custom fields
}
```

#### API Methods

- **`openDB()`** - Opens the database connection and creates object stores if needed
- **`addHabit(habit)`** - Adds a new habit to the database
- **`getHabit(id)`** - Retrieves a habit by its ID
- **`getAllHabits()`** - Retrieves all habits from the database
- **`updateHabit(habit)`** - Updates an existing habit
- **`deleteHabit(id)`** - Deletes a habit by its ID
- **`closeDB(db)`** - Closes the database connection

#### Error Handling

The service includes comprehensive error handling for:

- **Quota Exceeded**: When browser storage quota is exceeded, a user-friendly error message is returned
- **Version Upgrades**: Database schema upgrades are handled automatically during database initialization
- **Transaction Errors**: All database operations handle transaction failures gracefully

#### Usage Example

```javascript
import { openDB, addHabit, getAllHabits, updateHabit, deleteHabit } from './services/indexedDB'

// Open database (usually done once at app startup)
await openDB()

// Add a new habit
const habitId = await addHabit({
  id: '1',
  name: 'Exercise',
  description: 'Daily exercise routine',
  createdAt: new Date().toISOString()
})

// Get all habits
const habits = await getAllHabits()

// Update a habit
await updateHabit({
  id: '1',
  name: 'Exercise Updated',
  description: 'Updated description',
  createdAt: new Date().toISOString()
})

// Delete a habit
await deleteHabit('1')
```

#### Browser Support

IndexedDB is supported in all modern browsers. The service includes a check for IndexedDB availability and will throw a descriptive error if it's not supported.

## License

See [LICENSE](LICENSE) file for details.
