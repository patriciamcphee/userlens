import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, Users, Clock, Edit, AlertTriangle, Trash2, X, TrendingUp, BarChart2, UserCheck, Target, Lightbulb } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { api } from "../utils/api";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { CircularProgress } from "./ui/circular-progress";
import { RecordingOptionsStep } from "./RecordingOptionsStep";
import type { Project } from "../types";

// Helper function to get SUS ranking (using the "Rank" column from the image)
function getSUSRanking(score: number): string {
  if (score >= 84.1) return "Best imaginable";
  if (score >= 77.2) return "Excellent";
  if (score >= 71.1) return "Good";
  if (score >= 51.7) return "Okay";
  return "Poor";
}

// Helper function to get NPS ranking
function getNPSRanking(score: number): string {
  if (score >= 50) return "Excellent";
  if (score >= 0) return "Good";
  if (score >= -50) return "Needs Improvement";
  return "Critical Issues";
}

// Helper function to get status badge styling
function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'draft':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'archived':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return '';
  }
}

interface OverviewTabProps {
  project: Project;
  onUpdate: () => void;
  onDelete?: () => void;
  insightsCount?: number;
}

export function OverviewTab({ project, onUpdate, onDelete, insightsCount = 0 }: OverviewTabProps) {
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [projectFormData, setProjectFormData] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    mode: project.mode,
    startDate: project.startDate || "",
    endDate: project.endDate || "",
    tags: project.tags || [],
    cameraOption: project.cameraOption || 'optional',
    micOption: project.micOption || 'optional',
  });

  const participants = project.participants || [];
  const tasks = project.tasks || [];

  const handleUpdateProject = async () => {
    try {
      await api.updateProject(project.id, {
        name: projectFormData.name,
        description: projectFormData.description,
        status: projectFormData.status,
        mode: projectFormData.mode,
        startDate: projectFormData.startDate,
        endDate: projectFormData.endDate,
        updatedAt: new Date().toISOString(),
        tags: projectFormData.tags,
        cameraOption: projectFormData.cameraOption,
        micOption: projectFormData.micOption,
      });
      
      onUpdate();
      toast.success("Project updated successfully");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.deleteProject(project.id);
      toast.success("Project deleted successfully");
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !projectFormData.tags.includes(tagInput.trim())) {
      setProjectFormData({ ...projectFormData, tags: [...projectFormData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setProjectFormData({ ...projectFormData, tags: projectFormData.tags.filter(t => t !== tag) });
  };

  // Calculate high-level statistics
  const activeUsers = participants.filter(p => p.usageLevel === 'active').length;
  const occasionalUsers = participants.filter(p => p.usageLevel === 'occasional').length;
  const nonUsers = participants.filter(p => p.usageLevel === 'non-user').length;
  
  // Track interviews and usability tests separately based on completion flags
  const completedInterviews = participants.filter(p => p.interviewCompleted === true).length;
  const completedUsabilityTests = participants.filter(p => p.usabilityCompleted === true).length;
  
  // Calculate NPS and SUS scores from all participants who have scores (not just completed status)
  const npsScores = participants
    .map(p => p.npsScore)
    .filter((score): score is number => score !== undefined && score !== null);
  const susScores = participants
    .map(p => p.susScore)
    .filter((score): score is number => score !== undefined && score !== null);
  const avgNPS = npsScores.length > 0 ? Math.round(npsScores.reduce((acc, score) => acc + score, 0) / npsScores.length) : null;
  const avgSUS = susScores.length > 0 ? Math.round(susScores.reduce((acc, score) => acc + score, 0) / susScores.length) : null;

  return (
    <>
      {/* Project Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Information</CardTitle>
            <div className="flex gap-2">
              <Dialog open={isEditProjectOpen} onOpenChange={(open) => {
                setIsEditProjectOpen(open);
                if (open) {
                  setProjectFormData({
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    mode: project.mode,
                    startDate: project.startDate || "",
                    endDate: project.endDate || "",
                    tags: project.tags || [],
                    cameraOption: project.cameraOption || 'optional',
                    micOption: project.micOption || 'optional',
                  });
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>Update project information and status</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 overflow-y-auto pr-2">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Name</Label>
                      <Input
                        id="project-name"
                        placeholder="Project Name"
                        value={projectFormData.name}
                        onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-description">Description</Label>
                      <Textarea
                        id="project-description"
                        placeholder="Project Description"
                        value={projectFormData.description}
                        onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-status">Status</Label>
                        <Select
                          value={projectFormData.status}
                          onValueChange={(value: 'draft' | 'active' | 'completed' | 'archived') =>
                            setProjectFormData({ ...projectFormData, status: value })
                          }
                        >
                          <SelectTrigger id="project-status">
                            <SelectValue />
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
                        <Label htmlFor="project-mode">Mode</Label>
                        <Select
                          value={projectFormData.mode}
                          onValueChange={(value: 'moderated' | 'unmoderated') =>
                            setProjectFormData({ ...projectFormData, mode: value })
                          }
                        >
                          <SelectTrigger id="project-mode">
                            <SelectValue />
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
                        <Label htmlFor="project-start-date">Start Date</Label>
                        <Input
                          id="project-start-date"
                          type="date"
                          value={projectFormData.startDate}
                          onChange={(e) => setProjectFormData({ ...projectFormData, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-end-date">End Date</Label>
                        <Input
                          id="project-end-date"
                          type="date"
                          value={projectFormData.endDate}
                          onChange={(e) => setProjectFormData({ ...projectFormData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-tags">Tags</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="project-tags"
                          placeholder="Add a tag"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <Button type="button" variant="outline" onClick={handleAddTag}>
                          Add
                        </Button>
                      </div>
                    </div>
                    {projectFormData.tags.length > 0 && (
                      <div className="space-y-2">
                        <Label>Current Tags</Label>
                        <div className="flex flex-wrap gap-1">
                          {projectFormData.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-slate-100 cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                              {tag} <X className="w-3 h-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

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
                                name="edit-cameraOption"
                                value="optional"
                                checked={projectFormData.cameraOption === 'optional'}
                                onChange={(e) => setProjectFormData({ ...projectFormData, cameraOption: e.target.value as 'optional' })}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm">Optional</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="edit-cameraOption"
                                value="required"
                                checked={projectFormData.cameraOption === 'required'}
                                onChange={(e) => setProjectFormData({ ...projectFormData, cameraOption: e.target.value as 'required' })}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm">Required</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="edit-cameraOption"
                                value="disabled"
                                checked={projectFormData.cameraOption === 'disabled'}
                                onChange={(e) => setProjectFormData({ ...projectFormData, cameraOption: e.target.value as 'disabled' })}
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
                                name="edit-micOption"
                                value="optional"
                                checked={projectFormData.micOption === 'optional'}
                                onChange={(e) => setProjectFormData({ ...projectFormData, micOption: e.target.value as 'optional' })}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm">Optional</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="edit-micOption"
                                value="required"
                                checked={projectFormData.micOption === 'required'}
                                onChange={(e) => setProjectFormData({ ...projectFormData, micOption: e.target.value as 'required' })}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm">Required</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="edit-micOption"
                                value="disabled"
                                checked={projectFormData.micOption === 'disabled'}
                                onChange={(e) => setProjectFormData({ ...projectFormData, micOption: e.target.value as 'disabled' })}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm">Disabled</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      handleUpdateProject();
                      setIsEditProjectOpen(false);
                    }}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription className="mt-2">
                            This action cannot be undone. This will permanently delete <strong>{project.name}</strong> and all associated data including participants, tasks, hypotheses, and synthesis notes.
                          </AlertDialogDescription>
                        </div>
                      </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteProject} className="bg-red-600 hover:bg-red-700">
                        Delete Project
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Header */}
          <div className="space-y-3 pb-6 border-b border-slate-200">
            <h2 className="text-2xl text-slate-900">{project.name}</h2>
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {project.startDate 
                    ? new Date(project.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Not set'} - {project.endDate 
                    ? new Date(project.endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Not set'}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Status</p>
              <Badge className={`capitalize ${getStatusBadgeClasses(project.status)}`}>
                {project.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Mode</p>
              <Badge variant="outline" className="capitalize">
                {project.mode}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Created</p>
              <p className="text-sm text-slate-900">
                {project.createdAt 
                  ? new Date(project.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Last Updated</p>
              <p className="text-sm text-slate-900">
                {project.updatedAt 
                  ? new Date(project.updatedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Not set'}
              </p>
            </div>
          </div>

          {project.description && (
            <div>
              <p className="text-sm text-slate-600 mb-1">Description</p>
              <p className="text-sm text-slate-900">{project.description}</p>
            </div>
          )}

          {project.tags && project.tags.length > 0 && (
            <div>
              <p className="text-sm text-slate-600 mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-slate-100">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Project Stats - Updated to 3 columns with Insights */}
          <div className="pt-4 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Completed Sessions</p>
                  <p className="text-xl text-slate-900">{project.participants?.filter(p => p.status === 'completed').length || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Tasks</p>
                  <p className="text-xl text-slate-900">{tasks.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Insights</p>
                  <p className="text-xl text-slate-900">{insightsCount}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High-Level Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Total Participants */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Total Participants</p>
                <p className="text-3xl text-slate-900 mb-2">{participants.length}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs bg-slate-100">Active: {activeUsers}</Badge>
                  <Badge variant="outline" className="text-xs bg-slate-100">Occasional: {occasionalUsers}</Badge>
                  <Badge variant="outline" className="text-xs bg-slate-100">Non-User: {nonUsers}</Badge>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Interviews */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Completed Interviews</p>
                <p className="text-3xl text-slate-900">{completedInterviews}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {participants.length > 0 
                    ? `${Math.round((completedInterviews / participants.length) * 100)}% completion rate` 
                    : 'No participants yet'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average NPS Score */}
        <Card>
          <CardContent className="pt-6 pb-6">
            {avgNPS !== null ? (
              <div className="flex flex-col items-center">
                <p className="text-sm text-slate-600 mb-4">Average NPS</p>
                <CircularProgress
                  value={avgNPS + 100}
                  max={200}
                  size={140}
                  strokeWidth={10}
                  color="#6366f1"
                  backgroundColor="#e0e7ff"
                >
                  <div className="text-center">
                    <p className="text-3xl text-slate-900">{avgNPS}</p>
                    <p className="text-xs text-slate-500">Overall Score</p>
                    <p className="text-xs text-slate-900 mt-1 font-semibold">
                      {getNPSRanking(avgNPS)}
                    </p>
                  </div>
                </CircularProgress>
                <p className="text-xs text-slate-500 mt-4">
                  Based on {npsScores.length} {npsScores.length === 1 ? 'response' : 'responses'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <p className="text-sm text-slate-600 mb-2">Average NPS</p>
                <p className="text-sm text-slate-400">No data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average SUS Score */}
        <Card>
          <CardContent className="pt-6 pb-6">
            {avgSUS !== null ? (
              <div className="flex flex-col items-center">
                <p className="text-sm text-slate-600 mb-4">Average SUS</p>
                <CircularProgress
                  value={avgSUS}
                  max={100}
                  size={140}
                  strokeWidth={10}
                  color="#f59e0b"
                  backgroundColor="#fef3c7"
                >
                  <div className="text-center">
                    <p className="text-3xl text-slate-900">{avgSUS}</p>
                    <p className="text-xs text-slate-500">Overall Score</p>
                    <p className="text-xs text-slate-900 mt-1 font-semibold">
                      {getSUSRanking(avgSUS)}
                    </p>
                  </div>
                </CircularProgress>
                <p className="text-xs text-slate-500 mt-4">
                  Based on {susScores.length} {susScores.length === 1 ? 'response' : 'responses'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <p className="text-sm text-slate-600 mb-2">Average SUS</p>
                <p className="text-sm text-slate-400">No data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}