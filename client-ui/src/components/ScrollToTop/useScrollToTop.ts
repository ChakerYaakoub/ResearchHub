import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const SHOW_AFTER_PX = 120

/** Visibility + scroll-to-top handler for the FAB. */
export function useScrollToTop() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return { t, visible, scrollToTop }
}
