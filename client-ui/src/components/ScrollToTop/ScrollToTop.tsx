import { useScrollToTop } from './useScrollToTop'
import './ScrollToTop.css'

/** Fixed bottom-right control: appears after scroll, jumps to top. */
export function ScrollToTop() {
  const vm = useScrollToTop()

  if (!vm.visible) return null

  return (
    <button
      type="button"
      className="rh-scroll-top"
      aria-label={vm.t('common.scrollToTop')}
      onClick={vm.scrollToTop}
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
