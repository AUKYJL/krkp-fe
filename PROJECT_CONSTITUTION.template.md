# 📜 PROJECT CONSTITUTION

## Canonical Project Constitution (AI Engineering Standard — AES)

AES Constitution Version: 1.0  
Status: Active  
Authority Level: Required

---

## ⚖️ CONSTITUTION AUTHORITY

This document defines the **architectural and product authority** of the project.

All AI agents and contributors operating in this repository MUST:

- follow decisions defined in this constitution
- avoid architectural deviation
- request clarification when conflicts appear
- prioritize this document over assumptions

If implementation contradicts this constitution —  
**the constitution prevails.**

This file acts as the **single source of truth** for the system.

---

## 🤖 AI EXECUTION CONTEXT

AI agents MUST:

1. Read this constitution before generating code
2. Produce an implementation plan
3. Execute work incrementally
4. Validate changes against defined constraints
5. Use project skills when relevant:
   - `tailwind-patterns` MUST be used whenever creating, editing, or refactoring styles, layouts, responsive UI, shadcn/ui components, or Tailwind classNames.
   - `react-standarts` SHOULD be used when creating, reviewing, or optimizing React components.
   - `shadcn` MUST be used for all shadcn/ui component implementations.

Operational requirement:
- If any Tailwind classes/styles/layout/responsive UI are touched, the agent MUST first open and follow `.agents/skills/tailwind-patterns/SKILL.md` and mention that the `tailwind-patterns` skill is being used in the working notes/response for that change.

🚫 Implementation MUST NOT begin without alignment.

---

# 1. 🎯 PRODUCT SCOPE

## Project Description

Name:
krkp-fe
One-sentence description:
Frontend application for automating revenue tracking, vehicle condition monitoring,
and taxi fleet performance analytics.
Target user:
- Taxi fleet directors / owners
- Drivers working for a taxi fleet

---

## MVP Scope (≤5 items)

- Revenue tracking and reports (per role)
- Fleet performance analytics dashboards (Director)
- Vehicles condition and status views (Director/Driver as allowed)
- Drivers performance/work stats (Director + own stats for Driver)
- RBAC-protected navigation/routes and pages

---

## Non-Goals

❌ Implementing backend APIs (backend already exists)
❌ Supporting multiple currencies (rubles only)
❌ Defining/optimizing deployment and infrastructure (not defined yet)

---

## Success Metrics

| Metric             | Target       | Measurement |
| ------------------ | ------------ | ----------- |
| Core feature works | Yes          | Smoke test  |
| Response time      | Reasonable   | UX review   |
| Test coverage      | Targeted     | Vitest run  |

---

# 2. 🛠️ TECHNOLOGY STACK

## Frontend

Framework: React
Language: TypeScript
Styling: Tailwind CSS v4
State Management: TanStack Query (+ local UI state as needed)
Routing: TanStack Router
HTTP Client: generated OpenAPI client + openapi-react-query (no raw fetch/axios in components)
UI Library: shadcn/ui + custom components (Tailwind-based)
Validation: TODO(VALIDATION): define schema validation approach if needed (e.g., Zod) with explicit approval


AI coding requirements:

- Always follow the latest stable Tailwind CSS documentation.
- When unsure about Tailwind APIs, assume Tailwind CSS v4 conventions.
- Do not generate deprecated Tailwind configuration patterns.
- Prefer @theme, CSS variables, and modern Tailwind v4 architecture where applicable.
- Generated code must be compatible with the project's installed Tailwind version.

## Backend

Framework: N/A (external, already exists)
Database: N/A (external)
ORM: N/A
Authentication: JWT with access + refresh tokens (provided by backend)
File Storage: N/A / external

## Infrastructure

Package Manager: Yarn
Runtime: Vite (frontend build tool)
Deployment: Not defined yet
Hosting: Not defined yet

---

# 3. 📐 ARCHITECTURE

## Architectural Approach

Pattern: Feature-based (vertical slices)
Layer separation: UI/features/shared
API isolation: Only through generated OpenAPI client + openapi-react-query
Error handling: Every async UI must include loading, error, and empty states

---

## Project Structure

Current project structure (feature-based):

src/
├── app/                # app bootstrap, providers (router/query), composition
├── assets/             # static assets
├── features/           # feature slices (domain UI/logic)
├── pages/              # route-level pages (thin wrappers)
├── routes/             # TanStack Router route definitions
├── shared/             # shared UI/components/utils/api/types/store
├── main.tsx            # entrypoint
├── routeTree.gen.ts    # TanStack Router generated route tree
└── index.css           # global styles (Tailwind entry)

---

# 4. 👤 USER FLOWS

FLOW 1 (Director):
Director → Opens analytics dashboards → Sees fleet KPIs, charts, tables, filters

FLOW 2 (Driver):
Driver → Opens personal revenue/work stats → Sees own stats + assigned vehicle info

---

# 5. 📋 FUNCTIONAL REQUIREMENTS

## User Stories

P0 — Must Have:

- As a Director, I want to view fleet analytics (tables + charts) so I can monitor performance.
- As a Director, I want to manage/view drivers and vehicles info so I can control the fleet.
- As a Driver, I want to view my personal revenue and work stats so I can track my performance.
- As a Driver, I want to view my assigned vehicle info so I can monitor my work context.
- As a user, I want role-protected routes/actions so I never see unauthorized content.

---

# 6. ⚡ NON-FUNCTIONAL REQUIREMENTS
## Security

Authentication:
JWT with access + refresh tokens.
Access token stored in Local Storage; refresh token stored in cookies.
On `401`, the app refreshes access token and continues without re-login.
Rate limiting:
Input validation:
HTTPS required

---

# 7. 🗄️ DOMAIN MODEL

Director 1:M Fleet
Fleet 1:M Vehicle
Fleet 1:M Driver
Driver 1:M RevenueRecord
Vehicle 1:M ConditionRecord

---

# 8. 🚀 DEPLOYMENT

Platform:
Environment variables:
CI/CD:
Rollback strategy:

---

# 9. ✅ ACCEPTANCE CRITERIA

A feature is complete when:

[ ] Happy path works
[ ] Errors handled
[ ] Zero type errors
[ ] Responsive UI
[ ] Loading / Empty / Error states implemented
[ ] No direct `fetch`/`axios` in components
[ ] Routing uses TanStack Router
[ ] Complex tables use TanStack Table
[ ] Charts use Recharts
[ ] RBAC-protected routes and actions

---

# 🔁 CONSTITUTION EVOLUTION

Changes require:

- explicit human approval
- architectural review
- version update

---
