// components/ProjectSetup/WizardSteps/RecordingOptionsStep.tsx
import React from 'react';
import { Activity, Camera, Mic, Shield, Info } from 'lucide-react';

interface RecordingOptionsStepProps {
  data: {
    cameraOption: 'optional' | 'required' | 'disabled';
    micOption: 'optional' | 'required' | 'disabled';
    mode: 'moderated' | 'unmoderated' | null;
  };
  updateData: (updates: any) => void;
}

export function RecordingOptionsStep({ data, updateData }: RecordingOptionsStepProps) {
  const options: ('optional' | 'required' | 'disabled')[] = ['optional', 'required', 'disabled'];

  const getOptionLabel = (option: string) => {
    switch (option) {
      case 'optional': return 'Optional';
      case 'required': return 'Required';
      case 'disabled': return 'Disabled';
      default: return option;
    }
  };

  const getOptionDescription = (option: string) => {
    switch (option) {
      case 'optional': return 'Participant can choose';
      case 'required': return 'Must be enabled';
      case 'disabled': return 'Not available';
      default: return '';
    }
  };

  const getOptionColor = (option: string, isSelected: boolean) => {
    if (!isSelected) return 'border-gray-300 bg-white text-gray-700';
    
    switch (option) {
      case 'required': return 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200';
      case 'optional': return 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200';
      case 'disabled': return 'border-gray-500 bg-gray-50 text-gray-700 ring-2 ring-gray-200';
      default: return 'border-gray-300 bg-white text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Activity className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Recording Capabilities</p>
            <p className="mb-2">
              All sessions automatically track keyboard input, mouse movements, and clicks for detailed analytics.
            </p>
            <p>
              Configure camera and microphone settings below to capture additional context during testing sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Camera Configuration */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <Camera className="w-6 h-6 text-gray-700" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Camera (Screen Recording)</h3>
            <p className="text-sm text-gray-600">
              Records the participant's screen activity during sessions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {options.map(option => (
            <button
              key={`camera-${option}`}
              type="button"
              onClick={() => updateData({ cameraOption: option })}
              className={`p-4 border-2 rounded-lg text-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getOptionColor(option, data.cameraOption === option)
              }`}
              aria-pressed={data.cameraOption === option}
            >
              <div className="text-sm font-semibold mb-1">
                {getOptionLabel(option)}
              </div>
              <div className="text-xs">
                {getOptionDescription(option)}
              </div>
              {option === 'required' && (
                <div className="mt-2 text-xs text-red-600">
                  Sessions won't start without camera access
                </div>
              )}
              {option === 'optional' && (
                <div className="mt-2 text-xs text-blue-600">
                  Participant can enable/disable
                </div>
              )}
              {option === 'disabled' && (
                <div className="mt-2 text-xs text-gray-600">
                  No screen recording
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Microphone Configuration */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <Mic className="w-6 h-6 text-gray-700" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Microphone (Audio Recording)</h3>
            <p className="text-sm text-gray-600">
              Captures participant voice and think-aloud commentary
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {options.map(option => (
            <button
              key={`mic-${option}`}
              type="button"
              onClick={() => updateData({ micOption: option })}
              className={`p-4 border-2 rounded-lg text-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getOptionColor(option, data.micOption === option)
              }`}
              aria-pressed={data.micOption === option}
            >
              <div className="text-sm font-semibold mb-1">
                {getOptionLabel(option)}
              </div>
              <div className="text-xs">
                {getOptionDescription(option)}
              </div>
              {option === 'required' && (
                <div className="mt-2 text-xs text-red-600">
                  Sessions won't start without microphone access
                </div>
              )}
              {option === 'optional' && (
                <div className="mt-2 text-xs text-purple-600">
                  Participant can enable/disable
                </div>
              )}
              {option === 'disabled' && (
                <div className="mt-2 text-xs text-gray-600">
                  No audio recording
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Combined Recording Info */}
      {data.cameraOption !== 'disabled' && data.micOption !== 'disabled' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-900">
              <p className="font-medium mb-1">Synchronized Recording</p>
              <p>
                When both camera and microphone are enabled, they will be recorded together in a single 
                synchronized file, ensuring audio stays perfectly in sync with video throughout the session.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode-specific recommendations */}
      {data.mode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-900">
              <p className="font-medium mb-1">
                Recommendations for {data.mode} testing:
              </p>
              {data.mode === 'moderated' ? (
                <div className="space-y-1">
                  <p>• <strong>Camera:</strong> Optional or Required - helps you see what participants see</p>
                  <p>• <strong>Microphone:</strong> Optional or Required - enables real-time communication</p>
                  <p>• Consider making both optional to reduce technical barriers</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p>• <strong>Camera:</strong> Required or Optional - captures important screen interactions</p>
                  <p>• <strong>Microphone:</strong> Required or Optional - captures think-aloud feedback</p>
                  <p>• Audio is especially valuable for understanding participant thought processes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-medium text-gray-900 mb-1">Privacy & Security</p>
            <div className="space-y-1">
              <p>• All recordings are stored securely and encrypted</p>
              <p>• Participants will be clearly informed about recording before sessions start</p>
              <p>• Recording permissions are always requested before session begins</p>
              <p>• Participants can decline recording even if set to "Optional"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Requirements */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Technical Requirements</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• Modern browsers (Chrome, Firefox, Safari, Edge) support screen and audio recording</p>
          <p>• Participants need to grant browser permissions for camera/microphone access</p>
          <p>• Recordings are processed and uploaded automatically after sessions</p>
          <p>• Backup analytics are collected even if recording fails</p>
        </div>
      </div>
    </div>
  );
}