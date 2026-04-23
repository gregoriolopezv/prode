import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const global = query({
  args: {},
  handler: async (ctx) => {
    const memberships = await ctx.db.query("leagueMembers").collect();

    const pointsMap = new Map<Id<"users">, number>();
    const nameMap = new Map<Id<"users">, string>();

    for (const m of memberships) {
      const prev = pointsMap.get(m.userId) ?? 0;
      pointsMap.set(m.userId, prev + m.totalPoints);
    }

    for (const [userId] of pointsMap) {
      const user = await ctx.db.get(userId);
      nameMap.set(userId, (user as any)?.name ?? (user as any)?.email ?? "Unknown");
    }

    const results = Array.from(pointsMap.entries()).map(([userId, totalPoints]) => ({
      userId,
      name: nameMap.get(userId) ?? "Unknown",
      totalPoints,
    }));

    results.sort((a, b) => b.totalPoints - a.totalPoints);
    return results;
  },
});
