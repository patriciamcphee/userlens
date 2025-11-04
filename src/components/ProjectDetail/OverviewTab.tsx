// components/ProjectDetail/OverviewTab.tsx - WITH INLINE PARTICIPANT ADDING
import React, { useState } from 'react';
import { Users, CheckCircle, Target, Star, MessageSquare, Edit2, ChevronDown, ChevronUp, ChevronRight, Camera, Mic, Shuffle, Mail, TrendingUp, Plus, UserPlus, User, UserX, X } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Project, Participant, Task, EmailTemplate } from '../../types';
import { EditTaskModal } from '../Modals/EditTaskModal';
import { EmailModal } from '../Modals/EmailModal';
import { UsageLevelModal } from '../Modals/UsageLevelModal';
import { getUsageLevelLabel } from '../../utils/taskFiltering';
import { generateSessionLink, DEFAULT_EMAIL_TEMPLATE } from '../../utils';

interface OverviewTabProps {
  project: Project;
  onStartSession: (participantId: number) => void;
}

export function OverviewTab({ project, onStartSession }: OverviewTabProps) {
  const { state, actions } = useAppContext();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Task expansion state
  const [expandedTasks, setExpandedTasks] = useState<Set<string | number>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  
  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [sessionLink, setSessionLink] = useState('');
  const [linkExpiry, setLinkExpiry] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>(DEFAULT_EMAIL_TEMPLATE);

  // Add participant modal state
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showUsageLevelModal, setShowUsageLevelModal] = useState(false);
  const [participantToAdd, setParticipantToAdd] = useState<Participant | null>(null);

  // Calculate task difficulty breakdown
  const taskDifficultyBreakdown = {
    easy: project.setup.tasks.filter(task => task.difficulty === 'easy').length,
    medium: project.setup.tasks.filter(task => task.difficulty === 'medium').length,
    hard: project.setup.tasks.filter(task => task.difficulty === 'hard').length,
    all: project.setup.tasks.filter(task => task.difficulty === 'all').length
  };

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

  const handleSendLink = (participant: Participant) => {
    // Generate session link with project and participant data embedded
    const { link, sessionLink: newSessionLink } = generateSessionLink(
      Number(project.id),
      Number(participant.id),
      expiryDays,
      project,
      participant,
      true // ← Enable short URLs
    );
    
    // Add to state
    actions.addSessionLink(newSessionLink);
    
    // Set up email modal
    setSelectedParticipant(participant);
    setSessionLink(link);
    setLinkExpiry(newSessionLink.expiresAt);
    setEmailTemplate(DEFAULT_EMAIL_TEMPLATE);
    setShowEmailModal(true);
  };

  const handleExpiryDaysChange = (days: number) => {
    setExpiryDays(days);
    
    // Regenerate the link with new expiry if modal is open
    if (selectedParticipant) {
      const { link, sessionLink: newSessionLink } = generateSessionLink(
        Number(project.id),
        Number(selectedParticipant.id),
        days,
        project,
        selectedParticipant
      );
      
      // Update the session link in state
      actions.addSessionLink(newSessionLink);
      
      // Update modal state
      setSessionLink(link);
      setLinkExpiry(newSessionLink.expiresAt);
    }
  };

  const handleCopyEmail = () => {
    if (!selectedParticipant) return;
    
    const formattedSubject = emailTemplate.subject
      .replace(/{participantName}/g, selectedParticipant.name)
      .replace(/{projectName}/g, project.name);
    
    const formattedBody = emailTemplate.body
      .replace(/{participantName}/g, selectedParticipant.name)
      .replace(/{projectName}/g, project.name)
      .replace(/{sessionLink}/g, sessionLink)
      .replace(/{expiryDate}/g, new Date(linkExpiry).toLocaleDateString());
    
    const emailContent = `Subject: ${formattedSubject}\n\n${formattedBody}`;
    
    navigator.clipboard.writeText(emailContent).then(() => {
      alert('Email copied to clipboard!');
      setShowEmailModal(false);
    });
  };

  // Get available participants (not already in this project)
  const availableParticipants = state.participants.filter(p =>
    !project.participantIds.includes(p.id)
  );

  const projectParticipants = state.participants.filter(p =>
    project.participantIds.some(id => String(id) === String(p.id))
  );

  const handleAddParticipant = (participant: Participant) => {
    setParticipantToAdd(participant);
    setShowAddParticipantModal(false);
    setShowUsageLevelModal(true);
  };

  const handleConfirmUsageLevel = (usageLevel: 'active' | 'occasionally' | 'non-user') => {
    if (!participantToAdd) return;

    // Update project with new participant
    const updatedParticipantIds = [...project.participantIds, participantToAdd.id];
    const updatedAssignments = [
      ...(project.participantAssignments || []),
      {
        participantId: participantToAdd.id,
        usageLevel
      }
    ];

    actions.updateProject(project.id, {
      participantIds: updatedParticipantIds,
      participantAssignments: updatedAssignments
    });

    setShowUsageLevelModal(false);
    setParticipantToAdd(null);
  };

  const handleRemoveParticipant = (participantId: string | number) => {
    if (window.confirm('Remove this participant from the project?')) {
      const updatedParticipantIds = project.participantIds.filter(id => String(id) !== String(participantId));
      const updatedAssignments = (project.participantAssignments || []).filter(
        a => String(a.participantId) !== String(participantId)
      );

      actions.updateProject(project.id, {
        participantIds: updatedParticipantIds,
        participantAssignments: updatedAssignments
      });
    }
  };

  // Task expansion functions
  const toggleTask = (taskId: string | number) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const toggleAllTasks = () => {
    if (allExpanded) {
      setExpandedTasks(new Set());
      setAllExpanded(false);
    } else {
      const allTaskIds = new Set(project.setup.tasks.map(task => task.id));
      setExpandedTasks(allTaskIds);
      setAllExpanded(true);
    }
  };

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

      {/* Task Difficulty Breakdown Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Task Difficulty Breakdown</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Tasks are filtered by participant experience level during sessions
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Easy Tasks */}
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-green-700">{taskDifficultyBreakdown.easy}</div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                Easy
              </div>
            </div>
            <div className="text-sm text-green-600">Non-Users</div>
            <div className="text-xs text-gray-500 mt-1">Basic tasks for beginners</div>
          </div>

          {/* Medium Tasks */}
          <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-yellow-700">{taskDifficultyBreakdown.medium}</div>
              <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                Medium
              </div>
            </div>
            <div className="text-sm text-yellow-600">Occasional Users</div>
            <div className="text-xs text-gray-500 mt-1">Intermediate complexity</div>
          </div>

          {/* Hard Tasks */}
          <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-red-700">{taskDifficultyBreakdown.hard}</div>
              <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                Hard
              </div>
            </div>
            <div className="text-sm text-red-600">Active Users</div>
            <div className="text-xs text-gray-500 mt-1">Advanced features</div>
          </div>

          {/* All Users Tasks */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-blue-700">{taskDifficultyBreakdown.all}</div>
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                All Users
              </div>
            </div>
            <div className="text-sm text-blue-600">Everyone</div>
            <div className="text-xs text-gray-500 mt-1">Universal tasks</div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-700">
            <strong>Task Filtering Logic:</strong>
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              <li>• <strong>Non-Users</strong> see only Easy tasks ({taskDifficultyBreakdown.easy + taskDifficultyBreakdown.all} total)</li>
              <li>• <strong>Occasional Users</strong> see Easy + Medium tasks ({taskDifficultyBreakdown.easy + taskDifficultyBreakdown.medium + taskDifficultyBreakdown.all} total)</li>
              <li>• <strong>Active Users</strong> see all task types ({project.setup.tasks.length} total)</li>
              <li>• <strong>All Users</strong> tasks are shown to everyone regardless of experience level</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content: Tasks (2/3) + Sidebar (1/3) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks Section - Takes 2/3 on large screens */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <span>Tasks</span>
                <span className="text-sm font-normal text-gray-500">({project.setup.tasks.length})</span>
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleAllTasks}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1"
                >
                  {allExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Collapse All</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Expand All</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {project.setup.randomizeOrder && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                <Shuffle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900">
                  Task order will be randomized for each participant
                </p>
              </div>
            )}

            <div className="space-y-3">
              {project.setup.tasks.map((task, index) => {
                const isExpanded = expandedTasks.has(task.id);
                
                return (
                  <div key={task.id} className="border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                    {/* Task Header - Always Visible */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2 flex-wrap">
                            <div className="flex items-center space-x-2">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              )}
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0">
                                {index + 1}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(task.difficulty)}`}>
                              {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                            </span>
                            {task.estimatedTime && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {task.estimatedTime}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 mb-1">{task.title}</h3>
                          
                          {/* Show brief description when collapsed */}
                          {!isExpanded && (
                            <div className="text-sm text-gray-600">
                              {task.objective ? (
                                <p className="line-clamp-2">{task.objective}</p>
                              ) : task.description ? (
                                <p className="line-clamp-2">{task.description}</p>
                              ) : (
                                <p className="text-gray-400 italic">Click to expand details</p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Edit button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTask(task);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                          aria-label="Edit task"
                          title="Edit task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Task Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="space-y-2 text-sm pt-3">
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
                              <span className="text-gray-700 whitespace-pre-wrap">{task.scenario}</span>
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

                        {/* Task Features */}
                        <div className="flex flex-wrap gap-2 mt-4">
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
                              {task.difficulty === 'easy' ? 'Non-Users' : task.difficulty === 'medium' ? 'Occasional Users' : task.difficulty === 'all' ? 'All Users' : 'Active Users'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {project.setup.beforeMessage}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">During Session (Scenario)</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {project.setup.duringScenario}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">After Session</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>Participants</span>
                <span className="text-sm font-normal text-gray-500">({projectParticipants.length})</span>
              </h2>
              {availableParticipants.length > 0 && (
                <button
                  onClick={() => setShowAddParticipantModal(true)}
                  className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Add participant"
                  title="Add participant"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>

            {projectParticipants.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm mb-4">No participants assigned</p>
                {availableParticipants.length > 0 ? (
                  <button
                    onClick={() => setShowAddParticipantModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                  >
                    Add Participant
                  </button>
                ) : (
                  <p className="text-xs text-gray-500">
                    Create participants in the dashboard first
                  </p>
                )}
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
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm mb-1 truncate" title={participant.name}>
                            {participant.name}
                          </div>
                          <div className="text-xs text-gray-600 truncate" title={participant.email}>
                            {participant.email}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                          aria-label="Remove participant"
                          title="Remove from project"
                        >
                          <X className="w-4 h-4" />
                        </button>
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

                      <div className="space-y-2">
                        <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔵 Button clicked for:', participant.name);
    onStartSession(Number(participant.id));
  }}
  className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
>
  Start Session
</button>
                        <button
                          onClick={() => handleSendLink(participant)}
                          className="w-full bg-white border-2 border-blue-600 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Send Link</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Participant Modal */}
      {showAddParticipantModal && availableParticipants.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Participant</h2>
              <button
                onClick={() => setShowAddParticipantModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Choose a participant to add to this project:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableParticipants.map(participant => (
                <button
                  key={participant.id}
                  onClick={() => handleAddParticipant(participant)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{participant.name}</div>
                  <div className="text-sm text-gray-600">{participant.email}</div>
                  {participant.defaultUsageLevel && (
                    <div className="text-xs text-gray-500 mt-1">
                      Default: {getUsageLevelLabel(participant.defaultUsageLevel)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={(updates) => handleSaveTask(Number(editingTask.id), updates)}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* Usage Level Modal */}
      {showUsageLevelModal && participantToAdd && (
        <UsageLevelModal
          show={showUsageLevelModal}
          participant={participantToAdd}
          onConfirm={handleConfirmUsageLevel}
          onClose={() => {
            setShowUsageLevelModal(false);
            setParticipantToAdd(null);
          }}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && selectedParticipant && (
        <EmailModal
          show={showEmailModal}
          participant={selectedParticipant}
          project={project}
          link={sessionLink}
          expiryDate={linkExpiry}
          expiryDays={expiryDays}
          template={emailTemplate}
          onTemplateChange={setEmailTemplate}
          onExpiryDaysChange={handleExpiryDaysChange}
          onCopyEmail={handleCopyEmail}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}
