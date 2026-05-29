# Decisions (ADRs)

Log architectural decisions here as lightweight ADRs (Architectural Decision Records).

## Format

Each decision should include:
- Date and ADR number
- Context (why the decision was needed)
- Decision (what was chosen)
- Alternatives considered
- Consequences (trade-offs, implications)

## Example Entries

### ADR-001: Use Workload Identity Federation for GitHub Actions (2025-01-10)

**Context:**
- Need secure authentication from GitHub Actions to GCP
- Service account keys are deprecated and considered insecure
- Want to avoid managing long-lived credentials

**Decision:**
- Use Workload Identity Federation (WIF) for GitHub Actions authentication
- Configure via `WIF_PROVIDER` and `WIF_SERVICE_ACCOUNT` secrets

**Alternatives Considered:**
- Service account JSON keys → Rejected: security risk, manual rotation required
- Environment-specific credentials → Rejected: harder to manage across repos

**Consequences:**
- ✅ More secure (no long-lived credentials)
- ✅ Automatic credential rotation
- ✅ Better audit trail
- ❌ Slightly more complex initial setup
- ❌ Requires GitHub OIDC support

### ADR-002: Use Alembic for Database Migrations (2025-01-12)

**Context:**
- Need version control for database schema changes
- Multiple developers working on database schema
- Want to avoid manual SQL scripts and migration conflicts

**Decision:**
- Use Alembic as the database migration tool
- Store migrations in `alembic/versions/` directory
- Use auto-generate feature for model changes

**Alternatives Considered:**
- Raw SQL scripts → Rejected: no versioning, error-prone
- Flask-Migrate → Rejected: too tied to Flask framework
- Django migrations → Rejected: using FastAPI, not Django

**Consequences:**
- ✅ Version-controlled schema changes
- ✅ Automatic migration generation from models
- ✅ Easy rollback capability
- ❌ Learning curve for team
- ❌ Must remember to generate migrations after model changes

### ADR-003: Use AlloyDB Instead of Cloud SQL (2025-01-15)

**Context:**
- Need PostgreSQL-compatible database in GCP
- Require high availability and automatic backups
- Performance-critical application with complex queries

**Decision:**
- Use AlloyDB for PostgreSQL instead of Cloud SQL
- Configure with automated backups and point-in-time recovery

**Alternatives Considered:**
- Cloud SQL PostgreSQL → Rejected: slower query performance
- Self-managed PostgreSQL on GCE → Rejected: high operational overhead
- Firestore → Rejected: need relational data model and SQL

**Consequences:**
- ✅ Better query performance (2-4x faster than Cloud SQL)
- ✅ PostgreSQL compatibility
- ✅ Managed service (automated backups, HA)
- ❌ Higher cost than Cloud SQL
- ❌ Newer service, less community documentation

## Tips

- Number decisions sequentially (ADR-001, ADR-002, etc.)
- Always include date for context
- Be honest about trade-offs (use ✅ and ❌)
- Keep alternatives brief but clear
- Update decisions if they're revisited/changed
- Focus on "why" not "how" (implementation details go elsewhere)

### ADR-004: Keep `src/routes` Thin; Pages Own UI (2026-05-29)

**Context:**
- Route files started to accumulate layout/UI concerns (sidebar shells, title mapping, etc.), making it harder to keep a consistent structure.
- We want a stable convention so we don’t re-discuss where routing logic ends and page/UI logic begins.

**Decision:**
- `src/routes/*` contains only TanStack Router route definitions (`createRootRoute`, `createFileRoute`).
- Each route component returns a page component from `src/pages/*` (e.g. `return <TaxiParkPage />;`) and does not build layouts/feature UI directly.
- Page components in `src/pages/*` own the markup/layout for that page (and may use TanStack hooks like `useRouterState`, `useParams`, etc. if needed).
- The app shell that must persist across navigation (sidebar + `<Outlet />`) lives in `src/pages/home/HomePage` and is mounted from `src/routes/__root.tsx`.

**Alternatives Considered:**
- Put layout shells into route files → Rejected: spreads UI across routing layer and breaks the “routes are thin” convention.
- Keep sidebar only under `/taxiparks/*` → Rejected: requirement is for sidebar + outlet to persist for `/`, `/taxiparks`, `/drivers`, etc.

**Consequences:**
- ✅ `src/routes` stays predictable and easy to scan.
- ✅ Page-level UI stays in `src/pages`, improving reuse and testing later.
- ❌ Sometimes pages need to read router state/params (acceptable trade-off).

### ADR-005: Feature Folder `ui/` Is Optional for Internal Splitting (2026-05-29)

**Context:**
- We often create `src/features/<feature>/index.ts` that re-exports a single component file (e.g. `titled-section-page.tsx`).
- Creating `ui/` for every feature adds noise; but when a single component grows, we still want a clear place for its internal subcomponents.

**Decision:**
- A feature folder may contain only `index.ts` + a single `*.tsx` file when that’s sufficient (example: `src/features/titled-section-page/`).
- Create `src/features/<feature>/ui/` only when the main `*.tsx` grows and needs to be split into multiple internal components that belong exclusively to that feature.

**Alternatives Considered:**
- Always create `ui/` → Rejected: creates empty/low-value structure until it’s actually needed.
- Put subcomponents next to the main file → Rejected: feature root becomes cluttered over time.

**Consequences:**
- ✅ Feature folders stay minimal by default.
- ✅ When needed, `ui/` provides an obvious place for internal subcomponents.
- ❌ One-time refactor cost when splitting a large `*.tsx` into `ui/` parts.
