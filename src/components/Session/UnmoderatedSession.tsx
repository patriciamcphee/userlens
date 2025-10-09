// components/Session/UnmoderatedSession.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, Clock, Monitor, Mic, Eye, Activity, Mail, Mouse, Keyboard, Video } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Project, Participant, Task, Session, TaskFeedback, TrackingData } from '../../types';
import { FeedbackModal } from '../Modals/FeedbackModal';
import { CombinedRecorder, downloadRecording, isRecordingSupported } from '../../utils/recording';

interface UnmoderatedSessionProps {
  project: Project;
  participant: Participant;
  onBack: () => void;
  onComplete: () => void;
}

export function UnmoderatedSession({ project, participant, onBack, onComplete }: UnmoderatedSessionProps) {
  const { actions } = useAppContext();
  
  const [sessionStarted, setSessionStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [currentTask, setCurrentTask] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [trackingData, setTrackingData] = useState<TrackingData>({ clicks: 0, keystrokes: 0 });
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [displayTasks, setDisplayTasks] = useState<Task[]>([]);
  const [observations, setObservations] = useState('');
  
  // Optional recording preferences
  const [enableVideo, setEnableVideo] = useState(project.cameraOption === 'required');
  const [enableAudio, setEnableAudio] = useState(project.micOption === 'required');
  
  // Feedback state
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [taskFeedback, setTaskFeedback] = useState<TaskFeedback[]>([]);
  const [currentTaskAnswer, setCurrentTaskAnswer] = useState('');
  const [currentTaskRating, setCurrentTaskRating] = useState<number>(0);
  const [currentQuestionAnswers, setCurrentQuestionAnswers] = useState<{ questionId: number; answer: string | string[] }[]>([]);

  // Recording state - using combined recorder
  const combinedRecorderRef = useRef<CombinedRecorder | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<string | null>(null);
  const [isRecordingScreen, setIsRecordingScreen] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  // Check recording support
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

    // Use the user's selections for optional recordings
    const shouldRecordVideo = enableVideo;
    const shouldRecordAudio = enableAudio;

    // Use combined recorder when either video or audio is enabled
    if ((shouldRecordVideo || shouldRecordAudio) && recordingSupport.combined) {
      combinedRecorderRef.current = new CombinedRecorder();
      const result = await combinedRecorderRef.current.startRecording({
        video: shouldRecordVideo,
        audio: shouldRecordAudio
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
      setShowFeedbackPrompt(true);
    }
  };

  const submitTaskFeedback = () => {
    const currentTaskId = displayTasks[currentTask].id;
    const task = displayTasks[currentTask];
    
    const feedback: TaskFeedback = {
      taskId: currentTaskId,
      answer: currentTaskAnswer.trim(),
      rating: task.ratingEnabled ? currentTaskRating : undefined,
      questionAnswers: currentQuestionAnswers.length > 0 ? currentQuestionAnswers : undefined,
      timestamp: new Date().toISOString()
    };
    
    setTaskFeedback([...taskFeedback, feedback]);
    setCompletedTasks([...completedTasks, currentTaskId]);
    
    // Reset
    setCurrentTaskAnswer('');
    setCurrentTaskRating(0);
    setCurrentQuestionAnswers([]);
    setShowFeedbackPrompt(false);
    
    if (currentTask < displayTasks.length - 1) {
      setCurrentTask(currentTask + 1);
    }
  };

  const skipTaskFeedback = () => {
    const currentTaskId = displayTasks[currentTask].id;
    setCompletedTasks([...completedTasks, currentTaskId]);
    setCurrentTaskAnswer('');
    setCurrentTaskRating(0);
    setCurrentQuestionAnswers([]);
    setShowFeedbackPrompt(false);
    
    if (currentTask < displayTasks.length - 1) {
      setCurrentTask(currentTask + 1);
    }
  };

  const handleQuestionAnswerChange = (questionId: number, answer: string | string[]) => {
    const existing = currentQuestionAnswers.filter(a => a.questionId !== questionId);
    setCurrentQuestionAnswers([...existing, { questionId, answer }]);
  };

  const endSession = async () => {
    setRecording(false);
    
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
    const endTime = new Date().toISOString();

    // Stop combined recording
    let combinedRecordingData = null;
    if (combinedRecorderRef.current && combinedRecorderRef.current.isRecording()) {
      const result = await combinedRecorderRef.current.stopRecording();
      setRecordingBlob(result.blob);
      
      // Store recording data - in production, this would be uploaded to a server
      combinedRecordingData = {
        available: true,
        duration: result.duration,
        size: result.size,
        startTime: recordingStartTime!,
        endTime,
        hasVideo: result.hasVideo,
        hasAudio: result.hasAudio,
        type: result.hasVideo ? ("video" as "video") : ("audio" as "audio")
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
      notes: '',
      taskFeedback,
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">User Testing Session</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6 mx-auto">
              <Eye className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Welcome</h2>
            <div className="text-lg text-gray-700 mb-8 whitespace-pre-wrap text-center">
              {project.setup.beforeMessage}
            </div>
            {project.setup.duringScenario && (
              <div className="bg-purple-50 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Scenario</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{project.setup.duringScenario}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-gray-900 mb-3">What to expect:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <Clock className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>You'll complete {displayTasks.length} tasks</span>
                </li>
                {recordingSupport.combined && (project.cameraOption !== 'disabled' || project.micOption !== 'disabled') && (
                  <li className="flex items-start">
                    <Monitor className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <span>
                        {project.cameraOption !== 'disabled' && project.micOption !== 'disabled'
                          ? 'Your screen and voice will be recorded together in a synchronized file'
                          : project.cameraOption !== 'disabled'
                          ? 'Your screen will be recorded (you\'ll be asked for permission)'
                          : 'Your voice will be recorded - please think aloud and share your thoughts'}
                      </span>
                      {enableVideo && enableAudio && (
                        <div className="text-sm text-green-600 mt-1">
                          ✓ Audio and video stay perfectly in sync
                        </div>
                      )}
                    </div>
                  </li>
                )}
                <li className="flex items-start">
                  <Activity className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Keyboard and mouse movements will be tracked</span>
                </li>
                <li className="flex items-start">
                  <Mail className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>You'll be asked for feedback after each task</span>
                </li>
              </ul>
              {!recordingSupport.combined && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Recording not supported in this browser. Session data will still be collected, but no audio/video recordings.
                  </p>
                </div>
              )}
            </div>

            {/* Recording Options */}
            {(project.cameraOption === 'optional' || project.micOption === 'optional') && recordingSupport.combined && (
              <div className="bg-purple-50 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Recording Preferences</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose which recordings you'd like to enable for this session:
                </p>
                <div className="space-y-3">
                  {project.cameraOption === 'optional' && (
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-white rounded-lg hover:bg-purple-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={enableVideo}
                        onChange={(e) => setEnableVideo(e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Video className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-900">Enable Screen Recording</span>
                      </div>
                    </label>
                  )}
                  {project.micOption === 'optional' && (
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-white rounded-lg hover:bg-purple-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={enableAudio}
                        onChange={(e) => setEnableAudio(e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Mic className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-900">Enable Audio Recording</span>
                      </div>
                    </label>
                  )}
                </div>
                {enableVideo && enableAudio && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✓ Video and audio will be recorded together in sync
                    </p>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={beginSession}
              className="w-full bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-lg"
            >
              Start Testing Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">User Testing Session</h1>
          </div>
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
                      <span className="text-xs font-medium text-red-600">Screen Recording</span>
                    </div>
                  )}
                  {isRecordingAudio && (
                    <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full">
                      <Mic className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">Audio Recording</span>
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
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="space-y-6">
          {/* Current Task */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Task {currentTask + 1} of {displayTasks.length}
              </span>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mouse className="w-4 h-4" />
                  <span>{trackingData.clicks}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Keyboard className="w-4 h-4" />
                  <span>{trackingData.keystrokes}</span>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedTasks.length / displayTasks.length) * 100}%` }}
              ></div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {displayTasks[currentTask].title}
              </h3>
              <p className="text-lg text-gray-700">{displayTasks[currentTask].description}</p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleTaskComplete(displayTasks[currentTask].id)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Mark Task Complete</span>
              </button>

              {completedTasks.length === displayTasks.length && (
                <button
                  onClick={endSession}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Finish Session
                </button>
              )}
            </div>
          </div>

          {/* Observations */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Your Observations</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              As you complete tasks, note anything unexpected, confusing, or worth mentioning. What did you expect to see or happen?
            </p>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Example: I expected to see a confirmation message after clicking submit, but nothing happened immediately..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* All Tasks */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">All Tasks</h3>
            <div className="space-y-3">
              {displayTasks.map((task, index) => {
                const feedback = taskFeedback.find(f => f.taskId === task.id);
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-2 ${
                      completedTasks.includes(task.id)
                        ? 'border-green-300 bg-green-50'
                        : index === currentTask
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      </div>
                      {completedTasks.includes(task.id) && (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 ml-4" />
                      )}
                    </div>
                    {feedback && feedback.answer && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Your feedback:</div>
                        <div className="text-sm text-gray-700 bg-white p-2 rounded">
                          {feedback.answer}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        show={showFeedbackPrompt}
        task={displayTasks[currentTask]}
        currentTaskAnswer={currentTaskAnswer}
        currentTaskRating={currentTaskRating}
        currentQuestionAnswers={currentQuestionAnswers}
        onAnswerChange={setCurrentTaskAnswer}
        onRatingChange={setCurrentTaskRating}
        onQuestionAnswerChange={handleQuestionAnswerChange}
        onSubmit={submitTaskFeedback}
        onSkip={skipTaskFeedback}
      />
    </div>
  );
}