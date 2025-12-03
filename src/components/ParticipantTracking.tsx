import React, { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, Clock, CheckCircle2, Plus, Edit2, Circle, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { api } from "../utils/api";
import { toast } from "sonner";
import type { Participant, SessionRecording } from "../types";
import { format } from "date-fns";
import { RecordingIndicator } from "./RecordingIndicator";
import { AddRecordingDialog } from "./AddRecordingDialog";

const segmentColors: Record<string, string> = {
  "Active": "bg-green-100 text-green-700 border-green-200",
  "Occasional": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Non-user": "bg-blue-100 text-blue-700 border-blue-200",
};

// Helper function to get SUS grade and label
function getSUSLabel(score: number): { grade: string; label?: string } {
  if (score >= 84.1) return { grade: "A+", label: "Best imaginable" };
  if (score >= 80.8) return { grade: "A" };
  if (score >= 78.9) return { grade: "A-" };
  if (score >= 77.2) return { grade: "B+", label: "Excellent" };
  if (score >= 74.1) return { grade: "B" };
  if (score >= 72.6) return { grade: "B-" };
  if (score >= 71.1) return { grade: "C+", label: "Good" };
  if (score >= 65.0) return { grade: "C" };
  if (score >= 62.7) return { grade: "C-" };
  if (score >= 51.7) return { grade: "D", label: "Okay" };
  return { grade: "F", label: "Poor" };
}

// Helper function to get NPS category
function getNPSLabel(score: number): { category: string; color: string } {
  if (score >= 9) return { category: "Promoter", color: "text-green-600" };
  if (score >= 7) return { category: "Passive", color: "text-yellow-600" };
  return { category: "Detractor", color: "text-red-600" };
}

// Extended Participant type with recording fields
interface ParticipantWithRecordings extends Participant {
  interviewRecording?: SessionRecording;
  usabilityRecording?: SessionRecording;
}

interface Props {
  participants: ParticipantWithRecordings[];
  onUpdate: () => void;
  projectId?: string;
  readOnly?: boolean;
  onPlayRecording?: (participant: ParticipantWithRecordings, sessionType: 'interview' | 'usability') => void;
  onSaveRecording?: (participant: ParticipantWithRecordings, sessionType: 'interview' | 'usability', recording: SessionRecording) => Promise<void>;
}

export function ParticipantTracking({ 
  participants, 
  onUpdate, 
  projectId, 
  readOnly = false,
  onPlayRecording,
  onSaveRecording
}: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<ParticipantWithRecordings | null>(null);
  const [formData, setFormData] = useState<Partial<ParticipantWithRecordings>>({
    segment: "Active",
    role: "",
    date: "",
    duration: "45m",
    status: "scheduled",
  });

  // State for AddRecordingDialog
  const [addRecordingDialogOpen, setAddRecordingDialogOpen] = useState(false);
  const [recordingParticipant, setRecordingParticipant] = useState<ParticipantWithRecordings | null>(null);
  const [recordingSessionType, setRecordingSessionType] = useState<'interview' | 'usability'>('interview');

  // Parse time from formData.time (HH:MM format) into components
  const parseTime = (timeString?: string) => {
    if (!timeString) return { hour: "", minute: "", period: "AM" };
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? "12" : hour > 12 ? String(hour - 12) : String(hour);
    return { hour: displayHour, minute: minutes, period };
  };

  // Format time components into HH:MM format
  const formatTime = (hour: string, minute: string, period: string) => {
    if (!hour || !minute) return "";
    let hourNum = parseInt(hour, 10);
    if (period === "PM" && hourNum !== 12) hourNum += 12;
    if (period === "AM" && hourNum === 12) hourNum = 0;
    return `${String(hourNum).padStart(2, "0")}:${minute}`;
  };

  const timeComponents = parseTime(formData.time);
  const [selectedHour, setSelectedHour] = useState(timeComponents.hour);
  const [selectedMinute, setSelectedMinute] = useState(timeComponents.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(timeComponents.period);

  const handleTimeChange = (hour: string, minute: string, period: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    const formattedTime = formatTime(hour, minute, period);
    setFormData({ ...formData, time: formattedTime });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingParticipant) {
        if (readOnly && projectId) {
          // In synthesis tab, update participant at project level with only SUS/NPS
          await api.updateParticipantInProject(projectId, editingParticipant.id, {
            ...editingParticipant,
            susScore: formData.susScore,
            npsScore: formData.npsScore,
          });
        } else if (projectId) {
          // In overview tab with projectId, update with all fields and map segment to usageLevel
          await api.updateParticipantInProject(projectId, editingParticipant.id, { 
            ...editingParticipant, 
            ...formData,
            // Map segment back to usageLevel for the API
            usageLevel: formData.segment === 'Active' ? 'active' : 
                       formData.segment === 'Occasional' ? 'occasional' : 'non-user'
          });
        } else {
          // In overview tab without projectId, update with all fields
          await api.updateParticipant(editingParticipant.id, { ...editingParticipant, ...formData });
        }
        toast.success("Participant updated!");
      } else {
        // Find the highest existing P number and increment
        const maxNum = participants.reduce((max, p) => {
          const match = p.id.match(/^P(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            return num > max ? num : max;
          }
          return max;
        }, 0);
        const newId = `P${String(maxNum + 1).padStart(2, "0")}`;
        await api.createParticipant({ ...formData, id: newId, name: newId });
        toast.success("Participant added!");
      }
      setIsAddDialogOpen(false);
      setEditingParticipant(null);
      setFormData({
        segment: "Active",
        role: "",
        date: "",
        duration: "45m",
        status: "scheduled",
      });
      onUpdate();
    } catch (error) {
      console.error("Error saving participant:", error);
      toast.error("Failed to save participant");
    }
  };

  const handleEdit = (participant: ParticipantWithRecordings) => {
    setEditingParticipant(participant);
    setFormData(participant);
    setIsAddDialogOpen(true);
  };

  const handleToggleStatus = async (participant: ParticipantWithRecordings) => {
    try {
      const newStatus = participant.status === "completed" ? "invited" : "completed";
      
      // Use project-level API if projectId is provided
      if (projectId) {
        await api.updateParticipantInProject(projectId, participant.id, { 
          ...participant, 
          status: newStatus,
          // Map segment back to usageLevel for the API
          usageLevel: participant.segment === 'Active' ? 'active' : 
                     participant.segment === 'Occasional' ? 'occasional' : 'non-user'
        });
      } else {
        await api.updateParticipant(participant.id, { ...participant, status: newStatus });
      }
      
      toast.success(`Interview marked as ${newStatus}!`);
      onUpdate();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Handle playing a recording
  const handlePlayRecording = (participant: ParticipantWithRecordings, sessionType: 'interview' | 'usability') => {
    if (onPlayRecording) {
      onPlayRecording(participant, sessionType);
    }
  };

  // Handle opening external recording
  const handleExternalOpen = (url: string) => {
    window.open(url, '_blank');
  };

  // Handle opening add recording dialog
  const handleOpenAddRecording = (participant: ParticipantWithRecordings, sessionType: 'interview' | 'usability') => {
    setRecordingParticipant(participant);
    setRecordingSessionType(sessionType);
    setAddRecordingDialogOpen(true);
  };

  // Handle saving a recording URL
  const handleSaveRecording = async (recording: SessionRecording) => {
    console.log("handleSaveRecording called with:", recording);
    console.log("recordingParticipant:", recordingParticipant);
    console.log("projectId:", projectId);
    console.log("recordingSessionType:", recordingSessionType);

    if (!recordingParticipant) {
      console.error("No participant selected");
      toast.error("No participant selected");
      return;
    }

    // If onSaveRecording prop is provided, use that instead
    if (onSaveRecording) {
      console.log("Using onSaveRecording callback");
      await onSaveRecording(recordingParticipant, recordingSessionType, recording);
      return;
    }

    // Otherwise, try to save via API
    if (!projectId) {
      console.error("No projectId provided - cannot save recording");
      toast.error("Unable to save recording - project context missing");
      return;
    }

    try {
      const updateData: Partial<ParticipantWithRecordings> = {};
      
      if (recordingSessionType === 'interview') {
        updateData.interviewRecording = recording;
      } else {
        updateData.usabilityRecording = recording;
      }

      console.log("Calling API to update participant with:", updateData);

      await api.updateParticipantInProject(projectId, recordingParticipant.id, {
        ...recordingParticipant,
        ...updateData,
        // Map segment back to usageLevel for the API
        usageLevel: recordingParticipant.segment === 'Active' ? 'active' : 
                   recordingParticipant.segment === 'Occasional' ? 'occasional' : 'non-user'
      });

      console.log("API call successful");
      toast.success("Recording URL added successfully!");
      onUpdate();
    } catch (error) {
      console.error("Error saving recording:", error);
      toast.error("Failed to save recording URL");
    }
  };

  // Handle deleting a recording URL
  const handleDeleteRecording = async () => {
    console.log("handleDeleteRecording called");
    console.log("recordingParticipant:", recordingParticipant);
    console.log("recordingSessionType:", recordingSessionType);

    if (!recordingParticipant) {
      console.error("No participant selected");
      toast.error("No participant selected");
      return;
    }

    if (!projectId) {
      console.error("No projectId provided - cannot delete recording");
      toast.error("Unable to delete recording - project context missing");
      return;
    }

    try {
      const updateData: Partial<ParticipantWithRecordings> = {};
      
      if (recordingSessionType === 'interview') {
        updateData.interviewRecording = undefined;
      } else {
        updateData.usabilityRecording = undefined;
      }

      console.log("Calling API to remove recording from participant");

      await api.updateParticipantInProject(projectId, recordingParticipant.id, {
        ...recordingParticipant,
        ...updateData,
        // Map segment back to usageLevel for the API
        usageLevel: recordingParticipant.segment === 'Active' ? 'active' : 
                   recordingParticipant.segment === 'Occasional' ? 'occasional' : 'non-user'
      });

      console.log("Recording deleted successfully");
      toast.success("Recording removed successfully!");
      onUpdate();
    } catch (error) {
      console.error("Error deleting recording:", error);
      toast.error("Failed to remove recording");
    }
  };

  // Calculate completed sessions count
  const completedCount = participants.filter((p) => p.status === "completed").length;
  const totalCount = participants.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="p-6 bg-white shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2>Participant Interview Tracking</h2>
        <div className="flex items-center gap-4">
          {/* Research Progress */}
          <div className="text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Research Progress</span>
            </div>
            <div className="mt-1 h-2 w-40 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs text-slate-400">
              {completedCount} of {totalCount} sessions complete
            </span>
          </div>
          {!readOnly && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Participant
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingParticipant ? "Edit Participant" : "Add New Participant"}
                </DialogTitle>
                <DialogDescription>
                  {editingParticipant ? "Update participant information for your research." : "Add a new participant to your research study."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="segment">Segment</Label>
                  <Select
                    value={formData.segment}
                    onValueChange={(value) => setFormData({ ...formData, segment: value })}
                  >
                    <SelectTrigger id="segment" className="w-full border border-slate-300 rounded px-3 py-2">
                      <SelectValue>{formData.segment}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Occasional">Occasional</SelectItem>
                      <SelectItem value="Non-user">Non-user</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.date || "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.date ? new Date(formData.date) : undefined}
                        onSelect={(date) => setFormData({ ...formData, date: date ? format(date, "MMM dd") : "" })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="time">Time (optional)</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedHour}
                      onValueChange={(value) => handleTimeChange(value, selectedMinute, selectedPeriod)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                          <SelectItem key={hour} value={String(hour)}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center">:</span>
                    <Select
                      value={selectedMinute}
                      onValueChange={(value) => handleTimeChange(selectedHour, value, selectedPeriod)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {["00", "15", "30", "45"].map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedPeriod}
                      onValueChange={(value) => handleTimeChange(selectedHour, selectedMinute, value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20min">20 minutes</SelectItem>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="45min">45 minutes</SelectItem>
                      <SelectItem value="60min">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="susScore">SUS Score (optional, 0-100)</Label>
                  <Input
                    id="susScore"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.susScore || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, susScore: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="npsScore">NPS Score (optional, 0-10)</Label>
                  <Input
                    id="npsScore"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.npsScore || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, npsScore: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingParticipant ? "Update Participant" : "Add Participant"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
        </div>
      </div>
        
        {readOnly && editingParticipant && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Research Scores - {editingParticipant.id}</DialogTitle>
                <DialogDescription>
                  Add SUS and NPS scores for this participant
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Participant:</span>
                    <span className="text-sm">{editingParticipant.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Segment:</span>
                    <Badge variant="outline" className={segmentColors[editingParticipant.segment]}>
                      {editingParticipant.segment}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Date:</span>
                    <span className="text-sm">{editingParticipant.date}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="susScore">SUS Score (0-100)</Label>
                    <Input
                      id="susScore"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.susScore || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, susScore: e.target.value ? Number(e.target.value) : undefined })
                      }
                      placeholder="Enter SUS score"
                    />
                    {formData.susScore !== undefined && (
                      <p className="text-xs text-slate-600 mt-1">
                        Grade: <span className="text-indigo-600">{getSUSLabel(formData.susScore).grade}</span>
                        {getSUSLabel(formData.susScore).label && ` - ${getSUSLabel(formData.susScore).label}`}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="npsScore">NPS Score (0-10)</Label>
                    <Input
                      id="npsScore"
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      value={formData.npsScore || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, npsScore: e.target.value ? Number(e.target.value) : undefined })
                      }
                      placeholder="Enter NPS score"
                    />
                    {formData.npsScore !== undefined && (
                      <p className="text-xs mt-1">
                        Category: <span className={getNPSLabel(formData.npsScore).color}>{getNPSLabel(formData.npsScore).category}</span>
                      </p>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Save Scores
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {participants.map((participant) => {
          // Auto-determine completion status based on interview and testing completion
          const isFullyCompleted = participant.interviewCompleted && participant.usabilityCompleted;
          const displayStatus = isFullyCompleted ? "completed" : participant.status;
          
          return (
            <div
              key={participant.id}
              className={`border rounded-lg p-3 transition-all hover:shadow-md relative group ${
                displayStatus === "completed"
                  ? "bg-slate-50 border-slate-200"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => handleEdit(participant)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex items-start gap-2 mb-2">
                <button
                  onClick={() => handleToggleStatus(participant)}
                  className="cursor-pointer hover:scale-110 transition-transform"
                  title={displayStatus === "completed" ? "Mark as scheduled" : "Mark as completed"}
                >
                  {displayStatus === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 text-xs font-medium">{participant.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={`text-xs ${segmentColors[participant.segment] || "bg-slate-100 text-slate-700 border-slate-200"}`}
                >
                  {participant.segment}
                </Badge>
                {participant.status && (
                  <Badge
                    variant={
                      participant.status === 'completed' ? 'default' :
                      participant.status === 'in-progress' ? 'secondary' : 'outline'
                    }
                    className="text-xs capitalize"
                  >
                    {participant.status === 'in-progress' ? 'In Progress' : 
                     participant.status === 'no-show' ? 'No Show' :
                     participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Role:</span> {participant.role}
                </div>
                
                {/* Interview Row with Recording Indicator */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {participant.interviewCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className="text-slate-500 flex-shrink-0">Interview:</span>
                    <span className="truncate">
                      {participant.date && participant.time 
                        ? `${participant.date} at ${participant.time}` 
                        : participant.date 
                        ? participant.date 
                        : 'TBD'}
                    </span>
                  </div>
                  <RecordingIndicator
                    recording={participant.interviewRecording}
                    onPlay={() => handlePlayRecording(participant, 'interview')}
                    onExternalOpen={handleExternalOpen}
                    onAddRecording={() => handleOpenAddRecording(participant, 'interview')}
                    showAddOption={true}
                  />
                </div>
                
                {/* Testing Row with Recording Indicator */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {participant.usabilityCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className="text-slate-500 flex-shrink-0">Testing:</span>
                    <span className="truncate">
                      {participant.usabilityDate && participant.usabilityTime 
                        ? `${participant.usabilityDate} at ${participant.usabilityTime}` 
                        : participant.usabilityDate 
                        ? participant.usabilityDate 
                        : 'TBD'}
                    </span>
                  </div>
                  <RecordingIndicator
                    recording={participant.usabilityRecording}
                    onPlay={() => handlePlayRecording(participant, 'usability')}
                    onExternalOpen={handleExternalOpen}
                    onAddRecording={() => handleOpenAddRecording(participant, 'usability')}
                    showAddOption={true}
                  />
                </div>
                
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500">SUS:</span> 
                  {participant.susScore !== undefined ? (
                    <>
                      <span>{participant.susScore}</span>
                      <span className="text-indigo-600">({getSUSLabel(participant.susScore).grade}{getSUSLabel(participant.susScore).label ? ` - ${getSUSLabel(participant.susScore).label}` : ""})</span>
                    </>
                  ) : (
                    <span className="text-slate-400">TBD</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">NPS:</span> 
                  {participant.npsScore !== undefined ? (
                    <>
                      <span>{participant.npsScore}</span>
                      <span className={getNPSLabel(participant.npsScore).color}>({getNPSLabel(participant.npsScore).category})</span>
                    </>
                  ) : (
                    <span className="text-slate-400">TBD</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Recording Dialog */}
      {recordingParticipant && (
        <AddRecordingDialog
          open={addRecordingDialogOpen}
          onOpenChange={setAddRecordingDialogOpen}
          sessionType={recordingSessionType}
          participantId={recordingParticipant.id}
          participantName={recordingParticipant.name}
          existingRecording={
            recordingSessionType === 'interview' 
              ? recordingParticipant.interviewRecording 
              : recordingParticipant.usabilityRecording
          }
          onSave={handleSaveRecording}
          onDelete={handleDeleteRecording}
        />
      )}
    </Card>
  );
}