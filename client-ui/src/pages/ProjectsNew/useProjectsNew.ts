import type { FormikHelpers } from 'formik'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { ApiError } from '../../api/client'
import { createProject } from '../../api/projects'
import { useAuth } from '../../auth'

export type ProjectFormValues = {
  title: string
  description: string
  scientific_objective: string
}

/** Create-project form state and submit. */
export function useProjectsNew() {
  const { t } = useTranslation()
  const { access } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const initialValues: ProjectFormValues = {
    title: '',
    description: '',
    scientific_objective: '',
  }

  const validationSchema = Yup.object({
    title: Yup.string().trim().required(t('projects.titleRequired')),
    description: Yup.string(),
    scientific_objective: Yup.string(),
  })

  async function onSubmit(
    values: ProjectFormValues,
    helpers: FormikHelpers<ProjectFormValues>,
  ) {
    if (!access) return
    setFormError(null)
    try {
      const project = await createProject(access, {
        title: values.title.trim(),
        description: values.description.trim(),
        scientific_objective: values.scientific_objective.trim(),
      })
      navigate(`/projects/${project.id}`, { replace: true })
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : t('errors.createFailed'),
      )
      helpers.setSubmitting(false)
    }
  }

  return { t, initialValues, validationSchema, onSubmit, formError }
}
