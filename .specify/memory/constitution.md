<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Modified principles: template placeholders → KRKP FE principles (5)
- Added sections: none (filled Section 2/3 + Governance)
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (no change required)
  - ✅ .specify/templates/spec-template.md (no change required)
  - ✅ .specify/templates/tasks-template.md (no change required)
  - ✅ .specify/templates/checklist-template.md (no change required)
- Deferred TODOs: none
-->

# krkp-fe Constitution

## Core Principles

### 1) Feature-Based Architecture (NON-NEGOTIABLE)
The codebase MUST use a feature-based structure (vertical slices).
Shared code MUST live in shared modules (e.g., `src/shared/*`) and remain
dependency-light.

### 2) API Access via OpenAPI Codegen Only (NON-NEGOTIABLE)
All API access MUST go through the generated OpenAPI client and
`openapi-react-query`.
Components MUST NOT call raw `fetch`/`axios` directly.

### 3) Async UI States Are Mandatory
Every async UI MUST implement:
- loading state
- error state
- empty state

No screen should “hang silently” while data is loading or when data is missing.

### 4) Stack Enforcement for Routing/Tables/Charts
Routing MUST use TanStack Router.
Complex tables MUST use TanStack Table.
Charts MUST use Recharts.
Styling MUST use Tailwind CSS and `shadcn/ui` as the base component system.

### 5) Dependency Governance + Testing Discipline
New dependencies MUST NOT be added without explicit approval.
Tests SHOULD be written with Vitest for non-trivial logic, especially:
- RBAC decisions (role gates)
- auth/token refresh behavior
- critical UI state handling

## Architecture & Security Constraints

- **Project type**: frontend-only React app (backend already exists).
- **Language**: TypeScript.
- **State/data fetching**: TanStack Query + `openapi-react-query`.
- **Auth**:
  - `access` token stored in Local Storage.
  - `refresh` token stored in cookies.
  - On `401`, the app MUST attempt refresh and continue without forcing re-login.
- **Authorization**: RBAC is required.
  - Director: fleet analytics, drivers, vehicles, revenue reports, tables, charts.
  - Driver: personal revenue, assigned vehicle info, own work stats, profile.
- **Currency**: rubles only (₽). UI MUST NOT assume multi-currency.
- **Design system**: `shadcn/ui` + Tailwind customization only.

## Development Workflow & Quality Gates

- Keep changes small and incremental; avoid large refactors without need.
- Role-based routes MUST be protected:
  - users MUST NOT see pages/actions unavailable to their role
  - route-level and UI-level guards MUST be consistent
- PR/review checklist MUST include:
  - no direct `fetch`/`axios` usage inside components
  - loading/error/empty states exist for async UI
  - routing uses TanStack Router
  - complex tables use TanStack Table
  - charts use Recharts
  - no new dependencies added without approval

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

- This constitution is authoritative for architecture and product constraints.
- Any deviation MUST be explicitly approved and recorded as an amendment.
- Amendments MUST:
  - describe what changed and why
  - include migration steps if behavior/structure changes
  - bump the constitution version (SemVer):
    - MAJOR: incompatible rules/role model changes
    - MINOR: new principle or materially expanded constraints
    - PATCH: clarifications / wording without changing meaning
- Compliance is checked during code review and when generating plans/tasks.

**Version**: 1.0.0
