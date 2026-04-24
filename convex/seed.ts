import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { ForbiddenError } from "./lib/errors";

const seedMatches = [
  // ========= GROUP A =========
  { homeTeam: "Mexico", awayTeam: "South Africa", group: "A", kickoffTime: 1781200800000 },
  { homeTeam: "South Korea", awayTeam: "Czech Republic", group: "A", kickoffTime: 1781226000000 },
  { homeTeam: "Czech Republic", awayTeam: "South Africa", group: "A", kickoffTime: 1781802000000 },
  { homeTeam: "Mexico", awayTeam: "South Korea", group: "A", kickoffTime: 1781827200000 },
  { homeTeam: "Czech Republic", awayTeam: "Mexico", group: "A", kickoffTime: 1782345600000 },
  { homeTeam: "South Africa", awayTeam: "South Korea", group: "A", kickoffTime: 1782345600000 },
  // ========= GROUP B =========
  { homeTeam: "Canada", awayTeam: "Bosnia and Herzegovina", group: "B", kickoffTime: 1781294400000 },
  { homeTeam: "Qatar", awayTeam: "Switzerland", group: "B", kickoffTime: 1781370000000 },
  { homeTeam: "Switzerland", awayTeam: "Bosnia and Herzegovina", group: "B", kickoffTime: 1781802000000 },
  { homeTeam: "Canada", awayTeam: "Qatar", group: "B", kickoffTime: 1781812800000 },
  { homeTeam: "Switzerland", awayTeam: "Canada", group: "B", kickoffTime: 1782320400000 },
  { homeTeam: "Bosnia and Herzegovina", awayTeam: "Qatar", group: "B", kickoffTime: 1782320400000 },
  // ========= GROUP C =========
  { homeTeam: "Brazil", awayTeam: "Morocco", group: "C", kickoffTime: 1781391600000 },
  { homeTeam: "Haiti", awayTeam: "Scotland", group: "C", kickoffTime: 1781402400000 },
  { homeTeam: "Scotland", awayTeam: "Morocco", group: "C", kickoffTime: 1781910000000 },
  { homeTeam: "Brazil", awayTeam: "Haiti", group: "C", kickoffTime: 1781919000000 },
  { homeTeam: "Scotland", awayTeam: "Brazil", group: "C", kickoffTime: 1782342000000 },
  { homeTeam: "Morocco", awayTeam: "Haiti", group: "C", kickoffTime: 1782342000000 },
  // ========= GROUP D =========
  { homeTeam: "United States", awayTeam: "Paraguay", group: "D", kickoffTime: 1781305200000 },
  { homeTeam: "Australia", awayTeam: "Turkey", group: "D", kickoffTime: 1781402400000 },
  { homeTeam: "United States", awayTeam: "Australia", group: "D", kickoffTime: 1781888400000 },
  { homeTeam: "Turkey", awayTeam: "Paraguay", group: "D", kickoffTime: 1781917200000 },
  { homeTeam: "Turkey", awayTeam: "United States", group: "D", kickoffTime: 1782432000000 },
  { homeTeam: "Paraguay", awayTeam: "Australia", group: "D", kickoffTime: 1782432000000 },
  // ========= GROUP E =========
  { homeTeam: "Germany", awayTeam: "Curaçao", group: "E", kickoffTime: 1781456400000 },
  { homeTeam: "Ivory Coast", awayTeam: "Ecuador", group: "E", kickoffTime: 1781481600000 },
  { homeTeam: "Germany", awayTeam: "Ivory Coast", group: "E", kickoffTime: 1781989200000 },
  { homeTeam: "Ecuador", awayTeam: "Curaçao", group: "E", kickoffTime: 1782000000000 },
  { homeTeam: "Curaçao", awayTeam: "Ivory Coast", group: "E", kickoffTime: 1782421200000 },
  { homeTeam: "Ecuador", awayTeam: "Germany", group: "E", kickoffTime: 1782421200000 },
  // ========= GROUP F =========
  { homeTeam: "Netherlands", awayTeam: "Japan", group: "F", kickoffTime: 1781467200000 },
  { homeTeam: "Sweden", awayTeam: "Tunisia", group: "F", kickoffTime: 1781485200000 },
  { homeTeam: "Netherlands", awayTeam: "Sweden", group: "F", kickoffTime: 1781974800000 },
  { homeTeam: "Tunisia", awayTeam: "Japan", group: "F", kickoffTime: 1782010800000 },
  { homeTeam: "Japan", awayTeam: "Sweden", group: "F", kickoffTime: 1782428400000 },
  { homeTeam: "Tunisia", awayTeam: "Netherlands", group: "F", kickoffTime: 1782428400000 },
  // ========= GROUP G =========
  { homeTeam: "Belgium", awayTeam: "Egypt", group: "G", kickoffTime: 1781542800000 },
  { homeTeam: "Iran", awayTeam: "New Zealand", group: "G", kickoffTime: 1781564400000 },
  { homeTeam: "Belgium", awayTeam: "Iran", group: "G", kickoffTime: 1782061200000 },
  { homeTeam: "New Zealand", awayTeam: "Egypt", group: "G", kickoffTime: 1782082800000 },
  { homeTeam: "Egypt", awayTeam: "Iran", group: "G", kickoffTime: 1782522000000 },
  { homeTeam: "New Zealand", awayTeam: "Belgium", group: "G", kickoffTime: 1782522000000 },
  // ========= GROUP H =========
  { homeTeam: "Spain", awayTeam: "Cape Verde", group: "H", kickoffTime: 1781542800000 },
  { homeTeam: "Saudi Arabia", awayTeam: "Uruguay", group: "H", kickoffTime: 1781564400000 },
  { homeTeam: "Spain", awayTeam: "Saudi Arabia", group: "H", kickoffTime: 1782061200000 },
  { homeTeam: "Uruguay", awayTeam: "Cape Verde", group: "H", kickoffTime: 1782082800000 },
  { homeTeam: "Uruguay", awayTeam: "Spain", group: "H", kickoffTime: 1782514800000 },
  { homeTeam: "Cape Verde", awayTeam: "Saudi Arabia", group: "H", kickoffTime: 1782518400000 },
  // ========= GROUP I =========
  { homeTeam: "France", awayTeam: "Senegal", group: "I", kickoffTime: 1781640000000 },
  { homeTeam: "Iraq", awayTeam: "Norway", group: "I", kickoffTime: 1781650800000 },
  { homeTeam: "France", awayTeam: "Iraq", group: "I", kickoffTime: 1782165600000 },
  { homeTeam: "Norway", awayTeam: "Senegal", group: "I", kickoffTime: 1782176400000 },
  { homeTeam: "Norway", awayTeam: "France", group: "I", kickoffTime: 1782504000000 },
  { homeTeam: "Senegal", awayTeam: "Iraq", group: "I", kickoffTime: 1782504000000 },
  // ========= GROUP J =========
  { homeTeam: "Argentina", awayTeam: "Algeria", group: "J", kickoffTime: 1781658000000 },
  { homeTeam: "Austria", awayTeam: "Jordan", group: "J", kickoffTime: 1781661600000 },
  { homeTeam: "Argentina", awayTeam: "Austria", group: "J", kickoffTime: 1782147600000 },
  { homeTeam: "Jordan", awayTeam: "Algeria", group: "J", kickoffTime: 1782176400000 },
  { homeTeam: "Algeria", awayTeam: "Austria", group: "J", kickoffTime: 1782698400000 },
  { homeTeam: "Jordan", awayTeam: "Argentina", group: "J", kickoffTime: 1782698400000 },
  // ========= GROUP K =========
  { homeTeam: "Portugal", awayTeam: "DR Congo", group: "K", kickoffTime: 1781715600000 },
  { homeTeam: "Uzbekistan", awayTeam: "Colombia", group: "K", kickoffTime: 1781744400000 },
  { homeTeam: "Portugal", awayTeam: "Uzbekistan", group: "K", kickoffTime: 1782234000000 },
  { homeTeam: "Colombia", awayTeam: "DR Congo", group: "K", kickoffTime: 1782262800000 },
  { homeTeam: "Colombia", awayTeam: "Portugal", group: "K", kickoffTime: 1782691200000 },
  { homeTeam: "DR Congo", awayTeam: "Uzbekistan", group: "K", kickoffTime: 1782691200000 },
  // ========= GROUP L =========
  { homeTeam: "England", awayTeam: "Croatia", group: "L", kickoffTime: 1781726400000 },
  { homeTeam: "Ghana", awayTeam: "Panama", group: "L", kickoffTime: 1781740800000 },
  { homeTeam: "England", awayTeam: "Ghana", group: "L", kickoffTime: 1782248400000 },
  { homeTeam: "Panama", awayTeam: "Croatia", group: "L", kickoffTime: 1782259200000 },
  { homeTeam: "Panama", awayTeam: "England", group: "L", kickoffTime: 1782597600000 },
  { homeTeam: "Croatia", awayTeam: "Ghana", group: "L", kickoffTime: 1782597600000 },
];

export const clear = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    if (secret !== "prode-seed-2026") {
      throw new ForbiddenError("Invalid seed secret");
    }

    const matches = await ctx.db.query("matches").collect();
    const events = await ctx.db.query("matchEvents").collect();

    for (const m of matches) {
      await ctx.db.delete(m._id);
    }
    for (const e of events) {
      await ctx.db.delete(e._id);
    }

    return { deletedMatches: matches.length, deletedEvents: events.length };
  },
});

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

    let count = 0;
    for (const m of seedMatches) {
      await ctx.db.insert("matches", {
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        group: m.group,
        kickoffTime: m.kickoffTime,
        status: "scheduled",
        createdAt: Date.now(),
      });
      count++;
    }

    return { message: "Seeded successfully", count };
  },
});
