import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { nanoid } from "nanoid";
import { NotFoundError, ForbiddenError, ConflictError } from "./lib/errors";
import { enforceAdmin } from "./lib/admin";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await enforceAdmin(ctx);

    const leagues = await ctx.db.query("leagues").collect();
    const withCounts = await Promise.all(
      leagues.map(async (l) => {
        const members = await ctx.db
          .query("leagueMembers")
          .withIndex("by_league", (q) => q.eq("leagueId", l._id))
          .collect();
        return {
          _id: l._id,
          name: l.name,
          inviteCode: l.inviteCode,
          memberCount: members.length,
          createdAt: l.createdAt,
        };
      })
    );
    return withCounts;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const memberships = await ctx.db
      .query("leagueMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const leagues = await Promise.all(
      memberships.map(async (m) => {
        const league = await ctx.db.get(m.leagueId);
        if (!league) return null;
        return { ...league, totalPoints: m.totalPoints };
      })
    );

    return leagues.filter(Boolean);
  },
});

export const get = query({
  args: { id: v.id("leagues") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ForbiddenError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new NotFoundError("User");

    const inviteCode = nanoid(8).toUpperCase();
    const now = Date.now();

    const leagueId = await ctx.db.insert("leagues", {
      name,
      ownerId: user._id,
      inviteCode,
      createdAt: now,
    });

    await ctx.db.insert("leagueMembers", {
      leagueId,
      userId: user._id,
      joinedAt: now,
      totalPoints: 0,
    });

    return leagueId;
  },
});

export const join = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, { inviteCode }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ForbiddenError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new NotFoundError("User");

    const league = await ctx.db
      .query("leagues")
      .withIndex("by_inviteCode", (q) =>
        q.eq("inviteCode", inviteCode.toUpperCase())
      )
      .unique();

    if (!league) throw new NotFoundError("League");

    const existing = await ctx.db
      .query("leagueMembers")
      .withIndex("by_league_user", (q) =>
        q.eq("leagueId", league._id).eq("userId", user._id)
      )
      .unique();

    if (existing) throw new ConflictError("Already joined this league");

    const now = Date.now();
    await ctx.db.insert("leagueMembers", {
      leagueId: league._id,
      userId: user._id,
      joinedAt: now,
      totalPoints: 0,
    });

    return league._id;
  },
});

export const members = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, { leagueId }) => {
    const membership = await ctx.db
      .query("leagueMembers")
      .withIndex("by_league_user", (q) => q.eq("leagueId", leagueId))
      .collect();

    if (!membership.length) return [];

    return await Promise.all(
      membership.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        if (!user) return null;
        return {
          id: user._id,
          name: user.name ?? user.email,
          imageUrl: user.imageUrl,
          totalPoints: m.totalPoints,
          joinedAt: m.joinedAt,
        };
      })
    ).then((arr) => arr.filter(Boolean));
  },
});
