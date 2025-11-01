import { Project, Participant, Session } from '../types';

// API calls go through Azure Functions - no credentials needed in frontend!
const API_BASE = import.meta.env.PROD 
  ? '/api'  // Production: uses relative path
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
  // Projects
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE}/projects`);
    return handleResponse<Project[]>(response);
  },
  
  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    return handleResponse<Project>(response);
  },
  
  async createProject(project: Omit<Project, 'createdAt' | 'updatedAt'>): Promise<Project> {
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
  
  async addSession(projectId: string, session: Session): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    return handleResponse<Project>(response);
  },
  
  // Participants
  async getParticipants(): Promise<Participant[]> {
    const response = await fetch(`${API_BASE}/participants`);
    return handleResponse<Participant[]>(response);
  },
  
  async getParticipant(id: string): Promise<Participant> {
    const response = await fetch(`${API_BASE}/participants/${id}`);
    return handleResponse<Participant>(response);
  },
  
  async createParticipant(participant: Omit<Participant, 'createdAt' | 'updatedAt'>): Promise<Participant> {
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
  }
};