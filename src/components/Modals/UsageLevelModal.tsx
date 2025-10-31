// components/Modals/UsageLevelModal.tsx
import React, { useState, useEffect } from 'react';
import { User, Users, UserX, Info } from 'lucide-react';
import { Participant } from '../../types';
import { getUsageLevelLabel } from '../../utils/taskFiltering';

interface UsageLevelModalProps {
  show: boolean;
  participant: Participant | null;
  onConfirm: (usageLevel: 'active' | 'occasionally' | 'non-user') => void;
  onClose: () => void;
}

export function UsageLevelModal({
  show,
  participant,
  onConfirm,
  onClose
}: UsageLevelModalProps) {
  // Initialize with participant's default, or 'occasionally' as fallback
  const [selectedLevel, setSelectedLevel] = useState<'active' | 'occasionally' | 'non-user'>(
    participant?.defaultUsageLevel || 'occasionally'
  );

  // Update selected level when participant changes
  useEffect(() => {
    if (participant?.defaultUsageLevel) {
      setSelectedLevel(participant.defaultUsageLevel);
    }
  }, [participant]);

  if (!show || !participant) return null;

  const handleConfirm = () => {
    onConfirm(selectedLevel);
  };

  const hasDefault = !!participant.defaultUsageLevel;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Set Usage Level for {participant.name}
        </h2>
        
        {hasDefault && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <strong>Default level:</strong> {getUsageLevelLabel(participant.defaultUsageLevel!)}
                <div className="text-xs text-blue-700 mt-1">
                  You can use the default or choose a different level for this specific project.
                </div>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-gray-600 mb-6">
          Select the participant's experience level with the system. This determines which tasks they will see:
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setSelectedLevel('non-user')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              selectedLevel === 'non-user'
                ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                : 'border-gray-300 hover:border-green-400 bg-white'
            }`}
          >
            <div className="flex items-start space-x-3">
              <UserX className={`w-6 h-6 mt-0.5 ${
                selectedLevel === 'non-user' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900">Non-User</span>
                  {participant.defaultUsageLevel === 'non-user' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Has never or rarely used the system
                </div>
                <div className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                  Will see: Easy tasks
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedLevel('occasionally')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              selectedLevel === 'occasionally'
                ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                : 'border-gray-300 hover:border-yellow-400 bg-white'
            }`}
          >
            <div className="flex items-start space-x-3">
              <User className={`w-6 h-6 mt-0.5 ${
                selectedLevel === 'occasionally' ? 'text-yellow-600' : 'text-gray-400'
              }`} />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900">Occasional User</span>
                  {participant.defaultUsageLevel === 'occasionally' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Uses the system sometimes, has basic familiarity
                </div>
                <div className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                  Will see: Medium tasks
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedLevel('active')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              selectedLevel === 'active'
                ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                : 'border-gray-300 hover:border-red-400 bg-white'
            }`}
          >
            <div className="flex items-start space-x-3">
              <Users className={`w-6 h-6 mt-0.5 ${
                selectedLevel === 'active' ? 'text-red-600' : 'text-gray-400'
              }`} />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900">Active User</span>
                  {participant.defaultUsageLevel === 'active' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Uses the system frequently, highly experienced
                </div>
                <div className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                  Will see: Hard tasks
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Only tasks matching the selected usage level will be shown to this participant during the session.
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {hasDefault && selectedLevel === participant.defaultUsageLevel 
              ? 'Use Default & Add' 
              : 'Confirm & Add'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}