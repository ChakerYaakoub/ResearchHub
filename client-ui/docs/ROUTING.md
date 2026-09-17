# Routing

Defined in [`src/App.tsx`](../src/App.tsx). Auth uses a **modal** — there are no `/login` or `/register` routes.

## Public routes (`PublicLayout`)

| Path | Page |
|------|------|
| `/` | Home |
| `/how-it-works` | How it works |
| `/documentation` | Documentation (marketing) |

## Protected routes (`RequireAuth` → `DashboardLayout`)

| Path | Page |
|------|------|
| `/dashboard` | Researcher dashboard |
| `/projects` | Project list |
| `/projects/new` | Create project |
| `/projects/:id` | Project details |
| `/invitations` | My invitations |
| `/account` | Account / profile |

## RequireAuth (UX only)

If the user is not authenticated (`!user || !access`):

1. Opens the login modal (`requestLoginModal`)
2. Redirects to `/` with `<Navigate replace />`

This is **not** a security boundary. The API rejects unauthorized requests.

## Deep links (`InviteDeepLink`)

Always mounted. Reads query params such as:

| Params | Behavior |
|--------|----------|
| `?auth=login&token=…` | Store invite token; open login |
| `?auth=register&token=…` | Store invite token; open register |
| `?auth=reset&uid=…&token=…` | Open reset-password modal |

After successful auth with a stored invite token, navigation may go to `/invitations`.

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md) · [AUTHORIZATION.md](./AUTHORIZATION.md)
