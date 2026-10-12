# Golf Portal

A small portal for managing golf courses: a card list and a create/edit form with a live card preview.
React 19, Vite, strict TypeScript, TanStack Query, React Hook Form + Zod, Radix, CSS Modules, Vitest, Playwright.

## Setup

Requires Node 22.12+ (built with Node 24).

```bash
npm install
npm run dev            # http://localhost:5173
npm run test:run       # unit + hook tests (Vitest)
npx playwright install chromium
npm run e2e            # end-to-end tests (starts its own dev server on :5174)
npm run build
```

**Reviewing errors and the rollback:** open **Mock API** (bottom-left) and tick *Fail loading*, *Fail saving* or *Fail deleting*.
With *Fail deleting* on, a deleted card disappears immediately and comes back with a toast.
To start from the seed data again, clear site data in DevTools.

## Assumptions

- **Fields:** the brief's fields plus a required **City**, because the Figma card shows "California, US".
  Figma's *Description* is dropped since it isn't shown anywhere. Location is `"{city}, {country code}"`.
- **Tee lengths:** the Figma hover state shows men's/women's tee lengths, so they're optional fields.
  On hover the card swaps them in when they exist; otherwise only the shadow and menu button change.
- **Featured:** `featuredAt` is set when a course becomes featured on save, kept while it stays featured,
  and cleared when unfeatured (re-featuring puts it last in the featured group).
- **Difficulty** has no default ("Choose an option") so nobody saves difficulty 1 by accident.
- **Delete modal** includes the course name, as the brief asks (the Figma copy is generic).
- **Images:** JPG/PNG/WebP, max 10 MB, validated on drop with an inline error. A checkerboard placeholder is shown before upload.
- **Breakpoints:** 1 column below 600 px, 2 from 600, 3 from 960, 4 from 1280. The editor is two columns from 1024 px.
- **Seed data is illustrative:** five photos are the simulator renders from the Figma file, tee lengths are approximate.
  Other photos are credited in [docs/image-credits.md](docs/image-credits.md).

## Notable tradeoffs

- **Service layer:** everything goes through a `CourseService` interface (`src/features/courses/api`). The mock stores courses in
  localStorage and image Blobs in IndexedDB, so both survive a refresh. Components only see `Course.imageUrl`, as a real API
  would return it; swapping in a real backend is a new implementation plus one line in `api/index.ts`.
- **Explicit failure switches instead of random failures,** so the rollback can be reproduced on demand.
- **Ordering lives in one pure function** (`sortCourses`). The mock applies it like a server would, and the client reuses it to
  place a saved course in the cache immediately; the list is then refetched so the server's version wins.
- **Optimistic delete** cancels in-flight list fetches, snapshots the list, and restores it on error. Its toasts live in the
  hook, because the card (and the dialog's caller) is gone before the request finishes.
- **Radix** for the menu and dialog, rather than hand-rolled focus management. Focus returns to the menu button on cancel and
  moves to "Create a course" after a delete.
- **Tests focus on behaviour that's easy to break:** featured ordering and `featuredAt` rules, the optimistic rollback
  (React Query runs for real, only the service is mocked), and two Playwright flows: create → persist → delete, and a failed
  delete rolling back.

## With more time

- Resize images in the browser before storing them, and handle a full storage quota with a specific message.
- Warn about unsaved changes when leaving the form; allow removing an image, not just replacing it.
- Keep the Mock API switches in sync across tabs (`storage` event).
- More e2e coverage (validation, edit flow, mobile viewport) and an accessibility check with axe.
- PWA: cache the list page for offline use with an offline indicator.

## AI usage

**Tools:** Claude Code in VS Code, with the Figma MCP server and Playwright.

**How I set it up:**
- [`CLAUDE.md`](CLAUDE.md) with the stack, folder structure and rules (all data access through `api/`, one Zod schema,
  tokens instead of hex colours, Conventional Commits) and the decisions above.
- Three subagents in [`.claude/agents/`](.claude/agents/): `figma-extractor` (reads Figma into
  [`docs/design-spec.md`](docs/design-spec.md)), `test-writer`, and a read-only `reviewer`.
- A `PostToolUse` hook that runs ESLint and `tsc` after every edit, so type errors are fixed immediately, and a `/commit` command.
- Planning first, then building phase by phase. For the UI, two agents ran in parallel on the list page and the editor,
  each owning separate files, after the shared card, buttons and data layer were in place.

**Where it helped most:** extracting tokens, spacing and states from Figma; scaffolding the data and query layers;
building both pages in parallel; and checking the result in a real browser with screenshots at several widths.

**How I reviewed and adjusted it:**
- I reviewed and committed each phase myself, and made the open product decisions (fields, tee lengths, seed data).
- The test runs caught real issues: react-hook-form converted an empty tee length to `0`, and React Router warned about a
  missing loading fallback. Both are fixed.
- Review and visual checks caught others: wrong heading order in the preview, a load failure that was only visible after a
  reload, and seed images that were upscaled.
- I corrected the AI where it guessed: it had invented a course name for an unnamed Figma card, which I replaced with a real course.
- Limits: the Figma MCP hit its plan's rate limit late in the project, so later design questions used the saved spec and screenshots.
