# Forms and Validation

**Formik** + **Yup**. Client-side validation is for **UX only**. The API re-validates every write; trust server error messages for security-sensitive rules.

## Shared auth schemas

[`src/components/auth/authSchemas.ts`](../src/components/auth/authSchemas.ts) — login/register Yup schemas (email, password, optional names).

## Honeypot

Hidden Formik field `company` must stay empty. Bots that fill it are rejected by the backend (silent ignore). See `HoneypotField`.

## Field component

`TextInput` wraps Formik `useField` for consistent Bootstrap form controls and error display.

## Page / section schemas

Colocated in hooks (Account, ProjectsNew, Proposal/Experiments/Publications sections, invite form). Patterns:

- Required titles / emails
- Password change: current + new password
- Experiment: instrument + scheduled date; kind PLANNED/EXECUTED
- Publication: title, authors, kind EXISTING/RESULTING

## Submission UX

- Disable submit while Formik `isSubmitting`
- Show field errors under inputs
- Show API failures via toast (`notify` + `formatApiError`)
- On success: toast and/or navigate / refetch

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md) · Backend: [`backend/docs/VALIDATION.md`](../../backend/docs/VALIDATION.md)
