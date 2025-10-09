// components/Session/ModeratedSession.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, Monitor, Video, Mic, MicOff, VideoOff, Mouse, Keyboard, CheckCircle, Circle, Activity } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Project, Participant, Task, Session, TrackingData } from '../../types';
import { CombinedRecorder, isRecordingSupported } from '../../utils/recording';

interface ModeratedSessionProps {
  project: Project;
  participant: Participant;
  onBack: () => void;
  onComplete: () => void;
}

export function ModeratedSession({ project, participant, onBack, onComplete }: ModeratedSessionProps) {
  const { actions } = useAppContext();
  
  const [sessionStarted, setSessionStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [currentTask, setCurrentTask] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [micOn, setMicOn] = useState(project.micOption === 'required');
  const [videoOn, setVideoOn] = useState(project.cameraOption === 'required');
  const [notes, setNotes] = useState('');
  const [observations, setObservations] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData>({ clicks: 0, keystrokes: 0 });
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [displayTasks, setDisplayTasks] = useState<Task[]>([]);

  // Recording state - using combined recorder
  const combinedRecorderRef = useRef<CombinedRecorder | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<string | null>(null);
  const [isRecordingScreen, setIsRecordingScreen] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  const canToggleVideo = project.cameraOption === 'optional';
  const canToggleMic = project.micOption === 'optional';
  const recordingSupport = isRecordingSupported();

  useEffect(() => {
    // Set up tasks with optional randomization
    let tasksToUse = [...project.setup.tasks];
    if (project.setup.randomizeOrder) {
      tasksToUse = tasksToUse.sort(() => Math.random() - 0.5);
    }
    setDisplayTasks(tasksToUse);
  }, [project]);

  useEffect(() => {
    // Track actual mouse clicks and keystrokes
    if (!sessionStarted || !recording) return;

    const handleClick = () => {
      setTrackingData(prev => ({
        ...prev,
        clicks: prev.clicks + 1
      }));
    };

    const handleKeyPress = () => {
      setTrackingData(prev => ({
        ...prev,
        keystrokes: prev.keystrokes + 1
      }));
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [sessionStarted, recording]);

  const beginSession = async () => {
    setSessionStarted(true);
    setRecording(true);
    setSessionStartTime(Date.now());
    setRecordingStartTime(new Date().toISOString());

    // Use combined recorder when both video and audio are enabled or when either is enabled
    if ((videoOn || micOn) && recordingSupport.combined) {
      combinedRecorderRef.current = new CombinedRecorder();
      const result = await combinedRecorderRef.current.startRecording({
        video: videoOn,
        audio: micOn
      });
      
      if (result.success) {
        setIsRecordingScreen(result.hasVideo);
        setIsRecordingAudio(result.hasAudio);
      } else {
        console.warn('Combined recording failed to start:', result.error);
      }
    }
  };

  const handleTaskComplete = (taskId: number) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
      // Move to next task if available
      if (currentTask < displayTasks.length - 1) {
        setCurrentTask(currentTask + 1);
      }
    }
  };

  const endSession = async () => {
    setRecording(false);
    
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
    const endTime = new Date().toISOString();

    // Stop combined recording
    let combinedRecordingData = null;
    if (combinedRecorderRef.current && combinedRecorderRef.current.isRecording()) {
      const result = await combinedRecorderRef.current.stopRecording();
      
      // Store recording data - in production, this would be uploaded to a server
      combinedRecordingData = {
        available: true,
        duration: result.duration,
        size: result.size,
        startTime: recordingStartTime!,
        endTime,
        hasVideo: result.hasVideo,
        hasAudio: result.hasAudio,
        type: result.hasVideo ? "video" as const : "audio" as const
      };
    }
    
    const sessionRecord: Session = {
      id: Date.now(),
      participantId: participant.id,
      completedAt: new Date().toISOString(),
      duration,
      tasksCompleted: completedTasks.length,
      totalTasks: displayTasks.length,
      mouseClicks: trackingData.clicks,
      keystrokes: trackingData.keystrokes,
      hasVideo: isRecordingScreen,
      hasAudio: isRecordingAudio,
      notes,
      taskFeedback: [],
      observations,
      recordings: {
        combined: combinedRecordingData || undefined
      }
    };
    
    actions.addSession(project.id, sessionRecord);
    onComplete();
  };

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Moderated Testing Session</h1>
            </div>
            <button
              onClick={beginSession}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Session</span>
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome Message</h2>
            <div className="text-gray-700 mb-6 whitespace-pre-wrap">{project.setup.beforeMessage}</div>
            {project.setup.duringScenario && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Scenario</h3>
                <div className="bg-blue-50 rounded-lg p-4 text-gray-700 mb-6 whitespace-pre-wrap">
                  {project.setup.duringScenario}
                </div>
              </>
            )}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">Tracking Enabled</div>
                  <div className="mb-2">This session will record screen activity, keyboard input, and mouse movements.</div>
                  {videoOn && micOn && (
                    <div className="mt-2 pt-2 border-t border-gray-300 text-green-700 font-medium">
                      ✓ Video and audio will be recorded together in a synchronized file
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recording Options */}
            {(project.cameraOption === 'optional' || project.micOption === 'optional') && recordingSupport.combined && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Recording Preferences</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose which recordings to enable for this session:
                </p>
                <div className="space-y-3">
                  {project.cameraOption === 'optional' && (
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={videoOn}
                        onChange={(e) => setVideoOn(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Video className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Enable Screen Recording</span>
                      </div>
                    </label>
                  )}
                  {project.micOption === 'optional' && (
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={micOn}
                        onChange={(e) => setMicOn(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Mic className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Enable Audio Recording</span>
                      </div>
                    </label>
                  )}
                </div>
                {videoOn && micOn && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✓ Video and audio will be recorded together in sync
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Moderated Testing Session</h1>
            {recording && (
              <div className="flex items-center space-x-3">
                {isRecordingScreen && isRecordingAudio ? (
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                    <Video className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">+</span>
                    <Mic className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Synchronized</span>
                  </div>
                ) : (
                  <>
                    {isRecordingScreen && (
                      <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full">
                        <Video className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-medium text-red-600">Video</span>
                      </div>
                    )}
                    {isRecordingAudio && (
                      <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full">
                        <Mic className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">Audio</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600">Recording</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setRecording(!recording)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {recording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={endSession}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Square className="w-4 h-4" />
              <span>End Session</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Screen View */}
            <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Monitor className="w-16 h-16 text-gray-600" />
              </div>
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                Participant Screen
              </div>
              <div className="absolute bottom-4 left-4 flex space-x-4 text-white text-sm">
                <div className="bg-black bg-opacity-50 px-3 py-1 rounded flex items-center space-x-2">
                  <Mouse className="w-4 h-4" />
                  <span>{trackingData.clicks} clicks</span>
                </div>
                <div className="bg-black bg-opacity-50 px-3 py-1 rounded flex items-center space-x-2">
                  <Keyboard className="w-4 h-4" />
                  <span>{trackingData.keystrokes} keys</span>
                </div>
              </div>
            </div>

            {/* Webcam View */}
            {project.cameraOption !== 'disabled' && (
              <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video relative w-64">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-600" />
                </div>
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  Participant Webcam
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="bg-white rounded-lg p-4 flex items-center justify-center space-x-4">
              <button
                onClick={() => canToggleMic && setMicOn(!micOn)}
                disabled={!canToggleMic}
                className={`p-4 rounded-full ${
                  !canToggleMic ? 'opacity-50 cursor-not-allowed' : ''
                } ${micOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-white" />}
              </button>
              <button
                onClick={() => canToggleVideo && setVideoOn(!videoOn)}
                disabled={!canToggleVideo}
                className={`p-4 rounded-full ${
                  !canToggleVideo ? 'opacity-50 cursor-not-allowed' : ''
                } ${videoOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tasks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tasks</h3>
              <div className="space-y-3">
                {displayTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border-2 ${
                      completedTasks.includes(task.id)
                        ? 'border-green-300 bg-green-50'
                        : index === currentTask
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">{task.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                      </div>
                      <button
                        onClick={() => handleTaskComplete(task.id)}
                        className="ml-2 flex-shrink-0"
                      >
                        {completedTasks.includes(task.id) ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observer Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Observer Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes during the session..."
                className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Observations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Participant Observations</h3>
              <p className="text-sm text-gray-600 mb-3">
                Ask participant about their expectations and observations
              </p>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Record participant's observations here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}