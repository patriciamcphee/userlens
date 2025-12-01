import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Project } from "../types";
import { Button } from "./ui/button";
import { Calendar, LayoutDashboard, Users, ListTodo, BarChart3, Lightbulb, FileText, ChevronLeft, ChevronRight, Home, Menu, X } from "lucide-react";
import { OverviewTab } from "./OverviewTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { SynthesisTab } from "./SynthesisTab";
import { ParticipantsTab } from "./ParticipantsTab";
import { TasksTab } from "./TasksTab";
import { HypothesesTab } from "./HypothesesTab";
import { Breadcrumbs } from "./Breadcrumbs";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { api } from "../utils/api";

interface ProjectDetailProps {
  projects: Project[];
  onUpdate: () => void;
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
}: ProjectDetailProps) {
  const { projectId, tab = "overview" } = useParams<{ projectId: string; tab?: string }>();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
    navigate(`/app/project/${projectId}/${tabId}`);
    setIsMobileSidebarOpen(false); // Close mobile sidebar on navigation
  };

  const formatDateRange = () => {
    if (!project.startDate && !project.endDate) return null;

    const start = project.startDate
      ? format(
          new Date(project.startDate + "T00:00:00"),
          "MMM d, yyyy",
        )
      : "Not set";
    const end = project.endDate
      ? format(
          new Date(project.endDate + "T00:00:00"),
          "MMM d, yyyy",
        )
      : "Not set";

    return `${start} - ${end}`;
  };

  const getBreadcrumbItems = () => {
    const items = [
      { label: "Dashboard", onClick: handleBackClick },
      { label: project.name },
    ];

    if (tab !== "overview") {
      items.push({
        label:
          tab.charAt(0).toUpperCase() +
          tab.slice(1),
      });
    }

    return items;
  };

  // Calculate insights count from synthesis notes
  const insightsCount = synthesisData?.notes?.length || 0;

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "hypotheses", label: "Hypotheses", icon: Lightbulb },
    { id: "participants", label: "Participants", icon: Users, count: project.participants?.length || 0 },
    { id: "tasks", label: "Tasks", icon: ListTodo, count: project.tasks?.length || 0 },
    { id: "synthesis", label: "Synthesis", icon: FileText, count: insightsCount },
    { id: "analytics", label: "Analytics", icon: BarChart3 },  
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on all screen sizes */}
      <div className={`
        bg-white border-r border-slate-200 flex flex-col transition-all duration-300
        fixed left-0 z-50 overflow-y-auto overflow-x-hidden
        top-0 bottom-0 lg:top-[88px]
        ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        ${isMobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 z-20 p-2 hover:bg-slate-100 rounded-lg"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        <div className="p-6 flex-1 pt-24 lg:pt-6">
          {/* Navigation */}
          <nav className="space-y-1">
            {/* Dashboard Link */}
            <button
              onClick={() => {
                handleBackClick();
                setIsMobileSidebarOpen(false);
              }}
              className={`
                w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-slate-700 hover:bg-slate-50
              `}
              title={isSidebarCollapsed ? "Dashboard" : undefined}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <Home className={`w-4 h-4 text-slate-500`} />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </div>
            </button>

            {/* Divider */}
            <div className={`${isSidebarCollapsed ? 'px-2' : 'px-0'} py-2`}>
              <div className="border-t border-slate-200"></div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`
                    w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-700 hover:bg-slate-50'
                    }
                  `}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isSidebarCollapsed && item.count !== undefined && item.count > 0 && (
                    <Badge variant="secondary" className="text-xs opacity-0 animate-fadeIn">
                      {item.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Collapse/Expand Button - positioned outside sidebar (Desktop only) */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="hidden lg:flex fixed top-[100px] z-[60] w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all items-center justify-center"
        style={{ left: isSidebarCollapsed ? '52px' : '244px' }}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="w-3 h-3 text-slate-600" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-slate-600" />
        )}
      </button>

      {/* Main Content */}
      <div className={`
        min-h-screen overflow-y-auto transition-all duration-300
        ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Mobile Menu Button */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="font-semibold text-slate-800">{project.name}</h1>
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-6 pt-4 lg:pt-6 pb-6">
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
              <SynthesisTab projectId={project.id} />
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
          </div>
        </div>
      </div>
    </div>
  );
}