// components/ProjectDetail/ProjectDetail.tsx - IMPROVED FIX
import React, { useState } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Project } from '../../types';
import { OverviewTab } from './OverviewTab';
import { AnalyticsTab } from './AnalyticsTab';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onStartSession: (participantId: number) => void;
}

export function ProjectDetail({ project, onBack, onEdit, onStartSession }: ProjectDetailProps) {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  // IMPROVED: Create a wrapper that finds the participant before calling onStartSession
  const handleStartSession = (participantId: number) => {
    console.log('🔵 ProjectDetail: Starting session for participant ID:', participantId);
    console.log('🔍 Searching in state.participants:', state.participants.length, 'participants');
    
    // Try multiple ways to find the participant
    let participant = state.participants.find(p => String(p.id) === String(participantId));
    
    if (!participant) {
      console.warn('⚠️ Participant not found in state.participants, checking project.participantIds');
      // Check if the ID exists in the project
      const participantIdExists = project.participantIds.some(id => String(id) === String(participantId));
      
      if (participantIdExists) {
        console.error('❌ Participant ID exists in project but not in state.participants!');
        console.error('   This is a data consistency issue.');
        console.error('   Project participantIds:', project.participantIds);
        console.error('   State participants:', state.participants.map(p => ({ id: p.id, name: p.name })));
      }
    }
    
    if (participant) {
      console.log('✅ Participant found:', participant.name, '(ID:', participant.id, ')');
      onStartSession(participantId);
    } else {
      console.error('❌ Participant not found anywhere!');
      console.error('   Looking for ID:', participantId, '(type:', typeof participantId, ')');
      console.error('   Available participant IDs:', state.participants.map(p => `${p.id} (${typeof p.id})`));
      
      // Show more helpful error message
      alert(`Error: Participant not found.\n\nThis might be a data sync issue. Try:\n1. Refreshing the page\n2. Re-adding the participant to the project\n\nDebug info: Looking for ID "${participantId}" (${typeof participantId})`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack} 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-600">{project.description}</p>
              </div>
            </div>
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Edit Setup</span>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' ? (
          <OverviewTab project={project} onStartSession={handleStartSession} />
        ) : (
          <AnalyticsTab project={project} />
        )}
      </div>
    </div>
  );
}