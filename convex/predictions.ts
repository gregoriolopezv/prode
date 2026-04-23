import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ForbiddenError, NotFoundError, ValidationError } from "./lib/errors";
import { isMatchOpen } from "./lib/time";

export const listForLeague = query({
  args: {
    leagueId: v.id("leagues"),
    matchId: v.optional(v.id("matches")),
  },
  handler: async (ctx, { leagueId, matchId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    if (matchId) {
      const prediction = await ctx.db
        .query("predictions")
        .withIndex("by_user_match_league", (q) =>
          q
            .eq("userId", user._id)
            .eq("matchId", matchId)
            .eq("leagueId", leagueId)
        )
        .unique();

      return prediction ? [prediction] : [];
    }

    return await ctx.db
      .query("predictions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("leagueId"), leagueId))
      .collect();
  },
});

export const listForMatch = query({
  args: {
    leagueId: v.id("leagues"),
    matchId: v.id("matches"),
  },
  handler: async (ctx, { leagueId, matchId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const match = await ctx.db.get(matchId);
    if (!match) throw new NotFoundError("Match");

    // Privacy rule: only show own prediction until match is live or finished
    const predictionsVisible = match.status !== "scheduled";

    let predictions = await ctx.db
      .query("predictions")
      .withIndex("by_match", (q) => q.eq("matchId", matchId))
      .filter((q) => q.eq(q.field("leagueId"), leagueId))
      .collect();

    if (!predictionsVisible) {
      predictions = predictions.filter((p) => p.userId === user._id);
    }

    return await Promise.all(
      predictions.map(async (p) => {
        const u = await ctx.db.get(p.userId);
        return {
          ...p,
          userName: u?.name ?? u?.email ?? "Unknown",
          userImage: u?.imageUrl,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    matchId: v.id("matches"),
    leagueId: v.id("leagues"),
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

    if (!user) throw new NotFoundError("User");

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new NotFoundError("Match");

    if (!isMatchOpen(match.kickoffTime)) {
      throw new ValidationError("Predictions are locked after kickoff");
    }

    const existing = await ctx.db
      .query("predictions")
      .withIndex("by_user_match_league", (q) =>
        q
          .eq("userId", user._id)
          .eq("matchId", args.matchId)
          .eq("leagueId", args.leagueId)
      )
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        homeScore: args.homeScore,
        awayScore: args.awayScore,
        updatedAt: now,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("predictions", {
      ...args,
      userId: user._id,
      pointsEarned: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});
