// components/ProjectSetup/ParticipantsSelectionForm.tsx
import React, { useState } from 'react';
import { Users, UserPlus, User, UserX, Info } from 'lucide-react';
import { Participant } from '../../types';

interface ParticipantSelection {
  participantId: number;
  usageLevel: 'active' | 'occasionally' | 'non-user';
}

interface ParticipantsSelectionFormProps {
  participants: Participant[];
  selectedParticipants: ParticipantSelection[];
  onSelectionChange: (selections: ParticipantSelection[]) => void;
}

export function ParticipantsSelectionForm({
  participants,
  selectedParticipants,
  onSelectionChange
}: ParticipantsSelectionFormProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [selectedUsageLevel, setSelectedUsageLevel] = useState<'active' | 'occasionally' | 'non-user'>('occasionally');

  // Get participants that haven't been added yet
  const availableParticipants = participants.filter(
    p => !selectedParticipants.some(sp => sp.participantId === p.id)
  );

  const handleAddParticipant = () => {
    if (selectedParticipantId) {
      const participant = participants.find(p => p.id === selectedParticipantId);
      const usageLevel = selectedUsageLevel || participant?.defaultUsageLevel || 'occasionally';
      
      onSelectionChange([
        ...selectedParticipants,
        {
          participantId: selectedParticipantId,
          usageLevel
        }
      ]);
      
      setShowAddModal(false);
      setSelectedParticipantId(null);
      setSelectedUsageLevel('occasionally');
    }
  };

  const handleRemoveParticipant = (participantId: number) => {
    onSelectionChange(selectedParticipants.filter(sp => sp.participantId !== participantId));
  };

  const handleUpdateUsageLevel = (participantId: number, usageLevel: 'active' | 'occasionally' | 'non-user') => {
    onSelectionChange(
      selectedParticipants.map(sp =>
        sp.participantId === participantId ? { ...sp, usageLevel } : sp
      )
    );
  };

  const getUsageLevelLabel = (level: 'active' | 'occasionally' | 'non-user') => {
    switch (level) {
      case 'active': return 'Active User';
      case 'occasionally': return 'Occasional User';
      case 'non-user': return 'Non-User';
    }
  };

  const getUsageLevelColor = (level: 'active' | 'occasionally' | 'non-user') => {
    switch (level) {
      case 'active': return 'bg-red-100 text-red-700 border-red-300';
      case 'occasionally': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'non-user': return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Participants</h2>
        {availableParticipants.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Participant</span>
          </button>
        )}
      </div>

      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Add participants to this project and set their experience level. Tasks will be filtered based on their level during testing sessions.
          </p>
        </div>
      </div>

      {selectedParticipants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No participants added yet</p>
          {availableParticipants.length > 0 ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add First Participant
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Create participants in the dashboard first, then add them to your project
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {selectedParticipants.map(sp => {
            const participant = participants.find(p => p.id === sp.participantId);
            if (!participant) return null;

            return (
              <div key={sp.participantId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{participant.name}</div>
                    <div className="text-sm text-gray-600">{participant.email}</div>
                    {participant.defaultUsageLevel && (
                      <div className="text-xs text-gray-500 mt-1">
                        Default: {getUsageLevelLabel(participant.defaultUsageLevel)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveParticipant(sp.participantId)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                    aria-label="Remove participant"
                  >
                    <UserX className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level for This Project
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateUsageLevel(sp.participantId, 'non-user')}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        sp.usageLevel === 'non-user'
                          ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                          : 'border-gray-300 hover:border-green-400 bg-white'
                      }`}
                    >
                      <UserX className={`w-4 h-4 mx-auto mb-1 ${
                        sp.usageLevel === 'non-user' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <div className="text-xs font-semibold text-gray-900">Non-User</div>
                      <div className="text-xs text-gray-600">Easy tasks</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateUsageLevel(sp.participantId, 'occasionally')}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        sp.usageLevel === 'occasionally'
                          ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                          : 'border-gray-300 hover:border-yellow-400 bg-white'
                      }`}
                    >
                      <User className={`w-4 h-4 mx-auto mb-1 ${
                        sp.usageLevel === 'occasionally' ? 'text-yellow-600' : 'text-gray-400'
                      }`} />
                      <div className="text-xs font-semibold text-gray-900">Occasional</div>
                      <div className="text-xs text-gray-600">Medium tasks</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateUsageLevel(sp.participantId, 'active')}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        sp.usageLevel === 'active'
                          ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                          : 'border-gray-300 hover:border-red-400 bg-white'
                      }`}
                    >
                      <Users className={`w-4 h-4 mx-auto mb-1 ${
                        sp.usageLevel === 'active' ? 'text-red-600' : 'text-gray-400'
                      }`} />
                      <div className="text-xs font-semibold text-gray-900">Active</div>
                      <div className="text-xs text-gray-600">Hard tasks</div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Add Participant to Project
            </h2>

            {availableParticipants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">All participants have been added to this project</p>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="mt-4 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Participant
                  </label>
                  <select
                    value={selectedParticipantId || ''}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      setSelectedParticipantId(id);
                      const participant = participants.find(p => p.id === id);
                      if (participant?.defaultUsageLevel) {
                        setSelectedUsageLevel(participant.defaultUsageLevel);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a participant...</option>
                    {availableParticipants.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.email})
                        {p.defaultUsageLevel && ` - Default: ${getUsageLevelLabel(p.defaultUsageLevel)}`}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedParticipantId && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Set Experience Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedUsageLevel('non-user')}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          selectedUsageLevel === 'non-user'
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                            : 'border-gray-300 hover:border-green-400 bg-white'
                        }`}
                      >
                        <UserX className={`w-6 h-6 mx-auto mb-2 ${
                          selectedUsageLevel === 'non-user' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <div className="font-semibold text-gray-900">Non-User</div>
                        <div className="text-sm text-gray-600 mt-1">Will see easy tasks</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedUsageLevel('occasionally')}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          selectedUsageLevel === 'occasionally'
                            ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                            : 'border-gray-300 hover:border-yellow-400 bg-white'
                        }`}
                      >
                        <User className={`w-6 h-6 mx-auto mb-2 ${
                          selectedUsageLevel === 'occasionally' ? 'text-yellow-600' : 'text-gray-400'
                        }`} />
                        <div className="font-semibold text-gray-900">Occasional User</div>
                        <div className="text-sm text-gray-600 mt-1">Will see medium tasks</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedUsageLevel('active')}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          selectedUsageLevel === 'active'
                            ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                            : 'border-gray-300 hover:border-red-400 bg-white'
                        }`}
                      >
                        <Users className={`w-6 h-6 mx-auto mb-2 ${
                          selectedUsageLevel === 'active' ? 'text-red-600' : 'text-gray-400'
                        }`} />
                        <div className="font-semibold text-gray-900">Active User</div>
                        <div className="text-sm text-gray-600 mt-1">Will see hard tasks</div>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddParticipant}
                    disabled={!selectedParticipantId}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Project
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedParticipantId(null);
                      setSelectedUsageLevel('occasionally');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}