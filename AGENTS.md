<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Current known deprecation:
- `src/middleware.ts` convention is deprecated in favor of `proxy`, but still functional.
<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

<!-- docs-start -->
## Documentation

- `docs/SETUP.md` — Local development setup (Clerk, Convex, seeding, admin)
- `docs/DEPLOY.md` — Production deployment to Vercel + Convex
- `docs/ARCHITECTURE.md` — Data model, privacy, scoring flow, i18n approach
- `.env.example` — Environment variable template
<!-- docs-end -->

<!-- conventions-start -->
## Coding Conventions

### i18n
All user-facing strings use `const { t } = useLanguage()` and keys from `src/lib/i18n/types.ts`. Add new keys to **both** `en.ts` and `es.ts` before using them.

### Tailwind / shadcn
- Use semantic tokens (`bg-background`, `text-muted-foreground`) — never raw colors.
- Use `cn()` for conditional classes.
- Prefer `flex flex-col gap-*` over `space-y-*`.

### Convex
- Use `v.union(v.literal(...))` for finite state fields (status, event types).
- Enforce auth and roles in mutations/queries directly; never assume UI will gate.
- Keep scoring and time logic in pure `convex/lib/` files for easy testing.
<!-- conventions-end -->
