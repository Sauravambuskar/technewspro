# SalesInfoPro — backend & admin

The site is no longer hard-coded. Every headline, section, ticker item and piece of homepage
copy is stored in Postgres and edited from an admin panel at **`/admin`**.

The backend is Next.js route handlers plus Node's `crypto`; the only added dependency is the
Neon Postgres driver.

## Getting started

```bash
vercel env pull .env.local --yes   # gets DATABASE_URL from the Neon integration
npm run dev
```

Then open <http://localhost:3000/admin>. On first run the database seeds itself from the
original site content and creates one admin account:

| Email | Password |
| --- | --- |
| `admin@salesinfopro.com` | `changeme123` |

Change it under **Team** immediately — the panel shows a warning banner until you do. To seed
different credentials instead, copy `.env.example` to `.env.local` and set `ADMIN_EMAIL` /
`ADMIN_PASSWORD` *before* the first run.

## What you can manage

| Screen | What it controls |
| --- | --- |
| **Dashboard** | Read counts, draft queue, unread mail, stories per section |
| **Articles** | Full write/edit/publish/delete, search and filters, draft vs published |
| **Resources** | Whitepapers, ebooks, case studies and press releases; gating, file URL, page count, highlights |
| **Sections** | Add/rename/reorder categories, toggle them in the nav and on the homepage |
| **News ticker** | The scrolling headline bar — add, reorder, disable, delete |
| **Leads** | Captured from gated downloads and partnership enquiries, CSV export |
| **Subscribers** | Newsletter sign-ups, unsubscribe/resubscribe, CSV export |
| **Inbox** | Messages sent from the new `/contact` page |
| **Site settings** | Hero, manifesto, resource centre, Why-us points, About copy, industries, contact details, footer, metadata |
| **Team** | Add editors/admins, change passwords, remove accounts |

Drafts are invisible to the public site and to the search API until published.


## Site structure

| URL | Page |
| --- | --- |
| `/` | Hero → categories → latest insights → resource centre → trending → why us → lead capture |
| `/about` | Overview, mission, vision, editorial focus, industries, why choose us |
| `/insights` | All insights, grouped by category |
| `/insights/[category]` | One category, with related research |
| `/articles/[slug]` | Article detail |
| `/resources` | Resource centre with search, format/category filters and sorting |
| `/resources/[type]` | Whitepapers · Ebooks · Case Studies · Press Releases |
| `/resources/[type]/[slug]` | Detail page; gated ones show the lead form before the download |
| `/contact` | Contact form plus email, phone and office address |

`/articles` redirects to `/insights`. SEO: per-page canonicals, Organization / NewsArticle / Report /
AboutPage / ContactPage JSON-LD, a generated `sitemap.xml` covering every published URL, and
`robots.txt` disallowing `/admin` and `/api/`.

## Storage

Collections live as JSONB rows in a single Postgres table on **Neon**, provisioned
through the Vercel Marketplace so `DATABASE_URL` is injected automatically:

```sql
CREATE TABLE collections (
  name       text PRIMARY KEY,   -- articles, resources, sections, ticker, settings,
  data       jsonb NOT NULL,     -- leads, subscribers, messages, users, secret
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

The table is created on first use, and each collection seeds itself from `lib/seed/`
the first time it is read. Serverless instances share no memory, so `update()` holds
a `SELECT … FOR UPDATE` row lock for the whole read-modify-write.

`lib/store.ts` is the only file that talks to the database — every repository and
route handler goes through `read` / `update` / `write`, so swapping providers means
changing that one file.

For local development:

```bash
vercel env pull .env.local --yes
npm run dev
```

## API

Public — no auth:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/articles` | Published articles; `?section=`, `?q=`, `?limit=` |
| `GET` | `/api/articles/:id` | One published article |
| `GET` | `/api/search?q=` | Header search across articles and resources |
| `GET` | `/api/resources` | Published resources; `?type=`, `?category=`, `?q=`, `?limit=` |
| `GET` | `/api/resources/:id` | One published resource |
| `POST` | `/api/leads` | Gated download / partnership capture (rate limited) |
| `GET` | `/api/sections` | Section list |
| `GET` | `/api/ticker?enabled=true` | Ticker headlines |
| `GET` | `/api/settings` | Site settings |
| `POST` | `/api/newsletter` | Newsletter sign-up (rate limited) |
| `POST` | `/api/contact` | Contact message (rate limited) |
| `POST` | `/api/views` | Record a read |

Admin — requires the session cookie:

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` · `/api/auth/logout` | Session in/out |
| `GET` | `/api/auth/session` | Current user |
| `POST` `PATCH` `DELETE` | `/api/articles`, `/api/articles/:id` | Article CRUD |
| `GET` | `/api/articles?status=all` | Includes drafts |
| `POST` `PUT` `PATCH` `DELETE` | `/api/sections`, `/api/sections/:id` | Sections (`PUT` bulk-reorders) |
| `POST` `PUT` `PATCH` `DELETE` | `/api/ticker`, `/api/ticker/:id` | Ticker (`PUT` bulk-reorders) |
| `POST` `PATCH` `DELETE` | `/api/resources`, `/api/resources/:id` | Resource CRUD |
| `GET` `DELETE` | `/api/leads`, `/api/leads/:id` | Leads; `?format=csv` to export |
| `GET` `PATCH` `DELETE` | `/api/subscribers`, `/api/subscribers/:id` | Audience; `?format=csv` to export |
| `GET` `PATCH` `DELETE` | `/api/messages`, `/api/messages/:id` | Inbox |
| `PUT` | `/api/settings` | Save settings |
| `GET` `POST` `PATCH` `DELETE` | `/api/users`, `/api/users/:id` | Team (create/delete is admin-only) |
| `GET` | `/api/stats` | Dashboard counters |

Every response is `{ ok: true, data }` or `{ ok: false, error }`.

## Security notes

- Passwords are hashed with scrypt and a per-user salt; login compares in constant time and
  runs a dummy hash for unknown accounts so timing doesn't leak which emails exist.
- Sessions are HMAC-SHA256-signed cookies — `httpOnly`, `sameSite=lax`, `secure` in
  production, 12-hour expiry. A tampered cookie fails verification.
- `/admin` is guarded server-side in `app/admin/(panel)/layout.tsx`; every mutating API route
  independently calls `requireUser()`, so the guard can't be bypassed by hitting the API.
- The public sign-up and contact endpoints are rate limited per IP (in-memory).
- Admin pages are marked `noindex`.

## Code map

```
lib/store.ts          Neon Postgres collection store (the only file touching the DB)
lib/types.ts          shared types and helpers (client-safe)
lib/auth.ts           passwords, sessions, accounts
lib/api.ts            route-handler helpers (ok/fail, requireUser, error wrapping)
lib/ratelimit.ts      per-IP limiter for public writes
lib/articles.ts       lib/resources.ts  lib/sections.ts  lib/ticker.ts
lib/settings.ts       lib/subscribers.ts  lib/messages.ts  lib/leads.ts
lib/seo.ts            absolute URLs for canonicals, sitemap and JSON-LD
lib/site.ts           header/footer data for every public page
lib/seed/             first-run content

app/api/...           REST endpoints
app/admin/            login, panel shell, and one screen per collection
```

Public pages are `force-dynamic` so an edit in the admin panel is live on the next request —
no rebuild, no revalidation step.
