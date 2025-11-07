// utils/dataDisplay.ts
import { Analytics, Session, Task } from '../types';

/**
 * Enhanced duration formatting with proper handling of 0 values
 */
export const formatDuration = {
  /**
   * Format seconds to human readable duration
   * Handles edge cases like 0 seconds, very short durations
   */
  seconds: (seconds: number): string => {
    if (seconds === 0 || seconds === undefined || seconds === null) {
      return '0s';
    }
    
    if (seconds < 1) {
      return '<1s';
    }
    
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      if (remainingSeconds === 0) {
        return `${minutes}m`;
      }
      return `${minutes}m ${Math.round(remainingSeconds)}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  },

  /**
   * Format duration for compact display (analytics cards, etc.)
   */
  compact: (seconds: number): string => {
    if (seconds === 0 || seconds === undefined || seconds === null) {
      return '0s';
    }
    
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  },

  /**
   * Format for detailed session reports
   */
  detailed: (seconds: number): string => {
    if (seconds === 0 || seconds === undefined || seconds === null) {
      return '0 seconds';
    }
    
    if (seconds < 60) {
      return seconds === 1 ? '1 second' : `${Math.round(seconds)} seconds`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      const minStr = minutes === 1 ? '1 minute' : `${minutes} minutes`;
      if (remainingSeconds === 0) {
        return minStr;
      }
      const secStr = remainingSeconds === 1 ? '1 second' : `${Math.round(remainingSeconds)} seconds`;
      return `${minStr} ${secStr}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hourStr = hours === 1 ? '1 hour' : `${hours} hours`;
    
    if (remainingMinutes === 0) {
      return hourStr;
    }
    const minStr = remainingMinutes === 1 ? '1 minute' : `${remainingMinutes} minutes`;
    return `${hourStr} ${minStr}`;
  }
};

/**
 * Enhanced empty state messages and handlers
 */
export const emptyStates = {
  projects: {
    title: 'No projects yet',
    description: 'Create your first testing project to get started with user research',
    action: 'Create Project',
    icon: 'LayoutDashboard'
  },

  participants: {
    title: 'No participants yet',
    description: 'Add participants to start running user testing sessions',
    action: 'Add Participant',
    icon: 'UserPlus'
  },

  sessions: {
    title: 'No sessions yet',
    description: 'Sessions will appear here once participants complete testing',
    action: null,
    icon: 'Activity'
  },

  tasks: {
    title: 'No tasks defined',
    description: 'Add tasks for participants to complete during testing sessions',
    action: 'Add Task',
    icon: 'CheckCircle'
  },

  analytics: {
    title: 'No session data yet',
    description: 'Analytics will appear here once participants complete sessions',
    action: null,
    icon: 'BarChart3'
  },

  feedback: {
    title: 'No feedback collected',
    description: 'Task feedback from participants will appear here after sessions',
    action: null,
    icon: 'MessageSquare'
  },

  savedSessions: {
    title: 'No saved sessions',
    description: 'Previously saved sessions will appear here for easy resumption',
    action: null,
    icon: 'Save'
  }
};

/**
 * Smart number formatting for analytics
 */
export const formatNumber = {
  /**
   * Format counts with proper pluralization
   */
  count: (count: number, singular: string, plural?: string): string => {
    const pluralForm = plural || `${singular}s`;
    if (count === 0) return `0 ${pluralForm}`;
    if (count === 1) return `1 ${singular}`;
    return `${count} ${pluralForm}`;
  },

  /**
   * Format percentages with proper handling of edge cases
   */
  percentage: (value: number, total: number): string => {
    if (total === 0) return '0%';
    const percentage = Math.round((value / total) * 100);
    return `${percentage}%`;
  },

  /**
   * Format large numbers with abbreviations (1K, 1M, etc.)
   */
  abbreviate: (num: number): string => {
    if (num === 0) return '0';
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${Math.round(num / 1000)}K`;
    if (num < 1000000000) return `${Math.round(num / 1000000)}M`;
    return `${Math.round(num / 1000000000)}B`;
  }
};

/**
 * Progress indicators and completion status
 */
export const formatProgress = {
  /**
   * Calculate and format session completion
   */
  sessionCompletion: (completed: number, total: number): {
    percentage: number;
    label: string;
    status: 'not-started' | 'in-progress' | 'completed';
  } => {
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    let status: 'not-started' | 'in-progress' | 'completed';
    if (completed === 0) {
      status = 'not-started';
    } else if (completed === total) {
      status = 'completed';
    } else {
      status = 'in-progress';
    }

    const label = `${completed} of ${total} tasks`;
    
    return { percentage, label, status };
  },

  /**
   * Format task progress with visual indicators
   */
  taskProgress: (currentTask: number, totalTasks: number): {
    current: number;
    total: number;
    percentage: number;
    label: string;
    isComplete: boolean;
  } => {
    const current = Math.max(1, currentTask + 1); // 1-indexed for display
    const percentage = Math.round((currentTask / totalTasks) * 100);
    const label = `Task ${current} of ${totalTasks}`;
    const isComplete = currentTask >= totalTasks;
    
    return {
      current,
      total: totalTasks,
      percentage,
      label,
      isComplete
    };
  }
};

/**
 * Data validation and sanitization
 */
export const sanitizeData = {
  /**
   * Ensure analytics data has safe default values
   */
  analytics: (analytics: Partial<Analytics>): Analytics => {
    return {
      totalSessions: analytics.totalSessions || 0,
      completedSessions: analytics.completedSessions || 0,
      completionRate: analytics.completionRate || 0,
      avgDuration: analytics.avgDuration || 0,
      avgClicks: analytics.avgClicks || 0,
      avgKeystrokes: analytics.avgKeystrokes || 0,
      videoUsage: analytics.videoUsage || 0,
      audioUsage: analytics.audioUsage || 0
    };
  },

  /**
   * Ensure session data is valid
   */
  session: (session: Partial<Session>): Session => {
    return {
      id: session.id || 0,
      participantId: session.participantId || 0,
      completedAt: session.completedAt || new Date().toISOString(),
      duration: Math.max(0, session.duration || 0),
      tasksCompleted: Math.max(0, session.tasksCompleted || 0),
      totalTasks: Math.max(1, session.totalTasks || 1),
      mouseClicks: Math.max(0, session.mouseClicks || 0),
      keystrokes: Math.max(0, session.keystrokes || 0),
      hasVideo: Boolean(session.hasVideo),
      hasAudio: Boolean(session.hasAudio),
      notes: session.notes || '',
      taskFeedback: session.taskFeedback || [],
      observations: session.observations || '',
      recordings: session.recordings
    };
  }
};

/**
 * Status and state display helpers
 */
export const formatStatus = {
  /**
   * Get display info for project status
   */
  project: (status: string) => {
    const statusMap = {
      'draft': {
        label: 'Draft',
        color: 'bg-gray-100 text-gray-700',
        icon: 'FileText',
        description: 'Project is being set up'
      },
      'active': {
        label: 'Active',
        color: 'bg-green-100 text-green-700',
        icon: 'Play',
        description: 'Project is ready for testing'
      },
      'completed': {
        label: 'Completed',
        color: 'bg-blue-100 text-blue-700',
        icon: 'CheckCircle',
        description: 'All testing sessions completed'
      },
      'archived': {
        label: 'Archived',
        color: 'bg-gray-100 text-gray-600',
        icon: 'Archive',
        description: 'Project has been archived'
      }
    };

    return statusMap[status] || statusMap['draft'];
  },

  /**
   * Get display info for session status
   */
  session: (session: Session) => {
    const isComplete = session.tasksCompleted >= session.totalTasks;
    const hasStarted = session.duration > 0;

    if (isComplete) {
      return {
        label: 'Completed',
        color: 'bg-green-100 text-green-700',
        icon: 'CheckCircle'
      };
    } else if (hasStarted) {
      return {
        label: 'In Progress',
        color: 'bg-yellow-100 text-yellow-700',
        icon: 'Play'
      };
    } else {
      return {
        label: 'Not Started',
        color: 'bg-gray-100 text-gray-600',
        icon: 'Circle'
      };
    }
  }
};

/**
 * Helper to generate placeholder data for empty states
 */
export const generatePlaceholder = {
  /**
   * Generate realistic demo data for empty analytics
   */
  analyticsDemo: (): Analytics => ({
    totalSessions: 0,
    completedSessions: 0,
    completionRate: 0,
    avgDuration: 0,
    avgClicks: 0,
    avgKeystrokes: 0,
    videoUsage: 0,
    audioUsage: 0
  }),

  /**
   * Generate example task structure
   */
  exampleTasks: (): Task[] => [
    {
      id: 'example-1',
      title: 'Example Task 1',
      description: 'This is what a task looks like',
      difficulty: 'medium',
      estimatedTime: '5-10 minutes'
    }
  ]
};