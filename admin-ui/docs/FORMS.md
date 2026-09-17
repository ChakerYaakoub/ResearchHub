# Forms and Validation

**Formik** + **Yup**. Client-side validation is for **UX only**. The API re-validates every write.

## Login

Email + password (Yup required / email / min length). No honeypot on admin-ui login.

## Account

Profile PATCH and password change Formik forms; optional confirm dialog before sending password-reset email.

## Admins create

Popup Formik: email (required), optional username → `createAdmin`.

## Facilities

Installation / instrument create-edit popups with required name/code fields as implemented in page hooks.

## Submission UX

- Disable submit while `isSubmitting` / busy flags
- Field errors under inputs
- API failures via toast (`notify` + `formatApiError`)
- ConfirmDialog for destructive / review actions

## Related

- [COPY.md](./COPY.md) · [WORKFLOWS.md](./WORKFLOWS.md) · Backend: [`backend/docs/VALIDATION.md`](../../backend/docs/VALIDATION.md)
