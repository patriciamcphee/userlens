import { useState, useEffect } from "react";
import { ParticipantTracking } from "./ParticipantTracking";
import { AffinityMapping } from "./AffinityMapping";
import { MetricsDashboard } from "./MetricsDashboard";
import { NPSTable } from "./NPSTable";
import { SUSChart } from "./SUSChart";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Download, RefreshCw } from "lucide-react";
import { Participant, StickyNote, Hypothesis, ResearchQuestion } from "../types";
import { api } from "../utils/api";
import { exportToPDF, exportToCSV } from "../utils/export";
import { toast } from "sonner";

interface SynthesisTabProps {
  projectId: string;
  onProjectUpdate?: () => void; // Optional callback to refresh project data at parent level (for ParticipantsTab sync)
}

export function SynthesisTab({ projectId, onProjectUpdate }: SynthesisTabProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [researchQuestions, setResearchQuestions] = useState<ResearchQuestion[]>([]);
  const [emptyClusters, setEmptyClusters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSegment, setFilterSegment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("participant");

  // Load synthesis data for this project
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load participants from project level
      const project = await api.getProject(projectId);
      
      console.log('Raw participants from API:', project.participants);
      
      // Map ProjectParticipant to Participant (usageLevel -> segment)
      const mappedParticipants: Participant[] = (project.participants || []).map((p, index) => {
        const segment = p.usageLevel === 'active' ? 'Active' : 
                       p.usageLevel === 'occasional' ? 'Occasional' : 'Non-User';
        
        console.log(`Mapping participant ${p.id}: usageLevel="${p.usageLevel}" -> segment="${segment}"`);
        
        // Generate anonymous participant ID (P01, P02, etc.)
        const anonymousId = `P${String(index + 1).padStart(2, '0')}`;
        
        // Normalize interview date to ISO format (yyyy-MM-dd) for the date input
        let normalizedInterviewDate = '';
        if (p.interviewDate && p.interviewDate.trim()) {
          if (/^\d{4}-\d{2}-\d{2}/.test(p.interviewDate)) {
            // Already in ISO format, extract just the date part
            normalizedInterviewDate = p.interviewDate.substring(0, 10);
          } else {
            // Try to parse and convert to ISO
            try {
              const date = new Date(p.interviewDate);
              if (!isNaN(date.getTime())) {
                normalizedInterviewDate = date.toISOString().substring(0, 10);
              }
            } catch {
              normalizedInterviewDate = '';
            }
          }
        }
        
        // Normalize usability date to ISO format (yyyy-MM-dd) for the date input
        let normalizedUsabilityDate = '';
        if (p.usabilityDate && p.usabilityDate.trim()) {
          if (/^\d{4}-\d{2}-\d{2}/.test(p.usabilityDate)) {
            // Already in ISO format, extract just the date part
            normalizedUsabilityDate = p.usabilityDate.substring(0, 10);
          } else {
            // Try to parse and convert to ISO
            try {
              const date = new Date(p.usabilityDate);
              if (!isNaN(date.getTime())) {
                normalizedUsabilityDate = date.toISOString().substring(0, 10);
              }
            } catch {
              normalizedUsabilityDate = '';
            }
          }
        }
        
        return {
          id: anonymousId,
          name: p.name,
          segment,
          role: p.role || '',
          date: normalizedInterviewDate,
          time: p.interviewTime,
          endTime: p.interviewEndTime,
          usabilityDate: normalizedUsabilityDate,
          usabilityTime: p.usabilityTime,
          usabilityEndTime: p.usabilityEndTime,
          status: p.status || 'scheduled', // Use the actual status from the participant
          susScore: p.susScore,
          npsScore: p.npsScore,
          interviewCompleted: p.interviewCompleted || false,
          usabilityCompleted: p.usabilityCompleted || false,
          interviewRecording: p.interviewRecording,
          usabilityRecording: p.usabilityRecording,
          interviewNotes: (p as any).interviewNotes || '',
          usabilityNotes: (p as any).usabilityNotes || '',
        };
      });
      
      console.log('Mapped participants:', mappedParticipants);
      
      setParticipants(mappedParticipants);
      
      // Load synthesis-specific data (notes, hypotheses)
      const data = await api.getSynthesisData(projectId);
      
      if (!data.notes) {
        // Initialize with empty data for this project if needed
        await api.initializeSynthesis(projectId);
        const newData = await api.getSynthesisData(projectId);
        setStickyNotes(newData.notes);
        setHypotheses(newData.hypotheses);
        setResearchQuestions(newData.questions || []);
      } else {
        setStickyNotes(data.notes);
        setHypotheses(data.hypotheses);
        
        // Set research questions (no default fallback)
        setResearchQuestions(data.questions || []);
      }
      
      // Load empty clusters from project (not synthesis data)
      console.log('SynthesisTab loadData - project.emptyClusters:', project.emptyClusters);
      setEmptyClusters(project.emptyClusters || []);
    } catch (error) {
      console.error("Error loading synthesis data:", error);
      toast.error("Failed to load synthesis data");
    } finally {
      setLoading(false);
    }
  };

  // Refresh only synthesis data (notes) without full reload
  const refreshSynthesis = async () => {
    try {
      const data = await api.getSynthesisData(projectId);
      if (data.notes) {
        setStickyNotes(data.notes);
      }
    } catch (error) {
      console.error("Error refreshing synthesis data:", error);
    }
  };

  // Combined handler that refreshes both SynthesisTab AND notifies parent to update ParticipantsTab
  const handleParticipantUpdate = async () => {
    await loadData(); // Refresh SynthesisTab data
    if (onProjectUpdate) {
      onProjectUpdate(); // Notify parent to refresh project data (for ParticipantsTab)
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleExportPDF = () => {
    exportToPDF({ participants, stickyNotes, hypotheses });
    toast.success("PDF exported successfully!");
  };

  const handleExportCSV = () => {
    exportToCSV({ participants, stickyNotes, hypotheses });
    toast.success("CSV exported successfully!");
  };

  // Filter and sort participants
  const filteredParticipants = participants
    .filter((p) => filterSegment === "all" || p.segment === filterSegment)
    .filter((p) => filterStatus === "all" || p.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "participant") {
        const aNum = parseInt(a.id.replace(/\D/g, ""), 10) || 0;
        const bNum = parseInt(b.id.replace(/\D/g, ""), 10) || 0;
        return aNum - bNum;
      } else if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "sus") {
        return (b.susScore || 0) - (a.susScore || 0);
      } else if (sortBy === "nps") {
        return (b.npsScore || 0) - (a.npsScore || 0);
      }
      return 0;
    });

  const segments = ["all", "Active", "Occasional", "Non-User"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg p-4 shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 w-full sm:w-auto">
          {/* Filter by group */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-600">Filter by:</span>
            <Select value={filterSegment} onValueChange={setFilterSegment}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Segments" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((seg) => (
                  <SelectItem key={seg} value={seg}>
                    {seg === "all" ? "All Segments" : seg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Sort by group */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Participant ID" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">Participant ID</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="sus">SUS Score</SelectItem>
                <SelectItem value="nps">NPS Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button size="sm" variant="outline" onClick={handleExportPDF} className="gap-2 flex-1 sm:flex-initial">
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-2 flex-1 sm:flex-initial">
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </Button>
          <Button size="sm" variant="outline" onClick={loadData} className="gap-2 flex-1 sm:flex-initial">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Participant Tracking */}
        <ParticipantTracking
          participants={filteredParticipants}
          onUpdate={handleParticipantUpdate}
          onSynthesisUpdate={refreshSynthesis}
          projectId={projectId}
          readOnly={true}
        />

        {/* Affinity Mapping */}
        <AffinityMapping 
          stickyNotes={stickyNotes} 
          onUpdate={loadData} 
          projectId={projectId}
          emptyClusters={emptyClusters}
        />
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <TooltipProvider>
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <span className="text-sm text-slate-500 w-full sm:w-auto">Sticky Note Types:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-xs sm:text-sm text-slate-600">New Insight</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Unexpected discoveries or learnings from research</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <span className="text-xs sm:text-sm text-slate-600">Pattern/Opportunity</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recurring themes or potential areas for improvement</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <span className="text-xs sm:text-sm text-slate-600">Barrier/Pain Point</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Obstacles or frustrations users experience</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <span className="text-xs sm:text-sm text-slate-600">Direct Quote</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verbatim statements from participants</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <MetricsDashboard participants={participants} />

      {/* NPS Chart */}
      <NPSTable 
        participants={participants}
        projectId={projectId}
        onUpdate={handleParticipantUpdate}
      />

      {/* SUS Chart */}
      <SUSChart 
        participants={participants}
      />
    </div>
  );
}