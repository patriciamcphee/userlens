// ===========================================
// TaskHypothesisSelector.tsx
// Multi-select component for linking tasks to hypotheses
// Add this to Step 1 of TaskEditor or create a new Step 5
// ===========================================

import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "./ui/tooltip";
import { 
  ChevronDown, 
  ChevronRight, 
  Target, 
  AlertTriangle,
  Info
} from "lucide-react";
import { Hypothesis } from "../types";
import { 
  checkSegmentAlignment, 
  DIFFICULTY_SEGMENT_MAP,
  TaskDifficulty 
} from "../utils/coverageUtils";

interface TaskHypothesisSelectorProps {
  selectedHypothesisIds: string[];
  onChange: (hypothesisIds: string[]) => void;
  hypotheses: Hypothesis[];
  taskDifficulty?: TaskDifficulty;
  loading?: boolean;
}

// Priority styling
const priorityConfig = {
  high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
};

// Status styling  
const statusConfig = {
  validated: { bg: 'bg-green-100', text: 'text-green-700' },
  disproven: { bg: 'bg-red-100', text: 'text-red-700' },
  unclear: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  testing: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export function TaskHypothesisSelector({
  selectedHypothesisIds,
  onChange,
  hypotheses,
  taskDifficulty = 'medium',
  loading = false,
}: TaskHypothesisSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(selectedHypothesisIds.length > 0);

  const handleToggle = (hypothesisId: string) => {
    const newSelection = selectedHypothesisIds.includes(hypothesisId)
      ? selectedHypothesisIds.filter(id => id !== hypothesisId)
      : [...selectedHypothesisIds, hypothesisId];
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    onChange(hypotheses.map(h => h.id));
  };

  const handleSelectNone = () => {
    onChange([]);
  };

  // Check alignment for a hypothesis with current task difficulty
  const getAlignmentWarning = (hypothesis: Hypothesis): string | null => {
    if (taskDifficulty === 'all') return null;
    if (!hypothesis.segments || hypothesis.segments.length === 0) return null;

    const mockTask = { 
      id: 'temp', 
      title: 'temp', 
      difficulty: taskDifficulty, 
      order: 0 
    };
    const issue = checkSegmentAlignment(mockTask, hypothesis);
    return issue?.message || null;
  };

  // Get suggested hypotheses based on segment alignment
  const suggestedHypotheses = hypotheses.filter(h => !getAlignmentWarning(h));
  const otherHypotheses = hypotheses.filter(h => getAlignmentWarning(h));

  if (loading) {
    return (
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 text-slate-500">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading hypotheses...</span>
        </div>
      </div>
    );
  }

  if (hypotheses.length === 0) {
    return (
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-sm text-slate-600">No hypotheses available</p>
            <p className="text-xs text-slate-500 mt-1">
              Create hypotheses in the Hypotheses tab to link them to tasks.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Link to Hypotheses</Label>
          <p className="text-xs text-slate-500 mt-0.5">
            Select which hypotheses this task helps validate
          </p>
        </div>
        {selectedHypothesisIds.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedHypothesisIds.length} selected
          </Badge>
        )}
      </div>

      {/* Current task difficulty indicator */}
      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs">
        <Info className="w-3 h-3 text-slate-400" />
        <span className="text-slate-600">
          Task difficulty: <span className="font-medium capitalize">{taskDifficulty}</span>
          {taskDifficulty !== 'all' && (
            <span className="text-slate-500">
              {' '}→ Best for {DIFFICULTY_SEGMENT_MAP[taskDifficulty]?.join(', ')}
            </span>
          )}
        </span>
      </div>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            type="button"
          >
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {isExpanded ? 'Hide hypotheses' : 'Select hypotheses'}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <div className="border rounded-lg overflow-hidden">
            {/* Quick actions */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b">
              <span className="text-xs text-slate-600">
                {hypotheses.length} hypothesis{hypotheses.length !== 1 ? 'es' : ''} available
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={handleSelectAll}
                  type="button"
                >
                  Select All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={handleSelectNone}
                  type="button"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Suggested hypotheses (good segment alignment) */}
            {suggestedHypotheses.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-green-50 border-b border-green-100">
                  <span className="text-xs font-medium text-green-700">
                    Suggested (good segment alignment)
                  </span>
                </div>
                <div className="divide-y max-h-[200px] overflow-y-auto">
                  {suggestedHypotheses.map((hypothesis, index) => (
                    <HypothesisRow
                      key={hypothesis.id}
                      hypothesis={hypothesis}
                      index={hypotheses.findIndex(h => h.id === hypothesis.id)}
                      isSelected={selectedHypothesisIds.includes(hypothesis.id)}
                      onToggle={() => handleToggle(hypothesis.id)}
                      alignmentWarning={null}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other hypotheses (potential alignment issues) */}
            {otherHypotheses.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-yellow-50 border-b border-t border-yellow-100">
                  <span className="text-xs font-medium text-yellow-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Other (segment mismatch)
                  </span>
                </div>
                <div className="divide-y max-h-[150px] overflow-y-auto">
                  {otherHypotheses.map((hypothesis) => (
                    <HypothesisRow
                      key={hypothesis.id}
                      hypothesis={hypothesis}
                      index={hypotheses.findIndex(h => h.id === hypothesis.id)}
                      isSelected={selectedHypothesisIds.includes(hypothesis.id)}
                      onToggle={() => handleToggle(hypothesis.id)}
                      alignmentWarning={getAlignmentWarning(hypothesis)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Selected summary */}
      {selectedHypothesisIds.length > 0 && !isExpanded && (
        <div className="flex flex-wrap gap-1">
          {selectedHypothesisIds.map(id => {
            const hypothesis = hypotheses.find(h => h.id === id);
            const hasWarning = hypothesis && getAlignmentWarning(hypothesis);
            return hypothesis ? (
              <Badge 
                key={id} 
                variant="outline" 
                className={`text-xs ${hasWarning ? 'border-yellow-300 bg-yellow-50' : ''}`}
              >
                {hasWarning && <AlertTriangle className="w-2 h-2 mr-1 text-yellow-600" />}
                H{hypotheses.findIndex(h => h.id === id) + 1}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

// Individual hypothesis row component
interface HypothesisRowProps {
  hypothesis: Hypothesis;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
  alignmentWarning: string | null;
}

function HypothesisRow({ 
  hypothesis, 
  index, 
  isSelected, 
  onToggle, 
  alignmentWarning 
}: HypothesisRowProps) {
  const priority = hypothesis.priority && priorityConfig[hypothesis.priority];
  const status = hypothesis.status && statusConfig[hypothesis.status];

  return (
    <label 
      className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
        isSelected ? 'bg-indigo-50' : ''
      }`}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-slate-500">H{index + 1}</span>
          {priority && (
            <Badge 
              variant="outline" 
              className={`text-[10px] px-1.5 py-0 ${priority.bg} ${priority.text} border-0`}
            >
              {hypothesis.priority}
            </Badge>
          )}
          {status && (
            <Badge 
              variant="outline" 
              className={`text-[10px] px-1.5 py-0 ${status.bg} ${status.text} border-0`}
            >
              {hypothesis.status}
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-900 line-clamp-2">{hypothesis.hypothesis}</p>
        
        {hypothesis.segments && hypothesis.segments.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {hypothesis.segments.map(seg => (
              <Badge key={seg} variant="outline" className="text-[10px] px-1.5 py-0">
                {seg}
              </Badge>
            ))}
          </div>
        )}

        {alignmentWarning && isSelected && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 mt-2 text-yellow-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">Segment mismatch</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-xs">{alignmentWarning}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </label>
  );
}