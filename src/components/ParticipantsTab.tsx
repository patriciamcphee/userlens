import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Plus, Mail, Edit, Users, CheckCircle2, Play, Send, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { api } from "../utils/api";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { SessionLinkModal } from "./SessionLinkModal";
import { generateSessionLink } from "../utils/sessionLinks";
import { DateTimeRangePicker } from "./DateTimeRangePicker";
import { Project, ProjectParticipant } from "../types";

// Usage level colors consistent with Synthesis tab
const usageLevelColors: Record<string, string> = {
  "active": "bg-green-100 text-green-700 border-green-200",
  "occasional": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "non-user": "bg-blue-100 text-blue-700 border-blue-200",
};

interface ParticipantsTabProps {
  project: Project;
  onUpdate: () => void;
}

export function ParticipantsTab({ project, onUpdate }: ParticipantsTabProps) {
  const navigate = useNavigate();
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isEditParticipantOpen, setIsEditParticipantOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<ProjectParticipant | null>(null);
  const [sessionLinkModalOpen, setSessionLinkModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<ProjectParticipant | null>(null);

  type UsageLevel = 'active' | 'occasional' | 'non-user';
  interface NewParticipant {
    name: string;
    email: string;
    usageLevel: UsageLevel;
    role: string;
    tenure: string;
    interviewDate: string;
    interviewTime: string;
    interviewEndTime: string;
    usabilityDate: string;
    usabilityTime: string;
    usabilityEndTime: string;
  }

  const [newParticipant, setNewParticipant] = useState<NewParticipant>({
    name: "",
    email: "",
    usageLevel: "active",
    role: "",
    tenure: "",
    interviewDate: "",
    interviewTime: "",
    interviewEndTime: "",
    usabilityDate: "",
    usabilityTime: "",
    usabilityEndTime: "",
  });

  const participants = project.participants || [];
  
  // Debug: Log participant recording data
  useEffect(() => {
    console.log("Participants Tab - Current participant data:", participants.map(p => ({
      id: p.id,
      name: p.name,
      recordingUrl: p.recordingUrl,
      sessionHistoryCount: p.sessionHistory?.length || 0,
      sessionHistory: p.sessionHistory
    })));
  }, [participants]);

  // Auto-fix participants without IDs
  useEffect(() => {
    const fixMissingParticipantIds = async () => {
      const participantsWithoutIds = participants.filter(p => !p.id || p.id === '');
      
      if (participantsWithoutIds.length === 0) {
        return;
      }

      console.log(`Found ${participantsWithoutIds.length} participants without IDs. Assigning IDs...`);

      try {
        const existingNumbers = participants
          .map(p => {
            if (p.id && p.id.startsWith('P')) {
              const num = parseInt(p.id.substring(1));
              return isNaN(num) ? 0 : num;
            }
            return 0;
          })
          .filter(n => n > 0);
        
        let nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

        for (const participant of participantsWithoutIds) {
          const newId = `P${String(nextNumber).padStart(2, '0')}`;
          console.log(`Assigning ID ${newId} to participant ${participant.name}`);

          const response = await api.getProjects();
          // Normalize response to an array of projects whether the API returns Project[] or { projects: Project[] }
          // Cast response to any to avoid TypeScript inferring 'never' and safely check for .projects
          const respAny: any = response;
          const projectsArray: any[] = Array.isArray(respAny)
            ? respAny
            : (respAny && Array.isArray(respAny.projects) ? respAny.projects : []);
          const currentProject = projectsArray.find((p: any) => p.id === project.id);
          
          if (currentProject) {
            const participantIndex = currentProject.participants.findIndex(
              (p: any) => p.name === participant.name && p.email === participant.email
            );

            if (participantIndex !== -1) {
              const updatedParticipant = {
                ...currentProject.participants[participantIndex],
                id: newId,
              };

              currentProject.participants[participantIndex] = updatedParticipant;
              
              await api.updateProject(project.id, {
                participants: currentProject.participants,
                updatedAt: new Date().toISOString(),
              });

              nextNumber++;
            }
          }
        }

        console.log('Successfully fixed participant IDs. Refreshing...');
        onUpdate();
        toast.success('Participant IDs have been assigned');
      } catch (error) {
        console.error('Error fixing participant IDs:', error);
      }
    };

    fixMissingParticipantIds();
  }, []);

  const handleAddParticipant = async () => {
  console.log("1. handleAddParticipant started", newParticipant);
  
  if (!newParticipant.name.trim() || !newParticipant.email.trim()) {
    console.log("2. Validation failed - missing name or email");
    toast.error("Name and email are required");
    return;
  }

  console.log("3. Validation passed");

  try {
    const existingNumbers = participants
      .map(p => {
        if (p.id && p.id.startsWith('P')) {
          const num = parseInt(p.id.substring(1));
          return isNaN(num) ? 0 : num;
        }
        return 0;
      })
      .filter(n => n > 0);
    
    const nextNumber = existingNumbers.length > 0 
      ? Math.max(...existingNumbers) + 1 
      : 1;

    let status: 'invited' | 'completed' | 'in-progress' | 'scheduled' | 'no-show' | undefined = undefined;
    if (newParticipant.interviewDate && newParticipant.interviewTime) {
      status = "in-progress";
    }

    const participant: ProjectParticipant = {
      id: `P${String(nextNumber).padStart(2, '0')}`,
      ...newParticipant,
      addedAt: new Date().toISOString(),
      status,
      segmentLevel: ""
    };

    console.log("4. About to call API with participant:", participant);
    console.log("5. Project ID:", project.id);
    
    await api.addParticipantToProject(project.id, participant);
    
    console.log("6. API call successful");
    
    setNewParticipant({ name: "", email: "", usageLevel: "active", role: "", tenure: "", interviewDate: "", interviewTime: "", interviewEndTime: "", usabilityDate: "", usabilityTime: "", usabilityEndTime: "" });
    setIsAddParticipantOpen(false);
    onUpdate();
    toast.success("Participant added successfully");
  } catch (error) {
    console.error("7. Error in handleAddParticipant:", error);
    toast.error("Failed to add participant");
  }
};

  const handleEditParticipant = (participant: ProjectParticipant) => {
    setEditingParticipant(participant);
    
    // Helper function to normalize date to yyyy-MM-dd format
    const normalizeDate = (dateStr: string | undefined): string => {
      if (!dateStr) return "";
      
      // If it's already in yyyy-MM-dd format, return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // Try to parse and convert the date
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          // Convert to yyyy-MM-dd format
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      } catch (e) {
        console.warn('Invalid date format:', dateStr);
      }
      
      // Return empty string if we can't parse it
      return "";
    };
    
    setNewParticipant({
      name: participant.name || "",
      email: participant.email || "",
      usageLevel: participant.usageLevel || "active",
      role: participant.role || "",
      tenure: participant.tenure || "",
      interviewDate: normalizeDate(participant.interviewDate),
      interviewTime: participant.interviewTime || "",
      interviewEndTime: participant.interviewEndTime || "",
      usabilityDate: normalizeDate(participant.usabilityDate),
      usabilityTime: participant.usabilityTime || "",
      usabilityEndTime: participant.usabilityEndTime || "",
    });
    setIsEditParticipantOpen(true);
  };

  const handleUpdateParticipant = async () => {
    if (!editingParticipant) {
      toast.error("No participant selected for editing");
      return;
    }

    if (!newParticipant.name.trim() || !newParticipant.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      // Use the status from editingParticipant (which may have been auto-updated by checkboxes)
      let status = editingParticipant.status;
      
      // If no status yet and interview is scheduled, set to in-progress
      if (newParticipant.interviewDate && newParticipant.interviewTime && !status) {
        status = "in-progress";
      }

      const updatedParticipant: ProjectParticipant = {
        ...editingParticipant,
        name: newParticipant.name,
        email: newParticipant.email,
        usageLevel: newParticipant.usageLevel,
        role: newParticipant.role,
        tenure: newParticipant.tenure,
        interviewDate: newParticipant.interviewDate,
        interviewTime: newParticipant.interviewTime,
        interviewEndTime: newParticipant.interviewEndTime,
        usabilityDate: newParticipant.usabilityDate,
        usabilityTime: newParticipant.usabilityTime,
        usabilityEndTime: newParticipant.usabilityEndTime,
        status,
        interviewCompleted: editingParticipant.interviewCompleted,
        usabilityCompleted: editingParticipant.usabilityCompleted,
      };

      console.log('Updating participant:', updatedParticipant);
      await api.updateParticipantInProject(project.id, editingParticipant.id, updatedParticipant);
      
      setNewParticipant({ name: "", email: "", usageLevel: "active", role: "", tenure: "", interviewDate: "", interviewTime: "", interviewEndTime: "", usabilityDate: "", usabilityTime: "", usabilityEndTime: "" });
      setIsEditParticipantOpen(false);
      setEditingParticipant(null);
      onUpdate();
      toast.success("Participant updated successfully");
    } catch (error) {
      console.error("Error updating participant:", error);
      toast.error("Failed to update participant");
    }
  };

  // Helper functions for auto-status update on completion checkbox changes
  const handleInterviewCompletedChange = (checked: boolean) => {
    if (!editingParticipant) return;
    
    const isChecked = checked as boolean;
    let newStatus = editingParticipant.status;
    
    // If both sessions are now completed, set status to "completed"
    if (isChecked && editingParticipant.usabilityCompleted) {
      newStatus = "completed";
    }
    // If unchecking and was completed, revert to in-progress
    if (!isChecked && editingParticipant.status === "completed") {
      newStatus = "in-progress";
    }
    
    setEditingParticipant({ 
      ...editingParticipant, 
      interviewCompleted: isChecked,
      status: newStatus
    });
  };

  const handleUsabilityCompletedChange = (checked: boolean) => {
    if (!editingParticipant) return;
    
    const isChecked = checked as boolean;
    let newStatus = editingParticipant.status;
    
    // If both sessions are now completed, set status to "completed"
    if (isChecked && editingParticipant.interviewCompleted) {
      newStatus = "completed";
    }
    // If unchecking and was completed, revert to in-progress
    if (!isChecked && editingParticipant.status === "completed") {
      newStatus = "in-progress";
    }
    
    setEditingParticipant({ 
      ...editingParticipant, 
      usabilityCompleted: isChecked,
      status: newStatus
    });
  };

  const handleStartSession = (participant: ProjectParticipant) => {
    // Navigate to session page - for testing by researchers/developers
    navigate(`/session/${project.id}/${participant.id}/test`);
  };

  const handleSendLink = async (participant: ProjectParticipant) => {
    try {
      // Generate or regenerate session link if it doesn't exist or has expired
      let sessionLink = participant.sessionLink;
      let sessionLinkExpiry = participant.sessionLinkExpiry;
      let sessionLinkToken = participant.sessionLinkToken;

      const needsNewLink = !sessionLink || 
        !sessionLinkExpiry || 
        new Date(sessionLinkExpiry) < new Date();

      if (needsNewLink) {
        const linkData = generateSessionLink(project.id, participant.id, 7);
        sessionLink = linkData.link;
        sessionLinkExpiry = linkData.expiryDate;
        sessionLinkToken = linkData.token;

        // Update participant with new link
        const updatedParticipant: ProjectParticipant = {
          ...participant,
          sessionLink,
          sessionLinkExpiry,
          sessionLinkToken
        };

        await api.updateParticipantInProject(project.id, participant.id, updatedParticipant);
        onUpdate();
      }

      setSelectedParticipant({
        ...participant,
        sessionLink,
        sessionLinkExpiry,
        sessionLinkToken
      });
      setSessionLinkModalOpen(true);
    } catch (error) {
      console.error("Error generating session link:", error);
      toast.error("Failed to generate session link");
    }
  };

  const handleExpiryDaysChange = async (days: number) => {
    if (!selectedParticipant) return;

    try {
      const linkData = generateSessionLink(project.id, selectedParticipant.id, days);
      
      const updatedParticipant: ProjectParticipant = {
        ...selectedParticipant,
        sessionLink: linkData.link,
        sessionLinkExpiry: linkData.expiryDate,
        sessionLinkToken: linkData.token
      };

      await api.updateParticipantInProject(project.id, selectedParticipant.id, updatedParticipant);
      setSelectedParticipant(updatedParticipant);
      onUpdate();
      toast.success("Link expiry updated");
    } catch (error) {
      console.error("Error updating link expiry:", error);
      toast.error("Failed to update link expiry");
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Participants</CardTitle>
            <CardDescription>Manage participants for this research project</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2" 
              onClick={() => {
                console.log("Refreshing participant data...");
                onUpdate();
                toast.success("Data refreshed");
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Participant
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Participant</DialogTitle>
                <DialogDescription>Add a new participant to this project</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="participant-name">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="participant-name"
                    placeholder="e.g., John Smith"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participant-email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="participant-email"
                    type="email"
                    placeholder="e.g., john@example.com"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participant-role">Role</Label>
                  <Input
                    id="participant-role"
                    placeholder="e.g., Product Manager"
                    value={newParticipant.role}
                    onChange={(e) => setNewParticipant({ ...newParticipant, role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participant-usage">Usage Level <span className="text-red-500">*</span></Label>
                  <Select
                    value={newParticipant.usageLevel}
                    onValueChange={(value: 'active' | 'occasional' | 'non-user') =>
                      setNewParticipant({ ...newParticipant, usageLevel: value })
                    }
                  >
                    <SelectTrigger id="participant-usage">
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
                  <Label htmlFor="participant-tenure">Tenure</Label>
                  <Select
                    value={newParticipant.tenure}
                    onValueChange={(value) => setNewParticipant({ ...newParticipant, tenure: value })}
                  >
                    <SelectTrigger id="participant-tenure">
                      <SelectValue placeholder="Select tenure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less-than-6-months">Less than 6 months</SelectItem>
                      <SelectItem value="6-months-to-1-year">6 months to 1 year</SelectItem>
                      <SelectItem value="1-to-2-years">1 to 2 years</SelectItem>
                      <SelectItem value="2-to-5-years">2 to 5 years</SelectItem>
                      <SelectItem value="5-plus-years">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Interview Schedule</Label>
                  <DateTimeRangePicker
                    date={newParticipant.interviewDate}
                    startTime={newParticipant.interviewTime}
                    endTime={newParticipant.interviewEndTime}
                    onDateChange={(date) => setNewParticipant({ ...newParticipant, interviewDate: date })}
                    onStartTimeChange={(time) => setNewParticipant({ ...newParticipant, interviewTime: time })}
                    onEndTimeChange={(time) => setNewParticipant({ ...newParticipant, interviewEndTime: time })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Usability Testing Schedule</Label>
                  <DateTimeRangePicker
                    date={newParticipant.usabilityDate}
                    startTime={newParticipant.usabilityTime}
                    endTime={newParticipant.usabilityEndTime}
                    onDateChange={(date) => setNewParticipant({ ...newParticipant, usabilityDate: date })}
                    onStartTimeChange={(time) => setNewParticipant({ ...newParticipant, usabilityTime: time })}
                    onEndTimeChange={(time) => setNewParticipant({ ...newParticipant, usabilityEndTime: time })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddParticipantOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => {
                    console.log("Button clicked!");
                    handleAddParticipant();
                  }}>Add Participant</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        </div>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-4">No participants added yet</p>
            <Button size="sm" onClick={() => setIsAddParticipantOpen(true)}>
              Add Your First Participant
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex flex-col p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 relative group"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEditParticipant(participant)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                      {participant.id || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 truncate">{participant.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-600 truncate">{participant.email}</span>
                    </div>
                    {participant.role && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-slate-500">Role:</span>
                        <span className="text-xs text-slate-600 truncate">{participant.role}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`capitalize text-xs ${usageLevelColors[participant.usageLevel] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {participant.usageLevel === 'active' ? 'Active' :
                     participant.usageLevel === 'occasional' ? 'Occasional' : 'Non-User'}
                  </Badge>
                  {participant.status && (
                    <Badge variant={
                      participant.status === 'completed' ? 'default' :
                      participant.status === 'in-progress' ? 'secondary' : 'outline'
                    } className="capitalize text-xs">
                      {participant.status === 'in-progress' ? 'In Progress' : 
                       participant.status === 'no-show' ? 'No Show' :
                       participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                    </Badge>
                  )}
                </div>
                {/* Completion Status */}
                {(participant.interviewDate || participant.usabilityDate) && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
                    {participant.interviewDate && (
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${participant.interviewCompleted ? 'text-green-600' : 'text-slate-300'}`} />
                        <span className={participant.interviewCompleted ? 'text-slate-700' : 'text-slate-500'}>
                          Interview {participant.interviewCompleted ? 'Completed' : 'Scheduled'}
                        </span>
                        <span className="text-slate-400 ml-auto">
                          {new Date(participant.interviewDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {participant.interviewTime && ` ${participant.interviewTime}`}
                        </span>
                      </div>
                    )}
                    {participant.usabilityDate && (
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${participant.usabilityCompleted ? 'text-green-600' : 'text-slate-300'}`} />
                        <span className={participant.usabilityCompleted ? 'text-slate-700' : 'text-slate-500'}>
                          Usability Test {participant.usabilityCompleted ? 'Completed' : 'Scheduled'}
                        </span>
                        <span className="text-slate-400 ml-auto">
                          {new Date(participant.usabilityDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {participant.usabilityTime && ` ${participant.usabilityTime}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Session History */}
                {participant.sessionHistory && participant.sessionHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-700">Session History</span>
                      <Badge variant="secondary" className="text-xs">
                        {participant.sessionHistory.length} session{participant.sessionHistory.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {participant.sessionHistory.map((session: any, idx: number) => (
                        <div key={session.id || idx} className="bg-white rounded-md p-2 border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">
                              {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {' at '}
                              {new Date(session.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                            <span className="text-xs text-slate-500">
                              {Math.floor(session.duration / 60)}m {session.duration % 60}s
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500">Tasks: {session.tasksCompleted}/{session.totalTasks}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500">{session.clickCount} clicks</span>
                            </div>
                            {session.recordingUrl && (
                              <button
                                onClick={() => window.open(session.recordingUrl, '_blank')}
                                className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                              >
                                <Play className="w-3 h-3" />
                                Play
                              </button>
                            )}
                          </div>
                          <div className="mt-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-green-500 h-full rounded-full transition-all"
                                  style={{ width: `${session.completionRate || 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-600 font-medium">{Math.round(session.completionRate || 0)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Session Actions */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-center gap-4 py-1">
                    <button
                      onClick={() => handleStartSession(participant)}
                      className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Start Session
                    </button>
                    <button
                      onClick={() => handleSendLink(participant)}
                      className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Link
                    </button>
                  </div>
                  {participant.sessionLink && participant.sessionLinkExpiry && (
                    <div className="text-xs text-slate-500 text-center mt-2">
                      Link expires: {new Date(participant.sessionLinkExpiry).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Session Link Modal */}
      {selectedParticipant && selectedParticipant.sessionLink && selectedParticipant.sessionLinkExpiry && (
        <SessionLinkModal
          open={sessionLinkModalOpen}
          onOpenChange={setSessionLinkModalOpen}
          participant={selectedParticipant}
          project={project}
          sessionLink={selectedParticipant.sessionLink}
          sessionLinkExpiry={selectedParticipant.sessionLinkExpiry}
          onExpiryDaysChange={handleExpiryDaysChange}
        />
      )}
    </Card>
    
    {/* Edit Participant Dialog - outside the Card */}
    <Dialog open={isEditParticipantOpen} onOpenChange={(open) => {
      setIsEditParticipantOpen(open);
      if (!open) {
        setEditingParticipant(null);
        setNewParticipant({ name: "", email: "", usageLevel: "active", role: "", tenure: "", interviewDate: "", interviewTime: "", interviewEndTime: "", usabilityDate: "", usabilityTime: "", usabilityEndTime: "" });
      }
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Participant</DialogTitle>
          <DialogDescription>Update participant details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-participant-name">Name <span className="text-red-500">*</span></Label>
            <Input
              id="edit-participant-name"
              placeholder="e.g., John Smith"
              value={newParticipant.name}
              onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-participant-email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="edit-participant-email"
              type="email"
              placeholder="e.g., john@example.com"
              value={newParticipant.email}
              onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-participant-role">Role</Label>
            <Input
              id="edit-participant-role"
              placeholder="e.g., Product Manager"
              value={newParticipant.role}
              onChange={(e) => setNewParticipant({ ...newParticipant, role: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-participant-usage">Usage Level <span className="text-red-500">*</span></Label>
            <Select
              value={newParticipant.usageLevel}
              onValueChange={(value: 'active' | 'occasional' | 'non-user') =>
                setNewParticipant({ ...newParticipant, usageLevel: value })
              }
            >
              <SelectTrigger id="edit-participant-usage">
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
            <Label htmlFor="edit-participant-tenure">Tenure</Label>
            <Select
              value={newParticipant.tenure}
              onValueChange={(value) => setNewParticipant({ ...newParticipant, tenure: value })}
            >
              <SelectTrigger id="edit-participant-tenure">
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="less-than-6-months">Less than 6 months</SelectItem>
                <SelectItem value="6-months-to-1-year">6 months to 1 year</SelectItem>
                <SelectItem value="1-to-2-years">1 to 2 years</SelectItem>
                <SelectItem value="2-to-5-years">2 to 5 years</SelectItem>
                <SelectItem value="5-plus-years">5+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base">Interview Schedule</Label>
            <DateTimeRangePicker
              date={newParticipant.interviewDate}
              startTime={newParticipant.interviewTime}
              endTime={newParticipant.interviewEndTime}
              onDateChange={(date) => setNewParticipant({ ...newParticipant, interviewDate: date })}
              onStartTimeChange={(time) => setNewParticipant({ ...newParticipant, interviewTime: time })}
              onEndTimeChange={(time) => setNewParticipant({ ...newParticipant, interviewEndTime: time })}
            />
            {newParticipant.interviewDate && (
              <div className="flex items-center space-x-2 mt-2 p-2 bg-slate-50 rounded-md">
                <Checkbox
                  id="edit-interview-completed"
                  checked={editingParticipant?.interviewCompleted || false}
                  onCheckedChange={handleInterviewCompletedChange}
                />
                <Label
                  htmlFor="edit-interview-completed"
                  className="text-sm cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Interview Completed
                </Label>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-base">Usability Testing Schedule</Label>
            <DateTimeRangePicker
              date={newParticipant.usabilityDate}
              startTime={newParticipant.usabilityTime}
              endTime={newParticipant.usabilityEndTime}
              onDateChange={(date) => setNewParticipant({ ...newParticipant, usabilityDate: date })}
              onStartTimeChange={(time) => setNewParticipant({ ...newParticipant, usabilityTime: time })}
              onEndTimeChange={(time) => setNewParticipant({ ...newParticipant, usabilityEndTime: time })}
            />
            {newParticipant.usabilityDate && (
              <div className="flex items-center space-x-2 mt-2 p-2 bg-slate-50 rounded-md">
                <Checkbox
                  id="edit-usability-completed"
                  checked={editingParticipant?.usabilityCompleted || false}
                  onCheckedChange={handleUsabilityCompletedChange}
                />
                <Label
                  htmlFor="edit-usability-completed"
                  className="text-sm cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Usability Test Completed
                </Label>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-participant-status">Status</Label>
            <Select
              value={editingParticipant?.status}
              onValueChange={(value: 'invited' | 'completed' | 'in-progress' | 'scheduled' | 'no-show') => {
                if (editingParticipant) {
                  setEditingParticipant({ ...editingParticipant, status: value });
                }
              }}
            >
              <SelectTrigger id="edit-participant-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsEditParticipantOpen(false);
          }}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={() => {
              handleUpdateParticipant();
            }}
          >
            Update Participant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}