import { useTranslation } from 'react-i18next'
import type { PageMetaProps } from './PageMeta'

type UsePageMetaArgs = {
  /** i18n key under `seo.*`, e.g. `home` → seo.home.title */
  pageKey: string
  robots?: string
  titleOverride?: string
}

/** Builds PageMeta props from i18n. */
export function usePageMeta({
  pageKey,
  robots = 'index,follow',
  titleOverride,
}: UsePageMetaArgs): PageMetaProps {
  const { t } = useTranslation()
  const title =
    titleOverride ?? t(`seo.${pageKey}.title`, { defaultValue: 'ResearchHub' })
  const rawDescription = titleOverride
    ? ''
    : t(`seo.${pageKey}.description`, { defaultValue: '' })

  return {
    title,
    description: rawDescription || undefined,
    robots,
  }
}
