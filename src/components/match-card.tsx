import TeamFlag from "@/components/team-flag";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: {
    _id: string;
    homeTeam: string;
    awayTeam: string;
    group: string;
    kickoffTime: number;
    homeScore?: number;
    awayScore?: number;
    status?: string;
  };
  prediction?: {
    homeScore: number;
    awayScore: number;
    pointsEarned?: number;
  };
}

export default function MatchCard({ match, prediction }: MatchCardProps) {
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  const dateStr = new Date(match.kickoffTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const timeStr = new Date(match.kickoffTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const showScore = isLive || isFinished;

  return (
    <Card className={cn("hover:bg-muted/50 transition-colors", isLive ? "ring-1 ring-red-500/30" : "")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline">Group {match.group}</Badge>
          {isLive ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold text-red-500">LIVE</span>
            </div>
          ) : isFinished ? (
            <Badge variant="secondary">Finished</Badge>
          ) : (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {dateStr} {timeStr}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Home team */}
          <div className="flex-1">
            <div className="flex items-center gap-2 font-semibold">
              <TeamFlag team={match.homeTeam} />
              <span>{match.homeTeam}</span>
            </div>
            {showScore && match.homeScore !== undefined && (
              <div className="text-lg font-bold mt-0.5">{match.homeScore}</div>
            )}
          </div>

          <div className="text-sm text-muted-foreground font-medium">vs</div>

          {/* Away team */}
          <div className="flex-1 text-right">
            <div className="flex items-center gap-2 font-semibold justify-end">
              <span>{match.awayTeam}</span>
              <TeamFlag team={match.awayTeam} />
            </div>
            {showScore && match.awayScore !== undefined && (
              <div className="text-lg font-bold mt-0.5">{match.awayScore}</div>
            )}
          </div>
        </div>

        {prediction && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/40">
            <span className="text-muted-foreground">
              Your prediction: {prediction.homeScore} - {prediction.awayScore}
            </span>
            {prediction.pointsEarned !== undefined && (
              <span className="flex items-center gap-1 font-medium">
                <Trophy className="h-3.5 w-3.5 text-yellow-500" /> {prediction.pointsEarned} pts
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
