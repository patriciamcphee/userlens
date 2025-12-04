// ===========================================
// coverageUtils.ts
// Utility functions for Hypothesis-Task coverage analysis
// ===========================================

import { Task, Hypothesis } from '../types';

// Types
export type SegmentType = 'Non-Users' | 'Abandoned' | 'Occasional' | 'Active' | 'Power Users';
export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'all';

export interface SegmentAlignmentIssue {
  taskId: string;
  taskTitle: string;
  taskDifficulty: TaskDifficulty;
  hypothesisSegments: string[];
  message: string;
}

export interface HypothesisCoverage {
  hypothesisId: string;
  hypothesis: string;
  priority?: 'high' | 'medium' | 'low';
  segments: string[];
  linkedTaskIds: string[];
  linkedTasks: Task[];
  coverageStatus: 'none' | 'partial' | 'full';
  segmentAlignmentIssues: SegmentAlignmentIssue[];
}

export interface PlanningMetrics {
  totalHypotheses: number;
  hypothesesWithTasks: number;
  hypothesesWithoutTasks: number;
  totalTasks: number;
  tasksLinkedToHypotheses: number;
  orphanedTasks: number;
  alignmentIssues: number;
  coveragePercentage: number;
}

// ===========================================
// SEGMENT-DIFFICULTY MAPPING
// ===========================================

export const DIFFICULTY_SEGMENT_MAP: Record<TaskDifficulty, SegmentType[]> = {
  easy: ['Non-Users', 'Abandoned'],
  medium: ['Occasional'],
  hard: ['Active', 'Power Users'],
  all: ['Non-Users', 'Abandoned', 'Occasional', 'Active', 'Power Users'],
};

export const SEGMENT_DIFFICULTY_MAP: Record<SegmentType, TaskDifficulty[]> = {
  'Non-Users': ['easy', 'all'],
  'Abandoned': ['easy', 'all'],
  'Occasional': ['medium', 'all'],
  'Active': ['hard', 'all'],
  'Power Users': ['hard', 'all'],
};

// Normalize segment names for comparison
const normalizeSegment = (segment: string): string => {
  return segment.toLowerCase().replace(/[-_\s]/g, '');
};

// Check if two segments match (handles variations like "Non-Users" vs "non-user")
const segmentsMatch = (seg1: string, seg2: string): boolean => {
  const norm1 = normalizeSegment(seg1);
  const norm2 = normalizeSegment(seg2);
  
  // Handle singular/plural variations
  const variations: Record<string, string[]> = {
    'nonuser': ['nonuser', 'nonusers'],
    'poweruser': ['poweruser', 'powerusers'],
    'active': ['active', 'activeuser', 'activeusers'],
    'occasional': ['occasional', 'occasionaluser', 'occasionalusers'],
    'abandoned': ['abandoned', 'abandoneduser', 'abandonedusers'],
  };
  
  for (const [, variants] of Object.entries(variations)) {
    if (variants.includes(norm1) && variants.includes(norm2)) {
      return true;
    }
  }
  
  return norm1 === norm2;
};

// ===========================================
// COMPUTED RELATIONSHIPS
// ===========================================

/**
 * Get all tasks that are linked to a specific hypothesis
 */
export const getTasksForHypothesis = (hypothesisId: string, tasks: Task[]): Task[] => {
  return tasks.filter(task => task.hypothesisIds?.includes(hypothesisId));
};

/**
 * Get all hypotheses that a task is linked to
 */
export const getHypothesesForTask = (taskId: string, tasks: Task[], hypotheses: Hypothesis[]): Hypothesis[] => {
  const task = tasks.find(t => String(t.id) === String(taskId));
  if (!task?.hypothesisIds) return [];
  
  return hypotheses.filter(h => task.hypothesisIds?.includes(h.id));
};

/**
 * Get tasks that aren't linked to any hypothesis
 */
export const getOrphanedTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => !task.hypothesisIds || task.hypothesisIds.length === 0);
};

/**
 * Get hypotheses that don't have any linked tasks
 */
export const getUncoveredHypotheses = (hypotheses: Hypothesis[], tasks: Task[]): Hypothesis[] => {
  return hypotheses.filter(hypothesis => {
    const linkedTasks = getTasksForHypothesis(hypothesis.id, tasks);
    return linkedTasks.length === 0;
  });
};

// ===========================================
// SEGMENT ALIGNMENT CHECKING
// ===========================================

/**
 * Check if a task's difficulty aligns with a hypothesis's target segments
 */
export const checkSegmentAlignment = (
  task: Task,
  hypothesis: Hypothesis
): SegmentAlignmentIssue | null => {
  const taskDifficulty = (task.difficulty || 'medium') as TaskDifficulty;
  const hypothesisSegments = hypothesis.segments || [];
  
  // If task is 'all' difficulty, it's always aligned
  if (taskDifficulty === 'all') return null;
  
  // If hypothesis has no segments defined, skip alignment check
  if (hypothesisSegments.length === 0) return null;
  
  // Get segments that the task difficulty is appropriate for
  const appropriateSegments = DIFFICULTY_SEGMENT_MAP[taskDifficulty] || [];
  
  // Check if ANY of the hypothesis segments align with the task difficulty
  const hasAlignment = hypothesisSegments.some(hypSeg => 
    appropriateSegments.some(appSeg => segmentsMatch(hypSeg, appSeg))
  );
  
  if (!hasAlignment) {
    return {
      taskId: String(task.id),
      taskTitle: task.title,
      taskDifficulty,
      hypothesisSegments,
      message: `Task difficulty "${taskDifficulty}" targets ${appropriateSegments.join(', ')}, but hypothesis targets ${hypothesisSegments.join(', ')}.`,
    };
  }
  
  return null;
};

/**
 * Get all alignment issues for a hypothesis
 */
export const getAlignmentIssuesForHypothesis = (
  hypothesis: Hypothesis,
  tasks: Task[]
): SegmentAlignmentIssue[] => {
  const linkedTasks = getTasksForHypothesis(hypothesis.id, tasks);
  const issues: SegmentAlignmentIssue[] = [];
  
  for (const task of linkedTasks) {
    const issue = checkSegmentAlignment(task, hypothesis);
    if (issue) {
      issues.push(issue);
    }
  }
  
  return issues;
};

// ===========================================
// COVERAGE ANALYSIS
// ===========================================

/**
 * Determine coverage status for a hypothesis
 */
const getCoverageStatus = (
  linkedTasks: Task[],
  alignmentIssues: SegmentAlignmentIssue[]
): 'none' | 'partial' | 'full' => {
  if (linkedTasks.length === 0) return 'none';
  if (alignmentIssues.length > 0) return 'partial';
  if (linkedTasks.length >= 2) return 'full'; // Arbitrary: 2+ well-aligned tasks = full coverage
  return 'partial';
};

/**
 * Build complete coverage analysis for all hypotheses
 */
export const buildHypothesisCoverage = (
  hypotheses: Hypothesis[],
  tasks: Task[]
): HypothesisCoverage[] => {
  return hypotheses.map(hypothesis => {
    const linkedTasks = getTasksForHypothesis(hypothesis.id, tasks);
    const alignmentIssues = getAlignmentIssuesForHypothesis(hypothesis, tasks);
    
    return {
      hypothesisId: hypothesis.id,
      hypothesis: hypothesis.hypothesis,
      priority: hypothesis.priority,
      segments: hypothesis.segments || [],
      linkedTaskIds: linkedTasks.map(t => String(t.id)),
      linkedTasks,
      coverageStatus: getCoverageStatus(linkedTasks, alignmentIssues),
      segmentAlignmentIssues: alignmentIssues,
    };
  });
};

/**
 * Calculate overall planning metrics
 */
export const calculatePlanningMetrics = (
  hypotheses: Hypothesis[],
  tasks: Task[]
): PlanningMetrics => {
  const coverage = buildHypothesisCoverage(hypotheses, tasks);
  
  const hypothesesWithTasks = coverage.filter(c => c.linkedTasks.length > 0).length;
  const tasksWithHypotheses = tasks.filter(t => t.hypothesisIds && t.hypothesisIds.length > 0).length;
  const totalAlignmentIssues = coverage.reduce((sum, c) => sum + c.segmentAlignmentIssues.length, 0);
  
  return {
    totalHypotheses: hypotheses.length,
    hypothesesWithTasks,
    hypothesesWithoutTasks: hypotheses.length - hypothesesWithTasks,
    totalTasks: tasks.length,
    tasksLinkedToHypotheses: tasksWithHypotheses,
    orphanedTasks: tasks.length - tasksWithHypotheses,
    alignmentIssues: totalAlignmentIssues,
    coveragePercentage: hypotheses.length > 0 
      ? Math.round((hypothesesWithTasks / hypotheses.length) * 100) 
      : 0,
  };
};

// ===========================================
// MATRIX DATA HELPERS
// ===========================================

export interface MatrixCell {
  hypothesisId: string;
  taskId: string;
  isLinked: boolean;
  hasAlignmentIssue: boolean;
  alignmentIssue?: SegmentAlignmentIssue;
}

/**
 * Build matrix data for the planning grid
 */
export const buildMatrixData = (
  hypotheses: Hypothesis[],
  tasks: Task[]
): MatrixCell[][] => {
  return hypotheses.map(hypothesis => {
    return tasks.map(task => {
      const isLinked = task.hypothesisIds?.includes(hypothesis.id) || false;
      const alignmentIssue = isLinked ? checkSegmentAlignment(task, hypothesis) : null;
      
      return {
        hypothesisId: hypothesis.id,
        taskId: String(task.id),
        isLinked,
        hasAlignmentIssue: alignmentIssue !== null,
        alignmentIssue: alignmentIssue || undefined,
      };
    });
  });
};

/**
 * Get suggested tasks for a hypothesis based on segment alignment
 */
export const getSuggestedTasksForHypothesis = (
  hypothesis: Hypothesis,
  tasks: Task[]
): Task[] => {
  const hypothesisSegments = hypothesis.segments || [];
  if (hypothesisSegments.length === 0) return tasks; // All tasks are valid if no segments specified
  
  // Find tasks that aren't already linked and have good segment alignment
  return tasks.filter(task => {
    // Skip already linked tasks
    if (task.hypothesisIds?.includes(hypothesis.id)) return false;
    
    const taskDifficulty = (task.difficulty || 'medium') as TaskDifficulty;
    
    // 'all' difficulty tasks are always suggested
    if (taskDifficulty === 'all') return true;
    
    // Check if task difficulty aligns with any hypothesis segment
    const appropriateSegments = DIFFICULTY_SEGMENT_MAP[taskDifficulty] || [];
    return hypothesisSegments.some(hypSeg => 
      appropriateSegments.some(appSeg => segmentsMatch(hypSeg, appSeg))
    );
  });
};