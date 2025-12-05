import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Project } from "../types";
import { Button } from "./ui/button";
import { LayoutDashboard, Users, ListTodo, BarChart3, Lightbulb, FileText, Home, Map } from "lucide-react";
import { OverviewTab } from "./OverviewTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { SynthesisTab } from "./SynthesisTab";
import { ParticipantsTab } from "./ParticipantsTab";
import { TasksTab } from "./TasksTab";
import { HypothesesTab } from "./HypothesesTab";
import { CoverageTab } from "./CoverageTab";
import { Breadcrumbs } from "./Breadcrumbs";
import { Sidebar } from "./Sidebar";
import { BackToTop } from "./BackToTop";
import { api } from "../utils/api";
import { useAzureAuth } from "../hooks/useAzureAuth";

interface ProjectDetailProps {
  projects: Project[];
  onUpdate: () => void;
  onSignOut?: () => void;
}

interface SynthesisData {
  projectId: string;
  hypotheses: any[];
  notes: any[];
  clusters: string[];
  questions: any[];
}

export function ProjectDetail({
  projects,
  onUpdate,
  onSignOut,
}: ProjectDetailProps) {
  const { projectId, tab = "overview" } = useParams<{ projectId: string; tab?: string }>();
  const navigate = useNavigate();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [synthesisData, setSynthesisData] = useState<SynthesisData | null>(null);

  const project = projects.find(p => p.id === projectId);

  // Load synthesis data for insights count
  useEffect(() => {
    const loadSynthesisData = async () => {
      if (!projectId) return;
      try {
        const data = await api.getSynthesisData(projectId);
        setSynthesisData(data);
      } catch (error) {
        console.error('Error loading synthesis data:', error);
      }
    };
    loadSynthesisData();
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Project not found</p>
          <Button onClick={() => navigate("/app")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleBackClick = () => {
    navigate("/app");
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === "dashboard") {
      navigate("/app");
    } else {
      navigate(`/app/project/${projectId}/${tabId}`);
    }
  };

  const getBreadcrumbItems = () => {
    const items = [
      { label: "Dashboard", onClick: handleBackClick },
      { label: project.name },
    ];

    if (tab !== "overview") {
      items.push({
        label: tab.charAt(0).toUpperCase() + tab.slice(1),
      });
    }

    return items;
  };

  // Calculate insights count from synthesis notes
  const insightsCount = synthesisData?.notes?.length || 0;
  
  // Calculate hypotheses count for coverage tab badge
  const hypothesesCount = synthesisData?.hypotheses?.length || 0;

  // Navigation items for Project sidebar
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "divider-1", label: "", icon: () => null, isDivider: true },
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "participants", label: "Participants", icon: Users, count: project.participants?.length || 0 },
    { id: "hypotheses", label: "Hypotheses", icon: Lightbulb, count: hypothesesCount },
    { id: "tasks", label: "Tasks", icon: ListTodo, count: project.tasks?.length || 0 },
    { id: "coverage", label: "Coverage", icon: Map },    
    { id: "synthesis", label: "Synthesis", icon: FileText, count: insightsCount },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        activeItem={tab}
        onNavItemClick={handleTabChange}
        user={azureAuth.user || undefined}
        onSignOut={onSignOut}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`
        min-h-screen overflow-y-auto transition-all duration-300
        ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        <div className="max-w-6xl mx-auto px-4 lg:px-6 pt-4 lg:pt-6 pb-6 mt-12 lg:mt-0">
          <Breadcrumbs items={getBreadcrumbItems()} />

          {/* Tab Content */}
          <div className="mt-4 lg:mt-6">
            {tab === "overview" && (
              <OverviewTab
                project={project}
                onUpdate={onUpdate}
                onDelete={handleBackClick}
                insightsCount={insightsCount}
              />
            )}

            {tab === "analytics" && (
              <AnalyticsTab project={project} />
            )}

            {tab === "synthesis" && (
              <SynthesisTab 
                projectId={project.id} 
                onProjectUpdate={onUpdate}
              />
            )}

            {tab === "participants" && (
              <ParticipantsTab
                project={project}
                onUpdate={onUpdate}
              />
            )}

            {tab === "tasks" && (
              <TasksTab project={project} onUpdate={onUpdate} />
            )}

            {tab === "hypotheses" && (
              <HypothesesTab projectId={project.id} />
            )}

            {tab === "coverage" && (
              <CoverageTab project={project} onUpdate={onUpdate} />
            )}
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}