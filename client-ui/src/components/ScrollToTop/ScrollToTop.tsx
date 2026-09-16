import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ScrollToTop.css'

const SHOW_AFTER_PX = 120

/** Fixed bottom-right control: appears after scroll, jumps to top. */
export function ScrollToTop() {
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

  if (!visible) return null

  return (
    <button
      type="button"
      className="rh-scroll-top"
      aria-label={t('common.scrollToTop')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M12 6.5 5.5 13l1.4 1.4L12 9.3l5.1 5.1L18.5 13 12 6.5z"
        />
      </svg>
    </button>
  )
}
