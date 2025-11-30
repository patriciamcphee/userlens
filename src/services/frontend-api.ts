/**
 * Frontend API Service
 * 
 * Client-side API wrapper for Azure Functions backend.
 * Drop-in replacement for the old Supabase-based API.
 * 
 * FILE: src/services/api.ts
 */

import { Project, Participant, Session, Hypothesis, StickyNote, ResearchQuestion } from '../types';

// API configuration
const API_BASE = import.meta.env.PROD 
  ? '/api'                          // Production: relative path (same domain)
  : 'http://localhost:7071/api';    // Development: Azure Functions emulator

// ============================================
// HTTP UTILITIES
// ============================================

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(response.status, error.error || error.message || 'Request failed');
  }
  
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

// ============================================
// PROJECTS API
// ============================================

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const data = await request<{ projects: Project[] }>(`${API_BASE}/projects`);
    return data.projects;
  },
  
  getById: async (id: string): Promise<Project> => {
    return request<Project>(`${API_BASE}/projects/${id}`);
  },
  
  create: async (project: Partial<Project>): Promise<Project> => {
    return request<Project>(`${API_BASE}/projects`, {
      method: 'POST',
      body: JSON.stringify(project)
    });
  },
  
  update: async (id: string, updates: Partial<Project>): Promise<Project> => {
    return request<Project>(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  
  delete: async (id: string): Promise<void> => {
    await request<void>(`${API_BASE}/projects/${id}`, {
      method: 'DELETE'
    });
  },
  
  addSession: async (projectId: string, session: Partial<Session>): Promise<Project> => {
    return request<Project>(`${API_BASE}/projects/${projectId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(session)
    });
  }
};

// ============================================
// RESEARCH API (Global data)
// ============================================

export const researchApi = {
  // Hypotheses
  hypotheses: {
    getAll: async (): Promise<Hypothesis[]> => {
      const data = await request<{ hypotheses: Hypothesis[] }>(`${API_BASE}/research/hypotheses`);
      return data.hypotheses;
    },
    
    create: async (hypothesis: Partial<Hypothesis>): Promise<Hypothesis> => {
      return request<Hypothesis>(`${API_BASE}/research/hypotheses`, {
        method: 'POST',
        body: JSON.stringify(hypothesis)
      });
    },
    
    update: async (id: string, updates: Partial<Hypothesis>): Promise<Hypothesis> => {
      return request<Hypothesis>(`${API_BASE}/research/hypotheses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    
    delete: async (id: string): Promise<void> => {
      await request<void>(`${API_BASE}/research/hypotheses/${id}`, {
        method: 'DELETE'
      });
    }
  },
  
  // Participants
  participants: {
    getAll: async (): Promise<Participant[]> => {
      const data = await request<{ participants: Participant[] }>(`${API_BASE}/research/participants`);
      return data.participants;
    },
    
    create: async (participant: Partial<Participant>): Promise<Participant> => {
      return request<Participant>(`${API_BASE}/research/participants`, {
        method: 'POST',
        body: JSON.stringify(participant)
      });
    },
    
    update: async (id: string, updates: Partial<Participant>): Promise<Participant> => {
      return request<Participant>(`${API_BASE}/research/participants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    
    delete: async (id: string): Promise<void> => {
      await request<void>(`${API_BASE}/research/participants/${id}`, {
        method: 'DELETE'
      });
    }
  },
  
  // Research Questions
  questions: {
    getAll: async (): Promise<ResearchQuestion[]> => {
      const data = await request<{ questions: ResearchQuestion[] }>(`${API_BASE}/research/questions`);
      return data.questions;
    },
    
    create: async (question: Partial<ResearchQuestion>): Promise<ResearchQuestion> => {
      return request<ResearchQuestion>(`${API_BASE}/research/questions`, {
        method: 'POST',
        body: JSON.stringify(question)
      });
    },
    
    update: async (id: string, updates: Partial<ResearchQuestion>): Promise<ResearchQuestion> => {
      return request<ResearchQuestion>(`${API_BASE}/research/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    
    delete: async (id: string): Promise<void> => {
      await request<void>(`${API_BASE}/research/questions/${id}`, {
        method: 'DELETE'
      });
    }
  },
  
  // Sticky Notes
  notes: {
    getAll: async (): Promise<StickyNote[]> => {
      const data = await request<{ notes: StickyNote[] }>(`${API_BASE}/research/notes`);
      return data.notes;
    },
    
    getClusters: async (): Promise<string[]> => {
      const data = await request<{ clusters: string[] }>(`${API_BASE}/research/notes/clusters`);
      return data.clusters;
    },
    
    create: async (note: Partial<StickyNote>): Promise<StickyNote> => {
      return request<StickyNote>(`${API_BASE}/research/notes`, {
        method: 'POST',
        body: JSON.stringify(note)
      });
    },
    
    update: async (id: string, updates: Partial<StickyNote>): Promise<StickyNote> => {
      return request<StickyNote>(`${API_BASE}/research/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    
    delete: async (id: string): Promise<void> => {
      await request<void>(`${API_BASE}/research/notes/${id}`, {
        method: 'DELETE'
      });
    }
  }
};

// ============================================
// SYNTHESIS API (Project-scoped)
// ============================================

export const synthesisApi = {
  // Get all synthesis data for a project
  getAll: async (projectId: string) => {
    return request<{
      projectId: string;
      hypotheses: Hypothesis[];
      notes: StickyNote[];
      clusters: string[];
      questions: ResearchQuestion[];
    }>(`${API_BASE}/synthesis/${projectId}`);
  },
  
  // Initialize synthesis for a project
  initialize: async (projectId: string): Promise<void> => {
    await request<void>(`${API_BASE}/synthesis/${projectId}/initialize`, {
      method: 'POST'
    });
  },
  
  // Hypotheses (project-scoped)
  hypotheses: {
    getAll: async (projectId: string): Promise<Hypothesis[]> => {
      const data = await request<{ hypotheses: Hypothesis[] }>(
        `${API_BASE}/synthesis/${projectId}/hypotheses`
      );
      return data.hypotheses;
    },
    
    create: async (projectId: string, hypothesis: Partial<Hypothesis>): Promise<Hypothesis> => {
      return request<Hypothesis>(`${API_BASE}/synthesis/${projectId}/hypotheses`, {
        method: 'POST',
        body: JSON.stringify(hypothesis)
      });
    },
    
    update: async (projectId: string, id: string, updates: Partial<Hypothesis>): Promise<Hypothesis> => {
      return request<Hypothesis>(`${API_BASE}/synthesis/${projectId}/hypotheses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    
    delete: async (projectId: string, id: string): Promise<void> => {
      await request<void>(`${API_BASE}/synthesis/${projectId}/hypotheses/${id}`, {
        method: 'DELETE'
      });
    }
  },
  
  // Notes (project-scoped)
  notes: {
    getAll: async (projectId: string): Promise<StickyNote[]> => {
      const data = await request<{ notes: StickyNote[] }>(
        `${API_BASE}/synthesis/${projectId}/notes`
      );
      return data.notes;
    },
    
    create: async (projectId: string, note: Partial<StickyNote>): Promise<StickyNote> => {
      return request<StickyNote>(`${API_BASE}/synthesis/${projectId}/notes`, {
        method: 'POST',
        body: JSON.stringify(note)
      });
    },
    
    update: async (projectId: string, id: string, updates: Partial<StickyNote>): Promise<StickyNote> => {
      return request<StickyNote>(`${API_BASE}/synthesis/${projectId}/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    
    delete: async (projectId: string, id: string): Promise<void> => {
      await request<void>(`${API_BASE}/synthesis/${projectId}/notes/${id}`, {
        method: 'DELETE'
      });
    }
  },
  
  // Clusters (project-scoped)
  clusters: {
    getAll: async (projectId: string): Promise<string[]> => {
      const data = await request<{ clusters: string[] }>(
        `${API_BASE}/synthesis/${projectId}/clusters`
      );
      return data.clusters;
    },
    
    add: async (projectId: string, clusterName: string): Promise<string> => {
      return request<string>(`${API_BASE}/synthesis/${projectId}/clusters`, {
        method: 'POST',
        body: JSON.stringify({ name: clusterName })
      });
    },
    
    delete: async (projectId: string, clusterName: string): Promise<void> => {
      await request<void>(`${API_BASE}/synthesis/${projectId}/clusters/${encodeURIComponent(clusterName)}`, {
        method: 'DELETE'
      });
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const utilityApi = {
  // Initialize database
  initializeDatabase: async (seed = false): Promise<{
    success: boolean;
    database: string;
    container: string;
    seeded: boolean;
  }> => {
    const url = seed 
      ? `${API_BASE}/initialize-database?seed=true`
      : `${API_BASE}/initialize-database`;
    
    return request(url, { method: 'POST' });
  },
  
  // Health check
  healthCheck: async (): Promise<boolean> => {
    try {
      await request(`${API_BASE}/projects`);
      return true;
    } catch {
      return false;
    }
  }
};

// ============================================
// LEGACY API (for backward compatibility)
// Maps old api.xxx calls to new structure
// ============================================

export const api = {
  // Projects
  getProjects: projectsApi.getAll,
  getProject: projectsApi.getById,
  createProject: projectsApi.create,
  updateProject: projectsApi.update,
  deleteProject: projectsApi.delete,
  addSession: projectsApi.addSession,
  
  // Participants (global pool)
  getParticipants: researchApi.participants.getAll,
  getParticipant: async (id: string) => {
    const participants = await researchApi.participants.getAll();
    return participants.find(p => p.id === id);
  },
  createParticipant: researchApi.participants.create,
  updateParticipant: researchApi.participants.update,
  deleteParticipant: researchApi.participants.delete,
  
  // Research Questions
  getResearchQuestions: researchApi.questions.getAll,
  addResearchQuestion: researchApi.questions.create,
  updateResearchQuestion: researchApi.questions.update,
  deleteResearchQuestion: researchApi.questions.delete,
  
  // Hypotheses
  getHypotheses: researchApi.hypotheses.getAll,
  addHypothesis: researchApi.hypotheses.create,
  updateHypothesis: researchApi.hypotheses.update,
  deleteHypothesis: researchApi.hypotheses.delete,
  
  // Sticky Notes
  getStickyNotes: researchApi.notes.getAll,
  addStickyNote: researchApi.notes.create,
  updateStickyNote: researchApi.notes.update,
  deleteStickyNote: researchApi.notes.delete,
  
  // Synthesis (project-scoped)
  getSynthesisData: synthesisApi.getAll,
  initializeSynthesis: synthesisApi.initialize,
  
  // Project-scoped synthesis operations
  addStickyNoteToProject: synthesisApi.notes.create,
  updateStickyNoteInProject: synthesisApi.notes.update,
  deleteStickyNoteFromProject: synthesisApi.notes.delete,
  
  addHypothesisToProject: synthesisApi.hypotheses.create,
  updateHypothesisInProject: synthesisApi.hypotheses.update,
  deleteHypothesisFromProject: synthesisApi.hypotheses.delete,
  
  // Project participant management (embedded in project)
  addParticipantToProject: async (projectId: string, participant: any): Promise<Project> => {
    const project = await projectsApi.getById(projectId);
    const participants = project.participants || [];
    
    const newParticipant = {
      id: `P${String(participants.length + 1).padStart(2, '0')}`,
      ...participant,
      addedAt: new Date().toISOString()
    };
    
    participants.push(newParticipant);
    return projectsApi.update(projectId, { participants });
  },
  
  updateParticipantInProject: async (projectId: string, participantId: string, updates: any): Promise<Project> => {
    const project = await projectsApi.getById(projectId);
    const participants = (project.participants || []).map(p =>
      p.id === participantId ? { ...p, ...updates } : p
    );
    return projectsApi.update(projectId, { participants });
  },
  
  removeParticipantFromProject: async (projectId: string, participantId: string): Promise<Project> => {
    const project = await projectsApi.getById(projectId);
    const participants = (project.participants || []).filter(p => p.id !== participantId);
    return projectsApi.update(projectId, { participants });
  },
  
  // Task management (embedded in project)
  addTaskToProject: async (projectId: string, task: any): Promise<Project> => {
    const project = await projectsApi.getById(projectId);
    const tasks = project.tasks || [];
    
    const newTask = {
      id: `T${Date.now()}`,
      order: tasks.length + 1,
      ...task
    };
    
    tasks.push(newTask);
    return projectsApi.update(projectId, { tasks });
  },
  
  updateTaskInProject: async (projectId: string, taskId: string, updates: any): Promise<Project> => {
    const project = await projectsApi.getById(projectId);
    const tasks = (project.tasks || []).map(t =>
      t.id === taskId ? { ...t, ...updates } : t
    );
    return projectsApi.update(projectId, { tasks });
  },
  
  removeTaskFromProject: async (projectId: string, taskId: string): Promise<Project> => {
    const project = await projectsApi.getById(projectId);
    const tasks = (project.tasks || []).filter(t => t.id !== taskId);
    return projectsApi.update(projectId, { tasks });
  },
  
  // Utilities
  initialize: utilityApi.initializeDatabase,
  getData: async () => {
    const [projects, participants] = await Promise.all([
      projectsApi.getAll(),
      researchApi.participants.getAll()
    ]);
    return { projects, participants };
  }
};

// Default export for backward compatibility
export default api;
