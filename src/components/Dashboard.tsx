import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Calendar, Users, Clock, FolderOpen, TrendingUp, ChevronDown, ChevronRight, X, Target, FileText, Filter, Copy, CheckSquare, Lightbulb } from "lucide-react";
import { Project, Participant } from "../types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { NPSTrendAnalysis } from "./NPSTrendAnalysis";
import { SUSTrendAnalysis } from "./SUSTrendAnalysis";

interface DashboardProps {
  projects: Project[];
  onCreateProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  synthesisData?: { projectId: string; hypothesesCount: number; notesCount: number; }[];
}

export function Dashboard({ projects, onCreateProject, synthesisData }: DashboardProps) {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");
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

  // Get active and completed projects for trend analysis
  const activeAndCompletedProjects = projects.filter(p => 
    p.status === 'active' || p.status === 'completed'
  );

  // Get all unique tags from active and completed projects
  const allTags = new Set<string>();
  activeAndCompletedProjects.forEach(proj => {
    proj.tags?.forEach(tag => allTags.add(tag));
  });
  const uniqueTags = Array.from(allTags).sort();

  // Get projects with the selected tag
  const getProjectsByTag = (tag: string): Project[] => {
    return activeAndCompletedProjects.filter(proj => proj.tags?.includes(tag));
  };

  const projectsForTrend = selectedTag 
    ? getProjectsByTag(selectedTag)
    : [];
  
  // Debug logging
  if (selectedTag) {
    console.log('Selected tag:', selectedTag);
    console.log('Projects for trend:', projectsForTrend);
    console.log('Projects for trend count:', projectsForTrend.length);
  }

  // Helper function to get insights count for a project
  const getInsightsCount = (projectId: string) => {
    const data = synthesisData?.find(d => d.projectId === projectId);
    return data?.notesCount || 0;
  };

  const handleDuplicateProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to project
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
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

      {/* Create Project Wizard */}
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

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Draft Projects */}
        {draftProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-slate-900 mb-4">Draft Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftProjects.map((project) => (
                <Card 
                  key={project.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-dashed"
                  onClick={() => navigate(`/app/project/${project.id}/overview`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-slate-900">{project.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDuplicateProject(project, e)}
                          className="h-7 w-7 p-0"
                          title="Duplicate project"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Badge className="bg-slate-100 text-slate-800 border-slate-200">Draft</Badge>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
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
                  <CardContent>
                    <div className="space-y-3 text-sm text-slate-600">
                      {/* Quick Stats Row */}
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span>{project.participants?.length || 0} participants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckSquare className="w-4 h-4 text-slate-500" />
                          <span>{project.tasks?.length || 0} tasks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lightbulb className="w-4 h-4 text-slate-500" />
                          <span>{getInsightsCount(project.id)} insights</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-200" />

                      {/* Existing Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Sessions</span>
                          <span>{project.completedSessions}/{project.totalSessions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Mode</span>
                          <Badge variant="outline" className="capitalize">
                            {project.mode}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Project date</span>
                          <span className="text-right">
                            {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-slate-900 mb-4">Active Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProjects.map((project) => (
                <Card 
                  key={project.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/app/project/${project.id}/overview`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-slate-900">{project.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDuplicateProject(project, e)}
                          className="h-7 w-7 p-0"
                          title="Duplicate project"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
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
                  <CardContent>
                    <div className="space-y-3 text-sm text-slate-600">
                      {/* Quick Stats Row */}
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span>{project.participants?.length || 0} participants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckSquare className="w-4 h-4 text-slate-500" />
                          <span>{project.tasks?.length || 0} tasks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lightbulb className="w-4 h-4 text-slate-500" />
                          <span>{getInsightsCount(project.id)} insights</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-200" />

                      {/* Existing Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Sessions</span>
                          <span>{project.completedSessions}/{project.totalSessions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Mode</span>
                          <Badge variant="outline" className="capitalize">
                            {project.mode}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Project date</span>
                          <span className="text-right">
                            {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedProjects.map((project) => (
                  <Card 
                    key={project.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer opacity-90"
                    onClick={() => navigate(`/app/project/${project.id}/overview`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-slate-900">{project.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDuplicateProject(project, e)}
                            className="h-7 w-7 p-0"
                            title="Duplicate project"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">
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
                    <CardContent>
                      <div className="space-y-3 text-sm text-slate-600">
                        {/* Quick Stats Row */}
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span>{project.participants?.length || 0} participants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckSquare className="w-4 h-4 text-slate-500" />
                            <span>{project.tasks?.length || 0} tasks</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Lightbulb className="w-4 h-4 text-slate-500" />
                            <span>{getInsightsCount(project.id)} insights</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-200" />

                        {/* Existing Info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Sessions</span>
                            <span>{project.completedSessions}/{project.totalSessions}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Mode</span>
                            <Badge variant="outline" className="capitalize">
                              {project.mode}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Project date</span>
                            <span className="text-right">
                              {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedProjects.map((project) => (
                  <Card 
                    key={project.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer opacity-75"
                    onClick={() => navigate(`/app/project/${project.id}/overview`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-slate-900">{project.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDuplicateProject(project, e)}
                            className="h-7 w-7 p-0"
                            title="Duplicate project"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Archived</Badge>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">
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
                    <CardContent>
                      <div className="space-y-3 text-sm text-slate-600">
                        {/* Quick Stats Row */}
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span>{project.participants?.length || 0} participants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckSquare className="w-4 h-4 text-slate-500" />
                            <span>{project.tasks?.length || 0} tasks</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Lightbulb className="w-4 h-4 text-slate-500" />
                            <span>{getInsightsCount(project.id)} insights</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-200" />

                        {/* Existing Info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Sessions</span>
                            <span>{project.completedSessions}/{project.totalSessions}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Mode</span>
                            <Badge variant="outline" className="capitalize">
                              {project.mode}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Project date</span>
                            <span className="text-right">
                              {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Divider */}
        {uniqueTags.length > 0 && (
          <div className="border-t border-slate-200 my-12"></div>
        )}

        {/* Trend Analysis Section */}
        {uniqueTags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-slate-900 mb-4">Trend Analysis</h2>
            
            {/* Tag Filter */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter by Tag
                </CardTitle>
                <CardDescription>
                  Select a tag to view NPS and SUS trends for all participants in all Active and Completed projects with that tag
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {uniqueTags.map(tag => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      onClick={() => setSelectedTag(tag)}
                      size="sm"
                    >
                      {tag}
                    </Button>
                  ))}
                  {selectedTag && (
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedTag("")}
                      size="sm"
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear Filter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trend Charts */}
            <div className="space-y-6" key={selectedTag}>
              <NPSTrendAnalysis 
                projects={projectsForTrend}
                filterTag={selectedTag}
              />

              <SUSTrendAnalysis 
                projects={projectsForTrend}
                filterTag={selectedTag}
              />
            </div>
          </div>
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
  );
}