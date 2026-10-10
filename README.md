# Tala Naseh Amiri — Personal Site

Vite + React + TypeScript, Tailwind CSS, Framer Motion, react-i18next (English default, Persian RTL).

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint
npm run format
```

## Editing content

- `src/content/en.ts` — all English copy. Every `TODO: ...` string is a placeholder to replace.
- `src/content/fa.ts` — Persian copy (must match the shape of `en.ts`; TypeScript will tell you if not).
- `src/content/site.ts` — email (`talanasehamiri@gmail.com`), LinkedIn/GitHub/Instagram URLs, CV path, domain. Empty values show a "TODO" in the UI.
- Projects: set `href` on each item in `projects.items` to show its link.
- Language levels: edit `level` (0–5) and `levelText` in `languages.items`.
- Avatar: `public/avatar.jpg` + `avatar.webp` (used in `src/components/Hero.tsx`).

## CV PDF

Put the file at `public/cv.pdf`. The "Download CV" button already points to `/cv.pdf` (`site.cvPath`).

## Contact form

- Without config: submitting opens the visitor's mail app (`mailto:` to `site.email`).
- With Formspree: create a form at formspree.io, then set `VITE_FORMSPREE_ID` (copy `.env.example` to `.env`; on Vercel add it under Project → Settings → Environment Variables).

## SEO / domain

Replace `https://tala-naseh-amiri-site.vercel.app` in `index.html` (canonical, Open Graph, JSON-LD; the JSON-LD Person also carries the contact email), `public/sitemap.xml`, `public/robots.txt` and `src/content/site.ts`. `og:image` points at `/avatar.jpg`; swap in a dedicated 1200×630 `public/og-image.png` if you prefer.

## Deploy to Vercel

1. Push this folder to a Git repository.
2. On vercel.com choose **Add New → Project** and import the repo (framework preset: Vite; build `npm run build`, output `dist`).
3. Add `VITE_FORMSPREE_ID` if using Formspree, then deploy.
4. Add your custom domain under Project → Settings → Domains.

`vercel.json` already contains the SPA rewrite and asset caching headers.

## Palette & accessibility

Colour tokens live in `src/index.css` (`:root` and `.dark`). Verified contrast: white on `#E11D74` 4.5:1; link/eyebrow text uses `#BE185D` (5.5–6.0:1 on white/blush); dark-mode `#F472B6` on `#1E0F1A` 7.0:1.
