// components/Dashboard/Dashboard.tsx
import React from 'react';
import { Plus, LayoutDashboard } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { ProjectCard } from './ProjectCard';
import { ParticipantsList } from './ParticipantsList';
import { Project, Participant } from '../../types';

interface DashboardProps {
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onOpenProject: (project: Project) => void;
}

export function Dashboard({ onCreateProject, onEditProject, onOpenProject }: DashboardProps) {
  const { state, actions } = useAppContext();

  const handleDeleteProject = (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      actions.deleteProject(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Testing Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your testing projects and participants</p>
            </div>
            <button
              onClick={onCreateProject}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Projects</h2>
            
            {state.projects.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <LayoutDashboard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Create your first testing project to get started</p>
                <button
                  onClick={onCreateProject}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    participants={state.participants}
                    onEdit={() => onEditProject(project)}
                    onDelete={() => handleDeleteProject(project.id)}
                    onOpen={() => onOpenProject(project)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Participants Sidebar */}
          <ParticipantsList />
        </div>
      </div>
    </div>
  );
}

