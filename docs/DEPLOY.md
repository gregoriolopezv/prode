# Deploy to Production (Vercel + Convex)

## Overview

1. Deploy Convex backend
2. Deploy Next.js frontend to Vercel
3. Update environment variables on both platforms
4. Seed production data

---

## 1. Deploy Convex

```bash
npx convex deploy
```

This pushes your schema and functions to a **production** Convex deployment.

After deploying, get the production URLs:

```bash
npx convex env list
```

Or open the [Convex Dashboard](https://dashboard.convex.dev) for your project.

Note down:
- `Deployment name` (e.g., `prod:<name>`)
- `NEXT_PUBLIC_CONVEX_URL` (e.g., `https://<name>.convex.cloud`)
- `NEXT_PUBLIC_CONVEX_SITE_URL` (e.g., `https://<name>.convex.site`)

## 2. Deploy Next.js to Vercel

### Option A: Vercel Dashboard (recommended)

1. Push your code to a GitHub repository.
2. Go to [https://vercel.com/new](https://vercel.com/new) and import the repo.
3. **Build command**: `next build` (default)
4. **Output directory**: `.next` (default)
5. Add the environment variables (see step 3).

### Option B: Vercel CLI

```bash
npx vercel --prod
```

Follow the prompts. You will still need to add environment variables via the dashboard.

## 3. Environment variables on Vercel

In your Vercel project → **Settings** → **Environment Variables**, add:

| Name | Value | Type |
|------|-------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk Dashboard | Production |
| `CLERK_SECRET_KEY` | From Clerk Dashboard | Production |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Production |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | Production |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard/leagues` | Production |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard/leagues` | Production |
| `CONVEX_DEPLOYMENT` | Your prod deployment name | Production |
| `NEXT_PUBLIC_CONVEX_URL` | Prod Convex URL | Production |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Prod Convex site URL | Production |
| `CLERK_FRONTEND_API_URL` | Same as local | Production |

> **Important**: `NEXT_PUBLIC_*` variables are **bundled at build time**. After changing them, trigger a redeploy.

## 4. Update Clerk allowed origins

In your Clerk Dashboard:
1. Go to **Sessions**.
2. Add your Vercel production domain to **Authorized domains** (e.g., `https://prode-2026.vercel.app`).
3. Also add it as an **Allowed origin** for CORS.

If you forget this step, sign-in will fail with a CORS error in the browser console.

## 5. Wire Clerk JWT in Convex production

Ensure `convex/auth.config.ts` uses the same Clerk Frontend API URL as production.

If you are using an environment variable:

1. Set `CLERK_FRONTEND_API_URL` in the Convex dashboard:

```bash
npx convex env set CLERK_FRONTEND_API_URL https://your-app.clerk.accounts.dev
```

Then deploy again:

```bash
npx convex deploy
```

Alternatively, hardcode the domain in `convex/auth.config.ts` if you prefer.

## 6. Seed production matches

With the production deployment configured:

```bash
npx convex run --prod seed:run '{"secret":"prode-seed-2026"}'
```

> Use a different secret in production so no one can accidentally reset your data.

## 7. Make your first admin (production)

1. Visit your deployed app and sign up as a user.
2. Find your `clerkId` (e.g., from Clerk Dashboard → Users).
3. Run:

```bash
npx convex run --prod users:setAdmin '{"clerkId":"user_..."}'
```

You can now access `/admin` on the production domain.

## Rollback

Both Vercel and Convex support instant rollbacks:

- **Vercel**: Deployments tab → **Promote to Production** on a previous deployment.
- **Convex**: `npx convex deploy` is forward-only, but data is preserved unless you run destructive mutations.

## Custom domain (optional)

1. In Vercel: **Settings** → **Domains** → add your custom domain.
2. In Clerk: add the custom domain to allowed origins (same as step 4).
3. In Convex: no action needed — the backend URL stays the same.

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|-----------|-----|
| `Unauthorized` from Convex | Clerk issuer mismatch | Double-check `CLERK_FRONTEND_API_URL` matches Clerk JWT template issuer |
| `/admin` shows unauthorized | User role not set | Run `users:setAdmin` mutation |
| No matches shown after deploy | Not seeded | Run `seed:run` with `--prod` flag |
| CORS on sign-in | Missing origin in Clerk Dashboard | Add your Vercel domain to Clerk allowed origins |
| `404` on `/dashboard/*` | Middleware not working | In Vercel, ensure **Framework Preset** is set to Next.js |
