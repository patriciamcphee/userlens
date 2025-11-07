// components/ProjectSetup/WizardSteps/BasicDetailsStep.tsx
import React from 'react';
import { Users, User } from 'lucide-react';
import { InputField, TextareaField } from '../../UI/FormFields';

interface BasicDetailsStepProps {
  data: {
    name: string;
    description: string;
    mode: 'moderated' | 'unmoderated' | null;
  };
  updateData: (updates: any) => void;
  isEditing: boolean;
}

export function BasicDetailsStep({ data, updateData, isEditing }: BasicDetailsStepProps) {
  const handleModeChange = (mode: 'moderated' | 'unmoderated') => {
    updateData({ mode });
  };

  return (
    <div className="space-y-6">
      {/* Project Name */}
      <InputField
        label="Project Name"
        value={data.name}
        onChange={(value: any) => updateData({ name: value })}
        placeholder="e.g., E-commerce Checkout Flow"
        maxLength={100}
        required
      />

      {/* Project Description */}
      <TextareaField
        label="Project Description"
        value={data.description}
        onChange={(value: any) => updateData({ description: value })}
        placeholder="Brief description of what you're testing..."
        maxLength={500}
        rows={3}
      />

      {/* Testing Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Testing Mode <span className="text-red-500">*</span>
        </label>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleModeChange('moderated')}
            className={`p-6 border-2 rounded-lg text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              data.mode === 'moderated'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
            }`}
            aria-pressed={data.mode === 'moderated'}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Users className={`w-8 h-8 ${
                data.mode === 'moderated' ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Moderated</h3>
                <p className="text-sm text-gray-600">Live sessions with observation</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Real-time observation and guidance
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Direct interaction with participants
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Immediate clarification of user behavior
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('unmoderated')}
            className={`p-6 border-2 rounded-lg text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              data.mode === 'unmoderated'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
            }`}
            aria-pressed={data.mode === 'unmoderated'}
          >
            <div className="flex items-center space-x-3 mb-3">
              <User className={`w-8 h-8 ${
                data.mode === 'unmoderated' ? 'text-purple-600' : 'text-gray-600'
              }`} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Unmoderated</h3>
                <p className="text-sm text-gray-600">Self-guided task completion</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Participants complete tasks independently
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Natural, uninfluenced behavior
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Scalable to more participants
              </div>
            </div>
          </button>
        </div>

        {!data.mode && (
          <p className="text-red-600 text-sm mt-2">
            Select a testing mode to continue
          </p>
        )}
      </div>

      {/* Editing Notice - Only show if editing and relevant */}
      {isEditing && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
            <div className="text-sm">
              <p className="font-medium text-amber-900">Editing Project</p>
              <p className="text-amber-800 mt-1">
                Changing the testing mode may affect how existing sessions are handled.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}