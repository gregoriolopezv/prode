# Prode 2026 - World Cup Prediction Game

A private prediction game ("prode") for the 2026 FIFA World Cup. Friends compete by predicting match results in invite-only leagues.

---

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Convex** (backend, database, real-time queries)
- **Clerk** (authentication)
- **TailwindCSS v4** + **shadcn/ui**
- **Zod** (runtime validation)

---

## Quick links

- [**🚀 Local setup** → `docs/SETUP.md`](docs/SETUP.md)
- [**🌐 Production deploy** → `docs/DEPLOY.md`](docs/DEPLOY.md)
- [**🏗️ Architecture** → `docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## Features

- Sign up / Sign in via Clerk
- Create and join private leagues via invite code
- View all 48 group-stage World Cup 2026 matches
- Submit predictions (home/away scores) before kickoff
- Admin match lifecycle: **Start** → **Update Score** → **Add Events** → **Finish**
- Automatic scoring when match is finished
- League-based rankings with points leaderboard
- Privacy: others' predictions are hidden until match begins
- Live match events timeline (goals, cards, substitutions)
- Full bilingual support: English & Español
- Full mobile responsiveness

## Scoring System

| Result | Points |
|--------|--------|
| Exact score | +3 |
| Correct winner/draw | +1 |
| Wrong result | 0 |

---

## Project Structure

```
prode/
├── convex/                     # Backend (Convex)
│   ├── schema.ts               # Database schema (matches, predictions, matchEvents...)
│   ├── auth.config.ts          # Clerk JWT configuration
│   ├── lib/
│   │   ├── errors.ts           # Custom error classes (ForbiddenError, NotFoundError...)
│   │   ├── scoring.ts          # Pure scoring logic (calculatePoints)
│   │   ├── time.ts             # UTC time helpers (isMatchOpen)
│   │   └── validation.ts       # Zod/Convex validators
│   ├── users.ts                # User sync, me, setAdmin, setLocale
│   ├── leagues.ts              # League CRUD + join by invite code
│   ├── matches.ts              # Match queries + lifecycle mutations (start/updateScore/addEvent/finish)
│   ├── predictions.ts          # Prediction CRUD + privacy-enforced listForMatch
│   ├── scoring.ts              # Recalculate backfill mutation
│   └── seed.ts                 # WC2026 fixture seeder (48 matches)
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page (bilingual)
│   │   ├── layout.tsx            # Root layout: ClerkProvider + fonts
│   │   ├── globals.css           # Tailwind v4 theme (bare @theme block)
│   │   ├── middleware.ts         # Route protection for /dashboard/* and /admin
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...rest]]/page.tsx
│   │   │   └── sign-up/[[...rest]]/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        # Dashboard shell with nav + language switcher
│   │   │   ├── leagues/page.tsx      # Join/create leagues (Drawer UI)
│   │   │   ├── leagues/[id]/page.tsx   # League detail + invite code
│   │   │   ├── leagues/[id]/ranking/page.tsx
│   │   │   ├── matches/page.tsx        # Group-filtered match list
│   │   │   ├── matches/[id]/page.tsx   # Match detail (score, events, predictions)
│   │   │   └── rankings/page.tsx       # Global rankings view
│   │   └── admin/page.tsx            # Three-section admin (Scheduled/Live/Finished)
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── match-card.tsx          # Reusable card with LIVE badge
│   │   ├── language-switcher.tsx   # Globe dropdown EN/ES
│   │   └── ConvexClientProvider.tsx  # Clerk+Convex+LanguageProvider wrapper
│   ├── lib/
│   │   ├── utils.ts                # cn() helper
│   │   └── i18n/
│   │       ├── types.ts            # Dictionary interface
│   │       ├── en.ts               # English dictionary
│   │       ├── es.ts               # Spanish dictionary
│   │       └── language-provider.tsx # Locale context + t() + Convex sync
│   └── hooks/
│       └── use-auth-sync.ts        # Clerk → Convex user sync
├── docs/
│   ├── SETUP.md                # Step-by-step local dev guide
│   ├── DEPLOY.md               # Vercel + Convex production deployment
│   └── ARCHITECTURE.md         # Data model, privacy, scoring, lifecycle
├── .env.example                # Environment variable template
├── next.config.ts
├── tsconfig.json
└── components.json               # shadcn/ui config
```

---

## Getting Started (TL;DR)

```bash
# 1. Install
git clone <repo-url>
cd prode
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in Clerk keys & Frontend API URL

# 3. Start Convex (leave running)
npx convex dev

# 4. Seed matches
npx convex run seed:run '{"secret":"prode-seed-2026"}'

# 5. Start Next.js
npx next dev
```

For full details (Clerk JWT template, admin setup, troubleshooting) see [**docs/SETUP.md**](docs/SETUP.md).

---

## Admin Setup

1. Sign up as a user
2. Find your `clerkId` in the Clerk Dashboard
3. Run:

```bash
npx convex run users:setAdmin '{"clerkId":"your_clerk_id"}'
```

4. Visit `/admin`

Admin actions:
- **Start Match**: transitions from `scheduled` → `live`
- **Update Score**: changes live score in real time
- **Add Event**: logs match events (goals, cards, subs)
- **Finish Match**: sets final score, triggers automated scoring

---

## Architecture Decisions

| Decision | Why |
|----------|-----|
| **Per-league predictions** | Users can predict the same match differently in each league. Predictions are scoped by `(userId, matchId, leagueId)`. |
| **UTC timestamps** | All match times stored as epoch ms. Server-side lock checks use `Date.now()`. Client converts to local time for display. |
| **Denormalized leaderboard** | `leagueMembers.totalPoints` is updated incrementally during scoring. Fast leaderboard query, no aggregation needed. |
| **Idempotent scoring** | Calculates a `diff` between old and new points on every finish. Re-running is safe and correct. |
| **Privacy at backend** | `predictions.listForMatch` filters based on `match.status !== "scheduled"`. Never trust the UI alone. |
| **No i18n middleware** | Custom lightweight dictionary with React Context. Avoids `next-intl` middleware complexity and preserved route simplicity. |
| **Tailwind v4 bare @theme** | `@theme { ... }` (no `inline` keyword) correctly resolves CSS variables in v4. |

For the full architecture breakdown see [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md).

---

## License

MIT
