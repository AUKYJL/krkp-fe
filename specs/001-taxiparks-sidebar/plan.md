# Implementation Plan: Taxi Parks Sidebar

**Branch**: `feature/001-taxiparks-sidebar` | **Date**: 2026-05-29 | **Spec**: `specs/001-taxiparks-sidebar/spec.md`  
**Input**: Feature specification from `specs/001-taxiparks-sidebar/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the left sidebar for the Taxi Parks area based on Pencil Node `jRRvC`, backed by a small, reusable UI foundation:
- Extract and codify design tokens (colors, spacing, radii, typography) from Pencil and map them to the app’s CSS variables.
- Ensure `AppText` and `Button` components cover all sidebar typography and interactive states.
- Build a persistent left sidebar layout and route shell so each navigation item opens a separate page while keeping the sidebar visible.

## Technical Context

**Language/Version**: TypeScript (`typescript@5.9.3`)  
**Primary Dependencies**: React (`react@19.1.0`), TanStack Router (`@tanstack/react-router@1.x`), TanStack Query (`@tanstack/react-query@5.x`), Tailwind CSS (`tailwindcss@4.x`), `shadcn/ui` patterns  
**Storage**: N/A for this feature (UI-only; no persistence required)  
**Testing**: No test runner currently configured in this repo; add Vitest only with explicit approval (Constitution principle #5)  
**Target Platform**: Web (desktop-first)  
**Project Type**: Frontend-only React app  
**Performance Goals**: Sidebar interactions feel instant; no layout jank during navigation  
**Constraints**: No new dependencies without approval; routing must use TanStack Router; styling must be Tailwind + shared UI components  
**Scale/Scope**: This feature covers tokens + UI kit baseline and the sidebar route shell for Taxi Parks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Feature-based architecture is preserved (work lives under `src/features/*` with shared UI under `src/shared/*`).
- ✅ No direct API calls needed for sidebar; if a future page needs API, it must use OpenAPI codegen + `openapi-react-query`.
- ✅ Async UI states principle is not triggered by this feature (static shell), but must be applied on future pages with data.
- ✅ Routing uses TanStack Router (required).
- ✅ No new dependencies are introduced as part of this plan.

## Project Structure

### Documentation (this feature)

```text
specs/001-taxiparks-sidebar/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
src/
├── app/                 # App providers / app bootstrap
├── routes/              # TanStack Router route definitions
├── routeTree.gen.ts     # Generated router tree
├── features/            # Feature slices (Taxi Parks + sidebar)
├── pages/               # Page-level UI
└── shared/              # Shared UI + utilities + api client
    ├── ui/
    │   ├── app-text/
    │   └── button/
    └── api/
```

**Structure Decision**: Use the existing feature-based structure: sidebar + taxi parks route shell under `src/features/*`; reusable tokens and primitives in `src/shared/*`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
