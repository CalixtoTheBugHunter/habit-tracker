# Habit Tracker

A simple, free, and offline habit tracker built with React and TypeScript. Track your daily habits with streak counting, all stored locally in your browser using IndexedDB.

## Features

- **Create and manage habits** - Add, edit, and delete habits with optional descriptions
- **Streak tracking** - Automatically calculates consecutive completion days
- **Daily completion** - Mark habits as completed for today
- **Offline-first** - All data stored locally in your browser (IndexedDB)
- **Clean UI** - Simple, intuitive interface built with React
- **Accessible** - Built with accessibility best practices
- **Well-tested** - Comprehensive test coverage with Vitest

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v11 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CalixtoTheBugHunter/habit-tracker.git
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

### Project Structure

```
habit-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── HabitForm.tsx    # Form for creating/editing habits
│   │   └── HabitList.tsx    # List of habits with completion toggle
│   ├── contexts/            # React contexts
│   │   └── HabitContext.tsx # Habit state management
│   ├── services/            # Data layer
│   │   └── indexedDB.ts     # IndexedDB service for offline storage
│   ├── types/               # TypeScript type definitions
│   │   └── habit.ts         # Habit data model
│   ├── utils/               # Utility functions
│   │   ├── date/            # Date manipulation helpers
│   │   ├── habit/           # Habit-specific utilities (streak, completion)
│   │   └── validation/      # Validation functions
│   ├── test/                # Test utilities and fixtures
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── vitest.config.ts         # Vitest test configuration
└── eslint.config.js         # ESLint configuration
```

### Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **IndexedDB** - Offline storage
- **ESLint** - Code linting

## Testing

This project follows Test-Driven Development (TDD) principles. All features are thoroughly tested.

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

Tests are co-located with their source files using the `.test.ts` or `.test.tsx` naming convention. The project includes:

- Unit tests for utility functions
- Component tests using React Testing Library
- Integration tests for IndexedDB operations
- Test fixtures and helpers in `src/test/`

## Usage

1. **Create a habit**: Enter a name (required) and optional description, then click "Create Habit"
2. **Mark as complete**: Click "Mark as done" on any habit to record today's completion
3. **View streak**: Each habit displays its current consecutive day streak
4. **Edit habit**: Click "Edit" to modify a habit's name or description
5. **Delete habit**: Use the edit form to delete habits

All data is automatically saved to your browser's local storage and persists across sessions.

## Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. **Fork the repository** and create a feature branch
2. **Follow TDD**: Write tests first, then implement the feature
3. **Run tests**: Ensure all tests pass before submitting
4. **Lint code**: Run `npm run lint:fix` to fix formatting issues
5. **Commit changes**: Use clear, descriptive commit messages
6. **Submit PR**: Create a pull request with a detailed description

### Code Quality Standards

- All code must pass ESLint checks
- Maintain or improve test coverage
- Follow existing code patterns and structure
- Write self-documenting code (minimal comments)
- Ensure TypeScript types are properly defined

### Pull Request Process

1. Ensure all tests pass: `npm test`
2. Run linting: `npm run lint`
3. Update documentation if needed
4. Create a clear PR description explaining changes
5. Reference any related issues

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Browser Support

This application requires a modern browser with IndexedDB support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
