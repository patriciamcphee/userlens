import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Participant } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SUSChartProps {
  participants: Participant[];
}

// Colors for the pie chart
const COLORS = {
  Excellent: '#10b981', // green-500
  Good: '#3b82f6', // blue-500
  BelowAverage: '#f59e0b', // amber-500
  Poor: '#ef4444', // red-500
};

// Helper function to determine SUS category based on score
function getSUSCategory(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 68) return "Good";
  if (score >= 51) return "BelowAverage";
  return "Poor";
}

function getCategoryLabel(category: string): string {
  if (category === "BelowAverage") return "Below Average";
  return category;
}

export function SUSChart({ participants }: SUSChartProps) {
  // Calculate SUS metrics
  const participantsWithScores = participants.filter(p => p.susScore !== undefined && p.susScore !== null);
  const excellent = participantsWithScores.filter(p => p.susScore! >= 80).length;
  const good = participantsWithScores.filter(p => p.susScore! >= 68 && p.susScore! < 80).length;
  const belowAverage = participantsWithScores.filter(p => p.susScore! >= 51 && p.susScore! < 68).length;
  const poor = participantsWithScores.filter(p => p.susScore! <= 50).length;
  const total = participantsWithScores.length;
  
  const avgSUS = total > 0 
    ? Math.round(participantsWithScores.reduce((sum, p) => sum + (p.susScore || 0), 0) / total)
    : 0;

  // Prepare data for pie chart
  const pieData = [
    { name: 'Excellent', value: excellent, category: 'Excellent' },
    { name: 'Good', value: good, category: 'Good' },
    { name: 'Below Average', value: belowAverage, category: 'BelowAverage' },
    { name: 'Poor', value: poor, category: 'Poor' },
  ].filter(item => item.value > 0); // Only show categories with data

  // Custom label for pie chart
  const renderLabel = (entry: any) => {
    const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
    return `${entry.name}: ${entry.value} (${percent}%)`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SUS Scores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pie Chart */}
        {total > 0 ? (
          <div className="w-full" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.category as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} participants`, 'Count']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            No SUS scores available yet
          </div>
        )}

        {/* SUS Summary */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg mb-4">SUS Score Summary:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-700">Excellent (80-100):</span>
              <span className="font-medium">{excellent} participants</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-700">Good (68-79):</span>
              <span className="font-medium">{good} participants</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-700">OK (51-67):</span>
              <span className="font-medium">{belowAverage} participants</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-700">Poor (0-50):</span>
              <span className="font-medium">{poor} participants</span>
            </div>
            <div className="flex items-center gap-2 text-lg mt-4 pt-4 border-t border-slate-200">
              <span className="text-slate-700">Average SUS Score:</span>
              <span className={`text-2xl ${avgSUS >= 80 ? 'text-green-600' : avgSUS >= 68 ? 'text-blue-600' : avgSUS >= 51 ? 'text-amber-600' : 'text-red-600'}`}>
                {avgSUS}
              </span>
              <span className="text-slate-600 text-sm ml-2">
                ({avgSUS >= 80 ? 'Excellent' : avgSUS >= 68 ? 'Good' : avgSUS >= 51 ? 'OK' : 'Poor'})
              </span>
            </div>
          </div>
        </div>

        {/* SUS Score Interpretation */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg mb-3">SUS Score Interpretation:</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-600">•</span>
              <div>
                <span className="text-green-600">Excellent (80+):</span>
                <span className="text-slate-600"> Best imaginable usability</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <div>
                <span className="text-blue-600">Good (68-79):</span>
                <span className="text-slate-600"> Above average usability</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-600">•</span>
              <div>
                <span className="text-amber-600">OK (51-67):</span>
                <span className="text-slate-600"> Below average usability</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <div>
                <span className="text-red-600">Poor (0-50):</span>
                <span className="text-slate-600"> Worst imaginable usability</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
