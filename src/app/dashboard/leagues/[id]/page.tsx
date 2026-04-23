"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import MatchCard from "@/components/match-card";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useLanguage } from "@/lib/i18n/language-provider";

export default function LeagueDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const league = useQuery(api.leagues.get, { id: id as any });
  const members = useQuery(api.leagues.members, { leagueId: id as any });
  const matches = useQuery(api.matches.list, { group: undefined, status: undefined });

  if (league === undefined) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!league) {
    router.push("/dashboard/leagues");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leagues">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> {t("leagues.backToLeagues")}
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{league.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{t("leagues.inviteCode")}: {league.inviteCode}</Badge>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {members?.length ?? 0} {t("leagues.members")}
            </span>
          </div>
        </div>
        <Link href={`/dashboard/leagues/${id}/ranking`}>
          <Button>{t("leagues.viewRanking")}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">{t("leagues.upcomingMatches")}</h2>
          {matches === undefined || matches.length === 0 ? (
            <p className="text-muted-foreground">{t("leagues.noScheduled")}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matches
                .filter((m: Doc<"matches">) => m.status !== "finished")
                .sort((a: Doc<"matches">, b: Doc<"matches">) => a.kickoffTime - b.kickoffTime)
                .map((match: Doc<"matches">) => (
                  <Link key={match._id} href={`/dashboard/matches/${match._id}?league=${id}`}>
                    <MatchCard match={match} />
                  </Link>
                ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("leagues.members")}</h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {members?.map((m: any) => (
                  <li key={m.id} className="flex items-center justify-between p-3">
                    <span className="font-medium truncate">{m.name as string}</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Trophy className="h-3.5 w-3.5" /> {m.totalPoints as number}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
