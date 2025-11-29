import { Project, Participant, Session } from '../types';

// API calls go through Azure Functions
const API_BASE = import.meta.env.PROD 
  ? '/api'  // Production: relative path (same domain)
  : 'http://localhost:7071/api';  // Local development: Azure Functions default port

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(response.status, error.error || error.message || 'Request failed');
  }
  
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

export const api = {
  // ============================================
  // PROJECTS
  // ============================================
  
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE}/projects`);
    const data = await handleResponse<{ projects: Project[] }>(response);
    return data.projects;
  },
  
  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    return handleResponse<Project>(response);
  },
  
  async createProject(project: Partial<Project>): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    return handleResponse<Project>(response);
  },
  
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<Project>(response);
  },
  
  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<void>(response);
  },

  // ============================================
  // SESSIONS
  // ============================================
  
  async addSession(projectId: string, session: Partial<Session>): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    return handleResponse<Project>(response);
  },

  // ============================================
  // PARTICIPANTS
  // ============================================
  
  async getParticipants(projectId?: string): Promise<Participant[]> {
    const url = projectId 
      ? `${API_BASE}/participants?projectId=${projectId}`
      : `${API_BASE}/participants`;
    const response = await fetch(url);
    const data = await handleResponse<{ participants: Participant[] }>(response);
    return data.participants;
  },
  
  async getParticipant(id: string): Promise<Participant> {
    const response = await fetch(`${API_BASE}/participants/${id}`);
    return handleResponse<Participant>(response);
  },
  
  async createParticipant(participant: Partial<Participant>): Promise<Participant> {
    const response = await fetch(`${API_BASE}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participant)
    });
    return handleResponse<Participant>(response);
  },
  
  async updateParticipant(id: string, updates: Partial<Participant>): Promise<Participant> {
    const response = await fetch(`${API_BASE}/participants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<Participant>(response);
  },
  
  async deleteParticipant(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/participants/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<void>(response);
  },

  // ============================================
  // PARTICIPANT MANAGEMENT (per project)
  // These update participants embedded in a project
  // ============================================
  
  async addParticipantToProject(projectId: string, participant: any): Promise<Project> {
    // First get the project
    const project = await this.getProject(projectId);
    
    // Add participant to project's participants array
    const participants = project.participants || [];
    const newParticipant = {
      id: `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...participant,
      addedAt: new Date().toISOString()
    };
    participants.push(newParticipant);
    
    // Update the project
    return this.updateProject(projectId, { participants });
  },
  
  async removeParticipantFromProject(projectId: string, participantId: string): Promise<Project> {
    const project = await this.getProject(projectId);
    const participants = (project.participants || []).filter(p => p.id !== participantId);
    return this.updateProject(projectId, { participants });
  },
  
  async updateParticipantInProject(projectId: string, participantId: string, updates: any): Promise<Project> {
    const project = await this.getProject(projectId);
    const participants = (project.participants || []).map(p => 
      p.id === participantId ? { ...p, ...updates } : p
    );
    return this.updateProject(projectId, { participants });
  },

  // ============================================
  // TASK MANAGEMENT (per project)
  // ============================================
  
  async addTaskToProject(projectId: string, task: any): Promise<Project> {
    const project = await this.getProject(projectId);
    const tasks = project.tasks || [];
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...task,
      order: tasks.length
    };
    tasks.push(newTask);
    return this.updateProject(projectId, { tasks });
  },
  
  async removeTaskFromProject(projectId: string, taskId: string): Promise<Project> {
    const project = await this.getProject(projectId);
    const tasks = (project.tasks || []).filter(t => t.id !== taskId);
    return this.updateProject(projectId, { tasks });
  },
  
  async updateTaskInProject(projectId: string, taskId: string, updates: any): Promise<Project> {
    const project = await this.getProject(projectId);
    const tasks = (project.tasks || []).map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    );
    return this.updateProject(projectId, { tasks });
  },

  // ============================================
  // SYNTHESIS DATA (per project)
  // ============================================
  
  async getSynthesisData(projectId: string): Promise<any> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/synthesis`);
    return handleResponse<any>(response);
  },
  
  async initializeSynthesis(projectId: string): Promise<any> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/synthesis/initialize`, {
      method: 'POST'
    });
    return handleResponse<any>(response);
  },

  // ============================================
  // STICKY NOTES (per project)
  // ============================================
  
  async addStickyNoteToProject(projectId: string, note: any): Promise<Project> {
    const project = await this.getProject(projectId);
    const synthesis = project.synthesis || { notes: [], hypotheses: [], researchQuestions: [], clusters: [] };
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...note
    };
    synthesis.notes = [...(synthesis.notes || []), newNote];
    return this.updateProject(projectId, { synthesis } as any);
  },
  
  async updateStickyNoteInProject(projectId: string, noteId: string, updates: any): Promise<Project> {
    const project = await this.getProject(projectId);
    const synthesis = project.synthesis || { notes: [] };
    synthesis.notes = (synthesis.notes || []).map(n => 
      n.id === noteId ? { ...n, ...updates } : n
    );
    return this.updateProject(projectId, { synthesis } as any);
  },
  
  async deleteStickyNoteFromProject(projectId: string, noteId: string): Promise<Project> {
    const project = await this.getProject(projectId);
    const synthesis = project.synthesis || { notes: [] };
    synthesis.notes = (synthesis.notes || []).filter(n => n.id !== noteId);
    return this.updateProject(projectId, { synthesis } as any);
  },

  // ============================================
  // HYPOTHESES (per project)
  // ============================================
  
  async addHypothesisToProject(projectId: string, hypothesis: any): Promise<Project> {
    const project = await this.getProject(projectId);
    const synthesis = project.synthesis || { notes: [], hypotheses: [], researchQuestions: [] };
    const newHypothesis = {
      id: `hyp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...hypothesis
    };
    synthesis.hypotheses = [...(synthesis.hypotheses || []), newHypothesis];
    return this.updateProject(projectId, { synthesis } as any);
  },
  
  async updateHypothesisInProject(projectId: string, hypothesisId: string, updates: any): Promise<Project> {
    const project = await this.getProject(projectId);
    const synthesis = project.synthesis || { hypotheses: [] };
    synthesis.hypotheses = (synthesis.hypotheses || []).map(h => 
      h.id === hypothesisId ? { ...h, ...updates } : h
    );
    return this.updateProject(projectId, { synthesis } as any);
  },
  
  async deleteHypothesisFromProject(projectId: string, hypothesisId: string): Promise<Project> {
    const project = await this.getProject(projectId);
    const synthesis = project.synthesis || { hypotheses: [] };
    synthesis.hypotheses = (synthesis.hypotheses || []).filter(h => h.id !== hypothesisId);
    return this.updateProject(projectId, { synthesis } as any);
  },

  // ============================================
  // CLUSTERS (per project)
  // ============================================
  
  async addClusterToProject(projectId: string, clusterName: string): Promise<Project> {
    const project = await this.getProject(projectId);
    const synthesis = project.synthesis || { clusters: [] };
    synthesis.clusters = [...(synthesis.clusters || []), clusterName];
    return this.updateProject(projectId, { synthesis } as any);
  },
  
  async deleteClusterFromProject(projectId: string, clusterName: string): Promise<Project> {
    const project = await this.getProject(projectId);
    const synthesis = project.synthesis || { clusters: [] };
    synthesis.clusters = (synthesis.clusters || []).filter(c => c !== clusterName);
    return this.updateProject(projectId, { synthesis } as any);
  },

  // ============================================
  // RESEARCH QUESTIONS (per project)
  // ============================================
  
  async addResearchQuestionToProject(projectId: string, question: any): Promise<Project> {
    const project = await this.getProject(projectId);
    const synthesis: any = project.synthesis || { researchQuestions: [] };
    const newQuestion = {
      id: `rq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...question,
      order: (synthesis.researchQuestions || []).length
    };
    synthesis.researchQuestions = [...(synthesis.researchQuestions || []), newQuestion];
    return this.updateProject(projectId, { synthesis } as any);
  },
  
  async updateResearchQuestionInProject(projectId: string, questionId: string, updates: any): Promise<Project> {
    const project = await this.getProject(projectId);
    const synthesis: any = project.synthesis || { researchQuestions: [] };
    synthesis.researchQuestions = (synthesis.researchQuestions || []).map((q: { id: string; }) => 
      q.id === questionId ? { ...q, ...updates } : q
    );
    return this.updateProject(projectId, { synthesis } as any);
  },
  
  async deleteResearchQuestionFromProject(projectId: string, questionId: string): Promise<Project> {
    const project = await this.getProject(projectId);
    const synthesis: any = project.synthesis || { researchQuestions: [] };
    synthesis.researchQuestions = (synthesis.researchQuestions || []).filter((q: any) => q.id !== questionId);
    return this.updateProject(projectId, { synthesis } as any);
  },

  // ============================================
  // RECORDING UPLOAD
  // ============================================
  
  async uploadRecording(
    file: Blob,
    projectId: string,
    participantId: string,
    metadata?: {
      sessionId?: string;
      duration?: number;
      tasksCompleted?: number;
      totalTasks?: number;
      clicks?: number;
      keystrokes?: number;
      hasVideo?: boolean;
      hasAudio?: boolean;
    }
  ): Promise<{ success: boolean; url: string; path: string }> {
    // Convert blob to base64
    const buffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    const response = await fetch(`${API_BASE}/upload-recording`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: base64,
        projectId,
        participantId,
        ...metadata
      })
    });
    
    return handleResponse<{ success: boolean; url: string; path: string }>(response);
  },

  // ============================================
  // LEGACY ENDPOINTS (for backward compatibility)
  // ============================================
  
  getData: async () => {
    const projects = await api.getProjects();
    const participants = await api.getParticipants();
    return { projects, participants };
  },
  
  initialize: async () => {
    const response = await fetch(`${API_BASE}/initialize-database`, {
      method: 'POST'
    });
    return handleResponse<any>(response);
  },

  // Legacy participant methods (non-project-specific)
  addParticipant: (participant: any) => api.createParticipant(participant),
  
  // Legacy sticky note methods
  addStickyNote: async (note: any) => {
    console.warn('addStickyNote without projectId is deprecated. Use addStickyNoteToProject instead.');
    return note;
  },
  updateStickyNote: async (id: string, note: any) => {
    console.warn('updateStickyNote without projectId is deprecated. Use updateStickyNoteInProject instead.');
    return note;
  },
  deleteStickyNote: async (id: string) => {
    console.warn('deleteStickyNote without projectId is deprecated. Use deleteStickyNoteFromProject instead.');
    return { success: true };
  },

  // Legacy hypothesis methods
  addHypothesis: async (hypothesis: any) => {
    console.warn('addHypothesis without projectId is deprecated. Use addHypothesisToProject instead.');
    return hypothesis;
  },
  updateHypothesis: async (id: string, hypothesis: any) => {
    console.warn('updateHypothesis without projectId is deprecated. Use updateHypothesisInProject instead.');
    return hypothesis;
  },
  deleteHypothesis: async (id: string) => {
    console.warn('deleteHypothesis without projectId is deprecated. Use deleteHypothesisFromProject instead.');
    return { success: true };
  },

  // Legacy research question methods
  addResearchQuestion: async (question: any) => {
    console.warn('addResearchQuestion without projectId is deprecated. Use addResearchQuestionToProject instead.');
    return question;
  },
  updateResearchQuestion: async (id: string, question: any) => {
    console.warn('updateResearchQuestion without projectId is deprecated. Use updateResearchQuestionInProject instead.');
    return question;
  },
  deleteResearchQuestion: async (id: string) => {
    console.warn('deleteResearchQuestion without projectId is deprecated. Use deleteResearchQuestionFromProject instead.');
    return { success: true };
  }
};