"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useAuthSync } from "@/hooks/use-auth-sync";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { TimezoneLabel } from "@/components/timezone-label";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Trophy, LayoutDashboard, Calendar } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthSync();
  const pathname = usePathname();
  const { userId } = useAuth();
  const { t } = useLanguage();

  const nav = [
    { href: "/admin/dashboard", label: t("nav.adminDashboard"), icon: LayoutDashboard },
    { href: "/admin/matches", label: t("nav.adminMatches"), icon: Calendar },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center h-14 px-4 max-w-7xl mx-auto gap-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg mr-auto">
            <Trophy className="h-5 w-5 text-primary" />
            Prode 2026 Admin
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {nav.map((item) => {
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

          <Link href="/dashboard/leagues">
            <Button variant="ghost" size="sm">
              {t("nav.dashboard")}
            </Button>
          </Link>

          <LanguageSwitcher />
          <ThemeSwitcher />
          <TimezoneLabel />
          <UserButton />
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <nav className="sm:hidden sticky bottom-0 border-t border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-around h-14 px-4 max-w-7xl mx-auto">
          {nav.map((item) => {
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
