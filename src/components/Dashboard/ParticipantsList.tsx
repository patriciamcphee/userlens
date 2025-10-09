// components/Dashboard/ParticipantsList.tsx
import React, { useState } from 'react';
import { Plus, UserPlus, Mail, Trash2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Participant } from '../../types';

export function ParticipantsList() {
  const { state, actions } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
      newErrors.email = 'Please enter a valid email address';
    }

    // Check for duplicate email
    if (state.participants.some(p => p.email.toLowerCase() === email.toLowerCase())) {
      newErrors.email = 'This email is already registered';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Add participant
    const newParticipant: Participant = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase()
    };

    actions.addParticipant(newParticipant);
    
    // Reset form
    setName('');
    setEmail('');
    setErrors({});
    setShowAddForm(false);
  };

  const handleDeleteParticipant = (id: number, participantName: string) => {
    if (window.confirm(`Are you sure you want to delete ${participantName}? This will remove them from all projects.`)) {
      actions.deleteParticipant(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Participants</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
          aria-label="Add participant"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Add Participant</h3>
          
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

          <div className="flex space-x-2">
            <button
              onClick={handleAddParticipant}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setName('');
                setEmail('');
                setErrors({});
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {state.participants.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlus className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No participants yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {state.participants.map(participant => (
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
                  </div>
                  <button
                    onClick={() => handleDeleteParticipant(participant.id, participant.name)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors ml-2 flex-shrink-0"
                    aria-label={`Delete ${participant.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}