import type { TFunction } from 'i18next'
import * as Yup from 'yup'

/**
 * Client-side Yup schemas for auth forms (UX only).
 * Backend still validates credentials, password policy, and honeypot.
 */
export function loginSchema(t: TFunction) {
  return Yup.object({
    email: Yup.string()
      .trim()
      .required(t('validation.emailRequired'))
      .email(t('validation.emailInvalid')),
    password: Yup.string()
      .required(t('validation.passwordRequired'))
      .min(8, t('validation.passwordMin')),
  })
}

export function registerSchema(t: TFunction) {
  return loginSchema(t)
}

export type AuthFormValues = {
  email: string
  password: string
  /** Honeypot — must stay empty for humans. */
  company: string
}
