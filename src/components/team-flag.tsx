import { getTeamEmoji } from "@/lib/flags";

interface TeamFlagProps {
  team: string;
  className?: string;
}

export default function TeamFlag({ team, className }: TeamFlagProps) {
  const emoji = getTeamEmoji(team);
  if (!emoji) return null;
  return <span className={`text-3xl leading-none ${className ?? ''}`} aria-label={`${team} flag`}>{emoji}</span>;
}
