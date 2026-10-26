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

Once the API is running (below), **all editable content is managed at `/admin`** — no code,
no redeploy. The files in `src/content/` remain as:

- the **interface labels** (navigation, section titles, form labels) in `en.ts` / `fa.ts`, and
- the **fallback content**, shown when the API is not configured or unreachable. The same files
  generate the database's starter content (`npm run db:seed:gen` →
  `server/src/db/seed-data.json`), so a fresh database matches the site exactly.

Still static (edit in `en.ts` / `fa.ts`): the About "facts" card and the three stat counters.

## Backend & Admin

```
/            Vite site (Vercel)  ──fetch, cookies──▶  /server  Fastify API (Railway)
                                                       ├─ PostgreSQL (Railway plugin)
                                                       └─ Volume /data → uploads
```

`server/` is a Node 22 + TypeScript app: Fastify, zod, Drizzle ORM (migrations in
`server/drizzle/`), PostgreSQL, pino logs.

| Route | Who | What |
| --- | --- | --- |
| `GET /api/content` | anyone | everything visible, one payload (ETag) |
| `POST /api/messages` | anyone | contact form (3 per IP per 10 min, honeypot) |
| `GET /uploads/:file` | anyone | uploaded images / CV |
| `POST /api/auth/login`, `/logout`, `/change-password`, `GET /api/auth/me` | — | session |
| `/api/admin/*` | admin | CRUD + reorder for every section, settings, messages, uploads |
| `GET /health` | — | Railway healthcheck |

Security: one admin account (Argon2id password hash), session = signed JWT in an httpOnly,
Secure, SameSite=Lax cookie (7 days, renewed while in use), Origin check against CSRF, login
limited to 5 attempts per 15 minutes, CORS limited to the site's own domains, helmet headers,
uploads checked by their real file type (JPEG/PNG/WebP/AVIF/PDF, max 8 MB) and stored under
random names. Errors always look like `{ "error": { "code", "message" } }`.

### Local development

Needs Docker (for Postgres + API) and Node 22+.

```bash
docker compose up --build    # Postgres on :5432, API on http://localhost:8787
npm run dev                  # site on http://localhost:5173 (uses the local API automatically)
```

Open http://localhost:5173/admin and sign in with `talanasehamiri@gmail.com` /
`local-dev-password` (dev-only defaults from `docker-compose.yml`).

Without Docker: run Postgres yourself, `cp server/.env.example server/.env`, fill it in, then
`cd server && npm install && npm run dev`.

Server scripts (in `server/`): `npm run dev`, `npm test` (needs
`TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/tala_test` — the compose
Postgres already has that database; the tests wipe it), `npm run lint`, `npm run typecheck`,
`npm run build`, `npm run db:generate` (after changing `src/db/schema.ts`), `npm run db:migrate`,
`npm run db:seed` (fills empty tables only; never overwrites edits).

### Environment variables

**Server** (`server/.env.example`):

| Variable | |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | 32+ random characters (`openssl rand -hex 32`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | create the admin account on the **first** start only |
| `CORS_ORIGINS` | allowed sites, comma-separated (default: the two production domains + `http://localhost:5173`) |
| `UPLOAD_DIR` | default `/data/uploads` in production |
| `PUBLIC_URL` | `https://api.talanasehamiri.ir` (used in upload links) |
| `PORT` | default 8787 (Railway sets it) |
| `TRUST_PROXY` | proxy hops in front of the app, default 1 (Railway) |
| `RESEND_API_KEY`, `NOTIFY_EMAIL` | optional: e-mail on each new message ([resend.com](https://resend.com)) |

Migrations run automatically on every start; a completely empty database also gets the starter
content.

**Site** (`.env.example`): `VITE_API_URL=https://api.talanasehamiri.ir`. Until it is set, the
production site shows the built-in content and the contact form opens the visitor's mail app —
so deploying never breaks the live site.

### Deploy the API on Railway

1. [railway.com](https://railway.com) → **New Project → Deploy from GitHub repo** → this repo.
2. In the new service → **Settings → Source → Root Directory**: `/server`. Railway then builds
   `server/Dockerfile` and uses `server/railway.json` (healthcheck `GET /health`).
3. **+ New → Database → PostgreSQL** in the same project.
4. On the API service → **+ Volume**, mount path `/data`.
5. API service → **Variables**:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (reference variable)
   - `JWT_SECRET` = output of `openssl rand -hex 32`
   - `ADMIN_EMAIL` = `talanasehamiri@gmail.com`
   - `ADMIN_PASSWORD` = a temporary password (12+ characters)
   - `PUBLIC_URL` = `https://api.talanasehamiri.ir`
   - `PORT` = `8787` (so the domain's target port below is fixed)
   - optional `RESEND_API_KEY`, `NOTIFY_EMAIL`
6. **Settings → Networking → Custom Domain** → `api.talanasehamiri.ir` (target port 8787).
   Railway shows a CNAME target; in Cloudflare add `CNAME api → <that target>` with the proxy
   **off** (DNS only, grey cloud). Wait until Railway shows the certificate as active.
7. Check https://api.talanasehamiri.ir/health returns `{"ok":true}`.

### Connect the site (Vercel)

**Project → Settings → Environment Variables** → `VITE_API_URL` =
`https://api.talanasehamiri.ir` (Production and Preview) → **Redeploy**. After that, content
changes never need a redeploy. (Preview deployments on `*.vercel.app` aren't in `CORS_ORIGINS`,
so they show the built-in content.)

### First login

1. Open https://talanasehamiri.ir/admin and sign in with `ADMIN_EMAIL` and the temporary
   `ADMIN_PASSWORD`.
2. Click the key icon (**Change password**) and choose a new one. This also signs out every other
   device.
3. Remove `ADMIN_PASSWORD` from Railway's variables — it is only read when no admin exists.

Forgot the password? In Railway's Postgres **Data** tab run `delete from admin_users;`, set
`ADMIN_PASSWORD` again and restart the API; the account is recreated on start.

### Backups

- **Database**: Railway Postgres → **Backups** (enable scheduled backups), or from your computer
  `pg_dump "<public DATABASE_URL from Railway>" > tala-$(date +%F).sql`
  (restore with `psql "<url>" < file.sql`).
- **Uploads**: they live on the volume (`/data/uploads`). Railway volumes support backups in the
  volume's settings; the originals on your phone/computer are a good second copy.

### Rotating `JWT_SECRET`

Set a new random value in Railway (`openssl rand -hex 32`) and redeploy. Every session becomes
invalid, so the admin simply signs in again; nothing else changes. Do it if you think the secret
leaked, or every year or so.

## SEO / domain

The production URL `https://talanasehamiri.ir` appears in `index.html` (canonical, Open Graph, JSON-LD; the JSON-LD Person also carries the contact email), `public/sitemap.xml`, `public/robots.txt` and `src/content/site.ts`. `og:image` points at `/avatar.jpg`; swap in a dedicated 1200×630 `public/og-image.png` if you prefer.

## Deploy to Vercel

1. Push this folder to a Git repository.
2. On vercel.com choose **Add New → Project** and import the repo (framework preset: Vite; build `npm run build`, output `dist`).
3. Add `VITE_API_URL` (see above), then deploy.
4. Add your custom domain under Project → Settings → Domains.

`vercel.json` already contains the SPA rewrite and asset caching headers.

## Palette & accessibility

Colour tokens live in `src/index.css` (`:root` and `.dark`). Verified contrast: white on `#E11D74` 4.5:1; link/eyebrow text uses `#BE185D` (5.5–6.0:1 on white/blush); dark-mode `#F472B6` on `#1E0F1A` 7.0:1.
