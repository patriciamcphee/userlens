// components/Dashboard/ProjectCard.tsx
import React from 'react';
import { Edit2, Trash2, Users, User, CheckCircle, UserPlus, BarChart3 } from 'lucide-react';
import { Project, Participant } from '../../types';
import { getAnalytics } from '../../utils';

interface ProjectCardProps {
  project: Project;
  participants: Participant[];
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}

export function ProjectCard({ project, participants, onEdit, onDelete, onOpen }: ProjectCardProps) {
  const analytics = getAnalytics(project);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-700' :
                project.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {project.status}
              </span>
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

