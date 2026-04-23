import type { QueryCtx, MutationCtx } from "../_generated/server";
import { ForbiddenError } from "./errors";

export async function enforceAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ForbiddenError("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user || user.role !== "admin") {
    throw new ForbiddenError("Admin only");
  }
  return user;
}
