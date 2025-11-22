// components/ProjectDetail/EditTaskModal.tsx - UPDATED WITH QUESTION BANK
import { useState } from 'react';
import { X, Target, Plus, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Task, TaskQuestion } from '../../types';
import { QuestionBankModal } from './QuestionBankModal';

// Import the utility function for rating scales
function getDefaultRatingScale(label: string): { low: string; high: string } {
  const defaults: Record<string, { low: string; high: string }> = {
    'Task Difficulty': { low: 'Very Easy', high: 'Very Difficult' },
    'Confidence Level': { low: 'Not Confident', high: 'Very Confident' },
    'Satisfaction': { low: 'Very Unsatisfied', high: 'Very Satisfied' },
    'Clarity': { low: 'Very Confusing', high: 'Very Clear' },
    'Ease of Use': { low: 'Very Difficult', high: 'Very Easy' },
    'Success Rate': { low: 'Not Successful', high: 'Very Successful' }
  };
  
  return defaults[label] || { low: 'Low', high: 'High' };
}

interface EditTaskModalProps {
  task: Task;
  onSave: (updates: Partial<Task>) => void;
  onClose: () => void;
}

const ESTIMATED_TIME_OPTIONS = [
  "1-2 minutes",
  "3-5 minutes",
  "5-10 minutes",
  "10-15 minutes",
  "15-20 minutes",
  "20+ minutes"
];

export function EditTaskModal({ task, onSave, onClose }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [estimatedTime, setEstimatedTime] = useState(task.estimatedTime || '');
  const [objective, setObjective] = useState(task.objective || '');
  const [scenario, setScenario] = useState(task.scenario || '');
  const [yourTask, setYourTask] = useState<string[]>(task.yourTask || ['', '', '']);
  const [successCriteria, setSuccessCriteria] = useState(task.successCriteria || '');
  const [difficulty, setDifficulty] = useState(task.difficulty);
  const [ratingEnabled, setRatingEnabled] = useState(task.ratingEnabled || false);
  const [ratingLabel, setRatingLabel] = useState(task.ratingLabel || 'Task Difficulty');
  const [ratingScale, setRatingScale] = useState(task.ratingScale || { low: 'Very Easy', high: 'Very Difficult' });
  const [customQuestions, setCustomQuestions] = useState<TaskQuestion[]>(task.customQuestions || []);
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [showQuestions, setShowQuestions] = useState(false);
  
  // ✅ NEW: Question Bank modal state
  const [showQuestionBank, setShowQuestionBank] = useState(false);

  // Handler to auto-populate rating scale values when label changes
  const handleRatingLabelChange = (newLabel: string) => {
    setRatingLabel(newLabel);
    const defaultScale = getDefaultRatingScale(newLabel);
    setRatingScale(defaultScale);
  };

  const handleSave = () => {
    // Validation
    const newErrors: { title?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Filter out empty task steps
    const filteredSteps = yourTask.filter(step => step.trim() !== '');

    onSave({
      title: title.trim(),
      estimatedTime: estimatedTime.trim(),
      objective: objective.trim(),
      scenario: scenario.trim(),
      yourTask: filteredSteps.length > 0 ? filteredSteps : ['', '', ''],
      successCriteria: successCriteria.trim(),
      difficulty,
      ratingEnabled,
      ratingLabel,
      ratingScale,
      customQuestions
    });
    onClose();
  };

  const addQuestion = () => {
    const newQuestion: TaskQuestion = {
      id: Date.now(),
      question: '',
      type: 'text',
      required: false
    };
    setCustomQuestions([...customQuestions, newQuestion]);
    setShowQuestions(true);
  };

  // ✅ NEW: Handle questions selected from Question Bank
  const handleQuestionsFromBank = (questions: TaskQuestion[]) => {
    setCustomQuestions([...customQuestions, ...questions]);
    setShowQuestions(true); // Expand to show the new questions
  };

  const updateQuestion = (questionId: number, updates: Partial<TaskQuestion>) => {
    setCustomQuestions(customQuestions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  const removeQuestion = (questionId: number) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== questionId));
  };

  const addOption = (questionId: number) => {
    const question = customQuestions.find(q => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: [...(question.options || []), '']
      });
    }
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    const question = customQuestions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    const question = customQuestions.find(q => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: question.options.filter((_, i) => i !== optionIndex)
      });
    }
  };

  const addTaskStep = () => {
    setYourTask([...yourTask, '']);
  };

  const updateTaskStep = (stepIndex: number, value: string) => {
    const newSteps = [...yourTask];
    newSteps[stepIndex] = value;
    setYourTask(newSteps);
  };

  const removeTaskStep = (stepIndex: number) => {
    if (yourTask.length > 1) {
      setYourTask(yourTask.filter((_, i) => i !== stepIndex));
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                placeholder="Task title..."
                maxLength={200}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Estimated Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Time
              </label>
              <div className="flex space-x-2">
                <select
                  value={ESTIMATED_TIME_OPTIONS.includes(estimatedTime) ? estimatedTime : ''}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select estimated time...</option>
                  {ESTIMATED_TIME_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={!ESTIMATED_TIME_OPTIONS.includes(estimatedTime) ? estimatedTime : ''}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="Or custom time"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Objective */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objective (one sentence)
              </label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="What is the goal of this task?"
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Scenario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scenario (paragraph)
              </label>
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Set the context for this task..."
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {scenario.length}/500 characters
              </p>
            </div>

            {/* Your Task (Numbered List) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Task (numbered steps)
              </label>
              <div className="space-y-2">
                {yourTask.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-start space-x-2">
                    <span className="text-sm text-gray-600 mt-2 w-6">{stepIndex + 1}.</span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => updateTaskStep(stepIndex, e.target.value)}
                      placeholder={`Step ${stepIndex + 1}`}
                      maxLength={200}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {yourTask.length > 1 && (
                      <button
                        onClick={() => removeTaskStep(stepIndex)}
                        className="text-red-500 hover:text-red-700 mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addTaskStep}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Step</span>
              </button>
            </div>

            {/* Success Criteria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Success Criteria
              </label>
              <textarea
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
                placeholder="How will the participant know they've completed this task successfully?"
                maxLength={300}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Difficulty Level */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-medium text-gray-900">
                  Task Difficulty Level <span className="text-red-500">*</span>
                </label>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                This determines which participants will see this task based on their usage level
              </p>
              <div className="grid grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setDifficulty('easy')}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    difficulty === 'easy'
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-300 hover:border-green-400 bg-white'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">Easy</div>
                  <div className="text-xs text-gray-600 mt-1">Non-Users</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDifficulty('medium')}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    difficulty === 'medium'
                      ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                      : 'border-gray-300 hover:border-yellow-400 bg-white'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">Medium</div>
                  <div className="text-xs text-gray-600 mt-1">Occasional</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDifficulty('hard')}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    difficulty === 'hard'
                      ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                      : 'border-gray-300 hover:border-red-400 bg-white'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">Hard</div>
                  <div className="text-xs text-gray-600 mt-1">Active</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDifficulty('all')}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    difficulty === 'all'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-blue-400 bg-white'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">All Users</div>
                  <div className="text-xs text-gray-600 mt-1">Everyone</div>
                </button>
              </div>
            </div>

            {/* Rating Scale Configuration */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ratingEnabled}
                  onChange={(e) => setRatingEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable Rating Scale (1-5)</span>
              </label>

              {ratingEnabled && (
                <div className="space-y-3 pl-6 border-l-2 border-blue-300">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      What are you measuring?
                    </label>
                    <select
                      value={ratingLabel}
                      onChange={(e) => handleRatingLabelChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Task Difficulty">Task Difficulty</option>
                      <option value="Confidence Level">Confidence Level</option>
                      <option value="Satisfaction">Satisfaction</option>
                      <option value="Clarity">Clarity</option>
                      <option value="Ease of Use">Ease of Use</option>
                      <option value="Success Rate">Success Rate</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        1 = Low
                      </label>
                      <input
                        type="text"
                        value={ratingScale.low}
                        onChange={(e) => setRatingScale({ ...ratingScale, low: e.target.value })}
                        placeholder="e.g., Not Confident"
                        maxLength={50}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        5 = High
                      </label>
                      <input
                        type="text"
                        value={ratingScale.high}
                        onChange={(e) => setRatingScale({ ...ratingScale, high: e.target.value })}
                        placeholder="e.g., Very Confident"
                        maxLength={50}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ UPDATED: Custom Questions with Question Bank Integration */}
            <div className="bg-gray-50 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setShowQuestions(!showQuestions)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-t-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Custom Questions
                  </span>
                  {customQuestions.length > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {customQuestions.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {/* ✅ NEW: Question Bank Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQuestionBank(true);
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1 px-2 py-1 hover:bg-purple-50 rounded transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Browse Bank</span>
                  </button>
                  
                  {/* Add Custom Question button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addQuestion();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Custom</span>
                  </button>
                  
                  {showQuestions ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {showQuestions && (
                <div className="px-4 pb-4 space-y-4">
                  {customQuestions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 mb-3">No questions added yet</p>
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowQuestionBank(true)}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1 px-3 py-2 hover:bg-purple-50 rounded transition-colors border border-purple-200"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Browse Question Bank</span>
                        </button>
                        <span className="text-gray-400">or</span>
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 px-3 py-2 hover:bg-blue-50 rounded transition-colors border border-blue-200"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create Custom Question</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    customQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start space-x-2 mb-2">
                          <span className="text-xs text-gray-500 mt-2 flex-shrink-0">Q{idx + 1}:</span>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                              placeholder="Enter your question..."
                              maxLength={300}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            
                            <div className="flex items-center space-x-3">
                              <select
                                value={q.type || 'text'}
                                onChange={(e) => updateQuestion(q.id, { 
                                  type: e.target.value as 'text' | 'multiple-choice' | 'checkbox' | 'yes-no',
                                  options: (e.target.value === 'multiple-choice' || e.target.value === 'checkbox') 
                                    ? (q.options || ['']) 
                                    : undefined
                                })}
                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="text">Text Answer</option>
                                <option value="yes-no">Yes/No</option>
                                <option value="multiple-choice">Multiple Choice (single)</option>
                                <option value="checkbox">Multiple Choice (multiple)</option>
                              </select>
                              
                              <label className="flex items-center space-x-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={q.required || false}
                                  onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                                  className="w-3 h-3 text-blue-600 rounded"
                                />
                                <span className="text-xs text-gray-600">Required</span>
                              </label>
                            </div>

                            {/* Options for multiple-choice and checkbox */}
                            {((q.type || 'text') === 'multiple-choice' || (q.type || 'text') === 'checkbox') && (
                              <div className="mt-2 pl-4 border-l-2 border-blue-300 space-y-2">
                                <div className="text-xs font-medium text-gray-700 mb-2">Options:</div>
                                {(q.options || []).map((option, optIdx) => (
                                  <div key={optIdx} className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500 w-6">{String.fromCharCode(65 + optIdx)}.</span>
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                      maxLength={200}
                                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    {(q.options?.length || 0) > 1 && (
                                      <button
                                        onClick={() => removeOption(q.id, optIdx)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  onClick={() => addOption(q.id)}
                                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add Option</span>
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => removeQuestion(q.id)}
                            className="text-red-500 hover:text-red-700 mt-1 transition-colors"
                            aria-label="Remove question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Question Bank Modal */}
      {showQuestionBank && (
        <QuestionBankModal
          onClose={() => setShowQuestionBank(false)}
          onSelectQuestions={handleQuestionsFromBank}
          existingQuestions={customQuestions}
        />
      )}
    </>
  );
}