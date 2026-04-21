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

## Production releases (version tags)

Official production versions use **semantic versioning** (`MAJOR.MINOR.PATCH`) in `package.json` and git tags named **`vMAJOR.MINOR.PATCH`** (for example `v1.2.3`). See [Semantic Versioning](https://semver.org/) and GitHub’s [workflow_dispatch](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch) documentation.

**Pull requests to `main`:** Do not bump `package.json` or add new `## [version]` changelog sections. `package.json` on `main` reflects the **last released** version (updated only by the Tag workflow). Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced by Commitlint on PRs).

### How we release

Maintainers run **Tag version (production release)** (`.github/workflows/tag-version.yml`) from the Actions tab on **`main`** (`workflow_dispatch`).

**Inputs:** `bump_kind` (`patch` / `minor` / `major` / `explicit`) and, when `explicit` is chosen, `explicit_version` (must be strictly greater than the current `package.json` version). Optional **`release_notes_en_extra`** and **`release_notes_pt_br_extra`** append bullet lines to **Changed** / **Alterado** after generated notes (for emergencies or context the commits do not carry).

**What the workflow does**

1. Finds **`FROM_REF`**: the highest semver tag **`vMAJOR.MINOR.PATCH`** merged into `HEAD`, if any. The repository **root** commit is recorded when there is no such tag (used for tooling only).
2. Lists subjects: if a previous release tag exists, `git log --no-merges ${FROM_REF}..HEAD --pretty=%s` (commits **after** that tag). If there is **no** tag yet, the workflow uses **all** commits reachable from `HEAD` (so the first release is not empty on a shallow history). **Merge commits are excluded**; use squash merges with a good Conventional squash title when possible.
3. **Fails** if that list is empty (nothing new to ship since the last tag).
4. Runs `scripts/release/summarize-commits.mjs` to build JSON sections, then `scripts/release/apply-release.mjs` to prepend `## [version] - date` to every locale in `changelog-files.json`, bump `package.json`, run `npm install`, commit `chore(release): v…` to `main`, and push annotated tag `v…`.

**English bullets:** `feat` → **Added**; `fix` and `revert` → **Fixed**; `docs`, `style`, `refactor`, `perf`, `build`, `ci`, `chore`, `test`, and `chore(deps)` → **Changed**. Subjects matching **`chore(release):`** are omitted. Anything that does not match Conventional Commits falls under **Changed**. Within each section, lines are sorted alphabetically. Each section is capped at **50** lines; if anything was truncated, an extra **Changed** line points at a GitHub **compare** URL (when a previous `v*` tag exists).

**Portuguese (`CHANGELOG.pt-BR.md`):** A short **`### Nota`** states the section is generated from the same commits as the English file; the **Added / Changed / Fixed** bullets mirror the English lines (same commit subjects).

**Fixing a bad release note after the fact:** Edit the markdown on `main` in a normal PR. Do **not** re-run the Tag workflow for a version that already has a `v*` tag and changelog section, or you risk duplicate sections or tag collisions.

`changelog-files.json` must list exactly the locales the release scripts support (**`en`** and **`pt-BR`** today); extend the scripts before adding manifest entries.

**Branch protection:** If GitHub Actions cannot push to `main` with the default `GITHUB_TOKEN`, add a fine-grained or classic PAT with **contents: write** on this repository as repository secret **`RELEASE_PUSH_TOKEN`**. The workflow uses `RELEASE_PUSH_TOKEN` when set, otherwise `github.token`.

**Who can run it:** Limit who may run Actions on `main` (and who can merge there) so only trusted maintainers can dispatch this workflow. Treat **`RELEASE_PUSH_TOKEN`** like any other secret: scope it to this repo, rotate it if it leaks or a maintainer leaves, and prefer a **fine-grained** token with the smallest permission set that still allows push and tags.

**If the workflow stops mid-flight:** If the version bump **commit** reached `main` but the **`v*` tag** push failed, fix forward by creating the annotated tag on that commit (for example `git tag -a vX.Y.Z -m "Release vX.Y.Z" <sha>` then `git push origin refs/tags/vX.Y.Z`) or by opening a small follow-up PR—avoid re-running the workflow for the same version if it would duplicate changelog sections or tags.

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

## Analytics

Production can use **Umami Cloud** for privacy-first analytics (pageviews and custom events such as habit creation). The analytics backend is **not** hosted on Netlify; it is Umami Cloud.

To enable analytics, set these environment variables in Netlify (or at build time):

- `VITE_ANALYTICS_ENABLED=true`
- `VITE_UMAMI_WEBSITE_ID=<your-website-id>` (from the Umami Cloud dashboard)

Optional: `VITE_UMAMI_SRC` to override the script URL (default is `https://cloud.umami.is/script.js`).

When these variables are not set or analytics is disabled, no tracking script is loaded and no data is sent.

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
