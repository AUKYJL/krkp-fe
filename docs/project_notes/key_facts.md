# Key Facts

Store project constants, configuration, and frequently-needed **non-sensitive** information here. Organize by category using bullet lists.

## ⚠️ Security: what not to store here

**Never store passwords, API keys, or sensitive credentials in this file.** This file is typically committed to version control.

**❌ Never store:**
- Passwords or passphrases
- API keys or authentication tokens
- Service account JSON keys or credentials
- Database passwords
- OAuth client secrets
- Private keys or certificates
- Session tokens
- Any secret values from environment variables

**✅ Safe to store:**
- Hostnames, ports, cluster names
- Project identifiers and regions
- Public API endpoint URLs
- Service account email addresses (not keys)
- Environment names and deployment targets

**Where to store secrets:**
- `.env` files (excluded via `.gitignore`)
- Password managers
- Secrets managers (GCP Secret Manager, etc.)
- CI/CD environment variables (GitHub Secrets, etc.)

## Format

Organize information into logical categories:
- Cloud configuration
- API endpoints (URLs only)
- Local development setup (ports, service names)
- Important URLs

Use bullet lists for simplicity and easy scanning.

## Example Structure

### Local Development Ports

- Frontend dev server: `5173`
- Preview server: `4173`

## Tips

- Keep entries current (update when things change)
- Remove deprecated information after migration is complete
- Add URLs to make navigation easier
- Use consistent formatting

