// utils/taskFiltering.ts
import { Task, Project } from '../types';

/**
 * Get the tasks that a participant should see based on their usage level
 * 
 * Priority order:
 * 1. Use project-specific assignment if exists
 * 2. Otherwise, return all tasks (participant sees everything)
 */
// utils/taskFiltering.ts
// utils/taskFiltering.ts
export function getTasksForParticipant(
  project: Project,
  participantId: number
): Task[] {
  // Find the participant's assignment in this project
  const assignment = project.participantAssignments?.find(
    a => a.participantId === participantId
  );

  // If no assignment found, return all tasks (backwards compatibility)
  if (!assignment) {
    return project.setup.tasks;
  }

  // ✅ FIXED: Exclusive filtering - each level sees ONLY their tasks (+ "all" tasks)
  return project.setup.tasks.filter(task => {
    // Tasks marked as 'all' are shown to everyone
    if (task.difficulty === 'all') {
      return true;
    }

    // Exclusive matching: only show tasks that match the user's exact level
    switch (assignment.usageLevel) {
      case 'non-user':
        // Non-users ONLY see easy tasks
        return task.difficulty === 'easy';
      
      case 'occasionally':
        // Occasional users ONLY see medium tasks
        return task.difficulty === 'medium';
      
      case 'active':
        // Active users ONLY see hard tasks
        return task.difficulty === 'hard';
      
      default:
        return true;
    }
  });
}

/**
 * Get human-readable label for usage level
 */
export function getUsageLevelLabel(level: 'active' | 'occasionally' | 'non-user'): string {
  switch (level) {
    case 'active':
      return 'Active User';
    case 'occasionally':
      return 'Occasional User';
    case 'non-user':
      return 'Non-User';
    default:
      return 'Unknown';
  }
}

/**
 * Get tasks appropriate for a participant's usage level
 * - Non-users see easy tasks
 * - Occasional users see easy + medium tasks
 * - Active users see all tasks
 */
export function getTasksForUsageLevel(
  tasks: any[],
  usageLevel: 'active' | 'occasionally' | 'non-user'
): any[] {
  return tasks.filter(task => {
    // "All Users" tasks shown to everyone
    if (task.difficulty === 'all') {
      return true;
    }
    
    // Exclusive matching
    switch (usageLevel) {
      case 'non-user':
        return task.difficulty === 'easy';
      case 'occasionally':
        return task.difficulty === 'medium';
      case 'active':
        return task.difficulty === 'hard';
      default:
        return true;
    }
  });
}

/**
 * Check if a participant should see a specific task based on their usage level
 */
export function shouldShowTask(
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'all',
  usageLevel: 'active' | 'occasionally' | 'non-user'
): boolean {
  // "All Users" tasks shown to everyone
  if (taskDifficulty === 'all') {
    return true;
  }
  
  // Exclusive matching
  switch (usageLevel) {
    case 'non-user':
      return taskDifficulty === 'easy';
    case 'occasionally':
      return taskDifficulty === 'medium';
    case 'active':
      return taskDifficulty === 'hard';
    default:
      return true;
  }
}

/**
 * Get difficulty label for display
 */
export function getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
  const labels = {
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard'
  };
  return labels[difficulty];
}

/**
 * Get the icon class for a usage level
 */
export function getUsageLevelColor(usageLevel: 'active' | 'occasionally' | 'non-user'): {
  bg: string;
  text: string;
  border: string;
} {
  const colors = {
    'active': {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300'
    },
    'occasionally': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300'
    },
    'non-user': {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300'
    }
  };
  return colors[usageLevel];
}