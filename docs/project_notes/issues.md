# Issues / Work Log

Log work completed on tickets here. Keep it simple — enough to remember what was done. Full details live in Jira/GitHub.

## Format

Each entry should include:
- Date (YYYY-MM-DD)
- Ticket ID
- Brief description (1-2 lines)
- URL to ticket (if available)
- Status (optional: completed, in-progress, blocked)

Use bullet lists for simplicity. This is not a replacement for your ticket system — it's a quick reference log.

## Example Entries

### 2025-01-15 - PROJ-123: Implement Contact API
- **Status**: Completed
- **Description**: Created FastAPI endpoints for contact CRUD operations with validation
- **URL**: https://jira.company.com/browse/PROJ-123
- **Notes**: Added unit tests, coverage at 85%

### 2025-01-20 - GH-45: Add OAuth2 Authentication
- **Status**: In Progress
- **Description**: Implementing OAuth2 flow with Google provider
- **URL**: https://github.com/company/repo/issues/45
- **Notes**: Backend complete, frontend integration pending

## Tips

- Keep descriptions brief (1-2 lines max)
- Always include ticket URL for easy reference
- Update status if work gets blocked or resumed
- Clean out very old entries periodically (3+ months)

### 2026-06-05 - UI-vehicles-edit-page: Add vehicle edit page route
- **Status**: Completed
- **Description**: Added a UI-only `/vehicles/:id/edit` page based on the create form and wired the vehicle detail `Редактировать` action back to the vehicle detail flow.
- **URL**: N/A

### 2026-06-05 - UI-auth-layout-routes: Split app shell and add nested auth routes
- **Status**: Completed
- **Description**: Moved the sidebar shell into a pathless app branch, added `/auth` with nested `login` and `register` routes, and implemented UI-only auth forms with shared validation schemas.
- **URL**: N/A

### 2026-06-05 - UI-driver-home-inline-revenue: Move driver revenue entry to home dashboard
- **Status**: Completed
- **Description**: Removed the top-level revenue entry action, added an inline `Выручка сегодня` card under the driver header, and switched revenue entry/editing to in-place save/cancel states with autofocus.
- **URL**: N/A

### 2026-06-05 - UI-driver-home-dashboard-refactor: Split driver home dashboard into page-local module
- **Status**: Completed
- **Description**: Moved `DriverHomeDashboard` into a folder-based page-local module with local primitives, utils, and revenue card files while preserving the existing consumer import path via `index.ts`.
- **URL**: N/A
