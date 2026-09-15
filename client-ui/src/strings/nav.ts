/** Navigation and footer copy (client-ui). */

export const nav = {
  brand: 'ResearchHub',
  items: [
    { to: '/facilities', label: 'Facilities' },
    { to: '/instruments', label: 'Instruments' },
    { to: '/how-it-works', label: 'How it works' },
    { to: '/documentation', label: 'Documentation' },
  ],
  footerTagline: 'ResearchHub — scientific project & experiment management',
  copyrightPrefix: '©',
} as const
