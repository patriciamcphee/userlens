// components/ProjectSetup/WizardSteps/ReviewStep.tsx
import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Users, 
  User, 
  UserX, 
  Camera, 
  Mic, 
  MessageSquare, 
  Target, 
  Star, 
  Shuffle,
  Edit2,
  Clock,
  FileText,
  Settings,
  Play
} from 'lucide-react';
import { Button } from '../../UI/Button';
import { Task, Participant } from '../../../types';
import { getUsageLevelLabel } from '../../../utils/taskFiltering';

interface ReviewStepProps {
  data: {
    name: string;
    description: string;
    mode: 'moderated' | 'unmoderated' | null;
    cameraOption: 'optional' | 'required' | 'disabled';
    micOption: 'optional' | 'required' | 'disabled';
    selectedParticipants: Array<{ participantId: string | number; usageLevel: 'active' | 'occasionally' | 'non-user' }>;
    beforeMessage: string;
    duringScenario: string;
    afterMessage: string;
    tasks: Task[];
    randomizeOrder: boolean;
  };
  participants: Participant[];
  isEditing: boolean;
  onEditStep?: (stepIndex: number) => void;
}

export function ReviewStep({ data, participants, isEditing, onEditStep }: ReviewStepProps) {
  // Validation
  const validation = {
    hasName: data.name.trim() !== '',
    hasMode: data.mode !== null,
    hasBeforeMessage: data.beforeMessage.trim() !== '',
    hasAfterMessage: data.afterMessage.trim() !== '',
    hasTasks: data.tasks.length > 0,
    hasValidTasks: data.tasks.some(task => task.title.trim() !== ''),
    allTasksValid: data.tasks.every(task => task.title.trim() !== '')
  };

  const isValid = Object.values(validation).every(Boolean);

  // Task statistics
  const taskStats = {
    total: data.tasks.length,
    easy: data.tasks.filter(t => t.difficulty === 'easy').length,
    medium: data.tasks.filter(t => t.difficulty === 'medium').length,
    hard: data.tasks.filter(t => t.difficulty === 'hard').length,
    all: data.tasks.filter(t => t.difficulty === 'all').length,
    withRating: data.tasks.filter(t => t.ratingEnabled).length,
    withQuestions: data.tasks.filter(t => t.customQuestions && t.customQuestions.length > 0).length
  };

  // Participant data
  const selectedParticipantData = data.selectedParticipants.map(sp => ({
    ...sp,
    participant: participants.find(p => String(p.id) === String(sp.participantId))
  })).filter(sp => sp.participant);

  const getMediaOptionLabel = (option: string) => {
    switch (option) {
      case 'required': return 'Required';
      case 'optional': return 'Optional';
      case 'disabled': return 'Disabled';
      default: return option;
    }
  };

  const getMediaOptionColor = (option: string) => {
    switch (option) {
      case 'required': return 'text-red-700 bg-red-50 border-red-200';
      case 'optional': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'disabled': return 'text-gray-700 bg-gray-50 border-gray-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-700 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-700 bg-red-50 border-red-200';
      case 'all': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getModeColor = (mode: string) => {
    return mode === 'moderated' 
      ? 'text-blue-700 bg-blue-50 border-blue-200'
      : 'text-purple-700 bg-purple-50 border-purple-200';
  };

  const getModeIcon = (mode: string) => {
    return mode === 'moderated' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Validation Status */}
      {!isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-red-900 mb-2">Complete the following before creating your project:</p>
              <ul className="space-y-1 text-red-800">
                {!validation.hasName && <li>• Project name is required</li>}
                {!validation.hasMode && <li>• Testing mode must be selected</li>}
                {!validation.hasBeforeMessage && <li>• Welcome message is required</li>}
                {!validation.hasAfterMessage && <li>• Completion message is required</li>}
                {!validation.hasTasks && <li>• At least one task is required</li>}
                {validation.hasTasks && !validation.hasValidTasks && <li>• All tasks must have titles</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isValid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="text-sm text-green-900">
              <p className="font-medium">
                {isEditing ? 'Ready to save changes' : 'Ready to create project'}
              </p>
              <p className="text-green-800 mt-1">
                All required fields are complete. Review the details below and {isEditing ? 'save your changes' : 'create your project'}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Project Basics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Project Basics</span>
          </h3>
          {onEditStep && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(0)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <p className="text-gray-900 bg-gray-50 rounded-lg p-3 border">
              {data.name || <span className="text-red-500 italic">Not specified</span>}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <p className="text-gray-900 bg-gray-50 rounded-lg p-3 border">
              {data.description || <span className="text-gray-500 italic">No description provided</span>}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Testing Mode</label>
            {data.mode ? (
              <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getModeColor(data.mode)}`}>
                {getModeIcon(data.mode)}
                <span className="font-medium">
                  {data.mode === 'moderated' ? 'Moderated' : 'Unmoderated'}
                </span>
                <span className="text-sm">
                  {data.mode === 'moderated' ? '(Live observation)' : '(Self-guided)'}
                </span>
              </div>
            ) : (
              <span className="text-red-500 italic">Not selected</span>
            )}
          </div>
        </div>
      </div>

      {/* Recording Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Recording Settings</span>
          </h3>
          {onEditStep && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(1)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Camera (Screen Recording)</label>
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getMediaOptionColor(data.cameraOption)}`}>
              <Camera className="w-4 h-4" />
              <span className="font-medium">{getMediaOptionLabel(data.cameraOption)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Microphone (Audio Recording)</label>
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getMediaOptionColor(data.micOption)}`}>
              <Mic className="w-4 h-4" />
              <span className="font-medium">{getMediaOptionLabel(data.micOption)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> All sessions automatically track keyboard, mouse, and interaction data for analytics.
          </p>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Participants ({selectedParticipantData.length})</span>
          </h3>
          {onEditStep && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(2)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Edit
            </Button>
          )}
        </div>

        {selectedParticipantData.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No participants added yet</p>
            <p className="text-sm text-gray-500 mt-1">You can add participants later from the project details page</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedParticipantData.map((sp) => (
              <div key={String(sp.participantId)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{sp.participant!.name}</p>
                  <p className="text-sm text-gray-600">{sp.participant!.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    sp.usageLevel === 'active' ? 'text-red-700 bg-red-50 border-red-200' :
                    sp.usageLevel === 'occasionally' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                    'text-green-700 bg-green-50 border-green-200'
                  }`}>
                    {getUsageLevelLabel(sp.usageLevel)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Messages */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Session Messages</span>
          </h3>
          {onEditStep && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(3)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
            <div className="bg-gray-50 rounded-lg p-3 border max-h-24 overflow-y-auto">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {data.beforeMessage || <span className="text-red-500 italic">Not specified</span>}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scenario Context</label>
            <div className="bg-gray-50 rounded-lg p-3 border max-h-20 overflow-y-auto">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {data.duringScenario || <span className="text-gray-500 italic">No scenario provided</span>}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Completion Message</label>
            <div className="bg-gray-50 rounded-lg p-3 border max-h-24 overflow-y-auto">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {data.afterMessage || <span className="text-red-500 italic">Not specified</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Tasks ({taskStats.total})</span>
          </h3>
          {onEditStep && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(4)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Edit
            </Button>
          )}
        </div>

        {data.tasks.length === 0 ? (
          <div className="text-center py-8 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
            <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 font-medium">No tasks defined</p>
            <p className="text-sm text-red-500 mt-1">At least one task is required to create the project</p>
          </div>
        ) : (
          <>
            {/* Task Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
                <div className="text-lg font-bold text-green-700">{taskStats.easy}</div>
                <div className="text-sm text-green-600">Easy Tasks</div>
              </div>
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 text-center">
                <div className="text-lg font-bold text-yellow-700">{taskStats.medium}</div>
                <div className="text-sm text-yellow-600">Medium Tasks</div>
              </div>
              <div className="bg-red-50 rounded-lg border border-red-200 p-3 text-center">
                <div className="text-lg font-bold text-red-700">{taskStats.hard}</div>
                <div className="text-sm text-red-600">Hard Tasks</div>
              </div>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 text-center">
                <div className="text-lg font-bold text-blue-700">{taskStats.all}</div>
                <div className="text-sm text-blue-600">All Users</div>
              </div>
            </div>

            {/* Task Features */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {data.randomizeOrder && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-lg">
                  <Shuffle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Random Order</span>
                </div>
              )}
              
              {taskStats.withRating > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                  <Star className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">{taskStats.withRating} with ratings</span>
                </div>
              )}
              
              {taskStats.withQuestions > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">{taskStats.withQuestions} with questions</span>
                </div>
              )}
            </div>

            {/* Task List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.tasks.map((task, index) => (
                <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {task.title || <span className="text-red-500 italic">Untitled Task</span>}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                      </span>
                      {task.estimatedTime && (
                        <span className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimatedTime}</span>
                        </span>
                      )}
                    </div>
                    
                    {task.objective && (
                      <p className="text-sm text-gray-600 line-clamp-1">{task.objective}</p>
                    )}
                    
                    <div className="flex items-center space-x-3 mt-2">
                      {task.ratingEnabled && (
                        <span className="flex items-center space-x-1 text-xs text-amber-600">
                          <Star className="w-3 h-3" />
                          <span>Rating</span>
                        </span>
                      )}
                      {task.customQuestions && task.customQuestions.length > 0 && (
                        <span className="flex items-center space-x-1 text-xs text-purple-600">
                          <MessageSquare className="w-3 h-3" />
                          <span>{task.customQuestions.length} question{task.customQuestions.length !== 1 ? 's' : ''}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Project Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
          <Play className="w-5 h-5" />
          <span>Project Summary</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700">Testing Mode:</span>
            <p className="text-blue-900">{data.mode ? (data.mode === 'moderated' ? 'Moderated (Live)' : 'Unmoderated (Self-guided)') : 'Not selected'}</p>
          </div>
          
          <div>
            <span className="font-medium text-blue-700">Total Tasks:</span>
            <p className="text-blue-900">{taskStats.total} task{taskStats.total !== 1 ? 's' : ''}</p>
          </div>
          
          <div>
            <span className="font-medium text-blue-700">Participants:</span>
            <p className="text-blue-900">{selectedParticipantData.length} assigned</p>
          </div>
          
          <div>
            <span className="font-medium text-blue-700">Screen Recording:</span>
            <p className="text-blue-900">{getMediaOptionLabel(data.cameraOption)}</p>
          </div>
          
          <div>
            <span className="font-medium text-blue-700">Audio Recording:</span>
            <p className="text-blue-900">{getMediaOptionLabel(data.micOption)}</p>
          </div>
          
          <div>
            <span className="font-medium text-blue-700">Task Order:</span>
            <p className="text-blue-900">{data.randomizeOrder ? 'Randomized' : 'Fixed'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}