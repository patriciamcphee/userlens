// utils/taskFiltering.ts
import { Task, Project } from '../types';

/**
 * Get the tasks that a participant should see based on their usage level
 * 
 * FIXED: Exclusive filtering - Non-users see ONLY Easy tasks, 
 * Occasional users see ONLY Medium tasks, Active users see ONLY Hard tasks
 * (Plus "All Users" tasks are shown to everyone)
 */
export function getTasksForParticipant(
  project: Project,
  participantId: number | string
): Task[] {
  console.log('🔍 getTasksForParticipant called with:', {
    participantId,
    participantIdType: typeof participantId,
    projectAssignments: project.participantAssignments
  });

  // ✅ FIXED: Use String() comparison to handle both string and number IDs
  const assignment = project.participantAssignments?.find(
    a => String(a.participantId) === String(participantId)
  );

  console.log('📋 Assignment found:', assignment);

  // If no assignment found, return all tasks (backwards compatibility)
  if (!assignment) {
    console.warn('⚠️ No assignment found for participant, returning all tasks');
    return project.setup.tasks;
  }

  // ✅ EXCLUSIVE filtering: users only see tasks at their specific level (+ "all" tasks)
  const filteredTasks = project.setup.tasks.filter(task => {
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

  console.log('✅ Filtered tasks:', {
    usageLevel: assignment.usageLevel,
    totalTasks: project.setup.tasks.length,
    filteredCount: filteredTasks.length,
    tasksByDifficulty: {
      easy: filteredTasks.filter(t => t.difficulty === 'easy').length,
      medium: filteredTasks.filter(t => t.difficulty === 'medium').length,
      hard: filteredTasks.filter(t => t.difficulty === 'hard').length,
      all: filteredTasks.filter(t => t.difficulty === 'all').length
    }
  });

  return filteredTasks;
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
 * ✅ FIXED: Exclusive filtering
 */
export function getTasksForUsageLevel(
  tasks: any[],
  usageLevel: 'active' | 'occasionally' | 'non-user'
): any[] {
  return tasks.filter(task => {
    if (task.difficulty === 'all') {
      return true;
    }
    
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
 * ✅ FIXED: Exclusive filtering
 */
export function shouldShowTask(
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'all',
  usageLevel: 'active' | 'occasionally' | 'non-user'
): boolean {
  if (taskDifficulty === 'all') {
    return true;
  }
  
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