import { useEffect } from 'react'

/** Sets document.title for admin pages (no react-helmet-async). */
export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title
  }, [title])

  return null
}
