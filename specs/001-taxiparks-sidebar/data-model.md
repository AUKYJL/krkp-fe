# Data Model: Taxi Parks Sidebar

**Created**: 2026-05-29  
**Spec**: `specs/001-taxiparks-sidebar/spec.md`

This feature is primarily UI. The “data model” below describes the minimal UI contracts required to render the sidebar consistently across pages.

## Entities

### `DesignTokens`

Represents the extracted visual constants from Pencil used by the sidebar and shared UI primitives.

- `colors`: named palette (e.g., background, text, accent, border, interactive states)
- `typography`: font families + size/weight/line-height scale used by `AppText`
- `spacing`: spacing scale used by layout (padding/gaps)
- `radii`: border radius scale (including pill radius for buttons)

### `SidebarNavItem`

Represents one navigation entry in the sidebar.

- `id`: stable identifier (derived from the destination section)
- `label`: displayed text (must match Pencil)
- `route`: destination page/section route
- `icon`: optional icon identifier (only if present in Pencil)
- `isActive`: computed from current location

## Rules / Constraints

- The set and order of `SidebarNavItem` MUST match Pencil Node `jRRvC`.
- `SidebarNavItem.isActive` MUST be visually represented using the active state defined in Pencil.
- All pages reachable via `SidebarNavItem.route` MUST share a persistent left sidebar layout.

