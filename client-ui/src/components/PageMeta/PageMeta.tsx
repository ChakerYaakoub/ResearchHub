import { useEffect } from 'react'

export type PageMetaProps = {
  title: string
  description?: string
  robots?: string
}

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string,
): void {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Lightweight document head updates (no react-helmet-async). */
export function PageMeta({
  title,
  description,
  robots = 'index,follow',
}: PageMetaProps) {
  useEffect(() => {
    document.title = title
    upsertMeta('name', 'robots', robots)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:type', 'website')
    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
    }
  }, [title, description, robots])

  return null
}
