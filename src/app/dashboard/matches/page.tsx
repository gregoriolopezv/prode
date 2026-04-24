"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import MatchCard from "@/components/match-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t("matches.title")}</h1>

      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
        <SelectTrigger className="md:hidden w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("matches.groupAll")}</SelectItem>
          {groups?.map((g) => (
            <SelectItem key={g} value={g}>
              {t("matches.groupLabel")} {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Tabs
        value={selectedGroup}
        onValueChange={setSelectedGroup}
        className="w-full"
      >
        <TabsList className="hidden md:flex flex-wrap min-h-12">
          <TabsTrigger value="ALL">{t("matches.groupAll")}</TabsTrigger>
          {groups?.map((g) => (
            <TabsTrigger key={g} value={g}>
              {t("matches.groupLabel")} {g}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start mt-4">
          {sortedMatches.map((match: Doc<"matches">) => (
            <Link key={match._id} href={`/dashboard/matches/${match._id}`}>
              <MatchCard match={match} />
            </Link>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
