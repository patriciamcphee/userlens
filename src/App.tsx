// App.tsx - FIXED VERSION with Short URL Support
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
    // Initialize Azure upload service
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

  // ✅ FIXED: Session link handling with support for SHORT URLs
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for short URL format (sid parameter)
    const shortId = urlParams.get('sid');
    
    // Check for long URL format (session parameter)
    const sessionParam = urlParams.get('session');
    
    if (shortId) {
      console.log('📎 Processing SHORT session link:', shortId);
      
      try {
        // Retrieve session data from localStorage using linkId
        const sessionDataStr = localStorage.getItem(`session_${shortId}`);
        
        if (!sessionDataStr) {
          alert('This session link is invalid or has expired. Please contact the administrator for a new link.');
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }
        
        const sessionData = JSON.parse(sessionDataStr);
        processSessionData(sessionData, shortId);
        
      } catch (error) {
        console.error('Error parsing short session link:', error);
        alert('Invalid session link format. Please contact the administrator.');
        window.history.replaceState({}, '', window.location.pathname);
      }
      
    } else if (sessionParam) {
      console.log('📎 Processing LONG session link');
      
      try {
        // Decode the session data from URL
        const sessionData = JSON.parse(atob(sessionParam));
        processSessionData(sessionData, sessionData.linkId);
        
      } catch (error) {
        console.error('Error parsing long session link:', error);
        alert('Invalid session link format. Please contact the administrator.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    
    // ✅ Helper function to process session data
    function processSessionData(sessionData: any, linkId: string) {
      const { projectId, participantId, expiresAt, projectSetup, participant: participantData } = sessionData;
      
      // Check if expired
      if (new Date(expiresAt) < new Date()) {
        alert('This session link has expired. Please contact the administrator for a new link.');
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      // Check if link was already used
      const usedLinksKey = 'usedSessionLinks';
      const usedLinks = JSON.parse(localStorage.getItem(usedLinksKey) || '[]');
      
      if (usedLinks.includes(linkId)) {
        alert('This session link has already been used on this device.');
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      // Validate data
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

      // Mark link as used
      usedLinks.push(linkId);
      localStorage.setItem(usedLinksKey, JSON.stringify(usedLinks));

      console.log('✅ Session link processed successfully');
      console.log('   Project:', tempProject.name);
      console.log('   Participant:', tempParticipant.name);

      // Set current project and participant
      setSelectedProject(tempProject);
      setSelectedParticipant(tempParticipant);
      setCurrentView('runSession');

      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
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

  // ✅ FIXED: Better handling for Start Session
  const handleStartSession = (participantId: number) => {
    console.log('🎬 Starting session for participant:', participantId);
    console.log('   Selected project:', selectedProject?.name);
    
    if (!selectedProject) {
      console.error('❌ No project selected');
      alert('Error: No project selected');
      return;
    }
    
    // Find participant in state
    const participant = state.participants.find(p => {
      const pId = typeof p.id === 'number' ? p.id : parseInt(String(p.id), 10);
      return pId === participantId;
    });
    
    if (!participant) {
      console.error('❌ Participant not found:', participantId);
      console.log('   Available participants:', state.participants.map(p => ({ id: p.id, name: p.name })));
      alert('Error: Participant not found');
      return;
    }
    
    console.log('✅ Found participant:', participant.name);
    
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
            onStartSession={handleStartSession}
          />
        );

      case 'runSession':
        if (!selectedProject || !selectedParticipant) {
          console.error('❌ Missing data for session:', {
            hasProject: !!selectedProject,
            hasParticipant: !!selectedParticipant
          });
          setCurrentView('dashboard');
          return null;
        }
        
        console.log('🎥 Rendering session view:', {
          mode: selectedProject.mode,
          project: selectedProject.name,
          participant: selectedParticipant.name
        });
        
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