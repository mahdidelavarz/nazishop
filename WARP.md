# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

This is a TypeScript Next.js 15 application (created with `create-next-app`) using the App Router (`app/` directory) and React 19. The project is configured with:

- Next.js core + TypeScript (`next`, `react`, `react-dom`, `typescript`)
- ESLint with Next.js presets (`next/core-web-vitals`, `next/typescript`)
- Vitest + jsdom + Testing Library for unit/integration tests
- TailwindCSS 4/PostCSS for styling
- Supabase and JWT-based auth helpers (`@supabase/*`, `jsonwebtoken`, `bcryptjs`, `@/shared/lib/jwt/jwt`)
- Client-side state and data utilities (TanStack Query, Zustand, Zod, React Hook Form, Axios, React Hot Toast)

The development server runs on `http://localhost:3000`.

## Commands

All commands below are shown with `npm`, but equivalent package managers (yarn/pnpm/bun) are supported if installed.

### Development

- Start dev server (hot reload):
  - `npm run dev`

### Build & run

- Production build:
  - `npm run build`
- Start production server (after build):
  - `npm run start`

### Linting

- Run ESLint using the root flat config (`eslint.config.mjs`):
  - `npm run lint`

ESLint is configured via `FlatCompat` to extend `next/core-web-vitals` and `next/typescript`, and ignores typical build artifacts: `node_modules`, `.next`, `out`, `build`, and `next-env.d.ts`.

### Testing

Vitest is configured in `vitest.config.ts` with:

- `environment: 'jsdom'` (browser-like DOM for React components)
- Test files matched under `src/**/*.test.ts` and `src/**/*.test.tsx`

Common commands:

- Run the full test suite once:
  - `npm test`
- Run tests in watch mode:
  - `npm run test:watch`
- Run a single test file (pattern is passed through to Vitest):
  - `npm test src/path/to/file.test.tsx`

## Code architecture & structure

### Framework & routing

- Next.js 15 App Router is used (see README reference to `app/page.tsx`).
- Application source code is expected under `src/`, with the TypeScript path alias `@/*` mapped to `./src/*` (configured in `tsconfig.json`).
- Imports like `@/shared/lib/jwt/jwt` resolve into the `src` tree, enabling concise and stable import paths across the app.

### TypeScript configuration

- `tsconfig.json` uses `moduleResolution: "bundler"` and `module: "esnext"`, matching modern Next.js expectations.
- `strict` mode is enabled and `noEmit: true` (Next handles compilation).
- Compiler `paths`:
  - `@/*` → `./src/*` (primary alias to treat `src/` as the logical root).
- Global type inclusions:
  - `@types/node`, `@types/react`, `@types/react-dom`.

### Auth & middleware

- `middleware.ts` at the project root implements cookie-based auth checks for specific routes using `NextRequest`/`NextResponse`:
  - Reads `accessToken` from cookies.
  - Defines protected routes: `/profile`, `/admin-products`.
  - For protected routes without a token, users are redirected to `/login`.
  - If a token is present, `verifyAccessToken` from `@/shared/lib/jwt/jwt` is called; verification errors are logged but do not block the request, allowing pages/API routes to handle refresh flows.
- Additional behavior:
  - If a request targets `/login` and there is a valid `accessToken`, the middleware redirects to `/` (to keep authenticated users out of the login page).
  - If the token is invalid when visiting `/login`, the middleware clears the `accessToken` cookie and allows access.
- Matcher configuration:
  - `config.matcher = ['/((?!api|_next/static|_next/image|favicon.ico).*)']` ensures middleware runs on most application routes while skipping API routes, Next.js static assets, and `favicon.ico`.

### Data fetching, forms, and state

While the concrete implementation files are in `src/` (not listed here), the dependencies in `package.json` imply the following architectural patterns:

- **Remote data & caching**: `@tanstack/react-query` for client-side data fetching, caching, and synchronization.
- **HTTP client**: `axios` for REST/HTTP requests.
- **Serverless backend / auth**: Supabase client and Next.js auth helpers (`@supabase/ssr`, `@supabase/auth-helpers-nextjs`, `@supabase/supabase-js`).
- **Client state**: `zustand` for lightweight global state management.
- **Validation & forms**:
  - `zod` for schema validation.
  - `react-hook-form` with `@hookform/resolvers` for declarative form handling and Zod-based validation.
- **UI feedback**: `react-hot-toast` for toast notifications, and `vazir-font` for typography.

Future code you write should follow these existing patterns where appropriate (for example, using React Query for async data rather than ad-hoc `useEffect` + `fetch`, and using Zod + React Hook Form for form validation).

### Testing stack

- Tests are expected to live under `src/` matching `**/*.test.ts`/`**/*.test.tsx`.
- With `jsdom` as the environment and dev dependencies on `@testing-library/react` and `@testing-library/jest-dom`, React component tests should use React Testing Library and its matchers.
- When adding new tests, ensure they follow the existing directory and naming conventions so they are picked up by Vitest.

## Additional notes for Warp

- Prefer using the existing TypeScript path alias `@/*` when generating imports instead of long relative paths.
- When modifying or adding route protection logic, make sure it stays consistent with the behavior encapsulated in `middleware.ts` (protected routes, login redirect, and token handling).
- When adding new tests, place them under `src/` with `.test.ts`/`.test.tsx` suffixes so they are automatically discovered by Vitest.
