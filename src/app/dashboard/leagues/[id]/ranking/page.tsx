"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";

export default function LeagueRankingPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = params.id as string;

  const league = useQuery(api.leagues.get, { id: id as any });
  const members = useQuery(api.leagues.members, { leagueId: id as any });

  const sortedMembers = [...(members ?? [])]
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => (b?.totalPoints ?? 0) - (a?.totalPoints ?? 0));

  if (league === undefined) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!league) {
    return <p className="text-muted-foreground">{t("common.error")}</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/leagues/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> {t("common.back")}
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold">{league.name} - {t("rankings.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t("rankings.leaderboard")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {sortedMembers.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                          ? "bg-gray-100 text-gray-700"
                          : index === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {index + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                    {member.name?.[0] ?? "?"}
                  </div>
                  <span className="font-medium">{member.name}</span>
                </div>
                <div className="flex items-center gap-1 font-bold">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  {member.totalPoints}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
