# Redaksjon-Context Infrastructure

This document describes the infrastructure added to match protokoll and kronologi standards.

## Added Files

### Build & Development Configuration

- **vite.config.ts** - Vite build configuration with:
  - Git info injection (`__VERSION__`, `__GIT_BRANCH__`, etc.)
  - Library mode for ES and CJS outputs
  - Module preservation for better tree-shaking
  - External dependencies (overcontext, zod)
  - Source maps enabled

- **vitest.config.ts** - Test configuration with:
  - Node environment
  - Coverage thresholds (80% lines, 80% statements, 65% branches, 85% functions)
  - V8 coverage provider
  - Path aliases (@/ -> src/)

- **eslint.config.mjs** - ESLint configuration with:
  - TypeScript support
  - 4-space indentation (matching other projects)
  - Import plugin rules
  - No console.log allowed in production code
  - Unused vars prefixed with _ allowed

- **tsconfig.json** - TypeScript configuration (already existed)

### Package Management

- **.npmrc** - NPM configuration with provenance enabled
- **.npmignore** - Excludes source files, tests, and dev configs from npm package
- **.gitignore** - Git ignore patterns matching other projects

### GitHub Workflows

- **.github/workflows/test.yml** - Runs on push/PR:
  - Linting
  - Build verification
  - Test execution
  - Node 22 on Ubuntu

- **.github/workflows/npm-publish.yml** - Publishes on release:
  - Automated npm publish
  - Provenance enabled
  - Public access

- **.github/workflows/dependency-review.yml** - Security:
  - Reviews dependency changes in PRs
  - Comments summary in PR

- **.github/dependabot.yml** - Automated dependency updates:
  - Weekly npm updates

### Legal

- **LICENSE.md** - Apache 2.0 license (matching other projects)

## Updated Files

### package.json

Added:
- Repository URL and metadata
- Author and license fields
- Engine requirements (Node >=18, npm >=9)
- Keywords for npm discovery
- Enhanced scripts:
  - `build` - Full build with lint and type check
  - `dev` - Development mode
  - `watch` - Watch mode for development
  - `test:coverage` - Coverage reports
  - `lint:fix` - Auto-fix linting issues
  - `clean` - Remove dist directory
  - `prepublishOnly` - Pre-publish checks

Added devDependencies:
- ESLint plugins and parsers
- Vite and build tools
- Coverage tools
- TypeScript utilities

## Build Process

The build process now follows the same pattern as protokoll and kronologi:

1. **Lint** - ESLint checks all TypeScript files
2. **Type Check** - TypeScript compiler checks types (no emit)
3. **Build** - Vite builds ES and CJS modules with source maps
4. **Test** - Vitest runs all tests with coverage

## Scripts

```bash
# Development
npm run dev          # Start development server
npm run watch        # Watch mode for builds

# Quality Checks
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors
npm test             # Run tests
npm run test:coverage # Run tests with coverage

# Build
npm run build        # Full build (lint + typecheck + vite)
npm run clean        # Remove dist directory

# Pre-publish
npm run precommit    # Run before committing (lint + test + build)
npm run prepublishOnly # Runs automatically before npm publish
```

## CI/CD

### Continuous Integration

Every push to `main`, `working`, or feature branches triggers:
1. Dependency installation
2. Linting
3. Build
4. Tests

### Publishing

When a GitHub release is created:
1. Tests run
2. Package is built
3. Published to npm with provenance
4. Public access enabled

## Compliance

This package now matches the infrastructure standards of:
- ✅ @redaksjon/protokoll
- ✅ @redaksjon/kronologi
- ✅ @redaksjon/brennpunkt

All build, test, and deployment processes are standardized across the redaksjon ecosystem.
