"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useAuthSync } from "@/hooks/use-auth-sync";
import { Button } from "@/components/ui/button";
import { TimezoneLabel } from "@/components/timezone-label";
import { useLanguage } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";
import { Trophy, Calendar, Users, Settings } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthSync();
  const pathname = usePathname();
  const { userId } = useAuth();
  const { t } = useLanguage();

  const primaryNav = [
    { href: "/dashboard/leagues", label: t("nav.leagues"), icon: Users },
    { href: "/dashboard/matches", label: t("nav.matches"), icon: Calendar },
    { href: "/dashboard/rankings", label: t("nav.rankings"), icon: Trophy },
  ];

  const isSettingsActive = pathname.startsWith("/dashboard/settings");

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center h-14 px-4 max-w-7xl mx-auto gap-4">
          <Link href="/dashboard/leagues" className="flex items-center gap-2 font-bold text-lg mr-auto">
            <Trophy className="h-5 w-5 text-primary" />
            Prode 2026
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {primaryNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={active ? "secondary" : "ghost"} size="sm" className="gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <TimezoneLabel />
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon" aria-label={t("nav.settings")}>
              <Settings className={cn("h-5 w-5", isSettingsActive ? "text-primary" : "text-muted-foreground")} />
            </Button>
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full pb-24 sm:pb-6">
        {children}
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-around h-14 px-4 max-w-7xl mx-auto">
          {primaryNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
                <item.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-xs ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
