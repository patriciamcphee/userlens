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
        onChange={(value) => updateData({ name: value })}
        placeholder="e.g., E-commerce Checkout Flow"
        maxLength={100}
        required
        error={data.name.trim() === '' ? 'Project name is required' : undefined}
        hint="Choose a clear, descriptive name for your testing project"
      />

      {/* Project Description */}
      <TextareaField
        label="Project Description"
        value={data.description}
        onChange={(value) => updateData({ description: value })}
        placeholder="Brief description of what you're testing..."
        maxLength={500}
        rows={3}
        hint="Describe the purpose and scope of this user testing project"
      />

      {/* Testing Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Testing Mode <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Choose how you want to conduct your user testing sessions
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleModeChange('moderated')}
            className={`p-6 border-2 rounded-lg text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              data.mode === 'moderated'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
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
            {data.mode === 'moderated' && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Selected
                </span>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('unmoderated')}
            className={`p-6 border-2 rounded-lg text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              data.mode === 'unmoderated'
                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
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
            {data.mode === 'unmoderated' && (
              <div className="mt-3 pt-3 border-t border-purple-200">
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  Selected
                </span>
              </div>
            )}
          </button>
        </div>

        {!data.mode && (
          <p className="text-red-600 text-sm mt-2">
            Please select a testing mode to continue
          </p>
        )}
      </div>

      {/* Mode-specific information */}
      {data.mode && (
        <div className={`rounded-lg p-4 ${
          data.mode === 'moderated' ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'
        }`}>
          <h4 className={`font-medium mb-2 ${
            data.mode === 'moderated' ? 'text-blue-900' : 'text-purple-900'
          }`}>
            {data.mode === 'moderated' ? 'Moderated Testing' : 'Unmoderated Testing'} Selected
          </h4>
          <p className={`text-sm ${
            data.mode === 'moderated' ? 'text-blue-800' : 'text-purple-800'
          }`}>
            {data.mode === 'moderated' 
              ? 'You\'ll be able to observe participants in real-time, provide guidance, and ask follow-up questions during the session.'
              : 'Participants will complete tasks on their own schedule, providing feedback through the interface. You\'ll review results after completion.'
            }
          </p>
        </div>
      )}

      {isEditing && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
            <div className="text-sm">
              <p className="font-medium text-amber-900">Editing Project</p>
              <p className="text-amber-800 mt-1">
                Changing the testing mode may affect how existing sessions are handled. 
                Active sessions will continue with their original settings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}