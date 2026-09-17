# Troubleshooting

## API calls fail / CORS

- Confirm `VITE_API_BASE_URL` includes `/api` (e.g. `http://localhost:8000/api`).
- Client origin must be in backend `CORS_ALLOWED_ORIGINS`.
- Restart Compose after env changes.

## Login modal opens unexpectedly

`RequireAuth` opens login and redirects home when there is no access token. Clear stale `rh_*` keys or log in again.

## 401 loops / forced logout

Refresh may fail if the refresh token is expired or blacklisted. Clear `localStorage` keys `rh_access`, `rh_refresh`, `rh_user` and log in again.

## Invitation deep link does nothing

Check `?auth=login|register&token=…`. Invite token is stored in `sessionStorage` (`rh_invite_token`). Accept from `/invitations` after login.

## Wrong language

Toggle EN/FR in the nav, or clear `rh_lang` in localStorage.

## Tests fail in Docker

```bash
make start
make test-client-ui
```

Ensure the `client-ui` container is running before `exec`.

## Related

- [DEVELOPMENT.md](./DEVELOPMENT.md) · [AUTHENTICATION.md](./AUTHENTICATION.md)
