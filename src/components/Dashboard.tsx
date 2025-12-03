import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Users, FolderOpen, ChevronDown, ChevronRight, X, Copy, CheckSquare, Lightbulb, LayoutGrid, TrendingUp, FileText, Activity, Tag, Calendar, Download, Plug, UsersRound } from "lucide-react";
import { Project, Participant } from "../types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { formatDateRange, formatTimestamp } from "../utils/dateUtils";
import { Sidebar } from "./Sidebar";
import { BackToTop } from "./BackToTop";
import { useAzureAuth } from "../hooks/useAzureAuth";

interface DashboardProps {
  projects: Project[];
  onCreateProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  synthesisData?: { projectId: string; hypothesesCount: number; notesCount: number; }[];
  onSignOut?: () => void;
}

export function Dashboard({ projects, onCreateProject, synthesisData, onSignOut }: DashboardProps) {
  const navigate = useNavigate();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);
  const [newProject, setNewProject] = useState<{
    name: string;
    description: string;
    status: "draft" | "active" | "completed" | "archived";
    mode: "moderated" | "unmoderated";
    startDate: string;
    endDate: string;
    tags: string[];
    tasks?: any[];
    researchGoals?: string;
    beforeMessage?: string;
    duringMessage?: string;
    afterMessage?: string;
    cameraOption?: 'optional' | 'required' | 'disabled';
    micOption?: 'optional' | 'required' | 'disabled';
  }>({
    name: "",
    description: "",
    status: "draft" as const,
    mode: "moderated" as const,
    startDate: "",
    endDate: "",
    tags: [] as string[],
    cameraOption: 'optional',
    micOption: 'optional',
  });
  const [tagInput, setTagInput] = useState("");

  const draftProjects = projects.filter(p => p.status === 'draft');
  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  const handleDuplicateProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setNewProject({
      name: `${project.name} (Copy)`,
      description: project.description,
      status: 'active',
      mode: project.mode,
      startDate: '',
      endDate: '',
      tags: project.tags || [],
      tasks: project.tasks || [],
      researchGoals: project.researchGoals,
      beforeMessage: project.beforeMessage,
      duringMessage: project.duringMessage,
      afterMessage: project.afterMessage,
      cameraOption: project.cameraOption || 'optional',
      micOption: project.micOption || 'optional',
    });
    setIsCreateDialogOpen(true);
  };

  // Sidebar navigation items for Dashboard
  const navItems = [
    // Main
    { id: "projects", label: "Projects", icon: LayoutGrid },
    { id: "trends", label: "Trend Analysis", icon: TrendingUp },
    // Insights & Reporting
    { id: "divider-1", label: "", icon: () => null, isDivider: true },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "activity", label: "Activity", icon: Activity },
    // Organization
    { id: "divider-2", label: "", icon: () => null, isDivider: true },
    { id: "teams", label: "Teams", icon: UsersRound },
//    { id: "tags", label: "Tags", icon: Tag },
    { id: "calendar", label: "Calendar", icon: Calendar },
    // Data Management
    { id: "divider-3", label: "", icon: () => null, isDivider: true },
//    { id: "import-export", label: "Import/Export", icon: Download },
    { id: "integrations", label: "Integrations", icon: Plug },
  ];

  const handleNavItemClick = (id: string) => {
    if (id.startsWith("divider")) return;
    
    if (id === "projects") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Navigate to the corresponding page
      navigate(`/app/${id}`);
    }
  };

  // Helper function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Draft</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
      case 'archived':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to render project card content
  const renderProjectCardContent = (project: Project, type: 'draft' | 'active' | 'completed' | 'archived') => {
    const dateRange = formatDateRange(project.startDate, project.endDate);
    const projectSynthesis = synthesisData?.find(s => s.projectId === project.id);
    
    const getDateLabel = () => {
      switch (type) {
        case 'draft': return 'Created';
        case 'active': return 'Updated';
        case 'completed': return 'Completed';
        case 'archived': return 'Archived';
        default: return 'Updated';
      }
    };
    
    return (
      <div className="space-y-3 text-sm text-slate-600">
        {/* Participants, Tasks, Insights row */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">{project.participants?.length || 0}</span>
            <span className="text-slate-400">participants</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">{project.tasks?.length || 0}</span>
            <span className="text-slate-400">tasks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">{projectSynthesis?.notesCount || 0}</span>
            <span className="text-slate-400">insights</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Sessions</span>
          <span className="font-medium text-slate-700">{project.completedSessions || 0}/{project.totalSessions || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Mode</span>
          <Badge variant="outline" className="capitalize">
            {project.mode}
          </Badge>
        </div>
        {dateRange && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Project date</span>
            <span className="font-medium text-slate-700">{dateRange}</span>
          </div>
        )}
        {!dateRange && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{getDateLabel()}</span>
            <span className="font-medium text-slate-700">{formatTimestamp(project.updatedAt || project.createdAt)}</span>
          </div>
        )}
      </div>
    );
  };

  // Helper function to render a project card
  const renderProjectCard = (project: Project, type: 'draft' | 'active' | 'completed' | 'archived') => (
    <Card 
      key={project.id}
      className={`hover:shadow-lg transition-shadow cursor-pointer ${
        type === 'draft' ? 'opacity-80' : 
        type === 'completed' ? 'opacity-90' : 
        type === 'archived' ? 'opacity-75' : ''
      }`}
      onClick={() => navigate(`/app/project/${project.id}/overview`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-slate-900 text-base leading-tight">{project.name}</CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleDuplicateProject(project, e)}
              className="h-7 w-7 p-0"
              title="Duplicate project"
            >
              <Copy className="w-4 h-4" />
            </Button>
            {getStatusBadge(type)}
          </div>
        </div>
        <CardDescription className="line-clamp-2 mt-1">
          {project.description || "No description"}
        </CardDescription>
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {project.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-slate-100">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {renderProjectCardContent(project, type)}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        activeItem="projects"
        onNavItemClick={handleNavItemClick}
        user={azureAuth.user || undefined}
        onSignOut={onSignOut}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`
        min-h-screen transition-all duration-300
        ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12 lg:mt-0">
            <div>
              <h1 className="text-3xl text-slate-900 mb-2">User Research Projects</h1>
              <p className="text-slate-600">Manage your research projects and synthesis</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 sm:shrink-0">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Create Project Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Create a new project to start your research.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Project Name" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Project Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newProject.status} onValueChange={(value) => setNewProject({ ...newProject, status: value as 'draft' | 'active' | 'completed' | 'archived' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mode">Mode</Label>
                  <Select value={newProject.mode} onValueChange={(value) => setNewProject({ ...newProject, mode: value as 'moderated' | 'unmoderated' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moderated">Moderated</SelectItem>
                      <SelectItem value="unmoderated">Unmoderated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={newProject.startDate} onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={newProject.endDate} onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })} />
                </div>
              </div>
              {/* Recording Options */}
              <div className="space-y-3 border-t pt-4">
                <div>
                  <Label className="text-base">Recording Options</Label>
                  <p className="text-xs text-slate-600 mt-1">Configure camera and microphone settings for sessions</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Camera Options */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Camera (Screen Recording)</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="cameraOption"
                          value="optional"
                          checked={newProject.cameraOption === 'optional'}
                          onChange={(e) => setNewProject({ ...newProject, cameraOption: e.target.value as 'optional' })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Optional</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="cameraOption"
                          value="required"
                          checked={newProject.cameraOption === 'required'}
                          onChange={(e) => setNewProject({ ...newProject, cameraOption: e.target.value as 'required' })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Required</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="cameraOption"
                          value="disabled"
                          checked={newProject.cameraOption === 'disabled'}
                          onChange={(e) => setNewProject({ ...newProject, cameraOption: e.target.value as 'disabled' })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Disabled</span>
                      </label>
                    </div>
                  </div>

                  {/* Microphone Options */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Microphone (Audio Recording)</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="micOption"
                          value="optional"
                          checked={newProject.micOption === 'optional'}
                          onChange={(e) => setNewProject({ ...newProject, micOption: e.target.value as 'optional' })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Optional</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="micOption"
                          value="required"
                          checked={newProject.micOption === 'required'}
                          onChange={(e) => setNewProject({ ...newProject, micOption: e.target.value as 'required' })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Required</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="micOption"
                          value="disabled"
                          checked={newProject.micOption === 'disabled'}
                          onChange={(e) => setNewProject({ ...newProject, micOption: e.target.value as 'disabled' })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Disabled</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex items-center gap-2">
                  <Input id="tags" placeholder="Add a tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim() !== '') {
                      setNewProject({ ...newProject, tags: [...newProject.tags, tagInput.trim()] });
                      setTagInput('');
                    }
                  }} />
                  <Button type="button" variant="outline" onClick={() => {
                    if (tagInput.trim() !== '') {
                      setNewProject({ ...newProject, tags: [...newProject.tags, tagInput.trim()] });
                      setTagInput('');
                    }
                  }}>Add</Button>
                </div>
              </div>
              {newProject.tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {newProject.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-slate-100" onClick={() => setNewProject({ ...newProject, tags: newProject.tags.filter(t => t !== tag) })}>
                        {tag} <X className="w-3 h-3 ml-1 cursor-pointer" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={() => {
                const project: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
                  name: newProject.name,
                  description: newProject.description,
                  mode: newProject.mode,
                  totalSessions: 0,
                  completedSessions: 0,
                  participants: [],
                  tasks: newProject.tasks || [],
                  status: newProject.status,
                  startDate: newProject.startDate,
                  endDate: newProject.endDate,
                  tags: newProject.tags,
                  researchGoals: newProject.researchGoals,
                  beforeMessage: newProject.beforeMessage,
                  duringMessage: newProject.duringMessage,
                  afterMessage: newProject.afterMessage,
                  cameraOption: newProject.cameraOption || 'optional',
                  micOption: newProject.micOption || 'optional',
                  setup: {
                    tasks: [],
                    beforeMessage: "",
                    duringScenario: "",
                    afterMessage: "",
                    randomizeOrder: false
                  },
                  teamId: "",
                  organizationId: "",
                  createdBy: "",
                  participantCount: 0,
                  taskCount: 0,
                  insightCount: 0,
                  settings: {
                    recording: {
                      camera: newProject.cameraOption || 'optional',
                      microphone: newProject.micOption || 'optional'
                    },
                    cameraOption: "optional",
                    micOption: "optional",
                    screenShareOption: "optional",
                    autoTranscribe: false
                  }
                };
                onCreateProject(project);
                setIsCreateDialogOpen(false);
                setNewProject({
                  name: "",
                  description: "",
                  status: "draft" as const,
                  mode: "moderated" as const,
                  startDate: "",
                  endDate: "",
                  tags: [] as string[],
                  cameraOption: 'optional',
                  micOption: 'optional',
                });
                setTagInput("");
              }}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Projects Section */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Draft Projects */}
          {draftProjects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-slate-900 mb-4">Draft Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {draftProjects.map((project) => renderProjectCard(project, 'draft'))}
              </div>
            </div>
          )}

          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-slate-900 mb-4">Active Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {activeProjects.map((project) => renderProjectCard(project, 'active'))}
              </div>
            </div>
          )}

          {/* Completed Projects */}
          {completedProjects.length > 0 && (
            <Collapsible open={isCompletedOpen} onOpenChange={setIsCompletedOpen} className="mb-8">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between hover:bg-slate-100 rounded-lg p-3 transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className="transition-transform duration-200">
                      {isCompletedOpen ? (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <h2 className="text-slate-900">Completed Projects</h2>
                    <Badge variant="secondary" className="ml-2">
                      {completedProjects.length}
                    </Badge>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {completedProjects.map((project) => renderProjectCard(project, 'completed'))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Archived Projects */}
          {archivedProjects.length > 0 && (
            <Collapsible open={isArchivedOpen} onOpenChange={setIsArchivedOpen} className="mb-8">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between hover:bg-slate-100 rounded-lg p-3 transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className="transition-transform duration-200">
                      {isArchivedOpen ? (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <h2 className="text-slate-900">Archived Projects</h2>
                    <Badge variant="outline" className="ml-2">
                      {archivedProjects.length}
                    </Badge>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {archivedProjects.map((project) => renderProjectCard(project, 'archived'))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Empty State */}
          {projects.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-slate-900 mb-2">No projects yet</h3>
                <p className="text-slate-600 mb-6">
                  Create your first research project to get started
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}