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

### 2026-06-06 - UI-driver-taxipark-page: Add driver taxipark membership and invitation page
- **Status**: Completed
- **Description**: Split `/taxiparks` by role, preserved the director analytics page, and added a driver-focused page with membership info, invitation accept/reject actions, loading, empty, and error states backed by the existing API endpoints.
- **URL**: N/A

### 2026-06-07 - UI-driver-analytics-and-vehicle-brand-refresh: Wire real driver analytics and refresh vehicle insights
- **Status**: Completed
- **Description**: Added live driver analytics hooks and role-aware `/drivers` access, converted `/drivers/:id` to real analytics with self-only driver access semantics, hid the drivers sidebar item for `DRIVER`, and replaced low-signal vehicle comparison blocks with `brandAnalytics` insights.
- **URL**: N/A

### 2026-06-08 - UI-driver-search-and-invitations: Wire live driver search and invitation flows
- **Status**: Completed
- **Description**: Replaced `/drivers/add` mock search with API-backed driver search and invite actions, and refactored driver `/taxiparks` to render the full invitation list with per-card accept/reject behavior.
- **URL**: N/A

### 2026-06-08 - UI-driver-taxipark-invitations-de-emphasis: De-emphasize driver taxipark invitations
- **Status**: Completed
- **Description**: Moved the driver `/taxiparks` focus to `Мой таксопарк`, filtered invitations down to `pending` items, and moved invitation browsing/actions into a compact drawer-backed flow.
- **URL**: N/A

### 2026-06-08 - UI-live-taxi-park-operations: Wire live taxi park operations
- **Status**: Completed
- **Description**: Replaced the mocked vehicle creation flow with `POST /api/taxi-parks/{taxiParkId}/cars`, added driver car assignment from free cars only, and connected the driver home dashboard to live work-day start/update/finish actions.
- **URL**: N/A

### 2026-06-09 - UI-driver-home-active-workday-state: Respect active work day in driver home
- **Status**: Completed
- **Description**: Normalized `/api/drivers/me` to read nested `activeWorkDay` fields with flat fallback compatibility, and updated the driver home UI so start/finish/revenue controls follow the live active work day state.
- **URL**: N/A

### 2026-06-09 - UI-driver-home-revenue-string-parsing: Parse string revenue in live state
- **Status**: Completed
- **Description**: Updated the `/api/drivers/me` live-state normalization to accept `activeWorkDay.revenue` as either a number or a numeric string so the driver revenue card no longer falls back to the empty state.
- **URL**: N/A

### 2026-06-09 - UI-vehicles-create-assign-flow: Add create-and-assign flow for vehicles
- **Status**: Completed
- **Description**: Added the `Добавить авто` CTA to the vehicles header, kept the director catalog on `DataTable`, and extended `/vehicles/create` to create a car in the current taxi park, resolve it by plate number, and optionally assign a free driver.
- **URL**: N/A

### 2026-06-09 - UI-vehicles-assign-driver: Add dedicated vehicle driver assignment page
- **Status**: Completed
- **Description**: Added `/vehicles/:id/assign-driver`, wired a `Назначить водителя` action from the vehicle detail header, loaded taxi-park drivers for selection, and saved the assignment through `POST /api/cars/{carId}/assign-driver` with `null` support for unassignment.
- **URL**: N/A
