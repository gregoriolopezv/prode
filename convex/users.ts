import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { NotFoundError } from "./lib/errors";
import { enforceAdmin } from "./lib/admin";

export const sync = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name ?? existing.name,
        imageUrl: args.imageUrl ?? existing.imageUrl,
        // initialize defaultPrediction if missing
        defaultPrediction: existing.defaultPrediction ?? { homeScore: 0, awayScore: 0 },
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      locale: "en",
      defaultPrediction: { homeScore: 0, awayScore: 0 },
      createdAt: now,
    });
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;
    return user;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

export const setAdmin = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) throw new NotFoundError("User");

    await ctx.db.patch(user._id, { role: "admin" });
    return user._id;
  },
});

export const setLocale = mutation({
  args: { locale: v.string() },
  handler: async (ctx, { locale }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new NotFoundError("User");

    await ctx.db.patch(user._id, { locale });
    return user._id;
  },
});

export const updateDefaultPrediction = mutation({
  args: {
    homeScore: v.number(),
    awayScore: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new NotFoundError("User");

    await ctx.db.patch(user._id, {
      defaultPrediction: {
        homeScore: args.homeScore,
        awayScore: args.awayScore,
      },
    });
    return user._id;
  },
});

// ── Admin only ──

export const list = query({
  args: {},
  handler: async (ctx) => {
    await enforceAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      name: u.name ?? u.email,
      email: u.email,
      role: u.role ?? "user",
      locale: u.locale ?? "en",
      createdAt: u.createdAt,
    }));
  },
});
