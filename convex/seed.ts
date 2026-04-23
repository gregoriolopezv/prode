import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { ForbiddenError } from "./lib/errors";

const seedMatches = [
  // ========= GROUP A =========
  { homeTeam: "Argentina", awayTeam: "Canada", group: "A", day: 1, hour: 20 },
  { homeTeam: "Chile", awayTeam: "Peru", group: "A", day: 2, hour: 14 },
  { homeTeam: "Argentina", awayTeam: "Chile", group: "A", day: 7, hour: 17 },
  { homeTeam: "Canada", awayTeam: "Peru", group: "A", day: 7, hour: 20 },
  { homeTeam: "Argentina", awayTeam: "Peru", group: "A", day: 13, hour: 20 },
  { homeTeam: "Canada", awayTeam: "Chile", group: "A", day: 13, hour: 16 },
  // ========= GROUP B =========
  { homeTeam: "England", awayTeam: "USA", group: "B", day: 2, hour: 20 },
  { homeTeam: "Iran", awayTeam: "Wales", group: "B", day: 3, hour: 17 },
  { homeTeam: "England", awayTeam: "Iran", group: "B", day: 8, hour: 20 },
  { homeTeam: "USA", awayTeam: "Wales", group: "B", day: 8, hour: 14 },
  { homeTeam: "England", awayTeam: "Wales", group: "B", day: 14, hour: 16 },
  { homeTeam: "USA", awayTeam: "Iran", group: "B", day: 14, hour: 20 },
  // ========= GROUP C =========
  { homeTeam: "France", awayTeam: "Denmark", group: "C", day: 3, hour: 20 },
  { homeTeam: "Australia", awayTeam: "Tunisia", group: "C", day: 4, hour: 14 },
  { homeTeam: "France", awayTeam: "Australia", group: "C", day: 9, hour: 17 },
  { homeTeam: "Denmark", awayTeam: "Tunisia", group: "C", day: 9, hour: 20 },
  { homeTeam: "France", awayTeam: "Tunisia", group: "C", day: 15, hour: 14 },
  { homeTeam: "Denmark", awayTeam: "Australia", group: "C", day: 15, hour: 20 },
  // ========= GROUP D =========
  { homeTeam: "Brazil", awayTeam: "Serbia", group: "D", day: 4, hour: 20 },
  { homeTeam: "Switzerland", awayTeam: "Cameroon", group: "D", day: 5, hour: 16 },
  { homeTeam: "Brazil", awayTeam: "Switzerland", group: "D", day: 10, hour: 20 },
  { homeTeam: "Serbia", awayTeam: "Cameroon", group: "D", day: 10, hour: 14 },
  { homeTeam: "Brazil", awayTeam: "Cameroon", group: "D", day: 16, hour: 17 },
  { homeTeam: "Serbia", awayTeam: "Switzerland", group: "D", day: 16, hour: 20 },
  // ========= GROUP E =========
  { homeTeam: "Germany", awayTeam: "Spain", group: "E", day: 5, hour: 20 },
  { homeTeam: "Japan", awayTeam: "Costa Rica", group: "E", day: 6, hour: 14 },
  { homeTeam: "Germany", awayTeam: "Japan", group: "E", day: 11, hour: 17 },
  { homeTeam: "Spain", awayTeam: "Costa Rica", group: "E", day: 11, hour: 20 },
  { homeTeam: "Germany", awayTeam: "Costa Rica", group: "E", day: 17, hour: 20 },
  { homeTeam: "Spain", awayTeam: "Japan", group: "E", day: 17, hour: 16 },
  // ========= GROUP F =========
  { homeTeam: "Belgium", awayTeam: "Croatia", group: "F", day: 6, hour: 20 },
  { homeTeam: "Morocco", awayTeam: "Mexico", group: "F", day: 7, hour: 17 },
  { homeTeam: "Belgium", awayTeam: "Morocco", group: "F", day: 12, hour: 14 },
  { homeTeam: "Croatia", awayTeam: "Mexico", group: "F", day: 12, hour: 20 },
  { homeTeam: "Belgium", awayTeam: "Mexico", group: "F", day: 18, hour: 20 },
  { homeTeam: "Croatia", awayTeam: "Morocco", group: "F", day: 18, hour: 16 },
  // ========= GROUP G =========
  { homeTeam: "Portugal", awayTeam: "Uruguay", group: "G", day: 8, hour: 20 },
  { homeTeam: "South Korea", awayTeam: "Ghana", group: "G", day: 9, hour: 14 },
  { homeTeam: "Portugal", awayTeam: "South Korea", group: "G", day: 14, hour: 17 },
  { homeTeam: "Uruguay", awayTeam: "Ghana", group: "G", day: 14, hour: 20 },
  { homeTeam: "Portugal", awayTeam: "Ghana", group: "G", day: 20, hour: 16 },
  { homeTeam: "Uruguay", awayTeam: "South Korea", group: "G", day: 20, hour: 20 },
  // ========= GROUP H =========
  { homeTeam: "Netherlands", awayTeam: "Senegal", group: "H", day: 9, hour: 20 },
  { homeTeam: "Poland", awayTeam: "Ecuador", group: "H", day: 10, hour: 14 },
  { homeTeam: "Netherlands", awayTeam: "Poland", group: "H", day: 15, hour: 17 },
  { homeTeam: "Senegal", awayTeam: "Ecuador", group: "H", day: 15, hour: 20 },
  { homeTeam: "Netherlands", awayTeam: "Ecuador", group: "H", day: 21, hour: 20 },
  { homeTeam: "Senegal", awayTeam: "Poland", group: "H", day: 21, hour: 16 },
];

export const run = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    if (secret !== "prode-seed-2026") {
      throw new ForbiddenError("Invalid seed secret");
    }

    const existing = await ctx.db
      .query("matches")
      .withIndex("by_status")
      .collect();

    if (existing.length > 0) {
      return { message: "Matches already seeded", count: existing.length };
    }

    const baseTime = new Date("2026-06-12T00:00:00Z").getTime();

    let count = 0;
    for (const m of seedMatches) {
      const dayOffset = m.day - 1;
      const hourOffset = m.hour;
      const kickoff = baseTime + dayOffset * 86400000 + hourOffset * 3600000;

      await ctx.db.insert("matches", {
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        group: m.group,
        kickoffTime: kickoff,
        status: "scheduled" as any,
        createdAt: Date.now(),
      });
      count++;
    }

    return { message: "Seeded successfully", count };
  },
});
