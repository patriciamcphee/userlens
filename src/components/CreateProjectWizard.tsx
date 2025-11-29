import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ChevronLeft, ChevronRight, Check, Plus, Trash2, X } from "lucide-react";
import { Project, ProjectParticipant, Task, ProjectSetup } from "../types";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { RecordingOptionsStep } from "./RecordingOptionsStep";

interface CreateProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'participants' | 'tasks'> & {
      participants?: Omit<ProjectParticipant, 'id' | 'projectId'>[];
      tasks?: Omit<Task, 'id' | 'projectId'>[];
    }
  ) => void;
}

export function CreateProjectWizard({ open, onOpenChange, onCreateProject }: CreateProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<{
    name: string;
    description: string;
    mode: 'moderated' | 'unmoderated';
    startDate: string;
    endDate: string;
    tags: string[];
    cameraOption: 'optional' | 'required' | 'disabled';
    micOption: 'optional' | 'required' | 'disabled';
  }>({
    name: "",
    description: "",
    mode: "moderated",
    startDate: "",
    endDate: "",
    tags: [],
    cameraOption: "optional",
    micOption: "optional",
  });
  const [participants, setParticipants] = useState<Omit<ProjectParticipant, 'id' | 'projectId'>[]>([]);
  const [tasks, setTasks] = useState<Omit<Task, 'id' | 'projectId'>[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<{
    name: string;
    email: string;
    usageLevel: 'active' | 'occasional' | 'non-user';
    role: string;
    tenure: string;
    interviewDate: string;
    interviewTime: string;
    interviewDuration: string;
    usabilityDate: string;
    usabilityTime: string;
  }>({
    name: "",
    email: "",
    usageLevel: "active",
    role: "",
    tenure: "",
    interviewDate: "",
    interviewTime: "",
    interviewDuration: "",
    usabilityDate: "",
    usabilityTime: "",
  });
  const [currentTask, setCurrentTask] = useState({
    name: "",
    description: "",
    successCriteria: "",
  });
  const [tagInput, setTagInput] = useState("");

  const resetForm = () => {
    setCurrentStep(1);
    setProjectData({ 
      name: "", 
      description: "", 
      mode: "moderated", 
      startDate: "", 
      endDate: "", 
      tags: [],
      cameraOption: "optional",
      micOption: "optional",
    });
    setParticipants([]);
    setTasks([]);
    setCurrentParticipant({
      name: "",
      email: "",
      usageLevel: "active",
      role: "",
      tenure: "",
      interviewDate: "",
      interviewTime: "",
      interviewDuration: "",
      usabilityDate: "",
      usabilityTime: "",
    });
    setCurrentTask({ name: "", description: "", successCriteria: "" });
    setTagInput("");
  };

  const handleAddParticipant = () => {
    if (!currentParticipant.name.trim() || !currentParticipant.email.trim()) return;
    
    setParticipants([...participants, { ...currentParticipant, status: 'scheduled' as const, addedAt: new Date().toISOString() }]);
    setCurrentParticipant({
      name: "",
      email: "",
      usageLevel: "active",
      role: "",
      tenure: "",
      interviewDate: "",
      interviewTime: "",
      interviewDuration: "",
      usabilityDate: "",
      usabilityTime: "",
    });
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleAddTask = () => {
    if (!currentTask.name.trim()) return;
    
    setTasks([
      ...tasks,
      {
        title: currentTask.name,
        description: currentTask.description,
        successCriteria: currentTask.successCriteria,
        order: tasks.length + 1,
      },
    ]);
    setCurrentTask({ name: "", description: "", successCriteria: "" });
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    setProjectData({ ...projectData, tags: [...projectData.tags, tagInput] });
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    setProjectData({ ...projectData, tags: projectData.tags.filter((_, i) => i !== index) });
  };

  const handleComplete = () => {
    if (!projectData.name.trim()) return;

    onCreateProject({
      name: projectData.name,
      description: projectData.description,
      status: 'active',
      totalSessions: 0,
      completedSessions: 0,
      mode: projectData.mode,
      cameraOption: projectData.cameraOption,
      micOption: projectData.micOption,
      participants,
      tasks,
      startDate: projectData.startDate || undefined,
      endDate: projectData.endDate || undefined,
      tags: projectData.tags,
      synthesis: {
        notes: [],
        hypotheses: [],
        clusters: [],
        researchQuestions: []
      },
      setup: {} as ProjectSetup,
      beforeMessage: undefined,
      duringMessage: undefined,
      afterMessage: undefined
    });

    resetForm();
    onOpenChange(false);
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return projectData.name.trim() !== "" && projectData.tags.length > 0;
    }
    return true;
  };

  const steps = [
    { number: 1, title: "Project Details" },
    { number: 2, title: "Participants" },
    { number: 3, title: "Tasks" },
    { number: 4, title: "Recording Options" },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up your research project - you can add participants and tasks now or later
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep === step.number
                      ? "border-blue-600 bg-blue-600 text-white"
                      : currentStep > step.number
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span className="text-xs mt-1 text-slate-600">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mb-6 mx-2 ${
                    currentStep > step.number ? "bg-green-600" : "bg-slate-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Project Details */}
        {currentStep === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="e.g., Q1 2024 User Testing"
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Brief description of the research goals..."
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-mode">Research Mode</Label>
              <Select 
                value={projectData.mode} 
                onValueChange={(value: 'moderated' | 'unmoderated') => 
                  setProjectData({ ...projectData, mode: value })
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
            <div className="space-y-2">
              <Label htmlFor="project-start-date">Start Date</Label>
              <Input
                id="project-start-date"
                type="date"
                value={projectData.startDate}
                onChange={(e) => setProjectData({ ...projectData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-end-date">End Date</Label>
              <Input
                id="project-end-date"
                type="date"
                value={projectData.endDate}
                onChange={(e) => setProjectData({ ...projectData, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-tags">Tags (Required)</Label>
              <p className="text-sm text-slate-600">
                Add at least one tag to enable trend analysis by segment
              </p>
              <div className="flex items-center gap-2">
                <Input
                  id="project-tags"
                  placeholder="e.g., usability, accessibility"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Tag
                </Button>
              </div>
              {projectData.tags.length > 0 && (
                <div className="mt-2">
                  {projectData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="mr-2"
                      onClick={() => handleRemoveTag(index)}
                    >
                      {tag}
                      <X className="w-4 h-4 ml-2 cursor-pointer" />
                    </Badge>
                  ))}
                </div>
              )}
              {projectData.tags.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Please add at least one tag to continue
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Participants */}
        {currentStep === 2 && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-slate-900">Add Participants (Optional)</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Add research participants now or skip and add them later
                </p>
              </div>
              <Badge variant="secondary">{participants.length} added</Badge>
            </div>

            {/* Add Participant Form */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="participant-name">Name</Label>
                    <Input
                      id="participant-name"
                      placeholder="Participant name"
                      value={currentParticipant.name}
                      onChange={(e) => setCurrentParticipant({ ...currentParticipant, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participant-email">Email</Label>
                    <Input
                      id="participant-email"
                      type="email"
                      placeholder="email@example.com"
                      value={currentParticipant.email}
                      onChange={(e) => setCurrentParticipant({ ...currentParticipant, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participant-level">Usage Level</Label>
                    <Select 
                      value={currentParticipant.usageLevel} 
                      onValueChange={(value: 'active' | 'occasional' | 'non-user') => 
                        setCurrentParticipant({ ...currentParticipant, usageLevel: value })
                      }
                    >
                      <SelectTrigger id="participant-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="occasional">Occasional</SelectItem>
                        <SelectItem value="non-user">Non-User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participant-role">Role</Label>
                    <Input
                      id="participant-role"
                      placeholder="e.g., Product Manager"
                      value={currentParticipant.role}
                      onChange={(e) => setCurrentParticipant({ ...currentParticipant, role: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={handleAddParticipant} 
                    disabled={!currentParticipant.name.trim() || !currentParticipant.email.trim()}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Participant
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Participants List */}
            {participants.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium text-slate-700">Added Participants</h4>
                {participants.map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{participant.name}</span>
                        <Badge variant={
                          participant.usageLevel === 'active' ? 'default' :
                          participant.usageLevel === 'occasional' ? 'secondary' : 'outline'
                        }>
                          {participant.usageLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{participant.email}</p>
                      {participant.role && (
                        <p className="text-xs text-slate-500 mt-1">{participant.role}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveParticipant(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Tasks */}
        {currentStep === 3 && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-slate-900">Add Tasks (Optional)</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Add research tasks now or skip and add them later
                </p>
              </div>
              <Badge variant="secondary">{tasks.length} added</Badge>
            </div>

            {/* Add Task Form */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-name">Task Name</Label>
                    <Input
                      id="task-name"
                      placeholder="e.g., Complete checkout process"
                      value={currentTask.name}
                      onChange={(e) => setCurrentTask({ ...currentTask, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      placeholder="Task instructions..."
                      value={currentTask.description}
                      onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-criteria">Success Criteria</Label>
                    <Input
                      id="task-criteria"
                      placeholder="e.g., User completes checkout in under 3 minutes"
                      value={currentTask.successCriteria}
                      onChange={(e) => setCurrentTask({ ...currentTask, successCriteria: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={handleAddTask} 
                    disabled={!currentTask.name.trim()}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tasks List */}
            {tasks.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium text-slate-700">Added Tasks</h4>
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{task.title}</div>
                      {task.description && (
                        <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                      )}
                      {task.successCriteria && (
                        <p className="text-xs text-slate-500 mt-1">
                          Success: {task.successCriteria}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTask(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Recording Options */}
        {currentStep === 4 && (
          <div className="py-4">
            <RecordingOptionsStep
              data={{
                cameraOption: projectData.cameraOption,
                micOption: projectData.micOption,
                mode: projectData.mode,
              }}
              updateData={(updates) => setProjectData({ ...projectData, ...updates })}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep < 4 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Skip
                </Button>
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            {currentStep === 4 && (
              <Button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Create Project
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}