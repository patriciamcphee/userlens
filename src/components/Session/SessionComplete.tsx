// components/Session/SessionComplete.tsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SessionCompleteProps {
  afterMessage: string;
  completedTasks: number;
  totalTasks: number;
  onBackToProject: () => void;
  onBackToDashboard: () => void;
}

export function SessionComplete({
  afterMessage,
  completedTasks,
  totalTasks,
  onBackToProject,
  onBackToDashboard
}: SessionCompleteProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-12 text-center">
        <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 mx-auto">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Session Complete!</h2>
        <div className="text-lg text-gray-700 mb-8 whitespace-pre-wrap">
          {afterMessage}
        </div>
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">{completedTasks}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
          </div>
        </div>
        <div className="flex space-x-4 justify-center">
          <button
            onClick={onBackToProject}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Project
          </button>
          <button
            onClick={onBackToDashboard}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

