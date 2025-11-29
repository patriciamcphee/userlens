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
import { toast } from "sonner@2.0.3";

interface SynthesisTabProps {
  projectId: string;
}

export function SynthesisTab({ projectId }: SynthesisTabProps) {
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
        
        // Format interview date if it exists, otherwise leave empty
        let formattedDate = '';
        if (p.interviewDate && p.interviewDate.trim()) {
          // Check if it's already in short format (e.g., "Nov 24") or needs formatting
          if (p.interviewDate.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(p.interviewDate)) {
            // It's an ISO date or YYYY-MM-DD date, format it
            try {
              const date = new Date(p.interviewDate);
              // Check if date is valid
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              } else {
                formattedDate = '';
              }
            } catch {
              formattedDate = '';
            }
          } else {
            // Already in short format like "Nov 24"
            formattedDate = p.interviewDate;
          }
        }
        
        // Format usability date if it exists, otherwise leave empty
        let formattedUsabilityDate = '';
        if (p.usabilityDate && p.usabilityDate.trim()) {
          // Check if it's already in short format (e.g., "Nov 24") or needs formatting
          if (p.usabilityDate.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(p.usabilityDate)) {
            // It's an ISO date or YYYY-MM-DD date, format it
            try {
              const date = new Date(p.usabilityDate);
              // Check if date is valid
              if (!isNaN(date.getTime())) {
                formattedUsabilityDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              } else {
                formattedUsabilityDate = '';
              }
            } catch {
              formattedUsabilityDate = '';
            }
          } else {
            // Already in short format like "Nov 24"
            formattedUsabilityDate = p.usabilityDate;
          }
        }
        
        return {
          id: anonymousId,
          name: p.name,
          segment,
          role: p.role || '',
          date: formattedDate,
          time: p.interviewTime,
          usabilityDate: formattedUsabilityDate,
          usabilityTime: p.usabilityTime,
          status: p.status || 'scheduled', // Use the actual status from the participant
          susScore: p.susScore,
          npsScore: p.npsScore,
          interviewCompleted: p.interviewCompleted || false,
          usabilityCompleted: p.usabilityCompleted || false,
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
        setResearchQuestions(newData.researchQuestions || []);
        setEmptyClusters(newData.clusters || []);
      } else {
        setStickyNotes(data.notes);
        setHypotheses(data.hypotheses);
        
        // Set research questions (no default fallback)
        setResearchQuestions(data.researchQuestions || []);
        setEmptyClusters(data.clusters || []);
      }
    } catch (error) {
      console.error("Error loading synthesis data:", error);
      toast.error("Failed to load synthesis data");
    } finally {
      setLoading(false);
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
        <div className="flex items-center gap-4 flex-wrap flex-1 w-full sm:w-auto">
          <span className="text-sm text-slate-600">Filter by:</span>
          <Select value={filterSegment} onValueChange={setFilterSegment}>
            <SelectTrigger className="w-full sm:w-[150px]">
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
            <SelectTrigger className="w-full sm:w-[140px]">
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
          <span className="text-sm text-slate-600 sm:ml-4">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[150px]">
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
          onUpdate={loadData}
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
          <div className="text-sm text-slate-500 w-full lg:w-auto">
            <span>Research Progress</span>
            <div className="mt-1 h-2 w-full lg:w-48 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{
                  width: `${participants.length > 0 ? (participants.filter((p) => p.status === "completed").length / participants.length) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <span className="text-xs">
              {participants.filter((p) => p.status === "completed").length} of{" "}
              {participants.length} sessions complete
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <MetricsDashboard participants={participants} />

      {/* NPS Chart */}
      <NPSTable 
        participants={participants}
        projectId={projectId}
        onUpdate={loadData}
      />

      {/* SUS Chart */}
      <SUSChart 
        participants={participants}
      />
    </div>
  );
}