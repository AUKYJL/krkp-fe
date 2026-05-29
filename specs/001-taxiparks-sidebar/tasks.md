---

description: "Dependency-ordered implementation tasks for Taxi Parks Sidebar"
---

# Tasks: Taxi Parks Sidebar

**Input**: Design documents from `specs/001-taxiparks-sidebar/` (`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)

**Testing**: No test runner is currently configured in this repo; do not add one unless explicitly approved (per `specs/001-taxiparks-sidebar/plan.md`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US#]**: Maps tasks to user stories in `specs/001-taxiparks-sidebar/spec.md`
- Every task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure the implementation starts from an agreed source of truth (Pencil) and the repo is ready for the feature work.

- [ ] T001 Extract the final sidebar nav item list (labels/order/icons) from Pencil Node `jRRvC` and write it into `specs/001-taxiparks-sidebar/contracts/routes.md` (routes MUST follow `/taxiparks` + `/taxiparks/:id`)
- [ ] T002 Confirm the design tokens exist as Pencil variables for Node `jRRvC` (via Pencil MCP) and record the variable naming scheme in `specs/001-taxiparks-sidebar/research.md`
- [X] T003 Validate local run/lint/build steps using `specs/001-taxiparks-sidebar/quickstart.md`
- [X] T004 [P] Add a feature scaffold for sidebar UI in `src/features/taxiparks-sidebar/` (folders + `index.ts` exports)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared primitives + tokens that must exist before building the sidebar and routes.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T005 Mirror the Pencil token variables (colors/typography/spacing/radii) into CSS custom properties in `src/index.css` (keep names consistent with Pencil variables)
- [ ] T006 [P] Map required sidebar token variables into Tailwind theme variables (if needed) in `src/index.css`
- [ ] T007 [P] Update `AppText` variants/sizes used by the sidebar in `src/shared/ui/app-text/constants/variants.ts` and `src/shared/ui/app-text/constants/sizes.ts`
- [ ] T008 [P] Update `Button` variants/sizes needed by the sidebar design (if any) in `src/shared/ui/button/constants/variants.ts` and `src/shared/ui/button/constants/sizes.ts`
- [ ] T009 Create a typed nav item contract for the feature in `src/features/taxiparks-sidebar/model/sidebar-nav-item.ts`
- [ ] T010 [P] Implement a single source of truth nav list (derived from Pencil) in `src/features/taxiparks-sidebar/model/sidebar-nav.ts`

**Checkpoint**: Tokens + primitives + nav contract exist; user story implementation can begin.

---

## Phase 3: User Story 1 - Consistent sidebar navigation for Taxi Parks (Priority: P1) 🎯 MVP

**Goal**: Render a persistent left sidebar for the Taxi Parks area matching Pencil `jRRvC`, with active state and working navigation between sections.

**Independent Test**: Open a Taxi Parks route, visually compare the sidebar to Pencil, click each nav item, and confirm active highlight updates on navigation.

### Implementation for User Story 1

- [ ] T011 [US1] Create the Taxi Parks layout shell route at `/taxiparks` with a persistent sidebar + outlet in `src/routes/taxiparks.tsx`
- [ ] T012 [P] [US1] Add initial Taxi Parks section route stubs (one per nav item) as `src/routes/taxiparks/$sectionId.tsx` files
- [ ] T013 [US1] Implement the sidebar container (layout, logo area, nav list wrapper) in `src/features/taxiparks-sidebar/ui/taxiparks-sidebar.tsx`
- [ ] T014 [P] [US1] Implement a sidebar nav item component (link, active styles, focus-visible) in `src/features/taxiparks-sidebar/ui/taxiparks-sidebar-nav-item.tsx`
- [ ] T015 [US1] Wire sidebar navigation items to TanStack Router links and active state in `src/features/taxiparks-sidebar/ui/taxiparks-sidebar.tsx`
- [ ] T016 [US1] Handle overflow/scroll for long nav lists per Pencil intent in `src/features/taxiparks-sidebar/ui/taxiparks-sidebar.tsx`
- [ ] T017 [US1] Ensure missing logo asset does not break layout (fallback rendering) in `src/features/taxiparks-sidebar/ui/taxiparks-sidebar.tsx`
- [ ] T018 [US1] Ensure keyboard operability + visible focus indicator for nav items in `src/features/taxiparks-sidebar/ui/taxiparks-sidebar-nav-item.tsx`
- [ ] T019 [US1] Update `specs/001-taxiparks-sidebar/contracts/routes.md` with the implemented route paths/ids for each nav item

**Checkpoint**: Sidebar is persistent on all Taxi Parks routes, matches Pencil structure, and navigation + active state works.

---

## Phase 4: User Story 2 - Reusable UI foundations (tokens + text + buttons) (Priority: P2)

**Goal**: Ensure the sidebar (and future pages) use standardized tokens and shared UI components rather than ad-hoc styling.

**Independent Test**: Verify sidebar text/buttons use `AppText`/`Button` variants and token variables; confirm a small UI kit showcase renders correctly.

### Implementation for User Story 2

- [ ] T020 [US2] Add a lightweight “UI kit showcase” page demonstrating `AppText` + `Button` variants used by the sidebar in `src/pages/taxiparks-ui-kit/taxiparks-ui-kit-page.tsx`
- [ ] T021 [US2] Add a route for the UI kit showcase page in `src/routes/taxiparks-ui-kit.tsx`
- [ ] T022 [US2] Refactor sidebar typography to use `AppText` variants (no one-off font classes) in `src/features/taxiparks-sidebar/ui/taxiparks-sidebar.tsx`
- [ ] T023 [US2] Refactor sidebar interactive elements to use token-driven styles (no hardcoded colors) in `src/features/taxiparks-sidebar/ui/taxiparks-sidebar-nav-item.tsx`
- [ ] T024 [US2] Normalize token naming and remove unused sidebar token variables in `src/index.css`

**Checkpoint**: Sidebar uses shared primitives + tokens; stakeholders can review variants via the showcase page.

---

## Phase 5: User Story 3 - Navigation stubs for upcoming sections (Priority: P3)

**Goal**: Every sidebar nav item lands on a dedicated page with a clear section title (even if content is placeholder).

**Independent Test**: Click each sidebar item and verify the destination page title matches the clicked label and the active state updates.

### Implementation for User Story 3

- [ ] T025 [P] [US3] Implement placeholder pages (distinct title per section) as `src/pages/taxiparks-sections/$sectionId.tsx` files
- [ ] T026 [US3] Wire each section route component to render its placeholder page in `src/routes/taxiparks/$sectionId.tsx`
- [ ] T027 [US3] Ensure long section titles truncate/wrap per Pencil without breaking alignment in `src/pages/taxiparks-sections/$sectionId.tsx`

**Checkpoint**: All nav items lead to distinct pages with clear titles; active state stays correct.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ensure quality, consistency, and readiness for review/demo.

- [ ] T028 [P] Add a short usage note and route list to `specs/001-taxiparks-sidebar/contracts/routes.md`
- [ ] T029 [P] Run `yarn lint` and fix issues in `src/routes/` and `src/features/taxiparks-sidebar/`
- [ ] T030 [P] Verify build still succeeds (no route generation errors) and update instructions if needed in `specs/001-taxiparks-sidebar/quickstart.md`
- [ ] T031 [P] Quick manual accessibility pass (keyboard navigation + focus) and record any follow-ups in `specs/001-taxiparks-sidebar/research.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1
- **Phase 3 (US1 / P1)**: Depends on Phase 2
- **Phase 4 (US2 / P2)**: Depends on Phase 2 (can be done after US1 if you prefer a strict MVP-first path)
- **Phase 5 (US3 / P3)**: Depends on Phase 3 (routes exist) and can proceed in parallel with US2
- **Phase 6 (Polish)**: After whichever user stories you choose to ship

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (tokens + nav contract)
- **US2 (P2)**: Depends on Foundational; can be done before or after US1, but US1 should remain the MVP target
- **US3 (P3)**: Depends on US1 route shell existing; then placeholder pages can be added incrementally

---

## Parallel Opportunities

- Phase 1: `T001` and `T002` can be done in parallel with `T004`
- Phase 2: `T007`, `T008`, `T009`, `T010` can be parallelized (separate files) after `T005` establishes token naming
- Phase 3: `T012` can be parallel with `T013`/`T014` once `T011` exists
- Phase 5: `T025` can be parallelized per section page (one file per section) under `src/pages/taxiparks-sections/`

---

## Parallel Example: US1

```bash
# In parallel after T011:
Task: "T012 Add initial Taxi Parks section route stubs (one per nav item) as src/routes/taxiparks/$sectionId.tsx files"
Task: "T013 Implement the sidebar container (layout, logo area, nav list wrapper) in src/features/taxiparks-sidebar/ui/taxiparks-sidebar.tsx"
Task: "T014 Implement a sidebar nav item component (link, active styles, focus-visible) in src/features/taxiparks-sidebar/ui/taxiparks-sidebar-nav-item.tsx"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1) and stop for a design check against Pencil `jRRvC`
3. Only then proceed to US2/US3
