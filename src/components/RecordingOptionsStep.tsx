import React from 'react';
import { Activity } from 'lucide-react';

interface RecordingOptionsStepProps {
  data: {
    cameraOption: 'optional' | 'required' | 'disabled';
    micOption: 'optional' | 'required' | 'disabled';
    mode: 'moderated' | 'unmoderated';
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
      case 'optional': return 'User can choose';
      case 'required': return 'Must be on';
      case 'disabled': return 'Not used';
      default: return '';
    }
  };

  const getOptionColor = (option: string, isSelected: boolean) => {
    if (!isSelected) return 'border-slate-300 bg-white text-slate-700 hover:border-slate-400';
    
    switch (option) {
      case 'required': return 'border-blue-600 bg-white text-slate-900 ring-2 ring-blue-600';
      case 'optional': return 'border-blue-600 bg-white text-slate-900 ring-2 ring-blue-600';
      case 'disabled': return 'border-blue-600 bg-white text-slate-900 ring-2 ring-blue-600';
      default: return 'border-slate-300 bg-white text-slate-700';
    }
  };

  const getDescriptionColor = (option: string, isSelected: boolean) => {
    if (!isSelected) return 'text-slate-600';
    
    switch (option) {
      case 'required': return 'text-red-600';
      case 'optional': return 'text-blue-600';
      case 'disabled': return 'text-slate-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Recording Options</h3>
        <p className="text-sm text-slate-600">
          All sessions automatically track keyboard and mouse movements. Configure camera and microphone settings below.
        </p>
      </div>

      {/* Camera Configuration */}
      <div>
        <div className="mb-3">
          <h4 className="text-sm font-medium text-slate-900">Camera</h4>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {options.map(option => (
            <button
              key={`camera-${option}`}
              type="button"
              onClick={() => updateData({ cameraOption: option })}
              className={`p-4 border-2 rounded-lg text-center transition-all focus:outline-none ${
                getOptionColor(option, data.cameraOption === option)
              }`}
              aria-pressed={data.cameraOption === option}
            >
              <div className="text-sm font-medium mb-1">
                {getOptionLabel(option)}
              </div>
              <div className={`text-xs ${getDescriptionColor(option, data.cameraOption === option)}`}>
                {getOptionDescription(option)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Microphone Configuration */}
      <div>
        <div className="mb-3">
          <h4 className="text-sm font-medium text-slate-900">Microphone</h4>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {options.map(option => (
            <button
              key={`mic-${option}`}
              type="button"
              onClick={() => updateData({ micOption: option })}
              className={`p-4 border-2 rounded-lg text-center transition-all focus:outline-none ${
                getOptionColor(option, data.micOption === option)
              }`}
              aria-pressed={data.micOption === option}
            >
              <div className="text-sm font-medium mb-1">
                {getOptionLabel(option)}
              </div>
              <div className={`text-xs ${getDescriptionColor(option, data.micOption === option)}`}>
                {getOptionDescription(option)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Automatic Tracking Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Activity className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Automatic Tracking Enabled</p>
            <p className="text-blue-800">
              All sessions will record keyboard input, mouse clicks, cursor movements, and screen interactions for detailed analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Synchronized Recording Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
          <p className="text-sm text-green-900">
            <strong>When both camera and microphone are enabled, they will be recorded together in a single synchronized file, ensuring audio stays perfectly in sync with video.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
