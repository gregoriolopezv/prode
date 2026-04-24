"use client";

import { usePalette } from "@/components/theme-provider";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n/language-provider";
import { THEMES, type ThemeId } from "@/lib/themes";
import { Sun, Moon, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { selectedTheme, setThemeId } = usePalette();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <div className="flex items-center gap-1">
      {/* ── Mode toggle ────────────────────────────── */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Toggle theme"
        className="relative"
      >
        {!mounted ? (
          <Sun className="h-5 w-5" />
        ) : (
          <>
            <Sun
              className={cn(
                "h-5 w-5 transition-all",
                isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              )}
            />
            <Moon
              className={cn(
                "absolute h-5 w-5 transition-all left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
              )}
            />
          </>
        )}
      </Button>

      {/* ── Palette selector ───────────────────────── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Select theme">
            <Palette className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[10rem]">
          {THEMES.map((themeMeta) => (
            <DropdownMenuItem
              key={themeMeta.id}
              onClick={() => setThemeId(themeMeta.id)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                selectedTheme === themeMeta.id && "font-semibold"
              )}
            >
              <span
                className="inline-block w-3 h-3 rounded-full border border-border/60 flex-shrink-0"
                style={{ backgroundColor: themeMeta.swatch }}
              />
              {t(`themes.${themeMeta.id}` as const)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
