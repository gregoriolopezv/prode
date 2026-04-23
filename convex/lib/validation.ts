import { v } from "convex/values";

export const createLeagueValidator = v.object({
  name: v.string(),
});

export const joinLeagueValidator = v.object({
  inviteCode: v.string(),
});

export const createPredictionValidator = v.object({
  matchId: v.id("matches"),
  leagueId: v.id("leagues"),
  homeScore: v.number(),
  awayScore: v.number(),
});

export const setMatchResultValidator = v.object({
  matchId: v.id("matches"),
  homeScore: v.number(),
  awayScore: v.number(),
});
