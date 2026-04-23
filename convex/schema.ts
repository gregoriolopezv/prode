import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()), // "admin" | undefined
    locale: v.optional(v.string()), // "en" | "es"
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  leagues: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    inviteCode: v.string(),
    createdAt: v.number(),
  })
    .index("by_inviteCode", ["inviteCode"])
    .index("by_owner", ["ownerId"]),

  leagueMembers: defineTable({
    leagueId: v.id("leagues"),
    userId: v.id("users"),
    joinedAt: v.number(),
    totalPoints: v.number(),
  })
    .index("by_league", ["leagueId"])
    .index("by_user", ["userId"])
    .index("by_league_user", ["leagueId", "userId"])
    .index("by_ranking", ["leagueId", "totalPoints"]),

  matches: defineTable({
    homeTeam: v.string(),
    awayTeam: v.string(),
    homeScore: v.optional(v.number()),
    awayScore: v.optional(v.number()),
    group: v.string(),
    kickoffTime: v.number(), // UTC ms
    status: v.union(v.literal("scheduled"), v.literal("live"), v.literal("finished")),
    startedAt: v.optional(v.number()), // when admin clicked Start
    finishedAt: v.optional(v.number()), // when admin clicked Finish
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_kickoff", ["kickoffTime"])
    .index("by_group", ["group"]),

  matchEvents: defineTable({
    matchId: v.id("matches"),
    minute: v.number(),
    type: v.union(
      v.literal("goal"),
      v.literal("red-card"),
      v.literal("yellow-card"),
      v.literal("sub")
    ),
    description: v.string(), // e.g. "Messi"
    team: v.union(v.literal("home"), v.literal("away")),
    createdAt: v.number(),
  })
    .index("by_match", ["matchId"]),

  predictions: defineTable({
    userId: v.id("users"),
    matchId: v.id("matches"),
    leagueId: v.id("leagues"),
    homeScore: v.number(),
    awayScore: v.number(),
    pointsEarned: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_match", ["matchId"])
    .index("by_league", ["leagueId"])
    .index("by_user_match_league", ["userId", "matchId", "leagueId"]),
});
