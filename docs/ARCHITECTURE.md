# Architecture

## Data model

```
┌──────────────┐         ┌──────────────────┐
│    users     │         │     leagues      │
├──────────────┤         ├──────────────────┤
│ clerkId (PK) │────┐    │ name             │
│ email        │    │    │ ownerId  <─┐     │
│ name         │    │    │ inviteCode   │     │
│ role         │    │    │ createdAt    │     │
│ locale       │    │    └──────────────┘     │
│ createdAt    │    │           │              │
└──────────────┘    │           │              │
       ▲            │           │              │
       │            │           ▼              │
       │            │    ┌──────────────────┐  │
       │            │    │  leagueMembers   │  │
       │            │    ├──────────────────┤  │
       │            └──>│ leagueId  <─┐     │  │
       │                 │ userId  <───┤     │  │
       │                 │ totalPoints  │     │  │
       │                 │ joinedAt     │     │  │
       │                 └──────────────┘     │  │
       │                                      │  │
       │            ┌──────────────┐           │  │
       │            │   matches    │           │  │
       │            ├──────────────┤           │  │
       └────┐       │ homeTeam     │           │  │
             │       │ awayTeam     │           │  │
             │       │ group        │           │  │
             │       │ kickoffTime  │           │  │
             │       │ status (s|l|f)│           │  │
             │       │ homeScore    │           │  │
             │       │ awayScore    │           │  │
             │       │ startedAt    │           │  │
             │       │ finishedAt   │           │  │
             │       └──────────────┘           │  │
             │                ▲                  │  │
             │                │                  │  │
             │       ┌──────────────┐            │  │
             │       │ matchEvents  │            │  │
             │       ├──────────────┤            │  │
             │       │ matchId  <───┘            │  │
             │       │ minute                      │  │
             │       │ type (goal|red|yellow|sub)  │  │
             │       │ description                 │  │
             │       │ team (home|away)              │  │
             │       └───────────────────────────┘  │
             │                                      │
             │       ┌──────────────┐               │
             └──────>│ predictions  │<──────────────┘
                     ├──────────────┤
                     │ userId       │
                     │ matchId      │
                     │ leagueId  <──┘
                     │ homeScore
                     │ awayScore
                     │ pointsEarned
                     │ createdAt
                     │ updatedAt
                     └──────────────┘
```

Key relationships:
- **users** ↔ **leagueMembers** ↔ **leagues** (many-to-many)
- **matches** → **matchEvents** (one-to-many, ordered by minute)
- **users** + **matches** + **leagues** → **predictions** (composite key: userId + matchId + leagueId)

## Privacy model

Predictions stay private until the match is no longer `scheduled`.

```
if match.status === "scheduled" → show only YOUR prediction
if match.status === "live"     → show ALL predictions
if match.status === "finished" → show ALL predictions + points earned
```

This is enforced server-side in `convex/predictions.ts` (`listForMatch`). The UI merely follows the same rule — never the source of truth.

## Scoring flow

Trigger: admin clicks **Finish Match** (`matches.finish`).

```
Admin inputs final score
        │
        ▼
matches.finish mutation
  1. Validates match is "live"
  2. Updates match status → "finished" + final score
  3. Fetches all predictions for this matchId
  4. For each prediction:
       ├─ calculatePoints(pred, result) → 0, 1, or 3
       ├─ diff = newPoints - previousPoints
       ├─ update prediction.pointsEarned
       └─ if diff != 0:
           find leagueMembers row (leagueId + userId)
           update leagueMembers.totalPoints += diff
  5. Returns count of updated predictions
```

**Idempotency**: running `finish` twice is safe because scoring always computes a `diff` relative to `pointsEarned`. Reverting and re-setting a match result is allowed (though not exposed in the UI).

## Match lifecycle

```
scheduled (default on seed)
    │
    ▼ Admin clicks "Start Match"
live
    │
    ├─ Admin updates score (any number of times)
    ├─ Admin adds timeline events (goals, cards, subs)
    │
    ▼ Admin clicks "Finish Match"
finished
    │
    └─ Scoring runs automatically
```

Only the `live` status enables score updates and events. Predictions lock at `kickoffTime` regardless of status — the backend enforces this so late admin starts don't open prediction windows.

## Per-league predictions

A user can predict the same match in different leagues with different scores. Every prediction is scoped to `(userId, matchId, leagueId)`.

This means:
- Leaderboards are per-league (via `leagueMembers.totalPoints`)
- A user can hedge or vary predictions across leagues
- Scoring runs per-match, updating all league-specific predictions independently

## i18n approach

We use a **lightweight dictionary system** (no `next-intl`, no middleware complexity).

- Dictionaries live in `src/lib/i18n/{en,es}.ts`
- `LanguageProvider` (React Context) stores `locale` in state and persists it to Convex (`users.locale`)
- `useLanguage()` hook exposes `t(key)` and `locale`
- UI components call `t("matches.title")` directly
- Dates are formatted with `Intl.DateTimeFormat` using `locale` at render time

Trade-off: no route-based locale (e.g., `/es/dashboard`). All routing stays simple (`/dashboard/matches`). The locale is user preference, not URL segment.

## Denormalized leaderboard

Instead of aggregating `SUM(predictions.pointsEarned)` on every render, we maintain `leagueMembers.totalPoints` incrementally during scoring. This avoids expensive aggregation queries in Convex and makes the leaderboard query (`O(1)` per member).

Downside: if a scoring bug corrupts a total, you would need a backfill script (there is a `scoring.recalculate` mutation for this).

## Tailwind v4 + shadcn/ui

- TailwindCSS v4 uses bare `@theme { ... }` syntax (no `inline` keyword)
- shadcn/ui components are installed via `npx shadcn@latest add <component>`
- The project uses the **radix-mira** style preset
- Semantic tokens (`bg-background`, `text-muted-foreground`) are used everywhere

## Why Convex?

- **Real-time queries**: when admin updates a match score, every client sees it instantly (no polling, no WebSocket wiring)
- **Serverless functions**: mutations and queries auto-deploy with `npx convex dev`
- **Type safety**: generated `api` object gives full autocomplete from schema to frontend
- **No API layer**: frontend calls `useQuery(api.leagues.list)` directly — no REST or GraphQL needed
