// components/Session/UnmoderatedSession.tsx - WITH AZURE UPLOAD
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, Clock, Monitor, Mic, Activity, Mail, Mouse, Keyboard, Video, SkipForward, Eye } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Project, Participant, Task, Session, TaskFeedback, TrackingData } from '../../types';
import { isRecordingSupported } from '../../utils/recording';
import { useRecording } from '../../hooks/useRecording';
import { getTasksForParticipant } from '../../utils/taskFiltering';

interface UnmoderatedSessionProps {
  project: Project;
  participant: Participant;
  onBack: () => void;
  onComplete: () => void;
}

export function UnmoderatedSession({ project, participant, onBack, onComplete }: UnmoderatedSessionProps) {
  const { actions } = useAppContext();
  const recording = useRecording();
  
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentTask, setCurrentTask] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [trackingData, setTrackingData] = useState<TrackingData>({ clicks: 0, keystrokes: 0 });
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [displayTasks, setDisplayTasks] = useState<Task[]>([]);
  
  const [enableVideo, setEnableVideo] = useState(project.cameraOption === 'required');
  const [enableAudio, setEnableAudio] = useState(project.micOption === 'required');
  
  const [taskFeedback, setTaskFeedback] = useState<TaskFeedback[]>([]);
  const [currentTaskAnswer, setCurrentTaskAnswer] = useState('');
  const [currentTaskRating, setCurrentTaskRating] = useState<number>(0);
  const [currentQuestionAnswers, setCurrentQuestionAnswers] = useState<{ questionId: number; answer: string | string[] }[]>([]);

  const sessionIdRef = useRef(`session-${Date.now()}`);
  const recordingSupport = isRecordingSupported();

  useEffect(() => {
  console.log('🎯 UnmoderatedSession - Setting up tasks:', {
    projectName: project.name,
    projectId: project.id,
    participantId: participant.id,
    participantIdType: typeof participant.id,
    participantName: participant.name,
    participantAssignments: project.participantAssignments,
    totalTasksInProject: project.setup.tasks.length
  });

  // ✅ FIXED: Pass participant.id directly (no conversion needed)
  let tasksToUse = getTasksForParticipant(project, participant.id);
  
  console.log('📊 Tasks after filtering:', {
    filteredCount: tasksToUse.length,
    taskDifficulties: {
      easy: tasksToUse.filter(t => t.difficulty === 'easy').length,
      medium: tasksToUse.filter(t => t.difficulty === 'medium').length,
      hard: tasksToUse.filter(t => t.difficulty === 'hard').length,
      all: tasksToUse.filter(t => t.difficulty === 'all').length
    }
  });
  
  if (project.setup.randomizeOrder) {
    tasksToUse = tasksToUse.sort(() => Math.random() - 0.5);
  }
  
  setDisplayTasks(tasksToUse);
}, [project, participant.id]);

  useEffect(() => {
    if (!sessionStarted || !recording.state.isRecording) return;

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

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [sessionStarted, recording.state.isRecording]);

  const beginSession = async () => {
    setSessionStarted(true);
    setSessionStartTime(Date.now());

    // Start recording with Azure upload integration
    if ((enableVideo || enableAudio) && recordingSupport.combined) {
      const success = await recording.startRecording({
        video: enableVideo,
        audio: enableAudio,
        projectId: project.id,
        participantId: participant.id,
        sessionId: sessionIdRef.current
      });
      
      if (!success && (project.cameraOption === 'required' || project.micOption === 'required')) {
        alert('Failed to start required recording. Please check your camera/microphone permissions.');
        setSessionStarted(false);
        return;
      }
    }
  };

  const getQuestionAnswer = (questionId: number): string | string[] => {
    return currentQuestionAnswers.find(a => a.questionId === questionId)?.answer || '';
  };

  const handleQuestionAnswerChange = (questionId: number, answer: string | string[]) => {
    const existing = currentQuestionAnswers.filter(a => a.questionId !== questionId);
    setCurrentQuestionAnswers([...existing, { questionId, answer }]);
  };

  const handleCheckboxChange = (questionId: number, option: string, checked: boolean) => {
    const currentAnswer = getQuestionAnswer(questionId);
    const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
    
    let newAnswer: string[];
    if (checked) {
      newAnswer = [...currentArray, option];
    } else {
      newAnswer = currentArray.filter(item => item !== option);
    }
    
    handleQuestionAnswerChange(questionId, newAnswer);
  };

  const canCompleteTask = (): boolean => {
    const task = displayTasks[currentTask];
    
    if (task.ratingEnabled && currentTaskRating === 0) {
      return false;
    }
    
    const requiredQuestions = (task.customQuestions || []).filter(q => q.required);
    for (const question of requiredQuestions) {
      const answer = getQuestionAnswer(question.id);
      if (!answer || (Array.isArray(answer) && answer.length === 0) || 
          (typeof answer === 'string' && !answer.trim())) {
        return false;
      }
    }
    
    return true;
  };

  const handleTaskComplete = () => {
    const rawTaskId = displayTasks[currentTask].id;
    const currentTaskId = typeof rawTaskId === 'number' ? rawTaskId : parseInt(rawTaskId as string, 10);
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
    
    setCurrentTaskAnswer('');
    setCurrentTaskRating(0);
    setCurrentQuestionAnswers([]);
    
    if (currentTask < displayTasks.length - 1) {
      setCurrentTask(currentTask + 1);
    }
  };
  const skipTaskFeedback = () => {
    const rawTaskId = displayTasks[currentTask].id;
    const currentTaskId = typeof rawTaskId === 'number' ? rawTaskId : parseInt(rawTaskId as string, 10);
    setCompletedTasks([...completedTasks, currentTaskId]);
    setCompletedTasks([...completedTasks, currentTaskId]);
    setCurrentTaskAnswer('');
    setCurrentTaskRating(0);
    setCurrentQuestionAnswers([]);
    
    if (currentTask < displayTasks.length - 1) {
      setCurrentTask(currentTask + 1);
    }
  };

  const endSession = async () => {
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
    const endTime = new Date().toISOString();

    // Stop recording and upload to Azure
    let recordingData = null;
    if (recording.state.isRecording) {
      const result = await recording.stopRecording({
        video: enableVideo,
        audio: enableAudio,
        projectId: project.id,
        participantId: participant.id,
        sessionId: sessionIdRef.current
      });

      if (result.success && result.url) {
        recordingData = {
          available: true,
          duration: result.duration,
          size: result.size,
          startTime: new Date(Date.now() - result.duration * 1000).toISOString(),
          endTime,
          hasVideo: result.hasVideo,
          hasAudio: result.hasAudio,
          type: result.hasVideo ? 'video' as const : 'audio' as const
        };
      }
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
      hasVideo: recording.state.hasVideo,
      hasAudio: recording.state.hasAudio,
      notes: '',
      taskFeedback,
      observations: '',
      recordings: {
        combined: recordingData || undefined
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
                  <div>
                    <span>You'll complete {displayTasks.length} task{displayTasks.length !== 1 ? 's' : ''}</span>
                    {(() => {
                      const assignment = project.participantAssignments?.find(
                        a => a.participantId === participant.id
                      );
                      if (assignment) {
                        return (
                          <span className="block text-xs text-gray-500 mt-1">
                            (Matched to your {assignment.usageLevel === 'active' ? 'Active User' : 
                                              assignment.usageLevel === 'occasionally' ? 'Occasional User' : 
                                              'Non-User'} level)
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </li>
                {recordingSupport.combined && (project.cameraOption !== 'disabled' || project.micOption !== 'disabled') && (
                  <li className="flex items-start">
                    <Monitor className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <span>
                        {project.cameraOption !== 'disabled' && project.micOption !== 'disabled'
                          ? 'Your screen and voice will be recorded together and securely uploaded'
                          : project.cameraOption !== 'disabled'
                          ? 'Your screen will be recorded and securely uploaded'
                          : 'Your voice will be recorded and securely uploaded - please think aloud'}
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
                  <span>You'll provide feedback and observations after each task</span>
                </li>
              </ul>
              {!recordingSupport.combined && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Recording not supported in this browser. Session data will still be collected.
                  </p>
                </div>
              )}
            </div>

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

  const currentTaskData = displayTasks[currentTask];

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
          {recording.state.isRecording && (
            <div className="flex items-center space-x-3">
              {recording.state.hasVideo && recording.state.hasAudio ? (
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                  <Video className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">+</span>
                  <Mic className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600">Synchronized</span>
                </div>
              ) : (
                <>
                  {recording.state.hasVideo && (
                    <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full">
                      <Video className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-medium text-red-600">Screen Recording</span>
                    </div>
                  )}
                  {recording.state.hasAudio && (
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
          {recording.state.isUploading && (
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-xs font-medium text-blue-600">Uploading... {recording.state.uploadProgress}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="space-y-6">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {currentTaskData.title}
              </h3>
              
              {currentTaskData.estimatedTime && (
                <div className="mb-3 text-sm text-gray-700">
                  <strong>Estimated Time:</strong> {currentTaskData.estimatedTime}
                </div>
              )}
              
              {currentTaskData.objective && (
                <div className="mb-3">
                  <strong className="text-gray-900">Objective:</strong>
                  <p className="text-gray-700 mt-1">{currentTaskData.objective}</p>
                </div>
              )}
              
              {currentTaskData.scenario && (
                <div className="mb-3">
                  <strong className="text-gray-900">Scenario:</strong>
                  <p className="text-gray-700 mt-1">{currentTaskData.scenario}</p>
                </div>
              )}
              
              {currentTaskData.yourTask && currentTaskData.yourTask.length > 0 && currentTaskData.yourTask[0] !== '' && (
                <div className="mb-3">
                  <strong className="text-gray-900">Your Task:</strong>
                  <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-1 ml-2">
                    {currentTaskData.yourTask.map((step, idx) => (
                      step && <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              
              {currentTaskData.successCriteria && (
                <div className="bg-white rounded-lg p-3 mt-3">
                  <strong className="text-gray-900">Success Criteria:</strong>
                  <p className="text-gray-700 mt-1">{currentTaskData.successCriteria}</p>
                </div>
              )}
              
              {currentTaskData.description && !currentTaskData.objective && !currentTaskData.scenario && (
                <p className="text-lg text-gray-700">{currentTaskData.description}</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="w-5 h-5 text-purple-600" />
                <h4 className="text-lg font-bold text-gray-900">Task Feedback</h4>
              </div>

              {currentTaskData.ratingEnabled && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {currentTaskData.ratingLabel || 'Rate this task'} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">{currentTaskData.ratingScale?.low}</span>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setCurrentTaskRating(rating)}
                          className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                            currentTaskRating === rating
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-gray-300 text-gray-700 hover:border-purple-400'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{currentTaskData.ratingScale?.high}</span>
                  </div>
                </div>
              )}

              {currentTaskData.customQuestions && currentTaskData.customQuestions.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200 space-y-4">
                  {currentTaskData.customQuestions.map((q, idx) => {
                    const answer = getQuestionAnswer(q.id);
                    const questionType = q.type || 'text';
                    
                    return (
                      <div key={q.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question {idx + 1}: {q.question}
                          {q.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {questionType === 'text' && (
                          <textarea
                            value={typeof answer === 'string' ? answer : ''}
                            onChange={(e) => handleQuestionAnswerChange(q.id, e.target.value)}
                            placeholder="Your answer..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          />
                        )}
                        
                        {questionType === 'yes-no' && (
                          <div className="flex items-center space-x-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                value="Yes"
                                checked={answer === 'Yes'}
                                onChange={(e) => handleQuestionAnswerChange(q.id, e.target.value)}
                                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                value="No"
                                checked={answer === 'No'}
                                onChange={(e) => handleQuestionAnswerChange(q.id, e.target.value)}
                                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">No</span>
                            </label>
                          </div>
                        )}
                        
                        {questionType === 'multiple-choice' && (
                          <div className="space-y-2">
                            {(q.options || []).map((option, optIdx) => (
                              <label
                                key={optIdx}
                                className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                              >
                                <input
                                  type="radio"
                                  name={`question-${q.id}`}
                                  value={option}
                                  checked={answer === option}
                                  onChange={(e) => handleQuestionAnswerChange(q.id, e.target.value)}
                                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {questionType === 'checkbox' && (
                          <div className="space-y-2">
                            {(q.options || []).map((option, optIdx) => {
                              const isChecked = Array.isArray(answer) && answer.includes(option);
                              return (
                                <label
                                  key={optIdx}
                                  className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleCheckboxChange(q.id, option, e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                  />
                                  <span className="text-sm text-gray-700">{option}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments & Observations (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Share your thoughts, challenges, expectations, or anything unexpected about this task.
                </p>
                <textarea
                  value={currentTaskAnswer}
                  onChange={(e) => setCurrentTaskAnswer(e.target.value)}
                  placeholder="Example: I expected to see a confirmation message after clicking submit, but nothing happened immediately..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleTaskComplete}
                  disabled={!canCompleteTask()}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{!canCompleteTask() ? 'Complete required fields' : 'Mark as Complete'}</span>
                </button>
                <button
                  onClick={skipTaskFeedback}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Skip</span>
                </button>
              </div>
            </div>

            {completedTasks.length === displayTasks.length && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={endSession}
                  disabled={recording.state.isUploading}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {recording.state.isUploading ? 'Saving Recording...' : 'Finish Session'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">All Tasks</h3>
            <div className="space-y-3">
              {displayTasks.map((task, index) => {
                const feedback = taskFeedback.find(f => f.taskId === task.id);
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-2 ${
                      completedTasks.includes(typeof task.id === 'number' ? task.id : parseInt(task.id as string, 10))
                        ? 'border-green-300 bg-green-50'
                        : index === currentTask
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        
                        {task.objective ? (
                          <p className="text-sm text-gray-600 mt-1">{task.objective}</p>
                        ) : task.description ? (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        ) : null}
                        
                        {task.estimatedTime && (
                          <p className="text-xs text-gray-500 mt-1">⏱️ {task.estimatedTime}</p>
                        )}
                      </div>
                      {completedTasks.includes(typeof task.id === 'number' ? task.id : parseInt(task.id as string, 10)) && (
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
    </div>
  );
}