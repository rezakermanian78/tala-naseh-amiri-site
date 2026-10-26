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

Once the backend is set up (below), **all editable content is managed at `/admin`** — no code,
no redeploy. The files in `src/content/` remain as:

- the **interface labels** (navigation, section titles, form labels) in `en.ts` / `fa.ts`, and
- the **fallback content**, shown when Supabase is not configured or unreachable. The same
  files generate `supabase/seed.sql` (`npm run db:seed:gen`), so the database starts out
  identical to them.

Still static (edit in `en.ts` / `fa.ts`): the About "facts" card and the three stat counters.

## Backend & Admin

Supabase (free tier) provides Postgres, Auth and Storage. The browser talks to it directly;
**Row Level Security** decides what each visitor may do:

| Who | Can |
| --- | --- |
| Anyone | read visible content, send a contact message |
| `talanasehamiri@gmail.com` (signed in) | edit everything, read/delete messages, upload files |

The admin email lives in `public.is_admin()` in `supabase/migrations/0001_init.sql`.

### 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) → **New project** (any region close to your
   visitors, e.g. Frankfurt). Save the database password somewhere safe.
2. **SQL Editor → New query**: paste all of `supabase/migrations/0001_init.sql` → **Run**.
3. New query again: paste `supabase/seed.sql` → **Run**. This imports the current site content.
   It is safe to run twice; it never overwrites edits.

### 2. Configure sign-in (passwordless)

In **Authentication**:

1. **Sign In / Providers → Email**: keep Email enabled, and **turn off "Allow new users to sign
   up"**. Nobody can create an account from the site.
2. **URL Configuration**:
   - Site URL: `https://talanasehamiri.ir`
   - Redirect URLs: add `https://talanasehamiri.ir/admin` and `http://localhost:5173/admin`
     (add your `*.vercel.app/admin` URL too if you use preview deployments).
3. **Emails → Magic Link** template: so Tala can also type a code on her phone, make the body
   include the code as well as the link, e.g.
   `<p><a href="{{ .ConfirmationURL }}">Sign in</a></p><p>Or enter this code: {{ .Token }}</p>`
4. **Users → Add user → Send invitation** to `talanasehamiri@gmail.com`. This creates the one
   admin account (no password is ever set).

Then open `/admin`, enter the email, and click the link in the email (or type the code).
Supabase's built-in email sender is limited to a few emails per hour — plenty for one admin. For
more, add your own SMTP under **Authentication → Emails → SMTP Settings**.

### 3. Environment variables

From **Project Settings → API** copy the Project URL and the `anon` / publishable key:

```bash
cp .env.example .env   # then fill in the two values
```

On Vercel: **Project → Settings → Environment Variables** → add `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` (Production + Preview) → **Redeploy** once. After that, content
changes never need a redeploy.

These two values are public by design. **Never** put the `service_role` / secret key in the
frontend or in any `VITE_` variable.

### How it behaves

- The public site fetches all content once per visit (and shows the last good copy instantly on
  repeat visits). Changes saved in the admin appear on the next page load.
- If the env vars are missing, Supabase is down, or the request takes longer than 6 s, the site
  renders the built-in content from `src/content/` instead.
- The contact form writes to the `messages` table (validated, honeypot, max 3 messages per
  visitor per 10 minutes, enforced both in the browser and in the database).
- Images uploaded in the admin are resized and converted to WebP in the browser before upload,
  then stored in the public `media` bucket.
- `/admin` is a separate lazy-loaded bundle, marked `noindex` (meta tag, `X-Robots-Tag` header,
  `robots.txt`) and not in the sitemap. The public site loads only a small query client; the full
  `supabase-js` library is part of the admin bundle.

### Optional: email notification for new messages

`supabase/functions/notify-message/index.ts` sends an email (via [Resend](https://resend.com))
for each new message. Setup steps are at the top of that file: deploy the function, set its
secrets, then add a **Database Webhook** on `messages` → INSERT. The admin inbox works without it.

### Backups

- **Content**: Supabase **Table Editor → (table) → Export → CSV**, or from a terminal:
  `pg_dump "<connection string from Project Settings → Database>" --data-only --schema=public > backup.sql`
- **Files**: **Storage → media** → download, or keep the originals.
- Free-tier projects pause after a week without activity; opening the dashboard (or any visit to
  the site) wakes them. While paused, the site shows the built-in fallback content.

### Changing the admin email

Edit the address in `public.is_admin()` (run the `create or replace function` statement again in
the SQL Editor), optionally set `VITE_ADMIN_EMAIL`, and invite the new address under
**Authentication → Users**.

## SEO / domain

Replace `https://tala-naseh-amiri-site.vercel.app` in `index.html` (canonical, Open Graph, JSON-LD; the JSON-LD Person also carries the contact email), `public/sitemap.xml`, `public/robots.txt` and `src/content/site.ts`. `og:image` points at `/avatar.jpg`; swap in a dedicated 1200×630 `public/og-image.png` if you prefer.

## Deploy to Vercel

1. Push this folder to a Git repository.
2. On vercel.com choose **Add New → Project** and import the repo (framework preset: Vite; build `npm run build`, output `dist`).
3. Add the Supabase environment variables (see above), then deploy.
4. Add your custom domain under Project → Settings → Domains.

`vercel.json` already contains the SPA rewrite and asset caching headers.

## Palette & accessibility

Colour tokens live in `src/index.css` (`:root` and `.dark`). Verified contrast: white on `#E11D74` 4.5:1; link/eyebrow text uses `#BE185D` (5.5–6.0:1 on white/blush); dark-mode `#F472B6` on `#1E0F1A` 7.0:1.
