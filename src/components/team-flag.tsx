import { getTeamFlagCode } from "@/lib/flags";

interface TeamFlagProps {
  team: string;
  className?: string;
}

export default function TeamFlag({ team, className }: TeamFlagProps) {
  const code = getTeamFlagCode(team);
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={team}
      className={className ?? "size-5 rounded-full object-cover"}
    />
  );
}