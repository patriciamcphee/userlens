// components/Dashboard/ProjectCard.tsx
import React, { useState } from 'react';
import { Edit2, Trash2, Users, User, CheckCircle, UserPlus, BarChart3, MoreVertical, Archive, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Project, Participant } from '../../types';
import { getAnalytics } from '../../utils';

interface ProjectCardProps {
  project: Project;
  participants: Participant[];
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
  onStatusChange: (status: 'active' | 'completed' | 'archived') => void;
}

export function ProjectCard({ project, participants, onEdit, onDelete, onOpen, onStatusChange }: ProjectCardProps) {
  const analytics = getAnalytics(project);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'archived':
        return <Archive className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
              
              {/* Status Badge with Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(project.status)} hover:opacity-80 transition-opacity`}
                >
                  {getStatusIcon(project.status)}
                  <span className="capitalize">{project.status}</span>
                  <MoreVertical className="w-3 h-3 ml-1" />
                </button>
                
                {/* Status Dropdown Menu */}
                {showStatusMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowStatusMenu(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
                      <button
                        onClick={() => {
                          onStatusChange('active');
                          setShowStatusMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <PlayCircle className="w-4 h-4 text-green-600" />
                        <span>Active</span>
                      </button>
                      <button
                        onClick={() => {
                          onStatusChange('completed');
                          setShowStatusMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>Completed</span>
                      </button>
                      <button
                        onClick={() => {
                          onStatusChange('archived');
                          setShowStatusMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Archive className="w-4 h-4 text-gray-600" />
                        <span>Archived</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Edit project"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete project"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {project.mode === 'moderated' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
            <span className="capitalize">{project.mode}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <UserPlus className="w-4 h-4" />
            <span>{project.participantIds.length} participants</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4" />
            <span>{project.setup.tasks.length} tasks</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BarChart3 className="w-4 h-4" />
            <span>{analytics.totalSessions} sessions</span>
          </div>
        </div>

        {analytics.totalSessions > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{analytics.completionRate}%</div>
                <div className="text-xs text-gray-600">Completion</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{Math.floor(analytics.avgDuration / 60)}m</div>
                <div className="text-xs text-gray-600">Avg Duration</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{analytics.avgClicks}</div>
                <div className="text-xs text-gray-600">Avg Clicks</div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onOpen}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Open Project
        </button>
      </div>
    </div>
  );
}