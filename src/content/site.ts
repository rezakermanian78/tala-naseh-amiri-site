// Non-translatable site data. Empty strings (other than email) are rendered as "TODO" placeholders.
export const site = {
  url: 'https://tala-naseh-amiri-site.vercel.app',
  cvPath: '/cv.pdf', // TODO: place the CV PDF at public/cv.pdf
  email: 'talanasehamiri@gmail.com',
  formspreeId: import.meta.env.VITE_FORMSPREE_ID ?? '',
  // TODO: add real post images (e.g. `{ src: '/work/1.jpg', alt: '...' }` in public/work/); the
  // "Featured work" grid in Content Creation stays hidden while this list is empty.
  featuredWork: [] as readonly { src: string; alt: string }[],
  socials: {
    linkedin: 'https://www.linkedin.com/in/tala-naseh-amiri-513a54318/',
    github: '', // TODO: full GitHub profile URL
    instagram: '', // TODO: full Instagram profile URL — the "Follow on Instagram" button and footer link stay hidden until this is set
  },
} as const

export type SocialKey = keyof typeof site.socials
