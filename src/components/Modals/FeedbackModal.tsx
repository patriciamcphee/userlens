// components/Modals/FeedbackModal.tsx
import React from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';
import { Task, TaskFeedback } from '../../types';

interface FeedbackModalProps {
  show: boolean;
  task: Task;
  currentTaskAnswer: string;
  currentTaskRating: number;
  currentQuestionAnswers: { questionId: number; answer: string }[];
  onAnswerChange: (value: string) => void;
  onRatingChange: (rating: number) => void;
  onQuestionAnswerChange: (questionId: number, answer: string) => void;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Task Feedback</h2>
        </div>

        <div className="p-6">
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>

          {task.ratingEnabled && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {task.ratingLabel || 'Rate this task'}
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
              {task.customQuestions.map((q, idx) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question {idx + 1}: {q.question}
                  </label>
                  <textarea
                    value={currentQuestionAnswers.find(a => a.questionId === q.id)?.answer || ''}
                    onChange={(e) => onQuestionAnswerChange(q.id, e.target.value)}
                    placeholder="Your answer..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              ))}
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
              disabled={task.ratingEnabled && currentTaskRating === 0}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {task.ratingEnabled && currentTaskRating === 0 ? 'Please provide a rating' : 'Submit & Continue'}
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



