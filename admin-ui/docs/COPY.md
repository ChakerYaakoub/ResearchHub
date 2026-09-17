# UI copy (`copy.ts`)

admin-ui has **no i18n** yet. User-visible English strings live in [`src/copy.ts`](../src/copy.ts) as a flat object (`copy.loginTitle`, `copy.adminOnly`, …).

Pages and hooks import `copy` for shared labels. New strings belong in `copy.ts`, grouped by feature (auth, users, proposals, facilities, …).

## Related

- [FORMS.md](./FORMS.md) · [COMPONENTS.md](./COMPONENTS.md)
