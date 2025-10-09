// App.tsx
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProjectSetup } from './components/ProjectSetup/ProjectSetup';
import { ProjectDetail } from './components/ProjectDetail/ProjectDetail';
import { ModeratedSession } from './components/Session/ModeratedSession';
import { UnmoderatedSession } from './components/Session/UnmoderatedSession';
import { SessionComplete } from './components/Session/SessionComplete';
import { Project, Participant, View } from './types';

function AppContent() {
  const { state, actions } = useAppContext();
  
  const [view, setView] = useState<View>('dashboard');
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Get current project from state (always up-to-date)
  const currentProject = currentProjectId 
    ? state.projects.find(p => p.id === currentProjectId) || null
    : null;

  // Handle URL parameters for public session links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('session');
    
    if (token) {
      // Find the session link
      const link = state.sessionLinks.find(l => l.id === token);
      
      if (link && !link.used && new Date(link.expiresAt) > new Date()) {
        // Find the project and participant
        const project = state.projects.find(p => p.id === link.projectId);
        const participant = state.participants.find(p => p.id === link.participantId);
        
        if (project && participant) {
          // Mark link as used
          actions.updateSessionLink(token, { used: true });
          
          // Start the session
          setCurrentProjectId(project.id);
          setCurrentParticipant(participant);
          setView('runSession');
        } else {
          alert('Invalid session link - project or participant not found');
        }
      } else if (link && link.used) {
        alert('This session link has already been used');
      } else if (link && new Date(link.expiresAt) <= new Date()) {
        alert('This session link has expired');
      } else {
        alert('Invalid session link');
      }
    }
  }, [state.sessionLinks, state.projects, state.participants]);

  // Navigation handlers
  const handleCreateProject = () => {
    setEditingProject(null);
    setView('createProject');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setView('createProject');
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProjectId(project.id);
    actions.setCurrentProject(project);
    setView('projectDetail');
  };

  const handleSaveProject = () => {
    setEditingProject(null);
    setView('dashboard');
  };

  const handleCancelProjectSetup = () => {
    setEditingProject(null);
    setView('dashboard');
  };

  const handleBackToDashboard = () => {
    setCurrentProjectId(null);
    setCurrentParticipant(null);
    setSessionComplete(false);
    actions.setCurrentProject(null);
    actions.setCurrentParticipant(null);
    setView('dashboard');
  };

  const handleBackToProject = () => {
    setCurrentParticipant(null);
    setSessionComplete(false);
    actions.setCurrentParticipant(null);
    setView('projectDetail');
  };

  const handleStartSession = (participantId: number) => {
    const participant = state.participants.find(p => p.id === participantId);
    if (participant && currentProjectId) {
      setCurrentParticipant(participant);
      actions.setCurrentParticipant(participant);
      setSessionComplete(false);
      setView('runSession');
    }
  };

  const handleSessionComplete = () => {
    setSessionComplete(true);
  };

  // Render appropriate view
  if (view === 'dashboard') {
    return (
      <Dashboard
        onCreateProject={handleCreateProject}
        onEditProject={handleEditProject}
        onOpenProject={handleOpenProject}
      />
    );
  }

  if (view === 'createProject') {
    return (
      <ProjectSetup
        editingProject={editingProject}
        onCancel={handleCancelProjectSetup}
        onSave={handleSaveProject}
      />
    );
  }

  if (view === 'projectDetail' && currentProject) {
    return (
      <ProjectDetail
        project={currentProject}
        onBack={handleBackToDashboard}
        onEdit={() => handleEditProject(currentProject)}
        onStartSession={handleStartSession}
      />
    );
  }

  if (view === 'runSession' && currentProject && currentParticipant) {
    if (sessionComplete) {
      return (
        <SessionComplete
          afterMessage={currentProject.setup.afterMessage}
          completedTasks={currentProject.setup.tasks.length}
          totalTasks={currentProject.setup.tasks.length}
          onBackToProject={handleBackToProject}
          onBackToDashboard={handleBackToDashboard}
        />
      );
    }

    if (currentProject.mode === 'moderated') {
      return (
        <ModeratedSession
          project={currentProject}
          participant={currentParticipant}
          onBack={handleBackToProject}
          onComplete={handleSessionComplete}
        />
      );
    } else {
      return (
        <UnmoderatedSession
          project={currentProject}
          participant={currentParticipant}
          onBack={handleBackToProject}
          onComplete={handleSessionComplete}
        />
      );
    }
  }

  // Fallback to dashboard
  return (
    <Dashboard
      onCreateProject={handleCreateProject}
      onEditProject={handleEditProject}
      onOpenProject={handleOpenProject}
    />
  );
}

// Main App component with Provider
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}