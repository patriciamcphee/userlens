// components/Dashboard/ParticipantsList.tsx
import { useState } from 'react';
import { Plus, UserPlus, Mail, Trash2, User, Users, UserX, Edit2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Participant } from '../../types';
import { getUsageLevelLabel } from '../../utils/taskFiltering';

export function ParticipantsList() {
  const { state, actions } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [defaultUsageLevel, setDefaultUsageLevel] = useState<'active' | 'occasionally' | 'non-user'>('occasionally');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddParticipant = () => {
    // Validation
    const newErrors: { name?: string; email?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    // Check for duplicate email (skip if editing same participant)
    const isDuplicate = state.participants.some(p => 
      p.email.toLowerCase() === email.toLowerCase() && 
      (!editingParticipant || p.id !== editingParticipant.id)
    );
    
    if (isDuplicate) {
      newErrors.email = 'This email is already registered';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingParticipant) {
      // Update existing participant
      actions.updateParticipant(editingParticipant.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        defaultUsageLevel
      });
    } else {
      // Add new participant
      const newParticipant = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        defaultUsageLevel
      };
      actions.addParticipant(newParticipant as Participant);
    }
    
    // Reset form
    setName('');
    setEmail('');
    setDefaultUsageLevel('occasionally');
    setErrors({});
    setShowAddForm(false);
    setEditingParticipant(null);
  };

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant);
    setName(participant.name);
    setEmail(participant.email);
    setDefaultUsageLevel(participant.defaultUsageLevel || 'occasionally');
    setShowAddForm(true);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setShowAddForm(false);
    setEditingParticipant(null);
    setName('');
    setEmail('');
    setDefaultUsageLevel('occasionally');
    setErrors({});
  };

  const handleDeleteParticipant = (id: number, participantName: string) => {
    if (window.confirm(`Are you sure you want to delete ${participantName}? This will remove them from all projects.`)) {
      actions.deleteParticipant(id);
    }
  };

  // Sort participants alphabetically by name
  const sortedParticipants = [...state.participants].sort((a, b) => 
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const getUsageLevelIcon = (level?: 'active' | 'occasionally' | 'non-user') => {
    if (!level) return <User className="w-4 h-4 text-gray-400" />;
    
    switch (level) {
      case 'active':
        return <Users className="w-4 h-4 text-red-600" />;
      case 'occasionally':
        return <User className="w-4 h-4 text-yellow-600" />;
      case 'non-user':
        return <UserX className="w-4 h-4 text-green-600" />;
    }
  };

  const getUsageLevelBadgeClass = (level?: 'active' | 'occasionally' | 'non-user') => {
    if (!level) return 'bg-gray-100 text-gray-600';
    
    switch (level) {
      case 'active':
        return 'bg-red-100 text-red-700';
      case 'occasionally':
        return 'bg-yellow-100 text-yellow-700';
      case 'non-user':
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Participants</h2>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)} 
            className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Add participant"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            {editingParticipant ? 'Edit Participant' : 'Add Participant'}
          </h3>
          
          <div className="mb-3">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={100}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Default Usage Level Selector */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Experience Level
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {editingParticipant 
                ? 'Update default - existing project assignments will not be affected'
                : 'This will be used as the default when adding to projects (can be overridden)'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDefaultUsageLevel('non-user')}
                className={`p-2 border-2 rounded-lg text-left transition-all ${
                  defaultUsageLevel === 'non-user'
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-300 hover:border-green-400 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <UserX className={`w-4 h-4 ${
                    defaultUsageLevel === 'non-user' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <span className="text-xs font-semibold text-gray-900">Non-User</span>
                </div>
                <div className="text-xs text-gray-600">Easy tasks</div>
              </button>

              <button
                type="button"
                onClick={() => setDefaultUsageLevel('occasionally')}
                className={`p-2 border-2 rounded-lg text-left transition-all ${
                  defaultUsageLevel === 'occasionally'
                    ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                    : 'border-gray-300 hover:border-yellow-400 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <User className={`w-4 h-4 ${
                    defaultUsageLevel === 'occasionally' ? 'text-yellow-600' : 'text-gray-400'
                  }`} />
                  <span className="text-xs font-semibold text-gray-900">Occasional</span>
                </div>
                <div className="text-xs text-gray-600">Medium tasks</div>
              </button>

              <button
                type="button"
                onClick={() => setDefaultUsageLevel('active')}
                className={`p-2 border-2 rounded-lg text-left transition-all ${
                  defaultUsageLevel === 'active'
                    ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                    : 'border-gray-300 hover:border-red-400 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Users className={`w-4 h-4 ${
                    defaultUsageLevel === 'active' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <span className="text-xs font-semibold text-gray-900">Active</span>
                </div>
                <div className="text-xs text-gray-600">Hard tasks</div>
              </button>
            </div>
          </div>

          {editingParticipant && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-blue-900">
                <strong>Note:</strong> Changing the default level will only affect new project assignments. 
                Existing project-specific assignments will remain unchanged.
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={handleAddParticipant}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {editingParticipant ? 'Save Changes' : 'Add'}
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {sortedParticipants.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlus className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No participants yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedParticipants.map(participant => (
              <div key={participant.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {participant.name}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center mt-1">
                      <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{participant.email}</span>
                    </div>
                    {/* Show default usage level badge */}
                    {participant.defaultUsageLevel && (
                      <div className="mt-2 flex items-center space-x-1">
                        {getUsageLevelIcon(participant.defaultUsageLevel)}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getUsageLevelBadgeClass(participant.defaultUsageLevel)}`}>
                          Default: {getUsageLevelLabel(participant.defaultUsageLevel)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => handleEditParticipant(participant)}
                      className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      aria-label={`Edit ${participant.name}`}
                      title="Edit participant"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteParticipant(Number(participant.id), participant.name)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      aria-label={`Delete ${participant.name}`}
                      title="Delete participant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}