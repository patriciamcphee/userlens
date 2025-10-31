// types/index.ts
export interface TaskQuestion {
  id: number;
  question: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'yes-no'; // Added 'yes-no'
  options?: string[]; // For multiple-choice and checkbox
  required?: boolean;
}

export interface Task {
  id: number;
  title: string;
  // Legacy field kept for backwards compatibility
  description?: string;
  // New structured fields
  estimatedTime?: string;
  objective?: string;
  scenario?: string;
  yourTask?: string[]; // Array of task steps as numbered list
  successCriteria?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'all'; 
  ratingEnabled?: boolean;
  ratingLabel?: string;
  ratingScale?: {
    low: string;
    high: string;
  };
  customQuestions?: TaskQuestion[];
}
export interface TaskFeedback {
  taskId: number;
  answer: string;
  rating?: number;
  questionAnswers?: { 
    questionId: number; 
    answer: string | string[]; // Can be single value or array for checkbox
  }[];
  timestamp: string;
}

export interface ProjectSetup {
  beforeMessage: string;
  duringScenario: string;
  afterMessage: string;
  randomizeOrder: boolean;
  tasks: Task[];
}

export interface Session {
  recordings?: {
    combined?: {
      available: boolean;
      duration: number;
      size: number;
      startTime: string;
      endTime: string;
      hasVideo: boolean;
      hasAudio: boolean;
      type: 'video' | 'audio';
    };
    // Legacy support for old format
    screen?: {
      available: boolean;
      duration: number;
      size: number;
      startTime: string;
      endTime: string;
    };
    audio?: {
      available: boolean;
      duration: number;
      size: number;
      startTime: string;
      endTime: string;
    };
  };
  id: number;
  participantId: number;
  completedAt: string;
  duration: number;
  tasksCompleted: number;
  totalTasks: number;
  mouseClicks: number;
  keystrokes: number;
  hasVideo: boolean;
  hasAudio: boolean;
  notes: string;
  taskFeedback: TaskFeedback[];
  observations: string;
}

// Interface for tracking participant usage level per project
export interface ParticipantAssignment {
  participantId: number;
  usageLevel: 'active' | 'occasionally' | 'non-user';
}

export interface Project {
  id: number;
  name: string;
  description: string;
  mode: 'moderated' | 'unmoderated';
  status: 'draft' | 'active' | 'completed' | 'archived';
  participantIds: number[];
  participantAssignments: ParticipantAssignment[];
  sessions: Session[];
  cameraOption: 'optional' | 'required' | 'disabled';
  micOption: 'optional' | 'required' | 'disabled';
  setup: ProjectSetup;
}

export interface Participant {
  id: number;
  name: string;
  email: string;
  defaultUsageLevel?: 'active' | 'occasionally' | 'non-user'; // NEW: Default usage level
}

export interface Analytics {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  avgDuration: number;
  avgClicks: number;
  avgKeystrokes: number;
  videoUsage: number;
  audioUsage: number;
}

export interface TrackingData {
  clicks: number;
  keystrokes: number;
}

export interface SessionLink {
  id: string;
  projectId: number;
  participantId: number;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  emailSent?: boolean;
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

export type View = 'dashboard' | 'createProject' | 'projectDetail' | 'runSession';
export type ActiveTab = 'overview' | 'analytics';