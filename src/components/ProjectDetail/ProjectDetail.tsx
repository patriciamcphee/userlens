// components/ProjectDetail/ProjectDetail.tsx
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
  onStartSession: (participantId: string | number) => void;
}

export function ProjectDetail({ project, onBack, onEdit, onStartSession }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

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
          <OverviewTab project={project} onStartSession={onStartSession} />
        ) : (
          <AnalyticsTab project={project} />
        )}
      </div>
    </div>
  );
}