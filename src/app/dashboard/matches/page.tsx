"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import MatchCard from "@/components/match-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useLanguage } from "@/lib/i18n/language-provider";

export default function MatchesPage() {
  const { t } = useLanguage();
  const groups = useQuery(api.matches.listGroups);
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");

  const matches = useQuery(api.matches.list, {
    group: selectedGroup === "ALL" ? undefined : selectedGroup,
    status: undefined,
  });

  const sortedMatches = [...(matches ?? [])].sort(
    (a, b) => a.kickoffTime - b.kickoffTime
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("matches.title")}</h1>

      <Tabs
        value={selectedGroup}
        onValueChange={setSelectedGroup}
        className="w-full"
      >
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="ALL">{t("matches.groupAll")}</TabsTrigger>
          {groups?.map((g) => (
            <TabsTrigger key={g} value={g}>
              {t("matches.groupLabel")} {g}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedMatches.map((match: Doc<"matches">) => (
          <Link key={match._id} href={`/dashboard/matches/${match._id}`}>
            <MatchCard match={match} />
          </Link>
        ))}
      </div>
    </div>
  );
}
