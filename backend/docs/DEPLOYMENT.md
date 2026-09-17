# Deployment & CI/CD

## Local vs production

| Concern | Local | Production target |
|---------|-------|-------------------|
| Orchestration | Docker Compose | Google Cloud Docker host + Nginx |
| Domain | localhost ports | DuckDNS public domain |
| TLS | none | Let's Encrypt behind Nginx |
| Email | console backend | SMTP via env |
| Secrets | root `.env` (gitignored) | env / secrets on host — never in git |

Production flow:

```text
User → DuckDNS → Nginx → client-ui | admin-ui | Django API → PostgreSQL
```

## Environment in production

Must come from environment (never hardcode):

- `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `PUBLIC_DOMAIN`
- Database credentials and host
- `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `ADMIN_UI_ORIGINS`
- `CLIENT_UI_ORIGIN` for invitation deep links
- SMTP: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`
- Rate limits if tuned for production

See root `.env.example` and [`../.env.example`](../.env.example).

## CI/CD

GitHub Actions for backend tests, frontend tests/build, and Docker image builds are not in the repository yet. Until CI is wired, run tests locally:

```bash
make test-backend
```

## Kubernetes

Optional `k8s/` manifests may be added later. MVP production is expected on a Docker VM behind Nginx, not Kubernetes.

## Related

- Local run: [DEVELOPMENT.md](./DEVELOPMENT.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
