"use client";

import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

interface Props {
  variant?: "compact" | "full";
}

export function LanguageSwitcher({ variant = "compact" }: Props) {
  const { locale, setLocale, t } = useLanguage();

  if (variant === "full") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Globe className="h-4 w-4" />
            {t(`language.${locale}`)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setLocale("en")}>
            {t("language.en")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocale("es")}>
            {t("language.es")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // compact (header) variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-medium uppercase">
            {locale}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale("en")}>
          {t("language.en")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("es")}>
          {t("language.es")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
