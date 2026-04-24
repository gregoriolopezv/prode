"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useAuthSync } from "@/hooks/use-auth-sync";
import { UserProfile } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { Globe, Palette, Settings } from "lucide-react";

export default function SettingsPage() {
  useAuthSync();
  const { t } = useLanguage();
  const { isSignedIn } = useAuth();
  const user = useQuery(api.users.me);

  const updateDefault = useMutation(api.users.updateDefaultPrediction);

  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.defaultPrediction) {
      setHomeScore(String(user.defaultPrediction.homeScore));
      setAwayScore(String(user.defaultPrediction.awayScore));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (homeScore === "" || awayScore === "") return;
    setSaving(true);
    try {
      await updateDefault({
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.general")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {/* Language */}
          <div className="flex items-center justify-between py-3 border-b border-border/40">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{t("settings.language")}</span>
            </div>
            <LanguageSwitcher variant="full" />
          </div>

          {/* Theme + Dark mode */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{t("settings.theme")}</span>
            </div>
            <ThemeSwitcher variant="full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.defaultPrediction")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("settings.defaultPredictionDesc")}
          </p>
          <form onSubmit={handleSave} className="flex items-end gap-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Home</Label>
              <Input
                type="number"
                min={0}
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="w-20"
              />
            </div>
            <span className="pb-2 text-muted-foreground font-medium">-</span>
            <div className="space-y-2">
              <Label className="text-xs">Away</Label>
              <Input
                type="number"
                min={0}
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="w-20"
              />
            </div>

            <Button
              type="submit"
              disabled={saving || homeScore === "" || awayScore === ""}
              className="ml-auto"
            >
              {saving ? t("settings.saving") : saved ? t("settings.saved") : t("settings.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.userSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="m-0 p-0">
          {isSignedIn && <UserProfile routing="hash" />}
        </CardContent>
      </Card>
    </div>
  );
}
