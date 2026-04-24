"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Trophy, Activity } from "lucide-react";
import MatchCard from "@/components/match-card";
import { useLanguage } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

export default function AdminMatchesPage() {
  const { t } = useLanguage();
  const me = useQuery(api.users.me);
  const matches = useQuery(api.matches.list, { group: undefined, status: undefined });

  const startMatch = useMutation(api.matches.start);
  const updateScore = useMutation(api.matches.updateScore);
  const addEvent = useMutation(api.matches.addEvent);
  const finishMatch = useMutation(api.matches.finish);

  const [managingMatchId, setManagingMatchId] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [saving, setSaving] = useState(false);

  // event form state
  const [eventMinute, setEventMinute] = useState("");
  const [eventType, setEventType] = useState<"goal" | "red-card" | "yellow-card" | "sub">("goal");
  const [eventDesc, setEventDesc] = useState("");
  const [eventTeam, setEventTeam] = useState<"home" | "away">("home");

  const events = useQuery(
    api.matches.listEvents,
    managingMatchId ? { matchId: managingMatchId as any } : "skip"
  );

  // ── Early returns must come AFTER all hooks ──
  if (me === undefined) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!me || me.role !== "admin") {
    return (
      <div className="text-center space-y-3 py-12">
        <p className="text-muted-foreground">{t("admin.unauthorized")}</p>
        <Link href="/dashboard/leagues">
          <Button>{t("admin.goToDashboard")}</Button>
        </Link>
      </div>
    );
  }

  // ── Derived data ──
  const scheduled = [...(matches ?? [])]
    .filter((m: any) => m.status === "scheduled")
    .sort((a: any, b: any) => a.kickoffTime - b.kickoffTime);

  const live = [...(matches ?? [])]
    .filter((m: any) => m.status === "live")
    .sort((a: any, b: any) => (a.startedAt ?? 0) - (b.startedAt ?? 0));

  const finished = [...(matches ?? [])]
    .filter((m: any) => m.status === "finished")
    .sort((a: any, b: any) => b.finishedAt - a.finishedAt);

  const managedMatch = live.find((m: any) =>
    m._id === (managingMatchId ?? (live.length > 0 ? live[0]._id : null))
  );

  const handleStart = async (match: any) => {
    try {
      await startMatch({ matchId: match._id });
      setManagingMatchId(match._id);
    } catch (err: any) {
      alert(err?.message ?? t("common.error"));
    }
  };

  const handleUpdateScore = async () => {
    if (!managedMatch || homeScore === "" || awayScore === "") return;
    setSaving(true);
    try {
      await updateScore({
        matchId: managedMatch._id,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
      });
    } catch (err: any) {
      alert(err?.message ?? t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvent = async () => {
    if (!managedMatch || eventMinute === "" || !eventDesc.trim()) return;
    try {
      await addEvent({
        matchId: managedMatch._id,
        minute: parseInt(eventMinute),
        type: eventType,
        description: eventDesc.trim(),
        team: eventTeam,
      });
      setEventMinute("");
      setEventDesc("");
    } catch (err: any) {
      alert(err?.message ?? t("common.error"));
    }
  };

  const handleFinish = async () => {
    if (!managedMatch || homeScore === "" || awayScore === "") return;
    setSaving(true);
    try {
      await finishMatch({
        matchId: managedMatch._id,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
      });
      setManagingMatchId(null);
      setHomeScore("");
      setAwayScore("");
    } catch (err: any) {
      alert(err?.message ?? t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  // ── Sub-components ──
  const ScheduledList = () =>
    scheduled.length === 0 ? (
      <p className="text-muted-foreground">{t("admin.noScheduled")}</p>
    ) : (
      <div className="space-y-3">
        {scheduled.map((match: any) => (
          <div
            key={match._id}
            className="flex items-center justify-between p-3 border rounded-lg bg-card"
          >
            <div className="flex items-center gap-4">
              <Badge variant="outline">{t("admin.groupShort")} {match.group}</Badge>
              <span className="font-medium">
                {match.homeTeam} vs {match.awayTeam}
              </span>
              <span className="text-sm text-muted-foreground">
                {new Date(match.kickoffTime).toLocaleDateString()}
              </span>
            </div>
            <Button size="sm" onClick={() => handleStart(match)}>
              {t("admin.startMatch")}
            </Button>
          </div>
        ))}
      </div>
    );

  const LivePanel = () =>
    live.length === 0 ? (
      <p className="text-muted-foreground">{t("admin.noLive")}</p>
    ) : (
      <div className="space-y-4">
        {live.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {live.map((match: any) => (
              <Button
                key={match._id}
                variant={managingMatchId === match._id ? "default" : "outline"}
                size="sm"
                onClick={() => setManagingMatchId(match._id)}
              >
                {match.homeTeam} vs {match.awayTeam}
              </Button>
            ))}
          </div>
        )}

        {managedMatch && (
          <Card className="ring-1 ring-red-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {t("admin.groupShort")} {managedMatch.group}
                  </Badge>
                  <span className="font-medium">
                    {managedMatch.homeTeam} vs {managedMatch.awayTeam}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-200">
                  LIVE
                </Badge>
              </div>
              <div className="text-center mt-2">
                <span className="text-4xl font-mono font-bold">
                  {managedMatch.homeScore ?? 0} — {managedMatch.awayScore ?? 0}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end gap-2 border rounded-lg p-3 bg-muted/30">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">{managedMatch.homeTeam}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    placeholder={String(managedMatch.homeScore ?? 0)}
                  />
                </div>
                <div className="pb-2 text-muted-foreground font-medium">-</div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">{managedMatch.awayTeam}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    placeholder={String(managedMatch.awayScore ?? 0)}
                  />
                </div>
                <Button onClick={handleUpdateScore} disabled={saving}>
                  {t("admin.updateScore")}
                </Button>
              </div>

              <div className="border rounded-lg p-3 space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" /> {t("admin.addEvent")}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.minute")}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={120}
                      value={eventMinute}
                      onChange={(e) => setEventMinute(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.eventType")}</Label>
                    <Select value={eventType} onValueChange={(v) => setEventType(v as typeof eventType)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="goal">Goal</SelectItem>
                        <SelectItem value="yellow-card">Yellow Card</SelectItem>
                        <SelectItem value="red-card">Red Card</SelectItem>
                        <SelectItem value="sub">Substitution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.eventType")}</Label>
                    <Select value={eventTeam} onValueChange={(v) => setEventTeam(v as typeof eventTeam)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">{t("admin.teamHome")}</SelectItem>
                        <SelectItem value="away">{t("admin.teamAway")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.eventDescription")}</Label>
                    <Input
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      placeholder="Player name"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddEvent}
                  disabled={eventMinute === "" || !eventDesc.trim()}
                >
                  {t("admin.addEvent")}
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Timeline</h4>
                <div className="space-y-1.5 max-h-60 overflow-auto">
                  {events?.length === 0 && (
                    <p className="text-sm text-muted-foreground">No events yet.</p>
                  )}
                  {events?.map((ev: any) => (
                    <div
                      key={ev._id}
                      className={cn(
                        "flex items-center gap-3 text-sm p-2 rounded",
                        ev.team === "home" ? "bg-muted/50" : "bg-muted/30"
                      )}
                    >
                      <span className="font-mono font-bold text-muted-foreground w-10">
                        {ev.minute}&apos;
                      </span>
                      <EventIcon type={ev.type} />
                      <span className="flex-1">{ev.description}</span>
                      <Badge variant="outline" className="text-xs">
                        {ev.team === "home"
                          ? managedMatch.homeTeam
                          : managedMatch.awayTeam}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="default"
                  onClick={handleFinish}
                  disabled={saving || homeScore === "" || awayScore === ""}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {t("admin.finishMatch")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );

  const FinishedGrid = () =>
    finished.length === 0 ? (
      <p className="text-muted-foreground">{t("admin.noFinished")}</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {finished.map((match: any) => (
          <MatchCard key={match._id} match={match} />
        ))}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> {t("nav.adminDashboard")}
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold">{t("admin.title")}</h1>

      <Tabs defaultValue="upcoming">
        <TabsList variant="line">
          <TabsTrigger value="upcoming">{t("admin.upcomingTab")}</TabsTrigger>
          <TabsTrigger value="live">{t("admin.liveTab")}</TabsTrigger>
          <TabsTrigger value="finished">{t("admin.finishedTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <ScheduledList />
        </TabsContent>

        <TabsContent value="live" className="mt-4">
          <LivePanel />
        </TabsContent>

        <TabsContent value="finished" className="mt-4">
          <FinishedGrid />
        </TabsContent>
      </Tabs>
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
