import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Project } from "../types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface SUSTrendAnalysisProps {
  projects: Project[];
  filterTag?: string;
}

interface TrendData {
  period: string;
  projectName: string;
  avgScore: number;
  count: number;
  startDate: string;
  endDate: string;
}

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return 'No dates';
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };
  
  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  } else if (startDate) {
    return `From ${formatDate(startDate)}`;
  } else if (endDate) {
    return `Until ${formatDate(endDate)}`;
  }
  return 'No dates';
}

function groupByProject(projects: Project[]): TrendData[] {
  const trendData: TrendData[] = [];

  projects.forEach(proj => {
    // Filter participants with SUS scores
    const participantsWithScores = proj.participants?.filter(p => 
      p.susScore !== undefined && p.susScore !== null
    ) || [];

    if (participantsWithScores.length === 0) return;

    // Calculate average SUS for this project
    const avgScore = participantsWithScores.reduce((sum, p) => sum + p.susScore!, 0) / participantsWithScores.length;
    
    trendData.push({
      period: formatDateRange(proj.startDate, proj.endDate),
      projectName: proj.name,
      avgScore: Math.round(avgScore * 100) / 100,
      count: participantsWithScores.length,
      startDate: proj.startDate || '',
      endDate: proj.endDate || ''
    });
  });

  // Sort by start date
  return trendData.sort((a, b) => {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return a.startDate.localeCompare(b.startDate);
  });
}

function getScoreInterpretation(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "text-green-600" };
  if (score >= 68) return { label: "Good", color: "text-blue-600" };
  if (score >= 51) return { label: "OK", color: "text-yellow-600" };
  return { label: "Poor", color: "text-red-600" };
}

export function SUSTrendAnalysis({ projects, filterTag }: SUSTrendAnalysisProps) {
  const trendData = groupByProject(projects);

  if (!filterTag) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SUS Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Please select a tag to view SUS trend analysis. Use the tag filter above to analyze trends across all projects with that tag.</p>
        </CardContent>
      </Card>
    );
  }

  if (trendData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SUS Trend Analysis - {filterTag}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">No SUS scores available for projects tagged with "{filterTag}". Add SUS scores to participants in projects with this tag to see trends.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall average
  const overallAvg = trendData.reduce((sum, d) => sum + d.avgScore, 0) / trendData.length;
  const overallInterpretation = getScoreInterpretation(overallAvg);

  // Calculate trend direction
  const firstScore = trendData[0].avgScore;
  const lastScore = trendData[trendData.length - 1].avgScore;
  const trendDirection = lastScore > firstScore ? "improving" : lastScore < firstScore ? "declining" : "stable";
  const trendChange = Math.abs(lastScore - firstScore);

  const totalParticipants = trendData.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>SUS Trend Analysis - {filterTag}</CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Showing {trendData.length} project{trendData.length !== 1 ? 's' : ''} with this tag
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-sm text-slate-600 mb-1">Overall Average</div>
            <div className="text-2xl">{overallAvg.toFixed(2)}</div>
            <div className={`text-sm ${overallInterpretation.color}`}>
              {overallInterpretation.label}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-sm text-slate-600 mb-1">Trend</div>
            <div className="text-2xl capitalize">{trendDirection}</div>
            <div className="text-sm text-slate-600">
              {trendDirection !== "stable" && `${trendChange.toFixed(1)} points`}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-sm text-slate-600 mb-1">Total Projects</div>
            <div className="text-2xl">{trendData.length}</div>
            <div className="text-sm text-slate-600">
              {totalParticipants} participants
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full">
          <ResponsiveContainer width="100%" height={320} key={`sus-${filterTag}`}>
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="projectName"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]} 
                label={{ value: 'SUS Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TrendData;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                        <p className="font-semibold">{data.projectName}</p>
                        <p className="text-sm text-slate-600">{data.period}</p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Average SUS:</span> {data.avgScore.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-600">Participants: {data.count}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={68} stroke="#94a3b8" strokeDasharray="3 3" label="Good (68)" />
              <Line 
                type="monotone" 
                dataKey="avgScore" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div>
          <h3 className="text-lg mb-3">SUS Breakdown:</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-indigo-100 border-b border-indigo-200">
                  <th className="text-left py-3 px-4 text-indigo-900">Period</th>
                  <th className="text-left py-3 px-4 text-indigo-900">Average SUS Score</th>
                  <th className="text-left py-3 px-4 text-indigo-900">Participants</th>
                  <th className="text-left py-3 px-4 text-indigo-900">Assessment</th>
                </tr>
              </thead>
              <tbody>
                {trendData.map((data, index) => {
                  const interpretation = getScoreInterpretation(data.avgScore);
                  return (
                    <tr 
                      key={`${data.projectName}-${index}`}
                      className={`border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                    >
                      <td className="py-3 px-4 text-slate-900">{data.period}</td>
                      <td className="py-3 px-4">
                        <span className="text-slate-900">{data.avgScore.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{data.count}</td>
                      <td className="py-3 px-4">
                        <span className={interpretation.color}>{interpretation.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend Summary */}
        {trendData.length > 1 && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="mb-2">Trend Summary:</h4>
            <p className="text-slate-700">
              SUS score is <span className="font-medium capitalize">{trendDirection}</span>
              {trendDirection !== "stable" && (
                <> by {trendChange.toFixed(1)} points from {trendData[0].projectName} ({firstScore.toFixed(2)}) to {trendData[trendData.length - 1].projectName} ({lastScore.toFixed(2)})</>
              )}
            </p>
          </div>
        )}

        {/* Interpretation Guide */}
        <div className="bg-slate-50 p-4 rounded-lg text-sm">
          <h4 className="mb-2">SUS Score Interpretation:</h4>
          <ul className="space-y-1 text-slate-600">
            <li><span className="text-green-600">• Excellent (80+):</span> Best imaginable usability</li>
            <li><span className="text-blue-600">• Good (68-79):</span> Above average usability</li>
            <li><span className="text-yellow-600">• OK (51-67):</span> Below average usability</li>
            <li><span className="text-red-600">• Poor (0-50):</span> Worst imaginable usability</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}