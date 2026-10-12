# Golf Portal

Take-home: a small React app for managing golf courses (list + create/edit with live card preview).
The design reference is `docs/design-spec.md` and the screenshots in `docs/figma/`. Read them before touching UI.

## Stack
React 19, Vite, TypeScript (strict), React Router (lazy routes), TanStack Query, React Hook Form + Zod,
Radix primitives (DropdownMenu, Dialog), CSS Modules, Vitest + Testing Library, Playwright.

## Commands
- `npm run dev`: dev server
- `npm run typecheck`: `tsc -b`
- `npm run lint`: ESLint
- `npm run test:run`: Vitest once (use `npm test` for watch)
- `npm run e2e`: Playwright

Run `typecheck`, `lint` and `test:run` before calling a task done.

## Structure
```
src/
  app/                 shell, router, providers
  features/courses/
    model/             types, Zod schema, pure domain logic (sortCourses), no React
    api/               service interface + mock implementation, no React
    queries/           React Query keys, hooks, mutations
    components/        CourseCard, CourseMenu, DeleteCourseDialog, ...
    pages/             route components (lazy-loaded)
  ui/                  generic presentational components (Button, Field, ...)
  styles/              tokens.css, global.css
```

## Rules
- **All data access goes through `features/courses/api`.** Components never touch localStorage/IndexedDB directly.
  The service is an interface; the mock is one implementation. Swapping in a real API must only touch `api/`.
- Components read server state via the hooks in `queries/`, never by calling the service directly.
- One Zod schema (`model/courseSchema.ts`) is the source of truth for form validation and types.
- `sortCourses` is pure and is the only place featured ordering is defined.
- No `any`, no non-null `!` outside `main.tsx`. Prefer `type` over `interface`.
- Colors, font sizes, spacing and shadows come from CSS variables in `styles/tokens.css`. No hardcoded hex in components.
- Interactive elements must be keyboard accessible with visible focus. Use Radix for menu/dialog instead of hand-rolling focus management.
- Keep it small. This is a one-day task: no extra abstractions, no state library beyond React Query + RHF.

## Commits
Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`, `docs:`, `refactor:`), imperative, lowercase, scope optional
(`feat(courses): add optimistic delete`). Use `/commit`.

## Decisions (keep in sync with README)
- Card location = `"{city}, {countryCode}"` (e.g. "California, US"). City is required; Figma's Description field is dropped.
- Optional tee lengths (men/women, metres) are shown on the card hover state, as in Figma.
- `featuredAt` is set when `featured` goes false → true on save, cleared when it goes true → false, kept otherwise.
- Images are stored as Blobs in IndexedDB, referenced by `imageId` on the course; object URLs are created on read.
