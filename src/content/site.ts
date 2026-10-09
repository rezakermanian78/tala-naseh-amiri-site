// Non-translatable site data. Empty strings are rendered as "TODO" placeholders.
export const site = {
  url: 'https://example.com', // TODO: replace with the real domain (also in index.html, sitemap.xml, robots.txt)
  cvPath: '/cv.pdf', // TODO: place the CV PDF at public/cv.pdf
  email: '', // TODO: e.g. name@example.com
  formspreeId: import.meta.env.VITE_FORMSPREE_ID ?? '',
  socials: {
    linkedin: '', // TODO: full LinkedIn profile URL
    github: '', // TODO: full GitHub profile URL
    instagram: '', // TODO: full Instagram profile URL
  },
} as const

export type SocialKey = keyof typeof site.socials
