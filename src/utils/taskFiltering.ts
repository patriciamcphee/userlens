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

  // Progressive filtering: users can do tasks at or below their level
  return project.setup.tasks.filter(task => {
    // Tasks marked as 'all' are shown to everyone
    if (task.difficulty === 'all') {
      return true;
    }

    // Progressive access based on usage level
    switch (assignment.usageLevel) {
      case 'non-user':
        // Non-users only see easy tasks
        return task.difficulty === 'easy';
      
      case 'occasionally':
        // Occasional users see easy + medium tasks
        return task.difficulty === 'easy' || task.difficulty === 'medium';
      
      case 'active':
        // Active users see all tasks (easy + medium + hard)
        return true;
      
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
  switch (usageLevel) {
    case 'non-user':
      return tasks.filter(task => task.difficulty === 'easy');
    case 'occasionally':
      return tasks.filter(task => task.difficulty === 'easy' || task.difficulty === 'medium');
    case 'active':
      return tasks; // See all tasks
    default:
      return tasks;
  }
}

/**
 * Check if a participant should see a specific task based on their usage level
 */
export function shouldShowTask(
  taskDifficulty: 'easy' | 'medium' | 'hard',
  usageLevel: 'active' | 'occasionally' | 'non-user'
): boolean {
  switch (usageLevel) {
    case 'non-user':
      return taskDifficulty === 'easy';
    case 'occasionally':
      return taskDifficulty === 'easy' || taskDifficulty === 'medium';
    case 'active':
      return true; // See all tasks
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