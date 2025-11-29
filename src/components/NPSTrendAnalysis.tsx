import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Project } from "../types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface NPSTrendAnalysisProps {
  projects: Project[];
  filterTag?: string;
}

interface TrendData {
  period: string;
  projectName: string;
  nps: number;
  promoters: number;
  passives: number;
  detractors: number;
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
    // Filter participants with NPS scores
    const participantsWithScores = proj.participants?.filter(p => 
      p.npsScore !== undefined && p.npsScore !== null
    ) || [];

    if (participantsWithScores.length === 0) return;

    // Calculate NPS for this project
    const promoters = participantsWithScores.filter(p => p.npsScore! >= 9).length;
    const passives = participantsWithScores.filter(p => p.npsScore! >= 7 && p.npsScore! <= 8).length;
    const detractors = participantsWithScores.filter(p => p.npsScore! <= 6).length;
    const count = participantsWithScores.length;
    
    const promoterPercentage = (promoters / count) * 100;
    const detractorPercentage = (detractors / count) * 100;
    const nps = Math.round(promoterPercentage - detractorPercentage);
    
    trendData.push({
      period: formatDateRange(proj.startDate, proj.endDate),
      projectName: proj.name,
      nps,
      promoters,
      passives,
      detractors,
      count,
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

function shortenPeriod(period: string): string {
  // For display in chart - shorten long date ranges
  if (period.length > 25) {
    return period.substring(0, 22) + '...';
  }
  return period;
}

function getNPSInterpretation(score: number): { label: string; color: string } {
  if (score >= 50) return { label: "Excellent", color: "text-green-600" };
  if (score >= 30) return { label: "Good", color: "text-blue-600" };
  if (score >= 0) return { label: "Needs Improvement", color: "text-yellow-600" };
  return { label: "Critical", color: "text-red-600" };
}

export function NPSTrendAnalysis({ projects, filterTag }: NPSTrendAnalysisProps) {
  const trendData = groupByProject(projects);

  if (!filterTag) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NPS Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Please select a tag to view NPS trend analysis. Use the tag filter above to analyze trends across all projects with that tag.</p>
        </CardContent>
      </Card>
    );
  }

  if (trendData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NPS Trend Analysis - {filterTag}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">No NPS scores available for projects tagged with "{filterTag}". Add NPS scores to participants in projects with this tag to see trends.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall average
  const overallAvg = Math.round(trendData.reduce((sum, d) => sum + d.nps, 0) / trendData.length);
  const overallInterpretation = getNPSInterpretation(overallAvg);

  // Calculate trend direction
  const firstScore = trendData[0].nps;
  const lastScore = trendData[trendData.length - 1].nps;
  const trendDirection = lastScore > firstScore ? "improving" : lastScore < firstScore ? "declining" : "stable";
  const trendChange = Math.abs(lastScore - firstScore);

  // Calculate totals
  const totalPromoters = trendData.reduce((sum, d) => sum + d.promoters, 0);
  const totalPassives = trendData.reduce((sum, d) => sum + d.passives, 0);
  const totalDetractors = trendData.reduce((sum, d) => sum + d.detractors, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>NPS Trend Analysis - {filterTag}</CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Showing {trendData.length} project{trendData.length !== 1 ? 's' : ''} with this tag
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-sm text-slate-600 mb-1">Overall Average NPS</div>
            <div className="text-2xl">{overallAvg}</div>
            <div className={`text-sm ${overallInterpretation.color}`}>
              {overallInterpretation.label}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-700 mb-1">Promoters (9-10)</div>
            <div className="text-2xl text-green-900">{totalPromoters}</div>
            <div className="text-sm text-green-600">Total across projects</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-700 mb-1">Passives (7-8)</div>
            <div className="text-2xl text-yellow-900">{totalPassives}</div>
            <div className="text-sm text-yellow-600">Total across projects</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-700 mb-1">Detractors (0-6)</div>
            <div className="text-2xl text-red-900">{totalDetractors}</div>
            <div className="text-sm text-red-600">Total across projects</div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full">
          <ResponsiveContainer width="100%" height={320} key={`nps-${filterTag}`}>
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
                domain={[-100, 100]} 
                label={{ value: 'NPS Score', angle: -90, position: 'insideLeft' }}
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
                          <span className="font-medium">NPS Score:</span> {data.nps}
                        </p>
                        <p className="text-sm text-green-600">Promoters: {data.promoters}</p>
                        <p className="text-sm text-yellow-600">Passives: {data.passives}</p>
                        <p className="text-sm text-red-600">Detractors: {data.detractors}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="#94a3b8" strokeDasharray="3 3" label="Good (30)" />
              <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" label="Excellent (50)" />
              <Line 
                type="monotone" 
                dataKey="nps" 
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
          <h3 className="text-lg mb-3">NPS Breakdown:</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-indigo-100 border-b border-indigo-200">
                  <th className="text-left py-3 px-4 text-indigo-900">Period</th>
                  <th className="text-left py-3 px-4 text-indigo-900">NPS Score</th>
                  <th className="text-left py-3 px-4 text-indigo-900">Promoters</th>
                  <th className="text-left py-3 px-4 text-indigo-900">Passives</th>
                  <th className="text-left py-3 px-4 text-indigo-900">Detractors</th>
                  <th className="text-left py-3 px-4 text-indigo-900">Total</th>
                  <th className="text-left py-3 px-4 text-indigo-900">Assessment</th>
                </tr>
              </thead>
              <tbody>
                {trendData.map((data, index) => {
                  const interpretation = getNPSInterpretation(data.nps);
                  return (
                    <tr 
                      key={`${data.projectName}-${index}`}
                      className={`border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                    >
                      <td className="py-3 px-4 text-slate-900">{data.period}</td>
                      <td className="py-3 px-4">
                        <span className={interpretation.color}>{data.nps}</span>
                      </td>
                      <td className="py-3 px-4 text-green-600">{data.promoters}</td>
                      <td className="py-3 px-4 text-yellow-600">{data.passives}</td>
                      <td className="py-3 px-4 text-red-600">{data.detractors}</td>
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
              NPS is <span className="font-medium capitalize">{trendDirection}</span>
              {trendDirection !== "stable" && (
                <> by {trendChange} points from {trendData[0].projectName} ({firstScore}) to {trendData[trendData.length - 1].projectName} ({lastScore})</>
              )}
            </p>
          </div>
        )}

        {/* Interpretation Guide */}
        <div className="bg-slate-50 p-4 rounded-lg text-sm">
          <h4 className="mb-2">NPS Score Interpretation:</h4>
          <ul className="space-y-1 text-slate-600">
            <li><span className="text-green-600">• Excellent (50+):</span> World-class customer loyalty</li>
            <li><span className="text-blue-600">• Good (30-49):</span> Strong loyalty, room for improvement</li>
            <li><span className="text-yellow-600">• Needs Improvement (0-29):</span> Neutral to slightly positive</li>
            <li><span className="text-red-600">• Critical (&lt;0):</span> More detractors than promoters</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}