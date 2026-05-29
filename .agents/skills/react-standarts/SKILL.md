---
name: react-standards
description: Enforces React component conventions when creating, editing, or reviewing React components and hooks.
---

# React Standards

## Components

- Functional components with TypeScript
- Prefer composition over inheritance
- Keep components focused on one responsibility
- Named exports via index.ts barrel
- Props as interface and destructured in signature
- Avoid React.FC
- Avoid anonymous default exports

## Architecture

- Pages are thin route-level wrappers
- Business logic belongs in hooks/features
- Shared UI goes to shared/ui
- Feature-specific UI stays inside feature folders

## Styling

- Tailwind CSS v4
- Use project tailwind-patterns skill
- Use cn() for conditional classes
- No inline styles unless dynamically required
- Prefer design tokens and CSS variables

## State

- useState/useReducer for local state
- Zustand only for shared client state
- TanStack Query for server state
- Do not duplicate server state in Zustand

## Data Fetching

- Use openapi-react-query hooks
- No raw fetch/axios in components
- Handle loading, error and empty states

## Routing

- Use TanStack Router
- Protect routes by role
- Route components should remain thin

## Performance

- Memoize only when profiling justifies it
- Avoid unnecessary useMemo/useCallback
- Lazy-load heavy routes/components

## TypeScript

- Strict typing required
- Avoid any
- Prefer inferred types when readable

## Testing

- Vitest + React Testing Library
- Test behavior, not implementation
- One test file per component
