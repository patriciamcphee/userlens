// components/ProjectDetail/AnalyticsTab.tsx
import React, { useState } from 'react';
import { Users, TrendingUp, Clock, Activity, Mouse, Keyboard, Video, Mic, BarChart3, Mail, Download, Play, FileVideo, FileAudio } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Project, Session } from '../../types';
import { getAnalytics, exportToCSV } from '../../utils';
import { formatBytes, formatDuration } from '../../utils/recording';

interface AnalyticsTabProps {
  project: Project;
}

export function AnalyticsTab({ project }: AnalyticsTabProps) {
  const { state } = useAppContext();
  const analytics = getAnalytics(project);
  const [playingRecording, setPlayingRecording] = useState<{ sessionId: number; type: 'screen' | 'audio' } | null>(null);

  // Calculate recording statistics
  const recordingStats = {
    totalScreenRecordings: project.sessions.filter(s => s.recordings?.screen?.available).length,
    totalAudioRecordings: project.sessions.filter(s => s.recordings?.audio?.available).length,
    totalScreenSize: project.sessions.reduce((acc, s) => acc + (s.recordings?.screen?.size || 0), 0),
    totalAudioSize: project.sessions.reduce((acc, s) => acc + (s.recordings?.audio?.size || 0), 0),
    avgScreenDuration: project.sessions.filter(s => s.recordings?.screen).length > 0
      ? Math.round(project.sessions.reduce((acc, s) => acc + (s.recordings?.screen?.duration || 0), 0) / project.sessions.filter(s => s.recordings?.screen).length)
      : 0,
    avgAudioDuration: project.sessions.filter(s => s.recordings?.audio).length > 0
      ? Math.round(project.sessions.reduce((acc, s) => acc + (s.recordings?.audio?.duration || 0), 0) / project.sessions.filter(s => s.recordings?.audio).length)
      : 0
  };
// (removed duplicate state and component declaration)

if (analytics.totalSessions === 0) {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No session data yet</h3>
      <p className="text-gray-600">Analytics will appear here once participants complete sessions</p>
    </div>
  );
}

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Sessions</div>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{analytics.totalSessions}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Completion Rate</div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{analytics.completionRate}%</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Avg Duration</div>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {Math.floor(analytics.avgDuration / 60)}m
          </div>
          <div className="text-xs text-gray-600">{analytics.avgDuration % 60}s</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Avg Interactions</div>
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.avgClicks + analytics.avgKeystrokes}
          </div>
          <div className="text-xs text-gray-600">clicks + keys</div>
        </div>
      </div>

      {/* Interaction Analytics */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Mouse className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Mouse Activity</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Average Clicks</span>
                <span className="text-lg font-bold text-gray-900">{analytics.avgClicks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min((analytics.avgClicks / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Mouse movement heatmaps and click patterns are recorded for each session
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Keyboard className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Keyboard Activity</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Average Keystrokes</span>
                <span className="text-lg font-bold text-gray-900">{analytics.avgKeystrokes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min((analytics.avgKeystrokes / 200) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Keyboard inputs are logged to understand user interaction patterns
            </div>
          </div>
        </div>
      </div>

      {/* Recording Usage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recording Usage</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <Video className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Video Recording</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.videoUsage}/{analytics.totalSessions}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all" 
                style={{ width: `${(analytics.videoUsage / analytics.totalSessions) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {Math.round((analytics.videoUsage / analytics.totalSessions) * 100)}% of sessions included video
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <Mic className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-900">Audio Recording</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.audioUsage}/{analytics.totalSessions}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all" 
                style={{ width: `${(analytics.audioUsage / analytics.totalSessions) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {Math.round((analytics.audioUsage / analytics.totalSessions) * 100)}% of sessions included audio
            </div>
          </div>
        </div>
      </div>

      {/* Recording Analytics */}
      {(recordingStats.totalScreenRecordings > 0 || recordingStats.totalAudioRecordings > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recording Analytics</h3>
          <div className="grid grid-cols-2 gap-6">
            {recordingStats.totalScreenRecordings > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <FileVideo className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-900">Screen Recordings</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Recordings</span>
                    <span className="font-semibold text-gray-900">{recordingStats.totalScreenRecordings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Size</span>
                    <span className="font-semibold text-gray-900">{formatBytes(recordingStats.totalScreenSize)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Duration</span>
                    <span className="font-semibold text-gray-900">{formatDuration(recordingStats.avgScreenDuration)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(recordingStats.totalScreenRecordings / analytics.totalSessions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {recordingStats.totalAudioRecordings > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <FileAudio className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-900">Audio Recordings</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Recordings</span>
                    <span className="font-semibold text-gray-900">{recordingStats.totalAudioRecordings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Size</span>
                    <span className="font-semibold text-gray-900">{formatBytes(recordingStats.totalAudioSize)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Duration</span>
                    <span className="font-semibold text-gray-900">{formatDuration(recordingStats.avgAudioDuration)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(recordingStats.totalAudioRecordings / analytics.totalSessions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Export Data</h3>
            <p className="text-sm text-gray-600">
              Download session data for further analysis
            </p>
          </div>
          <button
            onClick={() => exportToCSV(project, state.participants)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Session History</h3>
        <div className="space-y-3">
          {project.sessions.map(session => {
            const participant = state.participants.find(p => p.id === session.participantId);
            const hasFeedback = session.taskFeedback && session.taskFeedback.some(f => f.answer.trim());
            const hasObservations = session.observations && session.observations.trim();
            
            return (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{participant?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(session.completedAt).toLocaleDateString()} at{' '}
                      {new Date(session.completedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {session.hasVideo && <Video className="w-4 h-4 text-blue-600" />}
                    {session.hasAudio && <Mic className="w-4 h-4 text-purple-600" />}
                    {(hasFeedback || hasObservations) && (
                      <span title="Has feedback">
                        <Mail className="w-4 h-4 text-green-600" />
                      </span>
                    )}
                    {session.recordings?.screen && (
                      <span title="Screen recording available">
                        <FileVideo className="w-4 h-4 text-blue-600" />
                      </span>
                    )}
                    {session.recordings?.audio && (
                      <span title="Audio recording available">
                        <FileAudio className="w-4 h-4 text-purple-600" />
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-gray-600">Duration</div>
                    <div className="font-semibold">
                      {Math.floor(session.duration / 60)}m {session.duration % 60}s
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tasks</div>
                    <div className="font-semibold">{session.tasksCompleted}/{session.totalTasks}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Clicks</div>
                    <div className="font-semibold">{session.mouseClicks}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Keystrokes</div>
                    <div className="font-semibold">{session.keystrokes}</div>
                  </div>
                </div>

                {/* Task Feedback */}
                {hasFeedback && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-semibold text-gray-900 mb-3">Task Feedback:</div>
                    <div className="space-y-3">
                      {session.taskFeedback.filter(f => f.answer.trim()).map(feedback => {
                        const task = project.setup.tasks.find(t => t.id === feedback.taskId);
                        return (
                          <div key={feedback.taskId} className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-semibold text-gray-900">
                                {task?.title || 'Unknown Task'}
                              </div>
                              {feedback.rating && (
                                <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold">
                                  {feedback.rating}/5
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-700">{feedback.answer}</div>
                            
                            {feedback.questionAnswers && feedback.questionAnswers.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-blue-200 space-y-2">
                                {feedback.questionAnswers.map(qa => {
                                  const question = task?.customQuestions?.find(q => q.id === qa.questionId);
                                  return (
                                    <div key={qa.questionId}>
                                      <div className="text-xs font-medium text-gray-700">
                                        {question?.question}
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1">{qa.answer}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Observations */}
                {hasObservations && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-semibold text-gray-900 mb-2">Observations:</div>
                    <div className="bg-purple-50 rounded-lg p-3 text-sm text-gray-700">
                      {session.observations}
                    </div>
                  </div>
                )}

                {/* Recordings */}
                {(session.recordings?.screen || session.recordings?.audio) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-semibold text-gray-900 mb-3">Recordings:</div>
                    <div className="space-y-2">
                      {session.recordings.screen && (
                        <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <FileVideo className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">Screen Recording</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Duration: {formatDuration(session.recordings.screen.duration)} • 
                              Size: {formatBytes(session.recordings.screen.size)}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Available for download in production
                          </div>
                        </div>
                      )}
                      {session.recordings.audio && (
                        <div className="bg-purple-50 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <FileAudio className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-gray-900">Audio Recording</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Duration: {formatDuration(session.recordings.audio.duration)} • 
                              Size: {formatBytes(session.recordings.audio.size)}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Available for download in production
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <strong>Note:</strong> In a production environment, recordings would be stored on a server and available for download or playback here. Due to browser storage limitations, recordings are not persisted in this demo.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}