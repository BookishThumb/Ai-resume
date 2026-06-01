import { Badge } from "@/components/ui/badge";

interface ScoreBadgeProps {
  score?: number | null;
  recommendation?: string | null;
  size?: "sm" | "md";
}

export default function ScoreBadge({ score, recommendation, size = "md" }: ScoreBadgeProps) {
  const rec = recommendation ?? getRecommendation(score);

  const config: Record<string, { color: string; bg: string }> = {
    "Strong Hire": { color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
    "Hire": { color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30" },
    "Maybe": { color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
    "Reject": { color: "text-red-400", bg: "bg-red-500/15 border-red-500/30" },
  };

  const { color, bg } = config[rec] ?? { color: "text-muted-foreground", bg: "bg-muted/20 border-muted/30" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${color} ${bg}`}
      data-testid="score-badge">
      {score != null && <span>{score.toFixed(1)}</span>}
      <span>{rec}</span>
    </span>
  );
}

export function getRecommendation(score?: number | null): string {
  if (score == null) return "Pending";
  if (score >= 90) return "Strong Hire";
  if (score >= 80) return "Hire";
  if (score >= 65) return "Maybe";
  return "Reject";
}

export function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#ffffff0d" strokeWidth={6} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={6} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>
        {score.toFixed(0)}
      </span>
    </div>
  );
}
