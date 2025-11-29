// Shared types for User Research application

// ============================================
// TASK & QUESTION TYPES
// ============================================

export interface TaskQuestion {
  id: number;
  question: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'yes-no' | 'rating';
  options?: string[];
  required?: boolean;
}

export interface TaskStep {
  id: string;
  description: string;
  order: number;
}

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  estimatedTime?: string;
  customTime?: string;
  objective?: string;
  scenario?: string;
  yourTask?: string[]; // Array of task steps
  successCriteria?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'all';
  difficultyMapping?: {
    easy: 'non-user';
    medium: 'occasional';
    hard: 'active';
    all: 'everyone';
  };
  ratingEnabled?: boolean; // Enable rating scale for this task
  ratingLabel?: string; // Custom label for rating
  ratingScale?: {
    low: string;
    high: string;
  };
  enableRatingScale?: boolean;
  customQuestions?: TaskQuestion[]; // Custom questions for feedback
  steps?: TaskStep[];
  questions?: TaskQuestion[];
  order: number;
}

// ============================================
// PARTICIPANT TYPES
// ============================================

export interface SessionHistoryEntry {
  id: string;
  timestamp: string;
  duration: number; // in seconds
  tasksCompleted: number;
  totalTasks: number;
  clicks: number;
  keystrokes: number;
  recordingUrl?: string;
  recordingStoragePath?: string;
  completionRate: number; // percentage
}

export interface ProjectParticipant {
  segmentLevel: string;
  id: string;
  name: string;
  email: string;
  usageLevel: 'active' | 'occasional' | 'non-user';
  role?: string;
  tenure?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewDuration?: string;
  interviewCompleted?: boolean; // Track if interview is completed
  usabilityDate?: string;
  usabilityTime?: string;
  usabilityCompleted?: boolean; // Track if usability test is completed
  addedAt: string;
  status?: 'invited' | 'completed' | 'in-progress' | 'scheduled' | 'no-show'; // Optional - automatically set to "invited" when interview date/time is entered
  sessionId?: string;
  sessionLink?: string; // Unique link for participant to access their session
  sessionLinkExpiry?: string; // ISO string for when the link expires
  sessionLinkToken?: string; // Unique token for the session link
  recordingUrl?: string; // Signed URL to the recorded session video (latest session)
  recordingStoragePath?: string; // Storage path for the recording (latest session)
  lastSessionDate?: string; // ISO string for the most recent session
  sessionHistory?: SessionHistoryEntry[]; // Array of all session data
  susScore?: number;
  npsScore?: number;
}

// ============================================
// SYNTHESIS BOARD TYPES
// ============================================

export interface Participant {
  interviewCompleted: any;
  usabilityCompleted: any;
  id: string;
  name: string;
  segment: string;
  role: string;
  date: string; // Interview date
  time?: string; // Interview time
  usabilityDate?: string; // Testing date
  usabilityTime?: string; // Testing time
  duration?: string;
  status: "completed" | "scheduled" | "in-progress" | "invited" | "no-show";
  susScore?: number;
  npsScore?: number;
}

export interface StickyNote {
  id: string;
  text: string;
  type: "barrier" | "insight" | "opportunity" | "quote";
  cluster: string;
}

export interface Hypothesis {
  id: string;
  status: "validated" | "disproven" | "unclear" | "testing";
  hypothesis: string;
  description?: string;
  evidence: string;
  priority?: "high" | "medium" | "low";
  supportingEvidence?: string;
  segments?: string[];
  expectedEvidence?: string;
  howToTest?: string;
  category?: "primary" | "workflow" | "usability" | "organizational";
  expectedOutcome?: string;
  roadmapImpact?: string;
  researchQuestionId?: string;
}

export interface ResearchQuestion {
  id: string;
  question: string;
  order: number;
}

export interface SynthesisData {
  participants: Participant[];
  notes: StickyNote[];
  hypotheses: Hypothesis[];
  researchQuestions: ResearchQuestion[];
}

// ============================================
// PROJECT MANAGEMENT TYPES
// ============================================

export interface ParticipantAssignment {
  participantId: string | number;
  usageLevel: 'active' | 'occasionally' | 'non-user';
}

export interface ProjectSetup {
  beforeMessage: string;
  duringScenario: string;
  afterMessage: string;
  randomizeOrder: boolean;
  tasks: Task[];
}

export interface Project {
  beforeMessage: string | undefined;
  duringMessage: string | undefined;
  afterMessage: string | undefined;
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  createdAt?: string;
  updatedAt?: string;
  totalSessions?: number;
  completedSessions?: number;
  mode: 'moderated' | 'unmoderated';
  participants?: ProjectParticipant[];
  participantIds?: (string | number)[];
  participantAssignments?: ParticipantAssignment[];
  tasks?: Task[];
  sessions?: Session[];
  cameraOption: 'optional' | 'required' | 'disabled';
  micOption: 'optional' | 'required' | 'disabled';
  setup: ProjectSetup;
  researchGoals?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export interface TaskFeedback {
  taskId: number;
  answer?: string;
  rating?: number;
  questionAnswers?: { questionId: number; answer: string | string[] }[];
  timestamp: string;
}

export interface TrackingData {
  clicks: number;
  keystrokes: number;
}

export interface RecordingData {
  available: boolean;
  duration: number;
  size: number;
  startTime: string;
  endTime: string;
  hasVideo: boolean;
  hasAudio: boolean;
  type: 'video' | 'audio';
  url?: string;
}

export interface Session {
  id: number | string;
  projectId?: string;
  participantId: string | number;
  completedAt: string;
  duration: number;
  tasksCompleted: number;
  totalTasks: number;
  mouseClicks?: number;
  keystrokes?: number;
  hasVideo: boolean;
  hasAudio: boolean;
  notes: string;
  taskFeedback?: TaskFeedback[];
  observations?: string;
  recordings?: {
    combined?: RecordingData;
    screen?: RecordingData;
    audio?: RecordingData;
  };
}

// ============================================
// VIEW TYPES
// ============================================

export type View = 'dashboard' | 'projectDetail';
export type ProjectTab = 'overview' | 'analytics' | 'synthesis';