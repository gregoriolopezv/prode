"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Link from "next/link";
import { Plus, Search, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";

export default function LeaguesPage() {
  const { t } = useLanguage();
  const leagues = useQuery(api.leagues.list);
  const create = useMutation(api.leagues.create);
  const join = useMutation(api.leagues.join);

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const [newLeagueName, setNewLeagueName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [joinError, setJoinError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeagueName.trim()) return;
    setCreateLoading(true);
    setCreateError("");
    try {
      await create({ name: newLeagueName.trim() });
      setNewLeagueName("");
      setCreateOpen(false);
    } catch (err: any) {
      setCreateError(err?.message ?? "Failed to create league");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setJoinLoading(true);
    setJoinError("");
    try {
      await join({ inviteCode: inviteCode.trim() });
      setInviteCode("");
      setJoinOpen(false);
    } catch (err: any) {
      setJoinError(err?.message ?? "Failed to join league");
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("leagues.title")}</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* ── Create League Drawer ── */}
        <Drawer open={createOpen} onOpenChange={setCreateOpen}>
          <DrawerTrigger asChild>
            <Button variant="default">
              <Plus data-icon="inline-start" />
              {t("leagues.createTitle")}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t("leagues.createTitle")}</DrawerTitle>
              <DrawerDescription>{t("leagues.createDesc")}</DrawerDescription>
            </DrawerHeader>
            <form
              id="create-league-form"
              onSubmit={handleCreate}
              className="flex flex-col gap-4 px-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="league-name">{t("leagues.createLabel")}</Label>
                <Input
                  id="league-name"
                  placeholder={t("leagues.createPlaceholder")}
                  value={newLeagueName}
                  onChange={(e) => setNewLeagueName(e.target.value)}
                />
              </div>
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
            </form>
            <DrawerFooter>
              <Button
                type="submit"
                form="create-league-form"
                disabled={createLoading || !newLeagueName.trim()}
              >
                {createLoading ? t("leagues.creating") : t("leagues.createButton")}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">{t("common.cancel")}</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* ── Join League Drawer ── */}
        <Drawer open={joinOpen} onOpenChange={setJoinOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline">
              <Search data-icon="inline-start" />
              {t("leagues.joinTitle")}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t("leagues.joinTitle")}</DrawerTitle>
              <DrawerDescription>{t("leagues.joinDesc")}</DrawerDescription>
            </DrawerHeader>
            <form
              id="join-league-form"
              onSubmit={handleJoin}
              className="flex flex-col gap-4 px-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="invite-code">{t("leagues.joinLabel")}</Label>
                <Input
                  id="invite-code"
                  placeholder={t("leagues.joinPlaceholder")}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
              </div>
              {joinError && (
                <p className="text-sm text-destructive">{joinError}</p>
              )}
            </form>
            <DrawerFooter>
              <Button
                type="submit"
                form="join-league-form"
                disabled={joinLoading || !inviteCode.trim()}
              >
                {joinLoading ? t("leagues.joining") : t("leagues.joinButton")}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">{t("common.cancel")}</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* ── Your Leagues ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("leagues.yourLeagues")}</h2>
        {leagues === undefined ? (
          <p className="text-muted-foreground">{t("leagues.loading")}</p>
        ) : leagues === null || leagues.length === 0 ? (
          <p className="text-muted-foreground">{t("leagues.empty")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leagues.map((league) =>
              league ? (
                <Link key={league._id} href={`/dashboard/leagues/${league._id}`}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{league.name}</h3>
                        <Badge variant="secondary">{league.inviteCode}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" /> {league.totalPoints} {t("leagues.pts")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
