"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, Globe, Activity } from "lucide-react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useLanguage } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

export default function MatchDetailPage() {
  const { t, locale } = useLanguage();
  const params = useParams();
  const matchId = params.id as string;

  const match = useQuery(api.matches.get, { id: matchId as Id<"matches"> });
  const leagues = useQuery(api.leagues.list);
  const events = useQuery(api.matches.listEvents, { matchId: matchId as Id<"matches"> });
  const createPrediction = useMutation(api.predictions.create);

  const [selectedLeague, setSelectedLeague] = useState<string | undefined>(undefined);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [saving, setSaving] = useState(false);

  const userLeagues = leagues?.filter((l): l is NonNullable<typeof l> => l !== null) ?? [];

  const activeLeagueId = selectedLeague ?? (userLeagues[0]?._id as string | undefined);

  const predictions = useQuery(
    api.predictions.listForLeague,
    activeLeagueId ? { leagueId: activeLeagueId as Id<"leagues">, matchId: matchId as Id<"matches"> } : "skip"
  );

  const leaguePredictions = useQuery(
    api.predictions.listForMatch,
    activeLeagueId ? { leagueId: activeLeagueId as Id<"leagues">, matchId: matchId as Id<"matches"> } : "skip"
  );

  // Own prediction for the currently selected league + match
  const ownPrediction = predictions?.find(
    (p) => p.matchId === matchId
  );
  const hasPrediction = Boolean(ownPrediction);

  // Sync form inputs with the current prediction so users see what they saved
  useEffect(() => {
    if (ownPrediction) {
      setHomeScore(String(ownPrediction.homeScore));
      setAwayScore(String(ownPrediction.awayScore));
    } else {
      setHomeScore("");
      setAwayScore("");
    }
  }, [ownPrediction]);

  if (match === undefined) {
    return <p className="text-muted-foreground">{t("matches.loading")}</p>;
  }

  if (!match) {
    return <p className="text-muted-foreground">{t("matches.notFound")}</p>;
  }

  const now = Date.now();
  const isOpen = now < match.kickoffTime;
  const showScore = match.status === "live" || match.status === "finished";
  const showPredictions = match.status !== "scheduled"; // privacy gate

  const dateOpts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const dateStr = new Date(match.kickoffTime).toLocaleDateString(
    locale === "es" ? "es" : "en-US",
    dateOpts
  );
  const timeStr = new Date(match.kickoffTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLeagueId || homeScore === "" || awayScore === "") return;

    setSaving(true);
    try {
      await createPrediction({
        matchId: matchId as Id<"matches">,
        leagueId: activeLeagueId as Id<"leagues">,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
      });
    } catch (err: any) {
      alert(err?.message ?? t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = isOpen ? (
    <Badge variant="outline" className="flex items-center gap-1 text-green-600">
      <Globe className="h-3 w-3" /> {t("matches.open")}
    </Badge>
  ) : (
    <Badge variant="outline" className="flex items-center gap-1 text-destructive">
      <Lock className="h-3 w-3" /> {t("matches.locked")}
    </Badge>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/matches">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> {t("matches.title")}
          </Button>
        </Link>
      </div>

      {/* ── Match Card ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{t("matches.groupLabel")} {match.group}</Badge>
            {statusBadge}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {dateStr} {t("matches.at")} {timeStr} {t("matches.utc")}
            </p>
            <div className="flex items-center justify-between text-2xl sm:text-3xl font-bold">
              <div className="flex-1 text-right">{match.homeTeam}</div>
              <div className="px-4 sm:px-8 text-lg text-muted-foreground">vs</div>
              <div className="flex-1 text-left">{match.awayTeam}</div>
            </div>

            {/* Live / Finished score */}
            {showScore && (
              <div className="flex flex-col items-center gap-2 pt-1">
                {match.status === "live" && (
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-red-600 uppercase tracking-wide">
                      {t("matches.liveUpper")}
                    </span>
                  </div>
                )}
                <div className="text-4xl font-mono font-bold">
                  {match.homeScore ?? 0} — {match.awayScore ?? 0}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Match Events Timeline ── */}
      {showScore && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("matches.matchEvents")}</CardTitle>
          </CardHeader>
          <CardContent>
            {(!events || events.length === 0) ? (
              <p className="text-sm text-muted-foreground">{t("matches.noEvents")}</p>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-auto pr-1">
                {events.map((ev: any) => (
                  <div
                    key={ev._id}
                    className={cn(
                      "flex items-center gap-3 text-sm p-2 rounded",
                      ev.team === "home" ? "bg-muted/50" : "bg-muted/30"
                    )}
                  >
                    <span className="font-mono font-bold text-muted-foreground w-10">{ev.minute}&apos;</span>
                    <EventIcon type={ev.type} />
                    <span className="flex-1">{ev.description}</span>
                    <Badge variant="outline" className="text-xs">
                      {ev.team === "home" ? match.homeTeam : match.awayTeam}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Your Prediction ── */}
      {userLeagues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("matches.yourPrediction")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">{t("matches.leagueLabel")}</Label>
              <div className="flex flex-wrap gap-2">
                {userLeagues.map((league) => (
                  <Button
                    key={league._id}
                    variant={activeLeagueId === league._id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLeague(league._id)}
                  >
                    {league.name}
                  </Button>
                ))}
              </div>
            </div>

            {!isOpen ? (
              ownPrediction ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">
                      {match.homeTeam}: {ownPrediction.homeScore}
                    </span>
                    <span className="font-medium">
                      {match.awayTeam}: {ownPrediction.awayScore}
                    </span>
                    {ownPrediction.pointsEarned !== undefined && (
                      <Badge variant="secondary">{ownPrediction.pointsEarned} pts</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{t("matches.predictionsLocked")}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("matches.noPrediction")}</p>
              )
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>{match.homeTeam}</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                    />
                  </div>
                  <div className="pb-2 text-muted-foreground font-medium">-</div>
                  <div className="flex-1 space-y-2">
                    <Label>{match.awayTeam}</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={saving || homeScore === "" || awayScore === "" || !activeLeagueId}
                >
                  {hasPrediction ? t("matches.updatePrediction") : t("matches.submitPrediction")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── League Members Predictions ── */}
      {activeLeagueId && showPredictions && leaguePredictions && leaguePredictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("matches.leaguePredictions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {leaguePredictions.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                      {(p.userName as string)?.[0] ?? "?"}
                    </div>
                    <span className="font-medium">{p.userName as string}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-lg">{p.homeScore} - {p.awayScore}</span>
                    {p.pointsEarned !== undefined && (
                      <Badge variant="secondary">{p.pointsEarned} pts</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {!activeLeagueId && (
        <div className="text-center space-y-3 py-8">
          <p className="text-muted-foreground">{t("matches.joinToPredict")}</p>
          <Link href="/dashboard/leagues">
            <Button>{t("matches.goToLeagues")}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    goal: "⚽",
    "yellow-card": "🟨",
    "red-card": "🟥",
    sub: "🔄",
  };
  return <span className="text-lg">{icons[type] ?? "•"}</span>;
}
