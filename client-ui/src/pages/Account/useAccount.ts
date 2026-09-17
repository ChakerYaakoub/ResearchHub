import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { updateMeRequest } from '../../auth/authApi'
import { notifyError, notifySuccess } from '../../notify'

export type ProfileFormValues = {
  email: string
  username: string
  first_name: string
  last_name: string
}

export type PasswordFormValues = {
  current_password: string
  new_password: string
  confirm_password: string
}

/** Account profile + password forms for the researcher dashboard. */
export function useAccount() {
  const { t } = useTranslation()
  const { access, user, setUser } = useAuth()

  const profileSchema = Yup.object({
    username: Yup.string().trim().required(t('account.usernameRequired')),
    first_name: Yup.string().trim(),
    last_name: Yup.string().trim(),
  })

  const passwordSchema = Yup.object({
    current_password: Yup.string().required(t('validation.passwordRequired')),
    new_password: Yup.string()
      .min(8, t('validation.passwordMin'))
      .required(t('validation.passwordRequired')),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('new_password')], t('account.passwordMismatch'))
      .required(t('validation.passwordRequired')),
  })

  const profileForm = useFormik<ProfileFormValues>({
    enableReinitialize: true,
    initialValues: {
      email: user?.email ?? '',
      username: user?.username ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      if (!access) return
      try {
        const updated = await updateMeRequest(access, {
          username: values.username.trim(),
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
        })
        setUser(updated)
        notifySuccess(t('toast.profileSaved'))
      } catch (err) {
        notifyError(
          err instanceof ApiError ? err.message : t('errors.saveFailed'),
        )
      }
    },
  })

  const passwordForm = useFormik<PasswordFormValues>({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, helpers) => {
      if (!access) return
      try {
        const updated = await updateMeRequest(access, {
          current_password: values.current_password,
          new_password: values.new_password,
        })
        setUser(updated)
        helpers.resetForm()
        notifySuccess(t('toast.passwordChanged'))
      } catch (err) {
        notifyError(
          err instanceof ApiError ? err.message : t('errors.saveFailed'),
        )
      }
    },
  })

  return { t, profileForm, passwordForm }
}
