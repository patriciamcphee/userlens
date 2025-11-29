import { Project } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Users, Clock, MousePointer, Keyboard, Video, Mic, Download, Play } from "lucide-react";

interface AnalyticsTabProps {
  project: Project;
}

interface SessionData {
  id: string;
  timestamp: string;
  duration: number;
  tasksCompleted: number;
  totalTasks: number;
  clicks: number;
  keystrokes: number;
  recordingUrl?: string;
  participantName: string;
  participantId: string;
}

export function AnalyticsTab({ project }: AnalyticsTabProps) {
  // Debug: Log project participant data
  console.log("Analytics Tab - Project participants:", project.participants?.map(p => ({
    id: p.id,
    name: p.name,
    sessionHistoryCount: p.sessionHistory?.length || 0,
    sessionHistory: p.sessionHistory
  })));
  
  // Collect all sessions from all participants
  const allSessions: SessionData[] = [];
  
  (project.participants || []).forEach(participant => {
    if (participant.sessionHistory && participant.sessionHistory.length > 0) {
      participant.sessionHistory.forEach(session => {
        allSessions.push({
          ...session,
          participantName: participant.name,
          participantId: participant.id,
        });
      });
    }
  });

  // Sort by timestamp (newest first)
  allSessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Calculate metrics
  const totalSessions = allSessions.length;
  const completedSessions = allSessions.filter(s => s.completionRate === 100).length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  
  const avgDuration = totalSessions > 0 
    ? Math.round(allSessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions)
    : 0;
  
  const totalClicks = allSessions.reduce((sum, s) => sum + s.clicks, 0);
  const totalKeystrokes = allSessions.reduce((sum, s) => sum + s.keystrokes, 0);
  const avgInteractions = totalSessions > 0 ? Math.round((totalClicks + totalKeystrokes) / totalSessions) : 0;
  
  const avgClicks = totalSessions > 0 ? Math.round(totalClicks / totalSessions) : 0;
  const avgKeystrokes = totalSessions > 0 ? Math.round(totalKeystrokes / totalSessions) : 0;
  
  const sessionsWithVideo = allSessions.filter(s => s.recordingUrl).length;
  const sessionsWithAudio = sessionsWithVideo; // We record video+audio together

  // Format duration as "0m 30s" or "1m 20s"
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Format date
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (allSessions.length === 0) {
      alert('No session data to export');
      return;
    }

    const headers = ['Participant', 'Date', 'Duration', 'Tasks Completed', 'Total Tasks', 'Clicks', 'Keystrokes', 'Completion Rate'];
    const rows = allSessions.map(session => [
      session.participantName,
      formatDate(session.timestamp),
      formatDuration(session.duration),
      session.tasksCompleted,
      session.totalTasks,
      session.clicks,
      session.keystrokes,
      `${session.completionRate}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name}-analytics.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Total Sessions</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-slate-900">{totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 11l3 3L22 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs">Completion Rate</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-slate-900">{completionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Avg Duration</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-slate-900">{formatDuration(avgDuration)}</div>
            <p className="text-xs text-slate-500 mt-1">avg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <MousePointer className="w-4 h-4" />
              <span className="text-xs">Avg Interactions</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-slate-900">{avgInteractions}</div>
            <p className="text-xs text-slate-500 mt-1">clicks + keys</p>
          </CardContent>
        </Card>
      </div>

      {/* Mouse and Keyboard Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-blue-600">
              <MousePointer className="w-5 h-5" />
              <CardTitle className="text-base">Mouse Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <div className="text-sm text-slate-600 mb-1">Average Clicks</div>
              <div className="text-2xl text-slate-900">{avgClicks}</div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Mouse movement heatmaps and click patterns are recorded for each session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-purple-600">
              <Keyboard className="w-5 h-5" />
              <CardTitle className="text-base">Keyboard Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <div className="text-sm text-slate-600 mb-1">Average Keystrokes</div>
              <div className="text-2xl text-slate-900">{avgKeystrokes}</div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Keyboard inputs are logged to understand user interaction patterns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recording Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recording Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Video className="w-5 h-5" />
                <span className="text-sm">Video Recording</span>
              </div>
              <div className="text-2xl text-slate-900 mb-1">
                {sessionsWithVideo}/{totalSessions}
              </div>
              <p className="text-xs text-slate-500">
                {totalSessions > 0 ? Math.round((sessionsWithVideo / totalSessions) * 100) : 0}% of sessions included video
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Mic className="w-5 h-5" />
                <span className="text-sm">Audio Recording</span>
              </div>
              <div className="text-2xl text-slate-900 mb-1">
                {sessionsWithAudio}/{totalSessions}
              </div>
              <p className="text-xs text-slate-500">
                {totalSessions > 0 ? Math.round((sessionsWithAudio / totalSessions) * 100) : 0}% of sessions included audio
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-slate-900">Export Data</h3>
          <p className="text-sm text-slate-600">Download session data for further analysis</p>
        </div>
        <Button 
          onClick={handleExportCSV}
          disabled={totalSessions === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {allSessions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-slate-900 mb-2">No Sessions Yet</h3>
              <p className="text-sm text-slate-600">
                Session data will appear here once participants complete their tasks
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-slate-900">{session.participantName}</h4>
                      <p className="text-sm text-slate-500">{formatDate(session.timestamp)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.recordingUrl && (
                        <>
                          <a
                            href={session.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          >
                            <Play className="w-4 h-4" />
                          </a>
                          <Mic className="w-4 h-4 text-purple-600" />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Duration</div>
                      <div className="text-slate-900">{formatDuration(session.duration)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Tasks</div>
                      <div className="text-slate-900">{session.tasksCompleted}/{session.totalTasks}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Clicks</div>
                      <div className="text-slate-900">{session.clicks}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Keystrokes</div>
                      <div className="text-slate-900">{session.keystrokes}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
