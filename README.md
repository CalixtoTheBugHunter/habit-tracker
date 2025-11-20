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

## Project Structure

```
habit-tracker/
├── src/
│   ├── App.jsx          # Main App component
│   ├── App.css          # App styles
│   ├── App.test.jsx     # App component tests
│   ├── main.jsx         # Application entry point
│   ├── index.css        # Global styles
│   └── test/
│       └── setup.js     # Test setup configuration
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── vitest.config.js     # Vitest configuration
└── package.json         # Project dependencies
```

## Styling

This project uses **plain CSS** for styling. No CSS frameworks or preprocessors are used.

## License

See [LICENSE](LICENSE) file for details.
