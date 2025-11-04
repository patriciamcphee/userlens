// App.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useAppContext } from './contexts/AppContext';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProjectSetup } from './components/ProjectSetup/ProjectSetup';
import { ProjectDetail } from './components/ProjectDetail/ProjectDetail';
import { ModeratedSession } from './components/Session/ModeratedSession';
import { UnmoderatedSession } from './components/Session/UnmoderatedSession';
import { SessionComplete } from './components/Session/SessionComplete';
import { Project, Participant, View } from './types';

import { azureUploadService } from './services/azureUploadService';

function App() {
  useEffect(() => {
    // Initialize Azure upload service on app start with proper validation
    const accountName = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME;
    const sasToken = import.meta.env.VITE_AZURE_STORAGE_SAS_TOKEN;
    const containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER_NAME || 'recordings';

    if (!accountName || !sasToken) {
      console.warn('⚠️ Azure Storage credentials not configured. Recording uploads will fail.');
      console.warn('Please set VITE_AZURE_STORAGE_ACCOUNT_NAME and VITE_AZURE_STORAGE_SAS_TOKEN in your .env file');
      return;
    }

    try {
      azureUploadService.initialize({
        accountName,
        sasToken,
        containerName
      });
      console.log('✅ Azure Upload Service initialized successfully');
      
      // Test the connection
      azureUploadService.testConnection().then(result => {
        if (result) {
          console.log('✅ Azure connection test passed');
        } else {
          console.error('❌ Azure connection test failed');
        }
      });
    } catch (error) {
      console.error('❌ Failed to initialize Azure Upload Service:', error);
    }
  }, []);

  const { state } = useAppContext();
  
  // View management
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Session link handling - runs on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionParam = urlParams.get('session');
    
    if (sessionParam) {
      try {
        // Decode the session data from URL
        const sessionData = JSON.parse(atob(sessionParam));
        const { projectId, participantId, expiresAt, linkId, projectSetup, participant: participantData } = sessionData;
        
        // Check if expired
        if (new Date(expiresAt) < new Date()) {
          alert('This session link has expired. Please contact the administrator for a new link.');
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }

        // Check if link was already used (optional - stored locally on participant's device)
        const usedLinksKey = 'usedSessionLinks';
        const usedLinks = JSON.parse(localStorage.getItem(usedLinksKey) || '[]');
        
        if (usedLinks.includes(linkId)) {
          alert('This session link has already been used on this device.');
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }

        // Create a temporary project and participant from the link data
        if (!projectSetup || !participantData) {
          alert('This session link format is not supported. Please request a new link.');
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }

        // Create temporary project object
        const tempProject: Project = {
          id: projectId,
          name: projectSetup.name,
          description: projectSetup.description,
          mode: projectSetup.mode,
          status: 'active',
          participantIds: [participantId],
          participantAssignments: participantData.usageLevel ? [{
            participantId: participantId,
            usageLevel: participantData.usageLevel
          }] : [],
          sessions: [],
          cameraOption: projectSetup.cameraOption,
          micOption: projectSetup.micOption,
          setup: {
            beforeMessage: projectSetup.beforeMessage,
            duringScenario: projectSetup.duringScenario,
            afterMessage: projectSetup.afterMessage,
            randomizeOrder: projectSetup.randomizeOrder,
            tasks: projectSetup.tasks
          }
        };

        // Create temporary participant object
        const tempParticipant: Participant = {
          id: participantId,
          name: participantData.name,
          email: participantData.email,
          defaultUsageLevel: participantData.usageLevel
        };

        // Mark link as used on this device
        usedLinks.push(linkId);
        localStorage.setItem(usedLinksKey, JSON.stringify(usedLinks));

        // Set current project and participant
        setSelectedProject(tempProject);
        setSelectedParticipant(tempParticipant);

        // Navigate to session view
        setCurrentView('runSession');

        // Clean up URL parameter
        window.history.replaceState({}, '', window.location.pathname);
        
      } catch (error) {
        console.error('Error parsing session link:', error);
        alert('Invalid session link format. Please contact the administrator.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []); // Run only once on mount

  // Navigation handlers
  const handleCreateProject = () => {
    setEditingProject(null);
    setCurrentView('createProject');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setCurrentView('editProject');
  };

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('projectDetail');
  };

  const handleStartSession = (participant: Participant, projectId: string | number) => {
    const project = state.projects.find(p => String(p.id) === String(projectId));
    
    if (!project || !participant) {
      alert('Error starting session');
      return;
    }
    
    setSelectedProject(project);
    setSelectedParticipant(participant);
    setCurrentView('runSession');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProject(null);
    setSelectedParticipant(null);
    setEditingProject(null);
  };

  const handleBackToProject = () => {
    setCurrentView('projectDetail');
    setSelectedParticipant(null);
  };

  const handleProjectSaved = () => {
    setCurrentView('dashboard');
    setEditingProject(null);
  };

  const handleSessionComplete = () => {
    setCurrentView('sessionComplete');
  };

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onOpenProject={handleOpenProject}
          />
        );

      case 'createProject':
        return (
          <ProjectSetup
            editingProject={null}
            onCancel={handleBackToDashboard}
            onSave={handleProjectSaved}
          />
        );

      case 'editProject':
        return (
          <ProjectSetup
            editingProject={editingProject}
            onCancel={handleBackToProject}
            onSave={handleProjectSaved}
          />
        );

      case 'projectDetail':
        if (!selectedProject) {
          setCurrentView('dashboard');
          return null;
        }
        return (
        <ProjectDetail
          project={selectedProject}
          onBack={handleBackToDashboard}
          onEdit={() => handleEditProject(selectedProject)}
          onStartSession={(participantId) => {
            const participant = state.participants.find(p => p.id === participantId);
            if (participant) {
              handleStartSession(participant, selectedProject.id);
            }
          }}
        />
        );

      case 'runSession':
        if (!selectedProject || !selectedParticipant) {
          setCurrentView('dashboard');
          return null;
        }
        
        // Render moderated or unmoderated session based on project mode
        if (selectedProject.mode === 'moderated') {
          return (
            <ModeratedSession
              project={selectedProject}
              participant={selectedParticipant}
              onBack={handleBackToProject}
              onComplete={handleSessionComplete}
            />
          );
        } else {
          return (
            <UnmoderatedSession
              project={selectedProject}
              participant={selectedParticipant}
              onBack={handleBackToProject}
              onComplete={handleSessionComplete}
            />
          );
        }

      case 'sessionComplete':
        if (!selectedProject) {
          setCurrentView('dashboard');
          return null;
        }
        
        // Calculate completed tasks from the most recent session
        const latestSession = selectedProject.sessions[selectedProject.sessions.length - 1];
        const completedTasks = latestSession?.tasksCompleted || 0;
        const totalTasks = latestSession?.totalTasks || selectedProject.setup.tasks.length;
        
        return (
          <SessionComplete
            afterMessage={selectedProject.setup.afterMessage}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
            onBackToProject={handleBackToProject}
            onBackToDashboard={handleBackToDashboard}
          />
        );

      default:
        return (
          <Dashboard
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onOpenProject={handleOpenProject}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;