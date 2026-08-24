# TechNewsInfoPro — backend & admin

The site is no longer hard-coded. Every headline, section, ticker item and piece of homepage
copy is stored in a small JSON database and edited from an admin panel at **`/admin`**.

No new dependencies were added — the whole backend runs on Next.js route handlers, Node's
`fs` and `crypto`.

## Getting started

```bash
npm run dev
```

Then open <http://localhost:3000/admin>. On first run the database seeds itself from the
original site content and creates one admin account:

| Email | Password |
| --- | --- |
| `admin@technewsinfopro.com` | `changeme123` |

Change it under **Team** immediately — the panel shows a warning banner until you do. To seed
different credentials instead, copy `.env.example` to `.env.local` and set `ADMIN_EMAIL` /
`ADMIN_PASSWORD` *before* the first run.

## What you can manage

| Screen | What it controls |
| --- | --- |
| **Dashboard** | Read counts, draft queue, unread mail, stories per section |
| **Articles** | Full write/edit/publish/delete, search and filters, draft vs published |
| **Sections** | Add/rename/reorder sections, toggle them in the nav and on the homepage |
| **News ticker** | The scrolling headline bar — add, reorder, disable, delete |
| **Subscribers** | Newsletter sign-ups, unsubscribe/resubscribe, CSV export |
| **Inbox** | Messages sent from the new `/contact` page |
| **Site settings** | Hero, manifesto, newsletter and footer copy, social links, pinned feature story, metadata |
| **Team** | Add editors/admins, change passwords, remove accounts |

Drafts are invisible to the public site and to the search API until published.

## Storage

Collections live in `data/*.json`, created on first access and written atomically through a
single serialised queue so concurrent edits can't clobber each other.

```
data/articles.json      data/sections.json     data/ticker.json
data/settings.json      data/subscribers.json  data/messages.json
data/users.json         data/secret.json
```

`data/` is gitignored — it's runtime state, not source. Delete the folder to reset the site
back to the seeded content in `lib/seed/`.

This is a single-node store: it's ideal for one server or a VM, but on a platform with an
ephemeral or per-instance filesystem the repositories in `lib/` are the only files that need
to change to move to a real database. Every route handler and page already talks to them
rather than to the filesystem.

## API

Public — no auth:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/articles` | Published articles; `?section=`, `?q=`, `?limit=` |
| `GET` | `/api/articles/:id` | One published article |
| `GET` | `/api/search?q=` | Header search |
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
lib/store.ts          atomic JSON storage + write queue
lib/types.ts          shared types and helpers (client-safe)
lib/auth.ts           passwords, sessions, accounts
lib/api.ts            route-handler helpers (ok/fail, requireUser, error wrapping)
lib/ratelimit.ts      per-IP limiter for public writes
lib/articles.ts       lib/sections.ts  lib/ticker.ts
lib/settings.ts       lib/subscribers.ts  lib/messages.ts
lib/site.ts           header/footer data for every public page
lib/seed/             first-run content

app/api/...           REST endpoints
app/admin/            login, panel shell, and one screen per collection
```

Public pages are `force-dynamic` so an edit in the admin panel is live on the next request —
no rebuild, no revalidation step.
