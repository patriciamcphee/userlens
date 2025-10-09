// components/ProjectSetup/ProjectDetailsForm.tsx
import React from 'react';
import { Users, User } from 'lucide-react';

interface ProjectDetailsFormProps {
  name: string;
  description: string;
  mode: 'moderated' | 'unmoderated' | null;
  errors: { name?: string; description?: string; mode?: string };
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onModeChange: (mode: 'moderated' | 'unmoderated') => void;
}

export function ProjectDetailsForm({
  name,
  description,
  mode,
  errors,
  onNameChange,
  onDescriptionChange,
  onModeChange
}: ProjectDetailsFormProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Project Details</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g., E-commerce Checkout Flow"
            maxLength={100}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Brief description of what you're testing..."
            maxLength={500}
            className={`w-full h-20 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/500 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Testing Mode <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onModeChange('moderated')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                mode === 'moderated'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Users className={`w-6 h-6 mb-2 ${mode === 'moderated' ? 'text-blue-600' : 'text-gray-600'}`} />
              <div className="font-semibold text-gray-900">Moderated</div>
              <div className="text-sm text-gray-600">Live sessions with observation</div>
            </button>
            <button
              onClick={() => onModeChange('unmoderated')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                mode === 'unmoderated'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className={`w-6 h-6 mb-2 ${mode === 'unmoderated' ? 'text-purple-600' : 'text-gray-600'}`} />
              <div className="font-semibold text-gray-900">Unmoderated</div>
              <div className="text-sm text-gray-600">Self-guided task completion</div>
            </button>
          </div>
          {errors.mode && (
            <p className="text-red-500 text-sm mt-2">{errors.mode}</p>
          )}
        </div>
      </div>
    </div>
  );
}