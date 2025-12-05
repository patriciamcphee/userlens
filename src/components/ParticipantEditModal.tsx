import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { DateTimeRangePicker } from "./DateTimeRangePicker";
import { 
  Download, 
  User, 
  ClipboardList, 
  TestTube2,
  Plus,
  X,
  RefreshCw,
  CheckCircle2,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../utils/api";
import type { Participant, SessionRecording } from "../types";

// ============================================
// TYPES
// ============================================

export type QuoteTag = 'pain' | 'delight' | 'feature_request' | 'workflow' | 'general';

export interface TaggedQuote {
  id: string;
  text: string;
  tag: QuoteTag;
  timestamp?: string;
}

export interface ParticipantSessionNotes {
  interviewer?: string;
  duration?: string;
  sessionDate?: string;
  keyQuotes: TaggedQuote[];
  keyInsights: string[];
  painPoints: string[];
  delights: string[];
  featureRequests: string[];
  workflowObservations: string;
  integrationNeeds: string;
  followUpQuestions: string;
  technicalIssues: string;
  additionalNotes: string;
  lastSyncedToSynthesis?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Extended Participant type with notes
export interface ParticipantWithNotes extends Participant {
  interviewNotes?: ParticipantSessionNotes;
  usabilityNotes?: ParticipantSessionNotes;
  interviewRecording?: SessionRecording;
  usabilityRecording?: SessionRecording;
}

// ============================================
// CONSTANTS
// ============================================

const QUOTE_TAG_CONFIG: Record<QuoteTag, { label: string; color: string; icon: string }> = {
  pain: { label: 'Pain Point', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: '😤' },
  delight: { label: 'Delight', color: 'bg-green-100 text-green-700 border-green-200', icon: '✨' },
  feature_request: { label: 'Feature Request', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🎯' },
  workflow: { label: 'Workflow', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🔄' },
  general: { label: 'General', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '💬' },
};

const QUOTE_TAG_TO_STICKY_TYPE: Record<QuoteTag, 'barrier' | 'insight' | 'opportunity' | 'quote'> = {
  pain: 'barrier',
  delight: 'opportunity',
  feature_request: 'opportunity',
  workflow: 'insight',
  general: 'quote',
};

const segmentColors: Record<string, string> = {
  "Active": "bg-green-100 text-green-700 border-green-200",
  "Occasional": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Non-user": "bg-blue-100 text-blue-700 border-blue-200",
};

function createEmptySessionNotes(): ParticipantSessionNotes {
  return {
    keyQuotes: [],
    keyInsights: [],
    painPoints: [],
    delights: [],
    featureRequests: [],
    workflowObservations: '',
    integrationNeeds: '',
    followUpQuestions: '',
    technicalIssues: '',
    additionalNotes: '',
  };
}

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

function getNPSLabel(score: number): { category: string; color: string } {
  if (score >= 9) return { category: "Promoter", color: "text-green-600" };
  if (score >= 7) return { category: "Passive", color: "text-yellow-600" };
  return { category: "Detractor", color: "text-red-600" };
}

// ============================================
// MAIN COMPONENT
// ============================================

interface ParticipantEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: ParticipantWithNotes | null;
  projectId: string;
  onUpdate: () => void;
  onSynthesisUpdate?: () => void;
  readOnly?: boolean;
}

export function ParticipantEditModal({
  open,
  onOpenChange,
  participant,
  projectId,
  onUpdate,
  onSynthesisUpdate,
  readOnly = false,
}: ParticipantEditModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [detailsData, setDetailsData] = useState({
    segment: "Active",
    role: "",
    date: "",
    time: "",
    endTime: "",
    usabilityDate: "",
    usabilityTime: "",
    usabilityEndTime: "",
    susScore: undefined as number | undefined,
    npsScore: undefined as number | undefined,
    interviewCompleted: false,
    usabilityCompleted: false,
    status: "scheduled" as "completed" | "scheduled" | "in-progress" | "invited" | "no-show",
  });

  const [interviewNotes, setInterviewNotes] = useState<ParticipantSessionNotes>(createEmptySessionNotes());
  const [usabilityNotes, setUsabilityNotes] = useState<ParticipantSessionNotes>(createEmptySessionNotes());

  useEffect(() => {
    if (participant) {
      setDetailsData({
        segment: participant.segment || "Active",
        role: participant.role || "",
        date: participant.date || "",
        time: participant.time || "",
        endTime: participant.endTime || "",
        usabilityDate: participant.usabilityDate || "",
        usabilityTime: participant.usabilityTime || "",
        usabilityEndTime: participant.usabilityEndTime || "",
        susScore: participant.susScore,
        npsScore: participant.npsScore,
        interviewCompleted: participant.interviewCompleted || false,
        usabilityCompleted: participant.usabilityCompleted || false,
        status: participant.status || "scheduled",
      });
      setInterviewNotes(participant.interviewNotes || createEmptySessionNotes());
      setUsabilityNotes(participant.usabilityNotes || createEmptySessionNotes());
      setActiveTab("details");
    }
  }, [participant]);

  const handleSave = async () => {
    if (!participant) return;
    
    setSaving(true);
    try {
      const now = new Date().toISOString();
      
      // Build update data explicitly to avoid field name mismatches
      // Participant type uses 'date'/'time' but ProjectParticipant uses 'interviewDate'/'interviewTime'
      // We only send fields that should actually be updated, preserving original date formats in the database
      const updateData = {
        // Editable details
        segment: detailsData.segment,
        role: detailsData.role,
        usageLevel: detailsData.segment === 'Active' ? 'active' : 
                   detailsData.segment === 'Occasional' ? 'occasional' : 'non-user',
        
        // Status and completion flags
        status: detailsData.status,
        interviewCompleted: detailsData.interviewCompleted,
        usabilityCompleted: detailsData.usabilityCompleted,
        
        // Scores
        susScore: detailsData.susScore,
        npsScore: detailsData.npsScore,
        
        // Notes
        interviewNotes: { ...interviewNotes, updatedAt: now, createdAt: interviewNotes.createdAt || now },
        usabilityNotes: { ...usabilityNotes, updatedAt: now, createdAt: usabilityNotes.createdAt || now },
        
        // Preserve recordings
        interviewRecording: participant.interviewRecording,
        usabilityRecording: participant.usabilityRecording,
        
        // Note: We intentionally do NOT include date/time fields here.
        // The 'date' field in detailsData is display-formatted ("Dec 5") 
        // but the database uses 'interviewDate' in ISO format ("2024-12-05").
        // By not including them, the original interviewDate/interviewTime values are preserved.
      };

      await api.updateParticipantInProject(projectId, participant.id, updateData);
      
      // Auto-sync notes to synthesis (non-blocking)
      syncNotesToSynthesis().catch(console.error);
      
      toast.success("Participant updated!");
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving participant:", error);
      toast.error("Failed to save participant");
    } finally {
      setSaving(false);
    }
  };

  const syncNotesToSynthesis = async () => {
    if (!participant || !projectId) return;
    
    setSyncing(true);
    try {
      const newStickyNotes: Array<{ text: string; type: 'barrier' | 'insight' | 'opportunity' | 'quote'; cluster: string }> = [];
      const participantLabel = `[${participant.id}]`;

      const createNote = (text: string, type: 'barrier' | 'insight' | 'opportunity' | 'quote', cluster: string) => {
        newStickyNotes.push({ text: `${participantLabel} ${text}`, type, cluster });
      };

      [interviewNotes, usabilityNotes].forEach(notes => {
        if (!notes) return;
        
        notes.keyQuotes.forEach(quote => {
          const type = QUOTE_TAG_TO_STICKY_TYPE[quote.tag];
          const cluster = quote.tag === 'pain' ? 'User Frustrations' :
                         quote.tag === 'delight' ? 'What Works Well' :
                         quote.tag === 'feature_request' ? 'Feature Requests' :
                         quote.tag === 'workflow' ? 'Workflow Issues' : 'Emerging Opportunities';
          createNote(`"${quote.text}"`, type, cluster);
        });

        notes.keyInsights.forEach(insight => {
          if (insight.trim()) createNote(insight, 'insight', 'Emerging Opportunities');
        });

        notes.painPoints.forEach(pain => {
          if (pain.trim()) createNote(pain, 'barrier', 'User Frustrations');
        });

        notes.delights.forEach(delight => {
          if (delight.trim()) createNote(delight, 'opportunity', 'What Works Well');
        });

        notes.featureRequests.forEach(request => {
          if (request.trim()) createNote(request, 'opportunity', 'Feature Requests');
        });
      });

      if (newStickyNotes.length === 0) return;

      // Get existing synthesis data for deduplication
      const existingSynthesis = await api.getSynthesisData(projectId);
      const existingTexts = new Set((existingSynthesis?.notes || []).map((n: { text: string }) => n.text));
      const uniqueNotes = newStickyNotes.filter(note => !existingTexts.has(note.text));

      // Add each unique note to the project's synthesis
      for (const note of uniqueNotes) {
        try {
          await api.addStickyNoteToProject(projectId, note);
        } catch (err) {
          console.error("Failed to add note:", note.text, err);
        }
      }

      if (uniqueNotes.length > 0) {
        toast.success(`Added ${uniqueNotes.length} notes to Synthesis`, { duration: 2000 });
        if (onSynthesisUpdate) {
          onSynthesisUpdate();
        }
      }
    } catch (error) {
      console.error("Error syncing to synthesis:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleDownload = () => {
    if (!participant) return;

    const formatNotes = (notes: ParticipantSessionNotes, sessionType: string) => {
      let content = `\n${'='.repeat(50)}\n${sessionType.toUpperCase()} NOTES\n${'='.repeat(50)}\n\n`;
      if (notes.interviewer) content += `Interviewer: ${notes.interviewer}\n`;
      if (notes.sessionDate) content += `Date: ${notes.sessionDate}\n`;
      if (notes.duration) content += `Duration: ${notes.duration}\n`;
      content += '\n';

      if (notes.keyQuotes.length > 0) {
        content += `KEY QUOTES\n${'-'.repeat(30)}\n`;
        notes.keyQuotes.forEach(q => content += `• "${q.text}" [${q.tag.toUpperCase()}]\n`);
        content += '\n';
      }
      if (notes.keyInsights.length > 0) {
        content += `KEY INSIGHTS\n${'-'.repeat(30)}\n`;
        notes.keyInsights.forEach(i => content += `• ${i}\n`);
        content += '\n';
      }
      if (notes.painPoints.length > 0) {
        content += `PAIN POINTS\n${'-'.repeat(30)}\n`;
        notes.painPoints.forEach((p, i) => content += `${i + 1}. ${p}\n`);
        content += '\n';
      }
      if (notes.delights.length > 0) {
        content += `DELIGHTS\n${'-'.repeat(30)}\n`;
        notes.delights.forEach((d, i) => content += `${i + 1}. ${d}\n`);
        content += '\n';
      }
      if (notes.featureRequests.length > 0) {
        content += `FEATURE REQUESTS\n${'-'.repeat(30)}\n`;
        notes.featureRequests.forEach((f, i) => content += `${i + 1}. ${f}\n`);
        content += '\n';
      }
      if (notes.workflowObservations) content += `WORKFLOW OBSERVATIONS\n${'-'.repeat(30)}\n${notes.workflowObservations}\n\n`;
      if (notes.integrationNeeds) content += `INTEGRATION NEEDS\n${'-'.repeat(30)}\n${notes.integrationNeeds}\n\n`;
      if (notes.followUpQuestions) content += `FOLLOW-UP QUESTIONS\n${'-'.repeat(30)}\n${notes.followUpQuestions}\n\n`;
      if (notes.technicalIssues) content += `TECHNICAL ISSUES\n${'-'.repeat(30)}\n${notes.technicalIssues}\n\n`;
      if (notes.additionalNotes) content += `ADDITIONAL NOTES\n${'-'.repeat(30)}\n${notes.additionalNotes}\n\n`;
      return content;
    };

    let content = `OBSERVATION NOTES\n${'='.repeat(50)}\n\n`;
    content += `Participant ID: ${participant.id}\n`;
    content += `Segment: ${participant.segment}\n`;
    content += `Role: ${participant.role || 'N/A'}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;

    if (hasContent(interviewNotes)) content += formatNotes(interviewNotes, 'Interview');
    if (hasContent(usabilityNotes)) content += formatNotes(usabilityNotes, 'Usability Testing');

    content += `\n${'='.repeat(50)}\nPOST-SESSION REMINDERS\n${'='.repeat(50)}\n`;
    content += `• Notes auto-synced to Synthesis using participant ID only\n`;
    content += `• No identifying information included in findings\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${participant.id}-observation-notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Notes downloaded!");
  };

  const hasContent = (notes: ParticipantSessionNotes): boolean => {
    return (
      notes.keyQuotes.length > 0 || notes.keyInsights.length > 0 || notes.painPoints.length > 0 ||
      notes.delights.length > 0 || notes.featureRequests.length > 0 || !!notes.workflowObservations ||
      !!notes.integrationNeeds || !!notes.followUpQuestions || !!notes.technicalIssues || !!notes.additionalNotes
    );
  };

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-700 font-semibold text-sm">{participant.id}</span>
              </div>
              <div>
                <DialogTitle className="text-xl">Edit Participant</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={segmentColors[participant.segment]}>
                    {participant.segment}
                  </Badge>
                  {participant.role && <span className="text-slate-500">• {participant.role}</span>}
                </DialogDescription>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!hasContent(interviewNotes) && !hasContent(usabilityNotes)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download notes (uses participant ID only)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="details" className="gap-2">
              <User className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="interview" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Interview
              {hasContent(interviewNotes) && <span className="w-2 h-2 bg-green-500 rounded-full" />}
            </TabsTrigger>
            <TabsTrigger value="usability" className="gap-2">
              <TestTube2 className="w-4 h-4" />
              Usability
              {hasContent(usabilityNotes) && <span className="w-2 h-2 bg-green-500 rounded-full" />}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <TabsContent value="details" className="mt-0">
              <DetailsTab data={detailsData} onChange={setDetailsData} readOnly={readOnly} />
            </TabsContent>
            <TabsContent value="interview" className="mt-0">
              <NotesTab notes={interviewNotes} onChange={setInterviewNotes} sessionType="Interview" />
            </TabsContent>
            <TabsContent value="usability" className="mt-0">
              <NotesTab notes={usabilityNotes} onChange={setUsabilityNotes} sessionType="Usability Testing" />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {syncing ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /><span>Syncing to Synthesis...</span></>
            ) : (hasContent(interviewNotes) || hasContent(usabilityNotes)) ? (
              <><Info className="w-4 h-4" /><span>Notes auto-sync on save</span></>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Save Changes</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// DETAILS TAB
// ============================================

interface DetailsTabProps {
  data: {
    segment: string;
    role: string;
    date: string;
    time: string;
    endTime: string;
    usabilityDate: string;
    usabilityTime: string;
    usabilityEndTime: string;
    susScore: number | undefined;
    npsScore: number | undefined;
    interviewCompleted: boolean;
    usabilityCompleted: boolean;
    status: "completed" | "scheduled" | "in-progress" | "invited" | "no-show";
  };
  onChange: (data: DetailsTabProps['data']) => void;
  readOnly?: boolean;
}

function DetailsTab({ data, onChange, readOnly }: DetailsTabProps) {
  // Helper to handle completion checkbox changes with auto-status update
  const handleInterviewCompletedChange = (checked: boolean) => {
    const newData = { ...data, interviewCompleted: checked };
    // If both sessions are now completed, set status to "completed"
    if (checked && data.usabilityCompleted) {
      newData.status = "completed";
    }
    // If unchecking and was completed, revert to in-progress
    if (!checked && data.status === "completed") {
      newData.status = "in-progress";
    }
    onChange(newData);
  };

  const handleUsabilityCompletedChange = (checked: boolean) => {
    const newData = { ...data, usabilityCompleted: checked };
    // If both sessions are now completed, set status to "completed"
    if (checked && data.interviewCompleted) {
      newData.status = "completed";
    }
    // If unchecking and was completed, revert to in-progress
    if (!checked && data.status === "completed") {
      newData.status = "in-progress";
    }
    onChange(newData);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Segment</Label>
          <Select value={data.segment} onValueChange={(value) => onChange({ ...data, segment: value })} disabled={readOnly}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Occasional">Occasional</SelectItem>
              <SelectItem value="Non-user">Non-user</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Role</Label>
          <Input value={data.role} onChange={(e) => onChange({ ...data, role: e.target.value })} disabled={readOnly} placeholder="e.g., Developer" />
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-900 flex items-center gap-2"><ClipboardList className="w-4 h-4" />Interview Session</h4>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={data.interviewCompleted} onChange={(e) => handleInterviewCompletedChange(e.target.checked)} className="rounded border-slate-300" />
            <span className="text-slate-600">Completed</span>
          </label>
        </div>
        <DateTimeRangePicker
          date={data.date}
          startTime={data.time}
          endTime={data.endTime}
          onDateChange={(date) => onChange({ ...data, date })}
          onStartTimeChange={(time) => onChange({ ...data, time })}
          onEndTimeChange={(endTime) => onChange({ ...data, endTime })}
          disabled={readOnly}
        />
      </div>

      <div className="p-4 bg-slate-50 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-900 flex items-center gap-2"><TestTube2 className="w-4 h-4" />Usability Testing</h4>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={data.usabilityCompleted} onChange={(e) => handleUsabilityCompletedChange(e.target.checked)} className="rounded border-slate-300" />
            <span className="text-slate-600">Completed</span>
          </label>
        </div>
        <DateTimeRangePicker
          date={data.usabilityDate}
          startTime={data.usabilityTime}
          endTime={data.usabilityEndTime}
          onDateChange={(usabilityDate) => onChange({ ...data, usabilityDate })}
          onStartTimeChange={(usabilityTime) => onChange({ ...data, usabilityTime })}
          onEndTimeChange={(usabilityEndTime) => onChange({ ...data, usabilityEndTime })}
          disabled={readOnly}
        />
      </div>

      <div className="p-4 bg-indigo-50 rounded-lg space-y-3">
        <h4 className="font-medium text-slate-900">Research Scores</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-1 block">SUS Score (0-100)</Label>
            <Input type="number" min="0" max="100" step="0.1" value={data.susScore ?? ""} onChange={(e) => onChange({ ...data, susScore: e.target.value ? Number(e.target.value) : undefined })} placeholder="Enter SUS score" />
            {data.susScore !== undefined && (
              <p className="text-xs text-slate-600 mt-1">Grade: <span className="text-indigo-600 font-medium">{getSUSLabel(data.susScore).grade}</span>{getSUSLabel(data.susScore).label && ` - ${getSUSLabel(data.susScore).label}`}</p>
            )}
          </div>
          <div>
            <Label className="text-xs mb-1 block">NPS Score (0-10)</Label>
            <Input type="number" min="0" max="10" value={data.npsScore ?? ""} onChange={(e) => onChange({ ...data, npsScore: e.target.value ? Number(e.target.value) : undefined })} placeholder="Enter NPS score" />
            {data.npsScore !== undefined && (
              <p className="text-xs mt-1">Category: <span className={`font-medium ${getNPSLabel(data.npsScore).color}`}>{getNPSLabel(data.npsScore).category}</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// NOTES TAB
// ============================================

interface NotesTabProps {
  notes: ParticipantSessionNotes;
  onChange: (notes: ParticipantSessionNotes) => void;
  sessionType: string;
}

function NotesTab({ notes, onChange, sessionType }: NotesTabProps) {
  const [newQuote, setNewQuote] = useState("");
  const [newQuoteTag, setNewQuoteTag] = useState<QuoteTag>("general");

  const addQuote = () => {
    if (!newQuote.trim()) return;
    const quote: TaggedQuote = { id: `q-${Date.now()}`, text: newQuote.trim(), tag: newQuoteTag, timestamp: new Date().toISOString() };
    onChange({ ...notes, keyQuotes: [...notes.keyQuotes, quote] });
    setNewQuote("");
  };

  const removeQuote = (id: string) => onChange({ ...notes, keyQuotes: notes.keyQuotes.filter(q => q.id !== id) });

  const addListItem = (field: 'keyInsights' | 'painPoints' | 'delights' | 'featureRequests', value: string) => {
    if (!value.trim()) return;
    onChange({ ...notes, [field]: [...notes[field], value.trim()] });
  };

  const removeListItem = (field: 'keyInsights' | 'painPoints' | 'delights' | 'featureRequests', index: number) => {
    onChange({ ...notes, [field]: notes[field].filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg">
        <div><Label className="text-xs mb-1 block">Interviewer</Label><Input value={notes.interviewer || ""} onChange={(e) => onChange({ ...notes, interviewer: e.target.value })} placeholder="Your name" className="h-8 text-sm" /></div>
        <div><Label className="text-xs mb-1 block">Session Date</Label><Input value={notes.sessionDate || ""} onChange={(e) => onChange({ ...notes, sessionDate: e.target.value })} placeholder="Dec 5, 2024" className="h-8 text-sm" /></div>
        <div><Label className="text-xs mb-1 block">Duration</Label><Input value={notes.duration || ""} onChange={(e) => onChange({ ...notes, duration: e.target.value })} placeholder="45 min" className="h-8 text-sm" /></div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-1.5 block">Key Quotes <span className="text-xs font-normal text-slate-500 ml-2">Verbatim quotes with tags</span></Label>
        <div className="space-y-1.5 mb-2">
          {notes.keyQuotes.map((quote) => (
            <div key={quote.id} className={`flex items-start gap-2 p-2 rounded border text-sm ${QUOTE_TAG_CONFIG[quote.tag].color}`}>
              <span>{QUOTE_TAG_CONFIG[quote.tag].icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">"{quote.text}"</p>
                <Badge variant="outline" className="text-xs mt-1">{QUOTE_TAG_CONFIG[quote.tag].label}</Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-red-600" onClick={() => removeQuote(quote.id)}><X className="w-3 h-3" /></Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newQuote} onChange={(e) => setNewQuote(e.target.value)} placeholder="Enter a quote..." className="flex-1 h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && addQuote()} />
          <Select value={newQuoteTag} onValueChange={(v) => setNewQuoteTag(v as QuoteTag)}>
            <SelectTrigger className="w-[130px] h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(QUOTE_TAG_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}><span className="flex items-center gap-1.5">{config.icon} {config.label}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addQuote} size="sm" className="h-8"><Plus className="w-4 h-4" /></Button>
        </div>
      </div>

      <ListInputSection label="Key Insights" description="Major takeaways" items={notes.keyInsights} onAdd={(v) => addListItem('keyInsights', v)} onRemove={(i) => removeListItem('keyInsights', i)} placeholder="Add an insight..." />
      <ListInputSection label="Pain Points" description="Struggles and difficulties" items={notes.painPoints} onAdd={(v) => addListItem('painPoints', v)} onRemove={(i) => removeListItem('painPoints', i)} placeholder="Add a pain point..." color="rose" />
      <ListInputSection label="Delights" description="What works well" items={notes.delights} onAdd={(v) => addListItem('delights', v)} onRemove={(i) => removeListItem('delights', i)} placeholder="Add a delight..." color="green" />
      <ListInputSection label="Feature Requests" description="Opportunities" items={notes.featureRequests} onAdd={(v) => addListItem('featureRequests', v)} onRemove={(i) => removeListItem('featureRequests', i)} placeholder="Add a request..." color="blue" />

      <div><Label className="text-sm mb-1 block">Workflow Observations</Label><Textarea value={notes.workflowObservations} onChange={(e) => onChange({ ...notes, workflowObservations: e.target.value })} placeholder="Document workflow patterns..." rows={2} className="text-sm" /></div>
      <div><Label className="text-sm mb-1 block">Integration Needs</Label><Textarea value={notes.integrationNeeds} onChange={(e) => onChange({ ...notes, integrationNeeds: e.target.value })} placeholder="Integration requirements..." rows={2} className="text-sm" /></div>
      <div><Label className="text-sm mb-1 block">Follow-up Questions</Label><Textarea value={notes.followUpQuestions} onChange={(e) => onChange({ ...notes, followUpQuestions: e.target.value })} placeholder="Questions to explore..." rows={2} className="text-sm" /></div>
      <div><Label className="text-sm mb-1 block">Technical Issues</Label><Textarea value={notes.technicalIssues} onChange={(e) => onChange({ ...notes, technicalIssues: e.target.value })} placeholder="Session disruptions..." rows={2} className="text-sm" /></div>
      <div><Label className="text-sm mb-1 block">Additional Notes</Label><Textarea value={notes.additionalNotes} onChange={(e) => onChange({ ...notes, additionalNotes: e.target.value })} placeholder="Other observations..." rows={2} className="text-sm" /></div>
    </div>
  );
}

// ============================================
// LIST INPUT SECTION
// ============================================

interface ListInputSectionProps {
  label: string;
  description?: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  color?: 'slate' | 'rose' | 'green' | 'blue';
}

function ListInputSection({ label, description, items, onAdd, onRemove, placeholder, color = 'slate' }: ListInputSectionProps) {
  const [newItem, setNewItem] = useState("");
  const colorClasses = { slate: 'bg-slate-50 border-slate-200', rose: 'bg-rose-50 border-rose-200', green: 'bg-green-50 border-green-200', blue: 'bg-blue-50 border-blue-200' };

  const handleAdd = () => { if (newItem.trim()) { onAdd(newItem); setNewItem(""); } };

  return (
    <div>
      <Label className="text-sm font-medium mb-1 block">{label}{description && <span className="text-xs font-normal text-slate-500 ml-2">{description}</span>}</Label>
      <div className="space-y-1.5 mb-2">
        {items.map((item, index) => (
          <div key={index} className={`flex items-start gap-2 p-2 rounded border text-sm ${colorClasses[color]}`}>
            <span className="text-slate-400 text-xs">{index + 1}.</span>
            <span className="flex-1">{item}</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-400 hover:text-red-600" onClick={() => onRemove(index)}><X className="w-3 h-3" /></Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={placeholder} className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
        <Button onClick={handleAdd} size="sm" className="h-8"><Plus className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

export default ParticipantEditModal;