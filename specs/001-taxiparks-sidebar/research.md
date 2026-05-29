# Research: Taxi Parks Sidebar

**Created**: 2026-05-29  
**Spec**: `specs/001-taxiparks-sidebar/spec.md`  
**Pencil Reference**: Node ID `jRRvC`

## Decisions

### Design tokens source of truth

- **Decision**: Pencil is the source of truth for tokens and the sidebar structure (Node `jRRvC`).
- **Rationale**: The feature’s success criteria requires matching Pencil; extracting tokens first prevents one-off styling drift.
- **Alternatives considered**:
  - Keep existing palette/typography as-is → rejected because it risks mismatch with the Pencil sidebar.

### Token representation

- **Decision**: Pencil (Node `jRRvC`) is the source of truth for tokens, stored as Pencil variables. Mirror these variables into the app as CSS custom properties (and Tailwind-compatible variables) and consume them from shared UI components (`AppText`, `Button`) and feature components.
- **Rationale**: Tokens already exist as variables in Pencil (via Pencil MCP), and the repo already uses CSS variables in `src/index.css`. This avoids new dependencies and reduces naming drift.
- **Alternatives considered**:
  - Hardcode Tailwind classes per component → rejected (hard to keep consistent and hard to adjust after design review).

### Navigation item contract

- **Decision**: Sidebar navigation items (labels, order, icons if present) must match Pencil Node `jRRvC` exactly.
- **Rationale**: Clarified requirement in the spec; it directly impacts routes and UI.
- **Alternatives considered**:
  - Temporary list defined in code → rejected for v1 of this feature.

### Layout + routing behavior

- **Decision**: Each navigation item opens a separate page/section; sidebar remains persistent on the left.
- **Rationale**: Matches clarified UX and simplifies user orientation across sections.
- **Alternatives considered**:
  - In-place content swap on the same page → rejected (not aligned with clarified behavior).

## Open Questions (non-blocking)

- Exact token values (colors/spacing/typography) and exact nav item list are extracted from Pencil during implementation; the plan assumes Pencil inspection/export is available to the implementer.
