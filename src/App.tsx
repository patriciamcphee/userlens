import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { ProjectDetail } from "./components/ProjectDetail";
import { SessionPage } from "./components/SessionPage";
import { SessionComplete } from "./components/SessionComplete";
import { Navbar } from "./components/Navbar";
import { Login } from "./components/Login";
import { LandingPage } from "./components/LandingPage";
import { AzureAuthProvider } from "./components/AzureAuthProvider";
import { useAzureAuth } from "./hooks/useAzureAuth";
import { isAzureAuthEnabled } from "./utils/azure/authConfig";
import { Project, SynthesisData, ProjectSetup } from "./types";
import { toast } from "sonner";

/**
 * Inline fallback API used by the app to avoid a missing './utils/api' module during compile.
 * This implementation calls the expected HTTP endpoints where possible and will surface
 * network errors to be handled by callers (which already include demo fallbacks).
 */
const api = {
  async getProjects(token?: string | null) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch("/api/projects", { headers });
    if (!res.ok) {
      // Throw to allow callers to detect network or server issues (they already catch).
      throw new Error(`Failed to fetch projects: ${res.statusText}`);
    }
    return res.json();
  },

  async getSynthesisData(projectId: string): Promise<SynthesisData> {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/synthesis`);
    if (!res.ok) {
      throw new Error(`Failed to fetch synthesis for ${projectId}: ${res.statusText}`);
    }
    return res.json();
  },

  async createProject(projectData: any) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });
    if (!res.ok) {
      throw new Error(`Failed to create project: ${res.statusText}`);
    }
    return res.json();
  },
};
import { RefreshCw } from "lucide-react";

function AppContent() {
  const azureAuth = useAzureAuth();
  const isAuthenticated = isAzureAuthEnabled ? azureAuth.isAuthenticated : true;
  const getAccessToken = azureAuth.getAccessToken;
  const signIn = azureAuth.signIn;
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [synthesisData, setSynthesisData] = useState<{ projectId: string; hypothesesCount: number; notesCount: number; }[]>([]);

  // Load projects from backend
  const loadProjects = async () => {
    try {
      setLoading(true);
      const token = isAzureAuthEnabled ? await getAccessToken() : null;
      const data = await api.getProjects(token);
      setProjects(data.projects || []);
      
      // Load synthesis data for all active projects
      const activeProjects = (data.projects || []).filter((p: Project) => p.status === 'active');
      const synthesisDataPromises = activeProjects.map(async (project: Project) => {
        try {
          const synthesis: SynthesisData = await api.getSynthesisData(project.id);
          return {
            projectId: project.id,
            hypothesesCount: synthesis.hypotheses?.length || 0,
            notesCount: synthesis.notes?.length || 0,
          };
        } catch (error) {
          console.error(`Error loading synthesis data for project ${project.id}:`, error);
          return {
            projectId: project.id,
            hypothesesCount: 0,
            notesCount: 0,
          };
        }
      });
      
      const synthesisResults = await Promise.all(synthesisDataPromises);
      setSynthesisData(synthesisResults);
    } catch (error) {
      console.error("Error loading projects:", error);
      
      // Check if it's a network error (server not deployed)
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        console.warn("Backend server not available. Using demo mode.");
        toast.error("Unable to connect to backend. Please deploy the Supabase edge function.", {
          duration: 8000,
        });
        
        // Load mock data for demo
        setProjects([
          {
            id: "demo-1",
            name: "Q1 2024 User Testing",
            description: "First quarter user research for product improvements",
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            totalSessions: 12,
            completedSessions: 8,
            mode: "moderated",
            participants: [],
            tasks: [],
            cameraOption: "optional",
            micOption: "optional",
            setup: {} as ProjectSetup,
            beforeMessage: undefined,
            duringMessage: undefined,
            afterMessage: undefined
          },
          {
            id: "demo-2",
            name: "Onboarding Flow Study",
            description: "Understanding user experience during onboarding",
            status: "active",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            totalSessions: 8,
            completedSessions: 5,
            mode: "unmoderated",
            participants: [],
            tasks: [],
            cameraOption: "optional",
            micOption: "optional",
            setup: {} as ProjectSetup,
            beforeMessage: undefined,
            duringMessage: undefined,
            afterMessage: undefined
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProject = await api.createProject({
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      setProjects([...projects, newProject]);
      toast.success("Project created successfully!");
    } catch (error) {
      console.error("Error creating project:", error);
      
      // Demo mode fallback
      const demoProject: Project = {
        id: `demo-${Date.now()}`,
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects([...projects, demoProject]);
      toast.success("Project created (demo mode)");
    }
  };

  const handleGetStarted = async () => {
    if (isAzureAuthEnabled) {
      await signIn();
    } else {
      // Navigate to app if Azure not configured
      window.location.href = '/app';
    }
  };

  return (
    <Routes>
      {/* Landing page route */}
      <Route 
        path="/" 
        element={
          !isAuthenticated ? (
            <LandingPage onGetStarted={handleGetStarted} />
          ) : (
            <Navigate to="/app" replace />
          )
        } 
      />
      
      {/* Public session routes - accessible without authentication */}
      <Route 
        path="/session/:projectId/:participantId/:token" 
        element={<SessionPage />} 
      />
      <Route 
        path="/session-complete" 
        element={<SessionComplete />} 
      />
      
      {/* App routes - require authentication */}
      <Route 
        path="/app/*" 
        element={
          isAuthenticated ? (
            <div className="min-h-screen">
              <Navbar />
              {loading ? (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                    <p className="text-slate-600">Loading projects...</p>
                  </div>
                </div>
              ) : (
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <Dashboard
                        projects={projects}
                        onCreateProject={handleCreateProject}
                        synthesisData={synthesisData}
                      />
                    } 
                  />
                  <Route 
                    path="/project/:projectId/:tab?" 
                    element={
                      <ProjectDetail
                        projects={projects}
                        onUpdate={loadProjects}
                      />
                    } 
                  />
                </Routes>
              )}
            </div>
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AzureAuthProvider>
        <AppContent />
      </AzureAuthProvider>
    </BrowserRouter>
  );
}