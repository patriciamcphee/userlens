// components/ProjectSetup/WizardSteps/TasksStep.tsx
import React, { useState } from 'react';
import { Plus, Shuffle, GripVertical, Eye, EyeOff, ChevronDown, ChevronUp, Target, Info, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '../../UI/Button';
import { Task } from '../../../types';
import { TaskItem } from '../TaskItem';
import { DEFAULT_TASK } from '../../../constants';

interface TasksStepProps {
  data: {
    tasks: Task[];
    randomizeOrder: boolean;
  };
  updateData: (updates: any) => void;
}

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';
type ViewMode = 'expanded' | 'collapsed';

export function TasksStep({ data, updateData }: TasksStepProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('expanded');
  const [draggedTask, setDraggedTask] = useState<number | null>(null);

  // Filter tasks based on difficulty
  const filteredTasks = data.tasks.filter(task => {
    if (difficultyFilter === 'all') return true;
    return task.difficulty === difficultyFilter;
  });

  // Task difficulty breakdown for stats
  const taskStats = {
    total: data.tasks.length,
    easy: data.tasks.filter(t => t.difficulty === 'easy').length,
    medium: data.tasks.filter(t => t.difficulty === 'medium').length,
    hard: data.tasks.filter(t => t.difficulty === 'hard').length,
    all: data.tasks.filter(t => t.difficulty === 'all').length
  };

  const handleAddTask = (difficulty: 'easy' | 'medium' | 'hard' | 'all' = 'medium') => {
    const newTask: Task = {
      id: Date.now(),
      ...DEFAULT_TASK,
      difficulty
    };
    updateData({ tasks: [...data.tasks, newTask] });
  };

  const handleRemoveTask = (taskId: number) => {
    if (data.tasks.length === 1) {
      // Don't allow removing the last task
      return;
    }
    updateData({
      tasks: data.tasks.filter(task => task.id !== taskId)
    });
  };

  const handleUpdateTask = (taskId: number, updates: Partial<Task>) => {
    updateData({
      tasks: data.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    });
  };

  const handleDuplicateTask = (task: Task) => {
    const duplicatedTask: Task = {
      ...task,
      id: Date.now(),
      title: `${task.title} (Copy)`
    };
    const taskIndex = data.tasks.findIndex(t => t.id === task.id);
    const newTasks = [...data.tasks];
    newTasks.splice(taskIndex + 1, 0, duplicatedTask);
    updateData({ tasks: newTasks });
  };

  const handleDragStart = (taskId: number) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropTaskId: number) => {
    e.preventDefault();
    
    if (draggedTask === null || draggedTask === dropTaskId) return;

    const draggedIndex = data.tasks.findIndex(t => t.id === draggedTask);
    const dropIndex = data.tasks.findIndex(t => t.id === dropTaskId);

    if (draggedIndex === -1 || dropIndex === -1) return;

    const newTasks = [...data.tasks];
    const [draggedItem] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(dropIndex, 0, draggedItem);

    updateData({ tasks: newTasks });
    setDraggedTask(null);
  };

  const toggleAllTasks = () => {
    setViewMode(viewMode === 'expanded' ? 'collapsed' : 'expanded');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 border-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 border-red-300';
      case 'all': return 'text-blue-600 bg-blue-100 border-blue-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy (Non-Users)';
      case 'medium': return 'Medium (Occasional)';
      case 'hard': return 'Hard (Active Users)';
      case 'all': return 'All Users';
      default: return difficulty;
    }
  };

  return (
    <div className="space-y-6">
      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Task Organization</p>
            <p className="mb-2">
              Create tasks that participants will complete during testing sessions. Tasks are filtered by difficulty level based on participant experience.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>• <strong>Easy tasks:</strong> Shown to Non-Users</div>
              <div>• <strong>Medium tasks:</strong> Shown to Occasional Users</div>
              <div>• <strong>Hard tasks:</strong> Shown to Active Users</div>
              <div>• <strong>All Users tasks:</strong> Shown to everyone</div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{taskStats.easy}</div>
          <div className="text-sm text-green-600">Easy</div>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700">{taskStats.medium}</div>
          <div className="text-sm text-yellow-600">Medium</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{taskStats.hard}</div>
          <div className="text-sm text-red-600">Hard</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{taskStats.all}</div>
          <div className="text-sm text-blue-600">All Users</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left side controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Difficulty Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as DifficultyFilter)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Difficulties ({taskStats.total})</option>
                <option value="easy">Easy ({taskStats.easy})</option>
                <option value="medium">Medium ({taskStats.medium})</option>
                <option value="hard">Hard ({taskStats.hard})</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllTasks}
              leftIcon={viewMode === 'expanded' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            >
              {viewMode === 'expanded' ? 'Collapse All' : 'Expand All'}
            </Button>

            {/* Randomize Order */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.randomizeOrder}
                onChange={(e) => updateData({ randomizeOrder: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <Shuffle className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Randomize order</span>
            </label>
          </div>

          {/* Right side - Add Task Dropdown */}
          <div className="relative">
            <div className="flex items-center space-x-2">
              <Button
                variant="primary"
                onClick={() => handleAddTask()}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Task
              </Button>
              
              {/* Quick Add by Difficulty */}
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => handleAddTask('easy')}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-green-50 text-green-700"
                    >
                      + Easy Task (Non-Users)
                    </button>
                    <button
                      onClick={() => handleAddTask('medium')}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-yellow-50 text-yellow-700"
                    >
                      + Medium Task (Occasional)
                    </button>
                    <button
                      onClick={() => handleAddTask('hard')}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-red-50 text-red-700"
                    >
                      + Hard Task (Active)
                    </button>
                    <button
                      onClick={() => handleAddTask('all')}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 text-blue-700"
                    >
                      + All Users Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {difficultyFilter === 'all' ? 'No tasks yet' : `No ${difficultyFilter} tasks`}
            </h4>
            <p className="text-gray-600 mb-4">
              {difficultyFilter === 'all' 
                ? 'Add your first task to get started'
                : `Create tasks for ${getDifficultyLabel(difficultyFilter).toLowerCase()} to see them here`
              }
            </p>
            <Button
              variant="primary"
              onClick={() => handleAddTask(difficultyFilter === 'all' ? 'medium' : difficultyFilter as any)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add {difficultyFilter === 'all' ? '' : getDifficultyLabel(difficultyFilter)} Task
            </Button>
          </div>
        ) : (
          <>
            {/* Task Count and Filter Info */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredTasks.length} of {data.tasks.length} tasks
                {difficultyFilter !== 'all' && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(difficultyFilter)}`}>
                    {getDifficultyLabel(difficultyFilter)}
                  </span>
                )}
              </span>
              
              {data.randomizeOrder && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <Shuffle className="w-4 h-4" />
                  <span>Order will be randomized</span>
                </div>
              )}
            </div>

            {/* Tasks */}
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(Number(task.id))}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, Number(task.id))}
                className={`relative transition-all ${
                  draggedTask === task.id ? 'opacity-50' : ''
                }`}
              >
                {/* Task Header - Always Visible */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="flex items-start space-x-3">
                    {/* Drag Handle */}
                    <div className="flex flex-col items-center space-y-1 pt-1">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {data.tasks.findIndex(t => t.id === task.id) + 1}
                      </span>
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      {viewMode === 'expanded' ? (
                        <TaskItem
                          task={task}
                          index={data.tasks.findIndex(t => t.id === task.id)}
                          canDelete={data.tasks.length > 1}
                          onUpdate={(updates) => handleUpdateTask(Number(task.id), updates)}
                          onRemove={() => handleRemoveTask(Number(task.id))}
                        />
                      ) : (
                        /* Collapsed View */
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {task.title || 'Untitled Task'}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(task.difficulty)}`}>
                                {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                              </span>
                              {task.estimatedTime && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {task.estimatedTime}
                                </span>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicateTask(task)}
                                className="text-gray-400 hover:text-blue-600"
                                title="Duplicate task"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              
                              {data.tasks.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveTask(Number(task.id))}
                                  className="text-gray-400 hover:text-red-600"
                                  title="Delete task"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Brief description */}
                          <div className="text-sm text-gray-600">
                            {task.objective ? (
                              <p className="line-clamp-1">{task.objective}</p>
                            ) : task.description ? (
                              <p className="line-clamp-1">{task.description}</p>
                            ) : (
                              <p className="text-gray-400 italic">Click to add details</p>
                            )}
                          </div>

                          {/* Task features */}
                          <div className="flex items-center space-x-3 text-xs">
                            {task.ratingEnabled && (
                              <span className="flex items-center space-x-1 text-amber-600">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Rating</span>
                              </span>
                            )}
                            {task.customQuestions && task.customQuestions.length > 0 && (
                              <span className="flex items-center space-x-1 text-purple-600">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{task.customQuestions.length} questions</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Validation Messages */}
      {data.tasks.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-red-600 mt-0.5">⚠️</div>
            <div className="text-sm">
              <p className="font-medium text-red-900">At least one task is required</p>
              <p className="text-red-800 mt-1">
                Add at least one task before proceeding to the next step.
              </p>
            </div>
          </div>
        </div>
      )}

      {data.tasks.some(task => !task.title.trim()) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
            <div className="text-sm">
              <p className="font-medium text-amber-900">Incomplete tasks detected</p>
              <p className="text-amber-800 mt-1">
                Some tasks are missing titles. Complete all tasks before proceeding.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Task Creation Tips</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• Keep task titles clear and specific</p>
          <p>• Use scenarios to provide context for participants</p>
          <p>• Break complex workflows into multiple tasks</p>
          <p>• Add custom questions to gather specific feedback</p>
          <p>• Use difficulty levels to match participant experience</p>
          <p>• Drag tasks to reorder them (unless randomized)</p>
        </div>
      </div>
    </div>
  );
}