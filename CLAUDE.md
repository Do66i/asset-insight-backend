# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev        # watch mode (recommended for dev)
npm run start:debug      # watch mode with debugger

# Build & Production
npm run build            # compile to dist/
npm run start:prod       # run compiled output

# Linting & Formatting
npm run lint             # ESLint with auto-fix
npm run format           # Prettier format

# Testing
npm test                 # unit tests (*.spec.ts in src/)
npm run test:watch       # unit tests in watch mode
npm run test:e2e         # e2e tests (test/*.e2e-spec.ts)
npm run test:cov         # unit tests with coverage

# Run a single test file
npx jest src/path/to/file.spec.ts
```

## Environment

Copy `.env.example` to `.env` and fill in the values before running:

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password_here
DB_DATABASE=asset_insight
```

The app uses `@nestjs/config` with `ConfigModule.forRoot({ isGlobal: true })`, so `ConfigService` is injectable everywhere without per-module imports.

## Architecture

NestJS backend targeting a MySQL database via TypeORM. The stack:

- **NestJS** — module/controller/service pattern; each domain gets its own module
- **TypeORM** (`@nestjs/typeorm`) — ORM for MySQL; entities live alongside their module
- **class-validator / class-transformer** — DTO validation via pipes; use `ValidationPipe` globally in `main.ts`
- **@nestjs/config** — environment access via `ConfigService`

### Conventions

- Each feature is a self-contained NestJS module under `src/<feature>/`
- TypeORM entities are defined as TypeScript classes with decorators
- DTOs use `class-validator` decorators for input validation
- Unit tests (`*.spec.ts`) live next to the file they test; e2e tests go in `test/`

### ESLint rules of note

- `@typescript-eslint/no-explicit-any` is off — `any` is allowed
- `@typescript-eslint/no-floating-promises` and `@typescript-eslint/no-unsafe-argument` are warnings, not errors
