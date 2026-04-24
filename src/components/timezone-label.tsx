"use client";

import { Badge } from "@/components/ui/badge";

function getTimezoneOffsetLabel(): string {
  const now = new Date();
  const offsetMinutes = now.getTimezoneOffset(); // positive = behind UTC, negative = ahead
  const hours = Math.abs(Math.floor(offsetMinutes / 60));
  const sign = offsetMinutes > 0 ? "-" : offsetMinutes < 0 ? "+" : "";
  return `UTC${sign}${hours || ""}`;
}

export function TimezoneLabel() {
  const label = getTimezoneOffsetLabel();

  return (
    <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-1.5 py-0 font-normal tracking-wide">
      {label}
    </Badge>
  );
}
