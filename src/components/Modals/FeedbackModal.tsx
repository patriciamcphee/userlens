// components/Modals/FeedbackModal.tsx - UPDATED for Yes/No and new task structure
import React from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';
import { Task, TaskFeedback } from '../../types';

interface FeedbackModalProps {
  show: boolean;
  task: Task;
  currentTaskAnswer: string;
  currentTaskRating: number;
  currentQuestionAnswers: { questionId: number; answer: string | string[] }[];
  onAnswerChange: (value: string) => void;
  onRatingChange: (rating: number) => void;
  onQuestionAnswerChange: (questionId: number, answer: string | string[]) => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export function FeedbackModal({
  show,
  task,
  currentTaskAnswer,
  currentTaskRating,
  currentQuestionAnswers,
  onAnswerChange,
  onRatingChange,
  onQuestionAnswerChange,
  onSubmit,
  onSkip
}: FeedbackModalProps) {
  if (!show) return null;

  const getQuestionAnswer = (questionId: number): string | string[] => {
    return currentQuestionAnswers.find(a => a.questionId === questionId)?.answer || '';
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
    
    onQuestionAnswerChange(questionId, newAnswer);
  };

  const canSubmit = () => {
    // Check if rating is required and provided
    if (task.ratingEnabled && currentTaskRating === 0) {
      return false;
    }
    
    // Check if required questions are answered
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Task Feedback</h2>
        </div>

        <div className="p-6">
          {/* Task Display - showing new structure */}
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">{task.title}</h3>
            
            {task.estimatedTime && (
              <div className="text-sm text-gray-600 mb-2">
                <strong>Time:</strong> {task.estimatedTime}
              </div>
            )}
            
            {task.objective && (
              <div className="text-sm text-gray-700 mb-2">
                <strong>Objective:</strong> {task.objective}
              </div>
            )}
            
            {task.scenario && (
              <div className="text-sm text-gray-700 mb-2">
                <strong>Scenario:</strong> {task.scenario}
              </div>
            )}
            
            {task.yourTask && task.yourTask.length > 0 && task.yourTask[0] !== '' && (
              <div className="mb-2">
                <strong className="text-sm text-gray-700">Your Task:</strong>
                <ol className="list-decimal list-inside text-sm text-gray-700 ml-2 mt-1">
                  {task.yourTask.map((step, idx) => (
                    step && <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            
            {task.successCriteria && (
              <div className="text-sm text-gray-700">
                <strong>Success Criteria:</strong> {task.successCriteria}
              </div>
            )}
            
            {/* Fallback to old description if exists */}
            {task.description && !task.objective && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}
          </div>

          {task.ratingEnabled && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {task.ratingLabel || 'Rate this task'} <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{task.ratingScale?.low}</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => onRatingChange(rating)}
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
                <span className="text-xs text-gray-500">{task.ratingScale?.high}</span>
              </div>
            </div>
          )}

          {task.customQuestions && task.customQuestions.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-200 space-y-4">
              {task.customQuestions.map((q, idx) => {
                const answer = getQuestionAnswer(q.id);
                // Default to 'text' if type is not specified (legacy questions)
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
                        onChange={(e) => onQuestionAnswerChange(q.id, e.target.value)}
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
                            onChange={(e) => onQuestionAnswerChange(q.id, e.target.value)}
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
                            onChange={(e) => onQuestionAnswerChange(q.id, e.target.value)}
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
                              onChange={(e) => onQuestionAnswerChange(q.id, e.target.value)}
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
              Additional Comments (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Describe your thought process, any challenges you faced, or other feedback.
            </p>
            <textarea
              value={currentTaskAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Example: I found the button easily but wasn't sure what would happen when I clicked it..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onSubmit}
              disabled={!canSubmit()}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!canSubmit() ? 'Please complete required fields' : 'Submit & Continue'}
            </button>
            <button
              onClick={onSkip}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}