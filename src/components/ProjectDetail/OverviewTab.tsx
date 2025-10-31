// components/ProjectDetail/OverviewTab.tsx
import React, { useState } from 'react';
import { Users, CheckCircle, Target, Star, MessageSquare, Edit2, ChevronDown, ChevronUp, Camera, Mic, Shuffle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Project, Participant, Task } from '../../types';
import { EditTaskModal } from '../Modals/EditTaskModal';
import { getUsageLevelLabel } from '../../utils/taskFiltering';

interface OverviewTabProps {
  project: Project;
  onStartSession: (participantId: number) => void;
}

export function OverviewTab({ project, onStartSession }: OverviewTabProps) {
  const { state, actions } = useAppContext();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleSaveTask = (taskId: number, updates: Partial<Task>) => {
    const updatedTasks = project.setup.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );

    actions.updateProject(project.id, {
      setup: {
        ...project.setup,
        tasks: updatedTasks
      }
    });
  };

  const projectParticipants = state.participants.filter(p =>
    project.participantIds.includes(p.id)
  );

  const getMediaPermissionLabel = (option: 'optional' | 'required' | 'disabled') => {
    switch (option) {
      case 'required': return 'Required';
      case 'optional': return 'Optional';
      case 'disabled': return 'Disabled';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{project.setup.tasks.length}</div>
          <div className="text-sm text-gray-600">Tasks</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{projectParticipants.length}</div>
          <div className="text-sm text-gray-600">Participants</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{project.sessions.length}</div>
          <div className="text-sm text-gray-600">Sessions</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900 capitalize">{project.mode}</div>
          <div className="text-sm text-gray-600">Mode</div>
        </div>
      </div>

      {/* Main Content: Tasks (2/3) + Sidebar (1/3) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks Section - Takes 2/3 on large screens */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <span>Tasks</span>
              <span className="text-sm font-normal text-gray-500">({project.setup.tasks.length})</span>
            </h2>

            {project.setup.randomizeOrder && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                <Shuffle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900">
                  Task order will be randomized for each participant
                </p>
              </div>
            )}

            <div className="space-y-3">
              {project.setup.tasks.map((task, index) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-3">{task.title}</h3>
                      
                      {/* New Task Structure Display */}
                      <div className="space-y-2 text-sm">
                        {task.estimatedTime && (
                          <div className="flex items-start">
                            <span className="text-gray-600 font-medium w-32 flex-shrink-0">Time:</span>
                            <span className="text-gray-700">{task.estimatedTime}</span>
                          </div>
                        )}
                        
                        {task.objective && (
                          <div className="flex items-start">
                            <span className="text-gray-600 font-medium w-32 flex-shrink-0">Objective:</span>
                            <span className="text-gray-700">{task.objective}</span>
                          </div>
                        )}
                        
                        {task.scenario && (
                          <div className="flex items-start">
                            <span className="text-gray-600 font-medium w-32 flex-shrink-0">Scenario:</span>
                            <span className="text-gray-700">{task.scenario}</span>
                          </div>
                        )}
                        
                        {task.yourTask && task.yourTask.length > 0 && task.yourTask[0] !== '' && (
                          <div className="flex items-start">
                            <span className="text-gray-600 font-medium w-32 flex-shrink-0">Your Task:</span>
                            <ol className="list-decimal list-inside text-gray-700 space-y-1">
                              {task.yourTask.map((step, idx) => (
                                step && <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        {task.successCriteria && (
                          <div className="flex items-start">
                            <span className="text-gray-600 font-medium w-32 flex-shrink-0">Success:</span>
                            <span className="text-gray-700">{task.successCriteria}</span>
                          </div>
                        )}
                        
                        {/* Fallback to old description for backwards compatibility */}
                        {task.description && !task.objective && !task.scenario && (
                          <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                      aria-label="Edit task"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Task Features */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {task.ratingEnabled && (
                      <div className="flex items-center space-x-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                        <Star className="w-3 h-3" />
                        <span>{task.ratingLabel}</span>
                      </div>
                    )}
                    {task.customQuestions && task.customQuestions.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                        <MessageSquare className="w-3 h-3" />
                        <span>{task.customQuestions.length} question{task.customQuestions.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                      <Target className="w-3 h-3" />
                      <span>
                        {task.difficulty === 'easy' ? 'Non-Users' : task.difficulty === 'medium' ? 'Occasional Users' : 'Active Users'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Messages - Collapsible */}
          <div className="bg-white rounded-lg shadow">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-900">Session Messages</h3>
              </div>
              {showMessages ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showMessages && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
                <div className="pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Before Session</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
                    {project.setup.beforeMessage}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">During Session (Scenario)</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
                    {project.setup.duringScenario}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">After Session</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
                    {project.setup.afterMessage}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Settings - Collapsible */}
          <div className="bg-white rounded-lg shadow">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-900">Recording Settings</h3>
              </div>
              {showSettings ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showSettings && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Camera className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Camera</div>
                      <div className="text-xs text-gray-600">{getMediaPermissionLabel(project.cameraOption)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Mic className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Microphone</div>
                      <div className="text-xs text-gray-600">{getMediaPermissionLabel(project.micOption)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Participants - Takes 1/3 on large screens */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Participants</span>
              <span className="text-sm font-normal text-gray-500">({projectParticipants.length})</span>
            </h2>

            {projectParticipants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">No participants assigned</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {projectParticipants.map(participant => {
                  const assignment = project.participantAssignments?.find(
                    a => a.participantId === participant.id
                  );
                  const usageLevel = assignment?.usageLevel || participant.defaultUsageLevel || 'occasionally';
                  const completedSessions = project.sessions.filter(
                    s => s.participantId === participant.id
                  ).length;

                  return (
                    <div
                      key={participant.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="mb-3">
                        <div className="font-semibold text-gray-900 text-sm mb-1 truncate" title={participant.name}>
                          {participant.name}
                        </div>
                        <div className="text-xs text-gray-600 truncate" title={participant.email}>
                          {participant.email}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          usageLevel === 'active'
                            ? 'bg-red-100 text-red-700'
                            : usageLevel === 'occasionally'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {getUsageLevelLabel(usageLevel)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {completedSessions} session{completedSessions !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <button
                        onClick={() => onStartSession(participant.id)}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Start Session
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={(updates) => handleSaveTask(editingTask.id, updates)}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}