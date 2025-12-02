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
// RECORDING TYPES
// ============================================

export type RecordingStatus = 'none' | 'scheduled' | 'external' | 'uploading' | 'processing' | 'ready';
export type RecordingStorageType = 'external' | 'internal';
export type RecordingPlatform = 'zoom' | 'teams' | 'meet' | 'webex' | 'browser';

export interface SessionRecording {
  status: RecordingStatus;
  storageType?: RecordingStorageType;
  platform?: RecordingPlatform;
  externalUrl?: string;         // For external: link to Zoom/Teams/etc.
  blobUrl?: string;             // For internal: Azure Blob Storage URL
  duration?: number;            // Duration in seconds
  hasTranscript?: boolean;
  transcriptStatus?: 'none' | 'processing' | 'ready';
  transcriptUrl?: string;       // URL to transcript file
  recordedAt?: string;          // ISO timestamp of when recording was made
  uploadedAt?: string;          // ISO timestamp of when recording was uploaded
  fileSize?: number;            // File size in bytes
  mimeType?: string;            // e.g., 'video/mp4', 'video/webm'
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
  startTime: string;
  clickCount?: number;
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
  interviewRecording?: SessionRecording; // Recording for interview session
  usabilityDate?: string;
  usabilityTime?: string;
  usabilityCompleted?: boolean; // Track if usability test is completed
  usabilityRecording?: SessionRecording; // Recording for usability session
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
  interviewRecording?: SessionRecording; // Recording for interview session
  usabilityRecording?: SessionRecording; // Recording for usability session
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
  _importedFrom?: string;
  _importedAt?: string;
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
  _importedFrom?: string;
  _importedAt?: string;
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
  status: 'draft' | 'active' | 'completed' | 'archived';
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
  emptyClusters?: string[];

  teamId: string;               // Team that owns this project
  team?: Team;                  // Populated team object
  organizationId: string;
  settings: ProjectSettings;
  createdBy: string;
  // Counts (for display)
  participantCount: number;
  taskCount: number;
  insightCount: number;
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

export interface SessionLink {
  id: string;
  participantId: string | number;
  sessionId: string | number;
  projectId: string | number;
  link: string;
  createdAt: Date;
}

// =============================================================================
// UserLens Insights - Teams Data Model
// =============================================================================
// This file defines the TypeScript interfaces for the multi-tenant team
// structure, including organizations, teams, memberships, and permissions.
// =============================================================================

// -----------------------------------------------------------------------------
// Organization (Maps to Azure AD Tenant)
// -----------------------------------------------------------------------------

export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface Organization {
  id: string;
  tenantId: string;              // Azure AD Tenant ID
  name: string;
  slug: string;                  // URL-friendly identifier
  logo?: string;                 // Organization logo URL
  plan: 'free' | 'pro' | 'enterprise';
  settings: OrganizationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  defaultTeamRole: TeamRole;
  defaultProjectAccess: ProjectAccess;
  allowMemberTeamCreation: boolean;
  allowMemberInvites: boolean;
  requireApprovalForJoin: boolean;
  sessionRecordingEnabled: boolean;
  dataRetentionDays: number;
  // Recording storage settings
  recordingStorage: RecordingStorageSettings;
}

export interface RecordingStorageSettings {
  mode: 'external' | 'internal' | 'both';  // Where recordings are stored
  externalPlatforms: RecordingPlatform[];  // Which external platforms are enabled
  autoImport: boolean;                      // Auto-import from connected platforms
  retentionDays: number;                    // How long to keep recordings
  maxStorageGB?: number;                    // Storage limit for internal recordings
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  user: User;
  role: OrganizationRole;
  joinedAt: string;
  invitedBy?: string;
  status: 'active' | 'invited' | 'suspended';
}

// -----------------------------------------------------------------------------
// User (Synced from Azure AD)
// -----------------------------------------------------------------------------

export interface User {
  id: string;
  azureAdId: string;            // Azure AD Object ID
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  jobTitle?: string;
  department?: string;
  organizationId: string;
  organizationRole: OrganizationRole;
  defaultTeamId?: string;       // User's preferred/default team
  settings: UserSettings;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
  // Connected platform accounts for recording import
  connectedPlatforms?: ConnectedPlatform[];
}

export interface ConnectedPlatform {
  platform: RecordingPlatform;
  accountId: string;
  accountEmail: string;
  connectedAt: string;
  lastSyncAt?: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  slackNotifications: boolean;
  defaultView: 'projects' | 'calendar' | 'activity';
  timezone: string;
}

// -----------------------------------------------------------------------------
// Team
// -----------------------------------------------------------------------------

export type TeamRole = 'lead' | 'member';

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  slug: string;                 // URL-friendly identifier
  description?: string;
  icon?: string;                // Emoji or icon identifier
  color?: string;               // Team color for visual distinction
  memberCount: number;
  projectCount: number;
  settings: TeamSettings;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamSettings {
  defaultProjectAccess: ProjectAccess;
  allowMemberProjectCreation: boolean;
  isPrivate: boolean;           // If true, only visible to members and admins
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user: User;
  role: TeamRole;
  joinedAt: string;
  addedBy?: string;
}

// Represents a user's membership across multiple teams
export interface UserTeamMembership {
  team: Team;
  role: TeamRole;
  joinedAt: string;
}

// -----------------------------------------------------------------------------
// Project (Updated to include team ownership)
// -----------------------------------------------------------------------------

export type ProjectAccess = 'editor' | 'viewer';



export interface ProjectSettings {
  cameraOption: 'optional' | 'required' | 'disabled';
  micOption: 'optional' | 'required' | 'disabled';
  screenShareOption: 'optional' | 'required' | 'disabled';
  autoTranscribe: boolean;
  beforeMessage?: string;
  duringMessage?: string;
  afterMessage?: string;
  // Recording settings at project level
  recordingMode?: 'external' | 'internal' | 'both';
  defaultRecordingPlatform?: RecordingPlatform;
}

// Project member with explicit access level (for future granular permissions)
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user: User;
  access: ProjectAccess;
  addedAt: string;
  addedBy?: string;
}

// -----------------------------------------------------------------------------
// Invitations
// -----------------------------------------------------------------------------

export type InvitationType = 'organization' | 'team';

export interface Invitation {
  id: string;
  type: InvitationType;
  organizationId: string;
  teamId?: string;              // Only for team invitations
  email: string;
  role: OrganizationRole | TeamRole;
  invitedBy: string;
  invitedByUser?: User;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Activity (Updated to include team context)
// -----------------------------------------------------------------------------

export type ActivityType = 
  | 'session_started'
  | 'session_completed'
  | 'participant_added'
  | 'participant_removed'
  | 'note_created'
  | 'project_created'
  | 'project_updated'
  | 'project_archived'
  | 'file_uploaded'
  | 'report_generated'
  | 'team_member_added'
  | 'team_member_removed'
  | 'team_created'
  | 'settings_changed'
  | 'recording_uploaded'
  | 'recording_imported'
  | 'recording_transcribed';

export interface Activity {
  id: string;
  organizationId: string;
  teamId?: string;
  projectId?: string;
  userId: string;
  user?: User;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Permission Helpers
// -----------------------------------------------------------------------------

export interface UserPermissions {
  // Organization level
  canManageOrganization: boolean;
  canManageAllTeams: boolean;
  canViewAllProjects: boolean;
  canManageBilling: boolean;
  canInviteToOrganization: boolean;
  
  // Derived from highest role
  isOrgOwner: boolean;
  isOrgAdmin: boolean;
}

export interface TeamPermissions {
  canManageTeam: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canCreateProjects: boolean;
  canArchiveProjects: boolean;
  canManageTeamSettings: boolean;
}

export interface ProjectPermissions {
  canView: boolean;
  canEdit: boolean;
  canManageParticipants: boolean;
  canRunSessions: boolean;
  canExport: boolean;
  canDelete: boolean;
}

// -----------------------------------------------------------------------------
// Context Types (for React Context)
// -----------------------------------------------------------------------------

export interface OrganizationContext {
  organization: Organization;
  currentUser: User;
  userPermissions: UserPermissions;
  teams: Team[];
  currentTeam: Team | null;
  setCurrentTeam: (team: Team | null) => void;
}

export interface TeamContext {
  team: Team;
  members: TeamMember[];
  projects: Project[];
  userRole: TeamRole;
  permissions: TeamPermissions;
}

// -----------------------------------------------------------------------------
// API Request/Response Types
// -----------------------------------------------------------------------------

export interface CreateTeamRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPrivate?: boolean;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  settings?: Partial<TeamSettings>;
}

export interface InviteMemberRequest {
  email: string;
  role: TeamRole;
  message?: string;
}

export interface UpdateMemberRoleRequest {
  role: TeamRole;
}

export interface TransferProjectRequest {
  targetTeamId: string;
}

// -----------------------------------------------------------------------------
// Utility Types
// -----------------------------------------------------------------------------

// For team selector dropdown
export interface TeamOption {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  role: TeamRole;
  projectCount: number;
}

// For member management
export interface MemberWithDetails extends TeamMember {
  teamCount: number;           // How many teams this user is on
  projectsInTeam: number;      // Projects they've contributed to in this team
  lastActiveInTeam?: string;   // Last activity in this team
}

// For permission checks
export type PermissionCheck = {
  allowed: boolean;
  reason?: string;
};


// ============================================
// VIEW TYPES
// ============================================

export type View = 'dashboard' | 'projectDetail';
export type ProjectTab = 'overview' | 'analytics' | 'synthesis';