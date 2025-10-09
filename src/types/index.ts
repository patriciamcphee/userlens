// types/index.ts
export interface TaskQuestion {
  id: number;
  question: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
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
  questionAnswers?: { questionId: number; answer: string }[];
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
  recordings: any;
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

export interface Project {
  id: number;
  name: string;
  description: string;
  mode: 'moderated' | 'unmoderated';
  status: 'draft' | 'active' | 'completed';
  participantIds: number[];
  sessions: Session[];
  cameraOption: 'optional' | 'required' | 'disabled';
  micOption: 'optional' | 'required' | 'disabled';
  setup: ProjectSetup;
}

export interface Participant {
  id: number;
  name: string;
  email: string;
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