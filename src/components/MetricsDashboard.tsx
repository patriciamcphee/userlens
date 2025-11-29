import { Card } from "./ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Participant } from "../App";

interface Metric {
  label: string;
  value: string | number;
  subtitle: string;
  trend?: "up" | "down";
  details?: string;
}

interface Props {
  participants: Participant[];
}

export function MetricsDashboard({ participants }: Props) {
  // Calculate metrics from participants
  const completedParticipants = participants.filter(p => p.status === "completed");
  
  const avgSUS = completedParticipants.length > 0
    ? Math.round(
        completedParticipants
          .filter(p => p.susScore)
          .reduce((sum, p) => sum + (p.susScore || 0), 0) /
        completedParticipants.filter(p => p.susScore).length
      )
    : 0;

  const participantsWithNPS = completedParticipants.filter(p => p.npsScore !== undefined && p.npsScore !== null);
  const avgNPS = participantsWithNPS.length > 0
    ? (
        participantsWithNPS
          .reduce((sum, p) => sum + (p.npsScore || 0), 0) /
        participantsWithNPS.length
      ).toFixed(1)
    : "0.0";

  const taskSuccessRate = completedParticipants.length > 0
    ? Math.round((completedParticipants.filter(p => (p.susScore || 0) >= 68).length / completedParticipants.filter(p => p.susScore).length) * 100)
    : 0;

  const avgDuration = completedParticipants.length > 0
    ? (completedParticipants.reduce((sum, p) => {
        const mins = parseInt(p.duration);
        return sum + (isNaN(mins) ? 0 : mins);
      }, 0) / completedParticipants.length).toFixed(1)
    : "0.0";

  const completionRate = participants.length > 0
    ? Math.round((completedParticipants.length / participants.length) * 100)
    : 0;

  const metrics: Metric[] = [
    {
      label: "Avg SUS Score",
      value: avgSUS,
      subtitle: avgSUS >= 68 ? "Good" : avgSUS === 0 ? "No Data" : "Below Average",
      trend: avgSUS >= 68 ? "up" : avgSUS === 0 ? undefined : "down",
    },
    {
      label: "Avg NPS",
      value: avgNPS,
      subtitle: Number(avgNPS) >= 0 && Number(avgNPS) > 0 ? "Good" : Number(avgNPS) === 0 ? "No Data" : "Needs Improvement",
      trend: Number(avgNPS) >= 0 && Number(avgNPS) > 0 ? "up" : Number(avgNPS) === 0 ? undefined : "down",
    },
    {
      label: "Task Success Rate",
      value: `${taskSuccessRate}%`,
      subtitle: taskSuccessRate >= 70 ? "Good" : taskSuccessRate === 0 ? "No Data" : "Critical Issue",
      trend: taskSuccessRate >= 70 ? "up" : taskSuccessRate === 0 ? undefined : "down",
    },
    {
      label: "Avg Time to Complete",
      value: `${avgDuration} min`,
      subtitle: Number(avgDuration) > 0 && Number(avgDuration) < 5 ? "Fast" : Number(avgDuration) === 0 ? "No Data" : "Too Long",
      trend: Number(avgDuration) > 0 && Number(avgDuration) < 5 ? "up" : Number(avgDuration) === 0 ? undefined : "down",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      subtitle: completionRate >= 80 ? "Great" : completionRate === 0 ? "No Data" : "Good Progress",
      trend: completionRate >= 80 ? "up" : completionRate === 0 ? undefined : "down",
      details: "Targets:\nSUS: ≥68 = C\nNPS: ≥0 = Okay\nTask Success: ≥70%",
    },
  ];

  return (
    <Card className="p-6 bg-white shadow-lg">
      <h2 className="mb-4">Live Metrics Tracking</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-2">
              <div className="text-3xl">{metric.value}</div>
              <div className="text-sm text-slate-600">{metric.label}</div>
              <div className="flex items-center gap-1 text-xs">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : metric.trend === "down" ? (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                ) : null}
                <span
                  className={
                    metric.trend === "up"
                      ? "text-green-600"
                      : metric.trend === "down"
                      ? "text-red-600"
                      : "text-slate-600"
                  }
                >
                  {metric.subtitle}
                </span>
              </div>
              {metric.details && (
                <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200 whitespace-pre-line">
                  {metric.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}