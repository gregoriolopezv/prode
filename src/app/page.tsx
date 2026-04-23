"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, Shield } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col flex-1">
      {/* Hero */}
      <section className="flex flex-1 items-center justify-center py-24 px-6 text-center">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {t("home.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t("home.subtitle")}
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg">{t("home.getStarted")}</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg">{t("home.signIn")}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Trophy className="h-6 w-6" />}
            title={t("home.featureCompete")}
            description={t("home.featureCompeteDesc")}
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title={t("home.featurePrivateLeagues")}
            description={t("home.featurePrivateLeaguesDesc")}
          />
          <FeatureCard
            icon={<Calendar className="h-6 w-6" />}
            title={t("home.featureAllMatches")}
            description={t("home.featureAllMatchesDesc")}
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title={t("home.featureFairPlay")}
            description={t("home.featureFairPlayDesc")}
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-3 p-4">
      <div className="p-3 rounded-full bg-primary/10 text-primary">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
