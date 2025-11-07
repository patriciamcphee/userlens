// components/ProjectSetup/WizardSteps/ParticipantsStep.tsx
import React, { useState } from 'react';
import { Plus, UserPlus, User, UserX, Users, Info, Search, Filter } from 'lucide-react';
import { Button } from '../../UI/Button';
import { InputField, SelectField } from '../../UI/FormFields';
import { Participant } from '../../../types';
import { getUsageLevelLabel } from '../../../utils/taskFiltering';

interface ParticipantsStepProps {
  data: {
    selectedParticipants: Array<{ 
      participantId: string | number; 
      usageLevel: 'active' | 'occasionally' | 'non-user' 
    }>;
  };
  updateData: (updates: any) => void;
  participants: Participant[];
}

export function ParticipantsStep({ data, updateData, participants }: ParticipantsStepProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');

  // Get available participants (not already selected)
  const availableParticipants = participants.filter(p =>
    !data.selectedParticipants.some(sp => String(sp.participantId) === String(p.id))
  );

  // Filter available participants based on search and filter
  const filteredAvailable = availableParticipants.filter(p => {
    const matchesSearch = searchTerm === '' || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterLevel === '' || p.defaultUsageLevel === filterLevel;
    
    return matchesSearch && matchesFilter;
  });

  const handleAddParticipant = (participant: Participant, usageLevel: 'active' | 'occasionally' | 'non-user') => {
    const newSelection = [
      ...data.selectedParticipants,
      {
        participantId: participant.id,
        usageLevel
      }
    ];
    updateData({ selectedParticipants: newSelection });
    setShowAddModal(false);
  };

  const handleRemoveParticipant = (participantId: string | number) => {
    const newSelection = data.selectedParticipants.filter(
      sp => String(sp.participantId) !== String(participantId)
    );
    updateData({ selectedParticipants: newSelection });
  };

  const handleUpdateUsageLevel = (
    participantId: string | number, 
    usageLevel: 'active' | 'occasionally' | 'non-user'
  ) => {
    const newSelection = data.selectedParticipants.map(sp =>
      String(sp.participantId) === String(participantId) 
        ? { ...sp, usageLevel } 
        : sp
    );
    updateData({ selectedParticipants: newSelection });
  };

  const getUsageLevelIcon = (level: 'active' | 'occasionally' | 'non-user') => {
    switch (level) {
      case 'active':
        return <Users className="w-4 h-4 text-red-600" />;
      case 'occasionally':
        return <User className="w-4 h-4 text-yellow-600" />;
      case 'non-user':
        return <UserX className="w-4 h-4 text-green-600" />;
    }
  };

  const getUsageLevelBadgeClass = (level: 'active' | 'occasionally' | 'non-user') => {
    switch (level) {
      case 'active':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'occasionally':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'non-user':
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="mb-2">
              You can add participants now or later. Participants determine which tasks they'll see based on their experience level.
            </p>
            <div className="space-y-1">
              <p>• <strong>Non-Users:</strong> See only Easy tasks</p>
              <p>• <strong>Occasional Users:</strong> See only Medium tasks</p>
              <p>• <strong>Active Users:</strong> See only Hard tasks</p>
              <p>• <strong>All Users tasks:</strong> Shown to everyone regardless of level</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Participants */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Selected Participants ({data.selectedParticipants.length})
          </h3>
          {availableParticipants.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Participant
            </Button>
          )}
        </div>

        {data.selectedParticipants.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No participants added yet</h4>
            <p className="text-gray-600 mb-4">
              Add participants to your project to start running testing sessions
            </p>
            {availableParticipants.length > 0 ? (
              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add First Participant
              </Button>
            ) : (
              <div className="text-sm text-gray-500">
                <p>No participants available.</p>
                <p>Create participants in the dashboard first, then add them here.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {data.selectedParticipants.map(sp => {
              const participant = participants.find(p => String(p.id) === String(sp.participantId));
              if (!participant) return null;

              return (
                <div key={String(sp.participantId)} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{participant.name}</h4>
                      <p className="text-sm text-gray-600 truncate">{participant.email}</p>
                      {participant.defaultUsageLevel && (
                        <p className="text-xs text-gray-500 mt-1">
                          Default: {getUsageLevelLabel(participant.defaultUsageLevel)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveParticipant(sp.participantId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      leftIcon={<UserX className="w-4 h-4" />}
                    >
                      Remove
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level for This Project
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['non-user', 'occasionally', 'active'] as const).map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleUpdateUsageLevel(sp.participantId, level)}
                          className={`p-3 border-2 rounded-lg text-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            sp.usageLevel === level
                              ? `${getUsageLevelBadgeClass(level)} ring-2 ring-opacity-50`
                              : 'border-gray-300 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-center mb-1">
                            {getUsageLevelIcon(level)}
                          </div>
                          <div className="text-xs font-semibold text-gray-900">
                            {getUsageLevelLabel(level)}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {level === 'non-user' && 'Easy tasks'}
                            {level === 'occasionally' && 'Medium tasks'}
                            {level === 'active' && 'Hard tasks'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Add Participant</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="p-6">
              {availableParticipants.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    All participants have been added
                  </h4>
                  <p className="text-gray-600">
                    All available participants are already part of this project.
                  </p>
                </div>
              ) : (
                <>
                  {/* Search and Filter */}
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Search Participants"
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Search by name or email..."
                      leftIcon={<Search className="w-4 h-4" />}
                    />
                    
                    <SelectField
                      label="Filter by Default Level"
                      value={filterLevel}
                      onChange={setFilterLevel}
                      options={[
                        { value: '', label: 'All levels' },
                        { value: 'non-user', label: 'Non-User' },
                        { value: 'occasionally', label: 'Occasional User' },
                        { value: 'active', label: 'Active User' }
                      ]}
                      placeholder="All levels"
                    />
                  </div>

                  {filteredAvailable.length === 0 ? (
                    <div className="text-center py-8">
                      <Filter className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        No participants match your search criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAvailable.map(participant => (
                        <div key={String(participant.id)} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{participant.name}</h4>
                              <p className="text-sm text-gray-600">{participant.email}</p>
                              {participant.defaultUsageLevel && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                                  getUsageLevelBadgeClass(participant.defaultUsageLevel)
                                }`}>
                                  Default: {getUsageLevelLabel(participant.defaultUsageLevel)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Select experience level for this project:
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {(['non-user', 'occasionally', 'active'] as const).map(level => (
                                <Button
                                  key={level}
                                  variant={participant.defaultUsageLevel === level ? 'primary' : 'outline'}
                                  size="sm"
                                  onClick={() => handleAddParticipant(participant, level)}
                                  className="text-center"
                                >
                                  <div className="flex flex-col items-center">
                                    {getUsageLevelIcon(level)}
                                    <span className="text-xs mt-1">
                                      {getUsageLevelLabel(level)}
                                    </span>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}