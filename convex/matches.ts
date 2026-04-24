import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { NotFoundError, ValidationError } from "./lib/errors";
import { calculatePoints } from "./lib/scoring";
import { enforceAdmin } from "./lib/admin";

const statusValidator = v.union(
  v.literal("scheduled"),
  v.literal("live"),
  v.literal("finished")
);

export const list = query({
  args: {
    group: v.optional(v.string()),
    status: v.optional(statusValidator),
  },
  handler: async (ctx, { group, status }) => {
    let q = ctx.db.query("matches");

    if (group && status) {
      return await q.collect();
    }

    if (group) {
      return await q
        .withIndex("by_group", (q2) => q2.eq("group", group))
        .collect();
    }

    if (status) {
      return await q
        .withIndex("by_status", (q2) => q2.eq("status", status))
        .collect();
    }

    return await q.order("asc").collect();
  },
});

export const get = query({
  args: { id: v.id("matches") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listGroups = query({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query("matches").collect();
    const groups = Array.from(new Set(matches.map((m) => m.group)));
    return groups.sort();
  },
});

export const listEvents = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    return await ctx.db
      .query("matchEvents")
      .withIndex("by_match", (q) => q.eq("matchId", matchId))
      .order("asc")
      .collect();
  },
});

// ─── Admin match lifecycle mutations ────────────────────────────

export const start = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    await enforceAdmin(ctx);

    const match = await ctx.db.get(matchId);
    if (!match) throw new NotFoundError("Match");
    if (match.status !== "scheduled") {
      throw new ValidationError("Match must be scheduled to start");
    }

    await ctx.db.patch(matchId, { status: "live", startedAt: Date.now() });
    return { success: true };
  },
});

export const updateScore = mutation({
  args: {
    matchId: v.id("matches"),
    homeScore: v.number(),
    awayScore: v.number(),
  },
  handler: async (ctx, args) => {
    await enforceAdmin(ctx);

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new NotFoundError("Match");
    if (match.status !== "live") {
      throw new ValidationError("Match must be live to update score");
    }

    await ctx.db.patch(args.matchId, {
      homeScore: args.homeScore,
      awayScore: args.awayScore,
    });
    return { success: true };
  },
});

export const addEvent = mutation({
  args: {
    matchId: v.id("matches"),
    minute: v.number(),
    type: v.union(
      v.literal("goal"),
      v.literal("red-card"),
      v.literal("yellow-card"),
      v.literal("sub")
    ),
    description: v.string(),
    team: v.union(v.literal("home"), v.literal("away")),
  },
  handler: async (ctx, args) => {
    await enforceAdmin(ctx);

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new NotFoundError("Match");
    if (match.status !== "live") {
      throw new ValidationError("Match must be live to add events");
    }

    const id = await ctx.db.insert("matchEvents", {
      ...args,
      createdAt: Date.now(),
    });
    return { id };
  },
});

export const finish = mutation({
  args: {
    matchId: v.id("matches"),
    homeScore: v.number(),
    awayScore: v.number(),
  },
  handler: async (ctx, args) => {
    await enforceAdmin(ctx);

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new NotFoundError("Match");
    if (match.status !== "live") {
      throw new ValidationError("Match must be live to finish");
    }

    const now = Date.now();
    await ctx.db.patch(args.matchId, {
      homeScore: args.homeScore,
      awayScore: args.awayScore,
      status: "finished",
      finishedAt: now,
    });

    // ── Run scoring ──

    // 1. Existing predictions for this match
    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();

    // 2. Build a set of (leagueId:userId) that already have predictions
    const predictionKey = (lId: string, uId: string) => `${lId}:${uId}`;
    const existingKeys = new Set(predictions.map((p) => predictionKey(p.leagueId, p.userId)));

    // 3. Find league members missing predictions and create them from defaults
    const allMembers = await ctx.db.query("leagueMembers").collect();
    for (const m of allMembers) {
      if (existingKeys.has(predictionKey(m.leagueId, m.userId))) continue;

      const user = await ctx.db.get(m.userId);
      const defaultP = user?.defaultPrediction ?? { homeScore: 0, awayScore: 0 };

      await ctx.db.insert("predictions", {
        userId: m.userId,
        matchId: args.matchId,
        leagueId: m.leagueId,
        homeScore: defaultP.homeScore,
        awayScore: defaultP.awayScore,
        pointsEarned: undefined,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 4. Re-fetch all predictions (original + newly inserted)
    const allPredictions = await ctx.db
      .query("predictions")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();

    let updatedCount = 0;

    for (const p of allPredictions) {
      const pts = calculatePoints(
        { homeScore: p.homeScore, awayScore: p.awayScore },
        { homeScore: args.homeScore, awayScore: args.awayScore }
      );

      const prevPoints = p.pointsEarned ?? 0;
      const diff = pts - prevPoints;

      await ctx.db.patch(p._id, { pointsEarned: pts });

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
      updatedCount++;
    }

    return { updated: updatedCount };
  },
});
