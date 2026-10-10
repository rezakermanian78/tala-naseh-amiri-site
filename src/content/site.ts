// Non-translatable site data. Empty strings (other than email) are rendered as "TODO" placeholders.
export const site = {
  url: 'https://tala-naseh-amiri-site.vercel.app',
  cvPath: '/cv.pdf', // TODO: place the CV PDF at public/cv.pdf
  email: 'talanasehamiri@gmail.com',
  formspreeId: import.meta.env.VITE_FORMSPREE_ID ?? '',
  socials: {
    linkedin: 'https://www.linkedin.com/in/tala-naseh-amiri-513a54318/',
    github: '', // TODO: full GitHub profile URL
    instagram: '', // TODO: full Instagram profile URL
  },
} as const

export type SocialKey = keyof typeof site.socials
