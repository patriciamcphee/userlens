import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "./ui/tooltip";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Target,
  ListTodo,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Lightbulb
} from "lucide-react";
import { api } from "../utils/api";
import { toast } from "sonner";
import { Project, Task, Hypothesis, ResearchQuestion } from "../types";
import {
  buildHypothesisCoverage,
  calculatePlanningMetrics,
  checkSegmentAlignment,
  getTasksForHypothesis,
  getOrphanedTasks,
  HypothesisCoverage,
  PlanningMetrics,
  SegmentAlignmentIssue,
} from "../utils/coverageUtils";
import { ResearchHelpPanel } from "./ResearchHelpPanel";

interface CoverageTabProps {
  project: Project;
  onUpdate: () => void;
}

// Priority badge styling
const priorityConfig = {
  high: { bg: 'bg-red-100', text: 'text-red-800', label: 'High' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Med' },
  low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Low' },
};

// Difficulty badge styling
const difficultyConfig = {
  easy: { bg: 'bg-green-100', text: 'text-green-700', label: 'Easy' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' },
  hard: { bg: 'bg-red-100', text: 'text-red-700', label: 'Hard' },
  all: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'All' },
};

// Coverage status styling
const coverageConfig = {
  none: { 
    icon: XCircle, 
    bg: 'bg-red-50', 
    border: 'border-red-200',
    text: 'text-red-700',
    label: 'No Coverage'
  },
  partial: { 
    icon: AlertCircle, 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    label: 'Partial Coverage'
  },
  full: { 
    icon: CheckCircle2, 
    bg: 'bg-green-50', 
    border: 'border-green-200',
    text: 'text-green-700',
    label: 'Full Coverage'
  },
};

// Task link status (how many hypotheses a task is linked to)
const taskLinkConfig = {
  none: { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-500' },
  some: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  many: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
};

export function CoverageTab({ project, onUpdate }: CoverageTabProps) {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [researchQuestions, setResearchQuestions] = useState<ResearchQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['matrix', 'coverage']));

  const tasks = project.tasks || [];

  // Load hypotheses data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const synthesisResponse = await api.getSynthesisData(project.id);
        setHypotheses(synthesisResponse.hypotheses || []);
        setResearchQuestions(synthesisResponse.questions || []);
      } catch (error) {
        console.error('Error loading coverage data:', error);
        toast.error('Failed to load coverage data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [project.id]);

  // Compute coverage and metrics
  const coverage = useMemo(() => 
    buildHypothesisCoverage(hypotheses, tasks), 
    [hypotheses, tasks]
  );
  
  const metrics = useMemo(() => 
    calculatePlanningMetrics(hypotheses, tasks), 
    [hypotheses, tasks]
  );

  const orphanedTasks = useMemo(() => 
    getOrphanedTasks(tasks), 
    [tasks]
  );

  // Toggle task-hypothesis link
  const handleToggleLink = async (taskId: string, hypothesisId: string, currentlyLinked: boolean) => {
    try {
      const task = tasks.find(t => String(t.id) === taskId);
      if (!task) return;

      const currentHypothesisIds = task.hypothesisIds || [];
      const newHypothesisIds = currentlyLinked
        ? currentHypothesisIds.filter(id => id !== hypothesisId)
        : [...currentHypothesisIds, hypothesisId];

      await api.updateTaskInProject(project.id, taskId, {
        ...task,
        hypothesisIds: newHypothesisIds,
      });

      toast.success(currentlyLinked ? 'Link removed' : 'Link added');
      onUpdate();
    } catch (error) {
      console.error('Error toggling link:', error);
      toast.error('Failed to update link');
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Helper to get task link status styling
  const getTaskLinkStatus = (linkedCount: number) => {
    if (linkedCount === 0) return taskLinkConfig.none;
    if (linkedCount >= 3) return taskLinkConfig.many;
    return taskLinkConfig.some;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-600">Loading coverage data...</div>
      </div>
    );
  }

  if (hypotheses.length === 0 && tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Research Plan Yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Add hypotheses and tasks to start building your research plan. 
              The coverage matrix helps you ensure every hypothesis has tasks to test it.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => window.location.href = `/app/project/${project.id}/hypotheses`}>
                Add Hypotheses
              </Button>
              <Button onClick={() => window.location.href = `/app/project/${project.id}/tasks`}>
                Add Tasks
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Help */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Coverage Planning</h2>
          <p className="text-sm text-slate-600 mt-1">
            Ensure your tasks adequately test your hypotheses across all user segments
          </p>
        </div>
        <ResearchHelpPanel defaultTab="coverage" />
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{metrics.coveragePercentage}%</p>
                <p className="text-sm text-slate-600 mt-1">Hypothesis Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {metrics.hypothesesWithTasks}/{metrics.totalHypotheses}
                </p>
                <p className="text-sm text-slate-600 mt-1">Hypotheses with Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ListTodo className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {metrics.tasksLinkedToHypotheses}/{metrics.totalTasks}
                </p>
                <p className="text-sm text-slate-600 mt-1">Tasks Linked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${metrics.alignmentIssues > 0 ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                <AlertTriangle className={`w-6 h-6 ${metrics.alignmentIssues > 0 ? 'text-yellow-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{metrics.alignmentIssues}</p>
                <p className="text-sm text-slate-600 mt-1">Alignment Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task-Hypothesis Matrix */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-slate-50 transition-colors py-5"
          onClick={() => toggleSection('matrix')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {expandedSections.has('matrix') ? (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500" />
              )}
              <CardTitle className="text-lg">Task-Hypothesis Matrix</CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-5 h-5 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs z-50">
                  <p>Check boxes to link tasks to the hypotheses they validate. Yellow warnings indicate segment misalignment between task difficulty and hypothesis targets.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription className="mt-2 ml-8">
            Map each task to the hypotheses it helps validate
          </CardDescription>
        </CardHeader>
        
        {expandedSections.has('matrix') && (
          <CardContent className="pt-2 pb-6">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ListTodo className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                <p className="text-base">No tasks created yet. Add tasks to build your matrix.</p>
              </div>
            ) : hypotheses.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Target className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                <p className="text-base">No hypotheses created yet. Add hypotheses to build your matrix.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {/* Task column header (sticky left) */}
                      <th className="text-left p-4 bg-slate-50 border-b font-medium text-slate-700 min-w-[240px] sticky left-0 z-10">
                        Task
                      </th>
                      {/* Hypothesis column headers */}
                      {hypotheses.map((hypothesis, index) => {
                        const hypothesisCoverage = coverage.find(c => c.hypothesisId === hypothesis.id);
                        const statusConfig = coverageConfig[hypothesisCoverage?.coverageStatus || 'none'];
                        
                        return (
                          <th 
                            key={hypothesis.id} 
                            className="p-4 bg-slate-50 border-b text-center min-w-[120px]"
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex flex-col items-center gap-2 cursor-help">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-indigo-600">H{index + 1}</span>
                                      {hypothesis.priority && (
                                        <span className={`w-2.5 h-2.5 rounded-full ${
                                          hypothesis.priority === 'high' ? 'bg-red-500' :
                                          hypothesis.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`} />
                                      )}
                                    </div>
                                    <span className="text-xs text-slate-600 truncate max-w-[100px] leading-tight">
                                      {hypothesis.hypothesis.slice(0, 30)}...
                                    </span>
                                    {hypothesis.segments && hypothesis.segments.length > 0 && (
                                      <div className="flex flex-wrap justify-center gap-1 mt-1">
                                        {hypothesis.segments.slice(0, 2).map(seg => (
                                          <Badge 
                                            key={seg} 
                                            variant="outline" 
                                            className="text-[10px] px-1.5 py-0.5 bg-blue-50 border-blue-200 text-blue-700"
                                          >
                                            {seg.length > 8 ? seg.slice(0, 8) + '…' : seg}
                                          </Badge>
                                        ))}
                                        {hypothesis.segments.length > 2 && (
                                          <span className="text-[10px] text-slate-400">
                                            +{hypothesis.segments.length - 2}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white z-50">
                                  <p className="font-medium text-white">{hypothesis.hypothesis}</p>
                                  {hypothesis.segments && hypothesis.segments.length > 0 && (
                                    <p className="text-xs text-slate-300 mt-2">
                                      Targets: {hypothesis.segments.join(', ')}
                                    </p>
                                  )}
                                  <p className={`text-xs mt-2 font-medium ${
                                    hypothesisCoverage?.coverageStatus === 'full' ? 'text-green-400' :
                                    hypothesisCoverage?.coverageStatus === 'partial' ? 'text-yellow-400' : 'text-red-400'
                                  }`}>
                                    {statusConfig.label} ({hypothesisCoverage?.linkedTasks.length || 0} tasks)
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </th>
                        );
                      })}
                      {/* Linked count column */}
                      <th className="p-4 bg-slate-50 border-b text-center min-w-[80px]">
                        <span className="text-sm font-medium text-slate-700">Links</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, tIndex) => {
                      const linkedHypothesesCount = task.hypothesisIds?.length || 0;
                      const linkStatus = getTaskLinkStatus(linkedHypothesesCount);
                      const diffConfig = difficultyConfig[task.difficulty || 'medium'];

                      return (
                        <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                          {/* Task info cell (sticky left) */}
                          <td className="p-4 border-b sticky left-0 bg-white z-10">
                            <div className="flex items-start gap-3">
                              <span className="text-sm font-semibold text-purple-600 mt-0.5">T{tIndex + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 line-clamp-1">
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                  {task.difficulty && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs px-2 py-0.5 ${diffConfig.bg} ${diffConfig.text} border-0`}
                                    >
                                      {diffConfig.label}
                                    </Badge>
                                  )}
                                  {task.estimatedTime && (
                                    <span className="text-xs text-slate-500">
                                      {task.estimatedTime}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Checkbox cells for each hypothesis */}
                          {hypotheses.map(hypothesis => {
                            const isLinked = task.hypothesisIds?.includes(hypothesis.id) || false;
                            const alignmentIssue = isLinked 
                              ? checkSegmentAlignment(task, hypothesis) 
                              : null;

                            return (
                              <td key={hypothesis.id} className="p-4 border-b text-center">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-center">
                                        <div className="relative">
                                          <Checkbox
                                            checked={isLinked}
                                            onCheckedChange={() => 
                                              handleToggleLink(String(task.id), hypothesis.id, isLinked)
                                            }
                                            className={`h-5 w-5 ${alignmentIssue ? 'border-yellow-500' : ''}`}
                                          />
                                          {alignmentIssue && (
                                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 absolute -top-1.5 -right-1.5" />
                                          )}
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    {alignmentIssue && (
                                      <TooltipContent side="top" className="max-w-xs z-50">
                                        <div className="flex items-start gap-2">
                                          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                          <p className="text-sm">{alignmentIssue.message}</p>
                                        </div>
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                            );
                          })}
                          
                          {/* Linked count cell */}
                          <td className="p-4 border-b text-center">
                            <div className={`inline-flex items-center justify-center min-w-[32px] px-2.5 py-1 rounded-full ${linkStatus.bg} ${linkStatus.border} border`}>
                              <span className={`text-sm font-medium ${linkStatus.text}`}>
                                {linkedHypothesesCount}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Coverage Details (Hypothesis-focused) */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-slate-50 transition-colors py-5"
          onClick={() => toggleSection('coverage')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {expandedSections.has('coverage') ? (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500" />
              )}
              <CardTitle className="text-lg">Hypothesis Coverage Analysis</CardTitle>
            </div>
          </div>
          <CardDescription className="mt-2 ml-8">
            Detailed view of each hypothesis's task coverage and alignment issues
          </CardDescription>
        </CardHeader>
        
        {expandedSections.has('coverage') && (
          <CardContent className="pt-2 pb-6">
            <div className="space-y-5">
              {coverage.map((item, index) => {
                const statusConfig = coverageConfig[item.coverageStatus];
                const StatusIcon = statusConfig.icon;

                return (
                  <div 
                    key={item.hypothesisId}
                    className={`p-5 rounded-lg border ${statusConfig.border} ${statusConfig.bg}`}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-indigo-600">H{index + 1}</span>
                          <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
                          {item.priority && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-2 py-0.5 ${priorityConfig[item.priority].bg} ${priorityConfig[item.priority].text} border-0`}
                            >
                              {priorityConfig[item.priority].label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-base font-medium text-slate-900">{item.hypothesis}</p>
                        
                        {item.segments.length > 0 && (
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="text-sm text-slate-500">Segments:</span>
                            {item.segments.map(seg => (
                              <Badge key={seg} variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 border-blue-200 text-blue-700">
                                {seg}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {item.linkedTasks.length > 0 && (
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="text-sm text-slate-500">Linked tasks:</span>
                            {item.linkedTasks.map((task) => (
                              <Badge key={task.id} variant="secondary" className="text-xs px-2 py-0.5">
                                T{tasks.findIndex(t => t.id === task.id) + 1}: {task.title}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {item.segmentAlignmentIssues.length > 0 && (
                          <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-800">
                                Alignment Issues ({item.segmentAlignmentIssues.length})
                              </span>
                            </div>
                            <ul className="text-sm text-yellow-700 space-y-1.5">
                              {item.segmentAlignmentIssues.map((issue, i) => (
                                <li key={i}>• {issue.message}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className={`text-base font-medium ${statusConfig.text}`}>
                          {statusConfig.label}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {item.linkedTasks.length} task{item.linkedTasks.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Orphaned Tasks */}
      {orphanedTasks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="py-5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <CardTitle className="text-lg text-orange-900">Unlinked Tasks</CardTitle>
            </div>
            <CardDescription className="text-orange-700 mt-2 ml-9">
              These tasks aren't linked to any hypothesis. Consider linking them or removing if not needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            <div className="flex flex-wrap gap-3 ml-9">
              {orphanedTasks.map((task) => (
                <Badge 
                  key={task.id} 
                  variant="outline" 
                  className="bg-white border-orange-300 text-orange-800 px-3 py-1.5 text-sm"
                >
                  T{tasks.findIndex(t => t.id === task.id) + 1}: {task.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}