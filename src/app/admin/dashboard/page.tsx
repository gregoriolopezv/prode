"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";
import { Users, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const me = useQuery(api.users.me);
  const users = useQuery(api.users.list);
  const leagues = useQuery(api.leagues.listAll);

  if (me === undefined || users === undefined || leagues === undefined) {
    return (
      <div className="max-w-5xl mx-auto">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!me || me.role !== "admin") {
    router.push("/dashboard/leagues");
    return null;
  }

  const totalUsers = users.length;
  const totalLeagues = leagues.length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("nav.adminDashboard")}</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/matches")}>
          {t("nav.adminMatches")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.totalUsers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.totalLeagues")}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLeagues}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("admin.usersListTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!users.length ? (
            <p className="text-muted-foreground">{t("admin.noUsers")}</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="p-3 font-medium">{t("admin.name")}</th>
                    <th className="p-3 font-medium">{t("admin.email")}</th>
                    <th className="p-3 font-medium">{t("admin.role")}</th>
                    <th className="p-3 font-medium">{t("admin.locale")}</th>
                    <th className="p-3 font-medium">{t("admin.joined")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-muted/50">
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                            u.role === "admin"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">{u.locale?.toUpperCase() ?? "-"}</td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
