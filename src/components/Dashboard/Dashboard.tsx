// components/Dashboard/Dashboard.tsx
import React from 'react';
import { Plus, LayoutDashboard, BookOpen, Mail, HelpCircle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { ProjectCard } from './ProjectCard';
import { ParticipantsList } from './ParticipantsList';
import { Project, Participant } from '../../types';
import { LogoHorizontal } from '../Logo/UserLenseLogo';

<nav className="bg-white px-6 py-4">
  <LogoHorizontal size="md" />
</nav>

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

  const handleStatusChange = (projectId: number, status: 'active' | 'completed' | 'archived') => {
    actions.updateProject(projectId, { status });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                  <LogoHorizontal size="lg" />
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">Beta</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="https://docs.insighthub.io/user-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">User Guide</span>
              </a>
              <a
                href="https://docs.insighthub.io/help"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Help Center</span>
              </a>
              <a
                href="mailto:support@insighthub.io"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm font-medium">Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Projects</h2>
              <button
                onClick={onCreateProject}
                className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Create new project"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {(() => {
              // Group projects by status
              const activeProjects = state.projects.filter(p => p.status === 'active' || p.status === 'draft');
              const completedProjects = state.projects.filter(p => p.status === 'completed');
              const archivedProjects = state.projects.filter(p => p.status === 'archived');

              if (state.projects.length === 0) {
                return (
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
                );
              }

              return (
                <div className="space-y-8">
                  {/* Active Projects Section */}
                  {activeProjects.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          {activeProjects.length}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {activeProjects.map(project => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            participants={state.participants}
                            onEdit={() => onEditProject(project)}
                            onDelete={() => handleDeleteProject(Number(project.id))}
                            onOpen={() => onOpenProject(project)}
                            onStatusChange={(status) => handleStatusChange(Number(project.id), status)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Projects Section */}
                  {completedProjects.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Completed Projects</h3>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {completedProjects.length}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {completedProjects.map(project => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            participants={state.participants}
                            onEdit={() => onEditProject(project)}
                            onDelete={() => handleDeleteProject(Number(project.id))}
                            onOpen={() => onOpenProject(project)}
                            onStatusChange={(status) => handleStatusChange(Number(project.id), status)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Archived Projects Section */}
                  {archivedProjects.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Archived Projects</h3>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                          {archivedProjects.length}
                        </span>
                      </div>
                      <div className="space-y-4 opacity-75">
                        {archivedProjects.map(project => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            participants={state.participants}
                            onEdit={() => onEditProject(project)}
                            onDelete={() => handleDeleteProject(Number(project.id))}
                            onOpen={() => onOpenProject(project)}
                            onStatusChange={(status) => handleStatusChange(Number(project.id), status)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Participants Sidebar */}
          <ParticipantsList />
        </div>
      </div>
    </div>
  );
}