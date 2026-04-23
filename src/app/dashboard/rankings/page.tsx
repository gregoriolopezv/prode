"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";

type ViewMode = "league" | "global";

export default function RankingsPage() {
  const { t } = useLanguage();
  const [view, setView] = useState<ViewMode>("league");
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | undefined>(undefined);

  const leagues = useQuery(api.leagues.list);
  const globalRankings = useQuery(api.rankings.global);

  const selectedLeagueName = leagues?.find(l => l !== null && l._id === selectedLeagueId)?.name;
  const members = useQuery(
    api.leagues.members,
    selectedLeagueId ? { leagueId: selectedLeagueId as any } : "skip"
  );

  const userLeagues = leagues?.filter((l): l is NonNullable<typeof l> => l !== null) ?? [];

  const sortedMembers = [...(members ?? [])]
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => (b?.totalPoints ?? 0) - (a?.totalPoints ?? 0));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{t("rankings.title")}</h1>

      <div className="flex gap-2">
        <Button
          variant={view === "league" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("league")}
        >
          <Trophy data-icon="inline-start" />
          {t("rankings.perLeague")}
        </Button>
        <Button
          variant={view === "global" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("global")}
        >
          <Globe data-icon="inline-start" />
          {t("rankings.globalTitle")}
        </Button>
      </div>

      {view === "league" && (
        <>
          <div className="flex flex-wrap gap-2">
            {userLeagues.map((league) => (
              <button
                key={league._id}
                onClick={() => setSelectedLeagueId(league._id as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedLeagueId === league._id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                  }`}
              >
                {league.name}
              </button>
            ))}
          </div>

          {selectedLeagueId && sortedMembers.length > 0 && (
            <LeaderboardCard
              title={`${t("rankings.leaderboard")} — ${selectedLeagueName}`}
              rows={sortedMembers.map((m, i) => ({
                rank: i + 1,
                name: m.name ?? "?",
                points: m.totalPoints ?? 0,
              }))}
            />
          )}

          {selectedLeagueId && sortedMembers.length === 0 && (
            <p className="text-muted-foreground">{t("rankings.noMembers")}</p>
          )}

          {!selectedLeagueId && (
            <p className="text-muted-foreground">{t("rankings.selectLeague")}</p>
          )}
        </>
      )}

      {view === "global" && (
        <>
          {globalRankings && globalRankings.length > 0 ? (
            <LeaderboardCard
              title={t("rankings.globalTitle")}
              rows={globalRankings.map((r, i) => ({
                rank: i + 1,
                name: r.name,
                points: r.totalPoints,
              }))}
            />
          ) : (
            <p className="text-muted-foreground">{t("rankings.noMembers")}</p>
          )}
        </>
      )}
    </div>
  );
}

function LeaderboardCard({
  title,
  rows,
}: {
  title: string;
  rows: { rank: number; name: string; points: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {rows.map((row) => (
            <div
              key={row.rank}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${row.rank === 1
                      ? "bg-yellow-100 text-yellow-700"
                      : row.rank === 2
                        ? "bg-gray-100 text-gray-700"
                        : row.rank === 3
                          ? "bg-orange-100 text-orange-700"
                          : "bg-muted text-muted-foreground"
                    }`}
                >
                  {row.rank}
                </div>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                  {row.name?.[0] ?? "?"}
                </div>
                <span className="font-medium">{row.name}</span>
              </div>
              <div className="flex items-center gap-1 font-bold">
                <Trophy className="h-4 w-4 text-yellow-500" />
                {row.points}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
