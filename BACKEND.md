# Tech News Pro — backend & admin

The site is no longer hard-coded. Every headline, section, ticker item and piece of homepage
copy is stored in MySQL (hosted on Hostinger) and edited from an admin panel at **`/admin`**.

The backend is Next.js route handlers plus Node's `crypto`; the only added dependency is the
`mysql2` driver.

## Getting started

```bash
cp .env.example .env.local   # then fill in DATABASE_URL (see Storage below)
npm run dev
```

Then open <http://localhost:3000/admin>. On first run the database seeds itself from the
original site content and creates one admin account:

| Email | Password |
| --- | --- |
| `admin@technewspro.com` | `changeme123` |

Change it under **Team** immediately — the panel shows a warning banner until you do. To seed
different credentials instead, copy `.env.example` to `.env.local` and set `ADMIN_EMAIL` /
`ADMIN_PASSWORD` *before* the first run.

## What you can manage

| Screen | What it controls |
| --- | --- |
| **Dashboard** | Reads, downloads, leads, draft queue, unread mail, content per category |
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
| `/category` | All categories, grouped by desk |
| `/category/[section]` | One category, with related research |
| `/category/[section]/[sub]` | One sub-category; noindexed and left out of nav/sitemap until it has a published article |
| `/articles/[slug]` | Article detail |
| `/resources` | Resource centre with search, format/category filters and sorting |
| `/resources/[type]` | Whitepapers · Ebooks · Case Studies · Press Releases |
| `/resources/[type]/[slug]` | Detail page; gated ones show the lead form before the download |
| `/contact` | Contact form plus email, phone and office address |

`/articles` and the old `/insights/...` paths redirect to `/category/...` (see `next.config.js`).
SEO: per-page canonicals, Organization / NewsArticle / Report / AboutPage / ContactPage /
BreadcrumbList / CollectionPage JSON-LD, a generated `sitemap.xml` covering every published URL,
and `robots.txt` disallowing `/admin` and `/api/`. A branded 404 lives at `app/not-found.tsx` and
is deliberately static — the global not-found is prerendered before `DATABASE_URL` exists, so it
must not read from the database.

## Storage

Collections live as JSON rows in a single MySQL table, hosted on **Hostinger**:

```sql
CREATE TABLE collections (
  name       VARCHAR(191) PRIMARY KEY,   -- articles, resources, sections, ticker, settings,
  data       JSON NOT NULL,              -- leads, subscribers, messages, users, secret
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;
```

The table is created on first use, and each collection seeds itself from `lib/seed/`
the first time it is read. Serverless instances share no memory, so `update()` holds
a `SELECT … FOR UPDATE` row lock (inside a transaction) for the whole read-modify-write.

`lib/store.ts` is the only file that talks to the database — every repository and
route handler goes through `read` / `update` / `write`, so swapping providers means
changing that one file.

## Email

Notifications are sent through [Resend](https://resend.com)'s HTTP API. Nothing is
sent until two environment variables exist, and the site works normally without
them — `lib/email.ts` no-ops and the Notifications card under **Site settings**
says so.

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Turns sending on. Without it nothing is emailed. |
| `EMAIL_FROM` | The sender, e.g. `desk@yourdomain.com`. Defaults to Resend's shared `onboarding@resend.dev`, which only delivers to the address that owns the Resend account. |

Sending as your own domain needs that domain verified in Resend (SPF/DKIM records
in its DNS). Until then `onboarding@resend.dev` is useful for checking the wiring
but cannot reach readers.

Who gets alerted, and about what, is set in the panel rather than in code:
**Site settings → Notifications**, which also has a *Send a test email* button.
Alerts never block a submission — `notify()` is fire-and-forget, so a mail
failure is logged and the reader's form still succeeds.

`DATABASE_URL` must be a MySQL connection string, e.g.
`mysql://user:password@host:3306/database` (percent-encode special characters in the
password). On Hostinger, allow remote connections for the app's outbound IP(s) under
**hPanel → Databases → Remote MySQL** — a shared-hosting MySQL server otherwise only
accepts connections from the hosting server itself.

For local development, copy `.env.example` to `.env.local` and fill in `DATABASE_URL`,
then:

```bash
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
| `GET` | `/api/stats` | Counters for articles, resources, leads, subscribers, inbox and per-category totals |

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
lib/store.ts          MySQL collection store (the only file touching the DB)
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
