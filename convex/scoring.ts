import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { ForbiddenError, NotFoundError } from "./lib/errors";
import { calculatePoints } from "./lib/scoring";

export const recalculate = mutation({
  args: {
    matchId: v.id("matches"),
    homeScore: v.number(),
    awayScore: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ForbiddenError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new ForbiddenError("Admin only");
    }

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new NotFoundError("Match");

    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();

    for (const p of predictions) {
      const pts = calculatePoints(
        { homeScore: p.homeScore, awayScore: p.awayScore },
        { homeScore: args.homeScore, awayScore: args.awayScore }
      );

      const diff = pts - (p.pointsEarned ?? 0);

      if (p.pointsEarned !== pts) {
        await ctx.db.patch(p._id, { pointsEarned: pts });
      }

      if (diff !== 0) {
        const member = await ctx.db
          .query("leagueMembers")
          .withIndex("by_league_user", (q) =>
            q.eq("leagueId", p.leagueId).eq("userId", p.userId)
          )
          .unique();

        if (member) {
          await ctx.db.patch(member._id, {
            totalPoints: member.totalPoints + diff,
          });
        }
      }
    }

    return { updated: predictions.length };
  },
});
