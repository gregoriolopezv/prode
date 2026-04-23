# Local Development Setup

## Prerequisites

- **Node.js 20+** (check with `node -v`)
- **npm 10+** (or pnpm/yarn)
- A **Clerk** account (free tier is enough)
- (Optional) **ngrok** or similar if you need a public URL for Clerk webhooks

## 1. Clone and install

```bash
git clone <repo-url>
cd prode
npm install
```

## 2. Clerk setup

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com) and create an application.
2. Copy the **Publishable key** and **Secret key**.
3. Go to **JWT Templates** → create a new template named `convex`.
   - Set the **Issuer** field to your Clerk Frontend API domain (e.g., `https://your-app.clerk.accounts.dev`).
   - Do not change any other settings.
4. Note down that **Frontend API URL** (under API Keys).

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in **all** variables in `.env.local`:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_FRONTEND_API_URL` | Clerk Dashboard → API Keys → Frontend API |

The `CONVEX_*` variables will be auto-populated when you run `npx convex dev` in the next step.

> **Security**: never commit `.env.local`. It is already ignored in `.gitignore`.

## 4. Wire Clerk to Convex

Open `convex/auth.config.ts` and update the domain to your Clerk Frontend API:

```typescript
export default {
  providers: [
    {
      domain: "https://your-app.clerk.accounts.dev",  // match CLERK_FRONTEND_API_URL
      applicationID: "convex",
    },
  ],
};
```

Or set `CLERK_FRONTEND_API_URL` in your env and use `process.env.CLERK_FRONTEND_API_URL` (already supported in the default config).

## 5. Start the Convex dev backend

```bash
npx convex dev
```

This will:
- push your schema to the dev instance
- print the Convex deployment URL
- auto-populate `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, and `NEXT_PUBLIC_CONVEX_SITE_URL` in your `.env.local` (or `.env`)

Leave this terminal running in a separate tab.

## 6. Seed the World Cup 2026 matches

In a new terminal (with Convex still running):

```bash
npx convex run seed:run '{"secret":"prode-seed-2026"}'
```

This creates 48 realistic group-stage fixtures.

## 7. Start the Next.js dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 8. Make yourself an admin

1. Sign up through the app (or `/sign-up`).
2. Find your `clerkId` in the Convex dashboard or via the `users.me` query.
3. Run:

```bash
npx convex run users:setAdmin '{"clerkId":"user_..."}'
```

You can now visit `/admin` to manage match lifecycles and trigger scoring.

## Common issues

### Clerk issuer mismatch

If Convex returns `Unauthorized` or `Invalid issuer`, check that:
- `CLERK_FRONTEND_API_URL` matches the **Issuer** in your Clerk JWT template
- `convex/auth.config.ts` uses the exact same domain

### Convex URL not found

If your frontend can't connect to Convex, verify:
```bash
cat .env.local | grep CONVEX
```
Make sure both `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` are present.

### Next.js middleware deprecation warning

Next.js 16 shows: `The "middleware" file convention is deprecated. Please use "proxy" instead.`
This is a known cosmetic warning; the `src/middleware.ts` file still works correctly.

## Next steps

- See [DEPLOY.md](DEPLOY.md) for pushing to Vercel + Convex production.
- See [ARCHITECTURE.md](ARCHITECTURE.md) for data model and design decisions.
