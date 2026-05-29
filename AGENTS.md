Any commits that are made must follow the Conventional Commits convention, such as feat: ..., fix(scope): ..., and so on, with descriptions written in English.

All specifications created via $speckit-specify must use the naming format "number-feature_name", for example: 009-ru-ui-localization. No dates should be included in the specification name.

Git branch names must also follow the same naming convention as the specifications, for example: feature/009-ru-ui-localization.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/001-taxiparks-sidebar/plan.md`
<!-- SPECKIT END -->

## AI Skills (Must Follow)

When making changes in the areas below, the agent MUST load and follow the corresponding skill file:

- Tailwind / styles / layout / responsive UI / shadcn styling / Tailwind classNames → `tailwind-patterns` (`.agents/skills/tailwind-patterns/SKILL.md`)
- React components / hooks / component refactors → `react-standarts` (`.agents/skills/react-standarts/SKILL.md`)
- shadcn/ui component work → `shadcn` (`.agents/skills/shadcn/SKILL.md`)

## Project Memory System

This project maintains institutional knowledge in `docs/project_notes/` for consistency across sessions.

### Memory Files

- `docs/project_notes/bugs.md` - Bug log with dates, solutions, and prevention notes
- `docs/project_notes/decisions.md` - Architectural Decision Records (ADRs) with context and trade-offs
- `docs/project_notes/key_facts.md` - Project configuration, ports, important URLs (non-sensitive only)
- `docs/project_notes/issues.md` - Work log with ticket references

### Memory-Aware Protocols

**Before proposing architectural changes:**
- Check `docs/project_notes/decisions.md` for existing decisions
- Verify the proposed approach doesn't conflict with past choices
- If it does conflict, acknowledge the existing decision and explain why a change is warranted

**When encountering errors or bugs:**
- Search `docs/project_notes/bugs.md` for similar issues
- Apply known solutions if found
- Document new bugs and solutions when resolved

**When looking up project configuration:**
- Check `docs/project_notes/key_facts.md` for ports, URLs, and other reference info
- Prefer documented facts over assumptions

**When completing work on tickets:**
- Log completed work in `docs/project_notes/issues.md`
- Include ticket ID, date, brief description, and URL

**When user requests memory updates:**
- Update the appropriate memory file (bugs, decisions, key_facts, or issues)
- Follow the established format and style

### Style Guidelines for Memory Files

- Prefer bullet lists over tables
- Keep entries concise (1-3 lines for descriptions)
- Always include dates for temporal context
- Include URLs where helpful
- Manual cleanup of old entries is expected (not automated)
