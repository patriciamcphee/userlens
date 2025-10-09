// components/ProjectSetup/RecordingOptionsForm.tsx
import React from 'react';
import { Activity } from 'lucide-react';

interface RecordingOptionsFormProps {
  cameraOption: 'optional' | 'required' | 'disabled';
  micOption: 'optional' | 'required' | 'disabled';
  onCameraChange: (option: 'optional' | 'required' | 'disabled') => void;
  onMicChange: (option: 'optional' | 'required' | 'disabled') => void;
}

export function RecordingOptionsForm({
  cameraOption,
  micOption,
  onCameraChange,
  onMicChange
}: RecordingOptionsFormProps) {
  const options: ('optional' | 'required' | 'disabled')[] = ['optional', 'required', 'disabled'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recording Options</h2>
      <p className="text-sm text-gray-600 mb-4">
        All sessions automatically track keyboard and mouse movements. Configure camera and microphone settings below.
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Camera</label>
          <div className="grid grid-cols-3 gap-3">
            {options.map(option => (
              <button
                key={option}
                onClick={() => onCameraChange(option)}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  cameraOption === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium capitalize">{option}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {option === 'optional' ? 'User can choose' : 
                   option === 'required' ? 'Must be on' : 
                   'Not used'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Microphone</label>
          <div className="grid grid-cols-3 gap-3">
            {options.map(option => (
              <button
                key={option}
                onClick={() => onMicChange(option)}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  micOption === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium capitalize">{option}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {option === 'optional' ? 'User can choose' : 
                   option === 'required' ? 'Must be on' : 
                   'Not used'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <div className="font-medium mb-1">Automatic Tracking Enabled</div>
              <div className="mb-2">All sessions will record keyboard input, mouse clicks, cursor movements, and screen interactions for detailed analytics.</div>
              {cameraOption !== 'disabled' && micOption !== 'disabled' && (
                <div className="mt-2 pt-2 border-t border-blue-200 text-green-700 font-medium">
                  ✓ When both camera and microphone are enabled, they will be recorded together in a single synchronized file, ensuring audio stays perfectly in sync with video.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}