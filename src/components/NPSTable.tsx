import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Participant } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface NPSTableProps {
  participants: Participant[];
  projectId: string;
  onUpdate: () => void;
}

// Colors for the pie chart
const COLORS = {
  Promoter: '#10b981', // green-500
  Passive: '#f59e0b', // amber-500
  Detractor: '#ef4444', // red-500
};

export function NPSTable({ participants }: NPSTableProps) {

  // Calculate NPS metrics
  const participantsWithScores = participants.filter(p => p.npsScore !== undefined && p.npsScore !== null);
  const promoters = participantsWithScores.filter(p => p.npsScore! >= 9).length;
  const passives = participantsWithScores.filter(p => p.npsScore! >= 7 && p.npsScore! <= 8).length;
  const detractors = participantsWithScores.filter(p => p.npsScore! <= 6).length;
  const total = participantsWithScores.length;
  
  const promoterPercentage = total > 0 ? Math.round((promoters / total) * 100) : 0;
  const detractorPercentage = total > 0 ? Math.round((detractors / total) * 100) : 0;
  const npsScore = promoterPercentage - detractorPercentage;

  // Prepare data for pie chart
  const pieData = [
    { name: 'Promoter', value: promoters, category: 'Promoter' },
    { name: 'Passive', value: passives, category: 'Passive' },
    { name: 'Detractor', value: detractors, category: 'Detractor' },
  ].filter(item => item.value > 0); // Only show categories with data

  // Custom label for pie chart
  const renderLabel = (entry: any) => {
    const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
    return `${entry.name}: ${entry.value} (${percent}%)`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>NPS Scores</CardTitle>
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
            No NPS scores available yet
          </div>
        )}

        {/* NPS Calculation */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg mb-4">NPS Calculation:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-700">Promoters:</span>
              <span className="font-medium">{promoters} out of {total} = {promoterPercentage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-700">Detractors:</span>
              <span className="font-medium">{detractors} out of {total} = {detractorPercentage}%</span>
            </div>
            <div className="flex items-center gap-2 text-lg mt-4 pt-4 border-t border-slate-200">
              <span className="text-slate-700">NPS =</span>
              <span className="font-medium">{promoterPercentage}% - {detractorPercentage}% =</span>
              <span className={`text-2xl ${npsScore >= 50 ? 'text-green-600' : npsScore >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {npsScore}
              </span>
              <span className="text-slate-600 text-sm ml-2">
                ({npsScore >= 50 ? 'Excellent' : npsScore >= 30 ? 'Good' : npsScore >= 0 ? 'Needs Improvement' : 'Critical'})
              </span>
            </div>
          </div>
        </div>

        {/* NPS Score Interpretation */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg mb-3">NPS Score Interpretation:</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-600">•</span>
              <div>
                <span className="text-green-600">Excellent (50+):</span>
                <span className="text-slate-600"> World-class customer loyalty</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <div>
                <span className="text-blue-600">Good (30-49):</span>
                <span className="text-slate-600"> Strong loyalty, room for improvement</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-600">•</span>
              <div>
                <span className="text-amber-600">Needs Improvement (0-29):</span>
                <span className="text-slate-600"> Neutral to slightly positive</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <div>
                <span className="text-red-600">Critical (&lt;0):</span>
                <span className="text-slate-600"> More detractors than promoters</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}