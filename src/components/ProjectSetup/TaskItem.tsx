// components/ProjectSetup/TaskItem.tsx
import React from 'react';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { Task, TaskQuestion } from '../../types';

interface TaskItemProps {
  task: Task;
  index: number;
  canDelete: boolean;
  onUpdate: (updates: Partial<Task>) => void;
  onRemove: () => void;
}

export function TaskItem({ task, index, canDelete, onUpdate, onRemove }: TaskItemProps) {
  const addQuestion = () => {
    const newQuestion: TaskQuestion = {
      id: Date.now(),
      question: '',
      type: 'text',
      required: false
    };
    onUpdate({
      customQuestions: [...(task.customQuestions || []), newQuestion]
    });
  };

  const updateQuestion = (questionId: number, updates: Partial<TaskQuestion>) => {
    onUpdate({
      customQuestions: (task.customQuestions || []).map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    });
  };

  const removeQuestion = (questionId: number) => {
    onUpdate({
      customQuestions: (task.customQuestions || []).filter(q => q.id !== questionId)
    });
  };

  const addOption = (questionId: number) => {
    const question = (task.customQuestions || []).find(q => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: [...(question.options || []), '']
      });
    }
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    const question = (task.customQuestions || []).find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    const question = (task.customQuestions || []).find(q => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: question.options.filter((_, i) => i !== optionIndex)
      });
    }
  };

  const updateRatingScale = (field: 'low' | 'high', value: string) => {
    onUpdate({
      ratingScale: {
        ...task.ratingScale!,
        [field]: value
      }
    });
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
        
        <div className="flex-1 space-y-3">
          {/* Task Title & Description */}
          <input
            type="text"
            value={task.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Task title..."
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            value={task.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Task description..."
            maxLength={500}
            className="w-full h-16 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Rating Scale Configuration */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={task.ratingEnabled || false}
                onChange={(e) => onUpdate({ ratingEnabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable Rating Scale (1-5)</span>
            </label>

            {task.ratingEnabled && (
              <div className="space-y-3 pl-6 border-l-2 border-blue-300">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    What are you measuring?
                  </label>
                  <select
                    value={task.ratingLabel}
                    onChange={(e) => onUpdate({ ratingLabel: e.target.value })}
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
                      value={task.ratingScale?.low || ''}
                      onChange={(e) => updateRatingScale('low', e.target.value)}
                      placeholder="Very Easy"
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
                      value={task.ratingScale?.high || ''}
                      onChange={(e) => updateRatingScale('high', e.target.value)}
                      placeholder="Very Difficult"
                      maxLength={50}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom Questions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Custom Questions</span>
              <button
                onClick={addQuestion}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Question</span>
              </button>
            </div>

            {(task.customQuestions || []).length === 0 ? (
              <p className="text-xs text-gray-500 italic">No custom questions yet</p>
            ) : (
              <div className="space-y-4">
                {(task.customQuestions || []).map((q, idx) => (
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
                              type: e.target.value as 'text' | 'multiple-choice' | 'checkbox',
                              options: e.target.value !== 'text' ? (q.options || ['']) : undefined
                            })}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="text">Text Answer</option>
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
                ))}
              </div>
            )}
          </div>
        </div>

        {canDelete && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 flex-shrink-0 mt-2 transition-colors"
            aria-label="Remove task"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}