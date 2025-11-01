import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { Project, Participant, SessionLink, Session } from '../types';
import { DEFAULT_PARTICIPANTS } from '../constants';
import { api } from '../services/api';

interface AppState {
  projects: Project[];
  participants: Participant[];
  sessionLinks: SessionLink[];
  currentProject: Project | null;
  currentParticipant: Participant | null;
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: number; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: number }
  | { type: 'ADD_SESSION'; payload: { projectId: number; session: Session } }
  | { type: 'SET_PARTICIPANTS'; payload: Participant[] }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'UPDATE_PARTICIPANT'; payload: { id: number; updates: Partial<Participant> } }
  | { type: 'DELETE_PARTICIPANT'; payload: number }
  | { type: 'SET_SESSION_LINKS'; payload: SessionLink[] }
  | { type: 'ADD_SESSION_LINK'; payload: SessionLink }
  | { type: 'UPDATE_SESSION_LINK'; payload: { id: string; updates: Partial<SessionLink> } }
  | { type: 'DELETE_SESSION_LINK'; payload: string }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'SET_CURRENT_PARTICIPANT'; payload: Participant | null };

interface AppContextType {
  state: AppState;
  actions: {
    loadProjects: () => Promise<void>;
    loadParticipants: () => Promise<void>;
    addProject: (project: Project) => Promise<void>;
    updateProject: (id: number, updates: Partial<Project>) => Promise<void>;
    deleteProject: (id: number) => Promise<void>;
    addSession: (projectId: number, session: Session) => Promise<void>;
    addParticipant: (participant: Participant) => Promise<void>;
    updateParticipant: (id: number, updates: Partial<Participant>) => Promise<void>;
    deleteParticipant: (id: number) => Promise<void>;
    setSessionLinks: (links: SessionLink[]) => void;
    addSessionLink: (link: SessionLink) => void;
    updateSessionLink: (id: string, updates: Partial<SessionLink>) => void;
    deleteSessionLink: (id: string) => void;
    setCurrentProject: (project: Project | null) => void;
    setCurrentParticipant: (participant: Participant | null) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  projects: [],
  participants: [],
  sessionLinks: [],
  currentProject: null,
  currentParticipant: null,
  isLoading: false,
  error: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'ADD_PROJECT':
      return { 
        ...state, 
        projects: [...state.projects, action.payload] 
      };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        )
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload)
      };
    
    case 'ADD_SESSION':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, sessions: [...p.sessions, action.payload.session] }
            : p
        )
      };
    
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.payload] };
    
    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        )
      };
    
    case 'DELETE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter(p => p.id !== action.payload),
        projects: state.projects.map(proj => ({
          ...proj,
          participantIds: proj.participantIds.filter(id => id !== action.payload),
          participantAssignments: (proj.participantAssignments || []).filter(
            a => a.participantId !== action.payload
          )
        }))
      };
    
    case 'SET_SESSION_LINKS':
      return { ...state, sessionLinks: action.payload };
    
    case 'ADD_SESSION_LINK':
      return { ...state, sessionLinks: [...state.sessionLinks, action.payload] };
    
    case 'UPDATE_SESSION_LINK':
      return {
        ...state,
        sessionLinks: state.sessionLinks.map(link =>
          link.id === action.payload.id ? { ...link, ...action.payload.updates } : link
        )
      };
    
    case 'DELETE_SESSION_LINK':
      return {
        ...state,
        sessionLinks: state.sessionLinks.filter(link => link.id !== action.payload)
      };
    
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    
    case 'SET_CURRENT_PARTICIPANT':
      return { ...state, currentParticipant: action.payload };
    
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [projects, participants] = await Promise.all([
          api.getProjects().catch(() => []),
          api.getParticipants().catch(() => DEFAULT_PARTICIPANTS)
        ]);
        
        dispatch({ type: 'SET_PROJECTS', payload: projects });
        dispatch({ type: 'SET_PARTICIPANTS', payload: participants });
        
        // Load session links from localStorage (kept local for now)
        const savedLinks = localStorage.getItem('userTesting_sessionLinks');
        if (savedLinks) {
          dispatch({ type: 'SET_SESSION_LINKS', payload: JSON.parse(savedLinks) });
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadInitialData();
  }, []);

  // Persist session links to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('userTesting_sessionLinks', JSON.stringify(state.sessionLinks));
    } catch (error) {
      console.warn('Could not save session links to localStorage:', error);
    }
  }, [state.sessionLinks]);

  const actions = {
    loadProjects: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const projects = await api.getProjects();
        dispatch({ type: 'SET_PROJECTS', payload: projects });
      } catch (error) {
        console.error('Error loading projects:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load projects' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    loadParticipants: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const participants = await api.getParticipants();
        dispatch({ type: 'SET_PARTICIPANTS', payload: participants });
      } catch (error) {
        console.error('Error loading participants:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load participants' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    addProject: async (project: Project) => {
      try {
        const created = await api.createProject(project);
        dispatch({ type: 'ADD_PROJECT', payload: created });
      } catch (error) {
        console.error('Error creating project:', error);
        throw error;
      }
    },

    updateProject: async (id: number, updates: Partial<Project>) => {
      try {
        const updated = await api.updateProject(String(id), updates);
        dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates: updated } });
      } catch (error) {
        console.error('Error updating project:', error);
        throw error;
      }
    },

    deleteProject: async (id: number) => {
      try {
        await api.deleteProject(String(id));
        dispatch({ type: 'DELETE_PROJECT', payload: id });
      } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
      }
    },

    addSession: async (projectId: number, session: Session) => {
      try {
        const updated = await api.addSession(String(projectId), session);
        dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, updates: updated } });
      } catch (error) {
        console.error('Error adding session:', error);
        throw error;
      }
    },

    addParticipant: async (participant: Participant) => {
      try {
        const created = await api.createParticipant(participant);
        dispatch({ type: 'ADD_PARTICIPANT', payload: created });
      } catch (error) {
        console.error('Error creating participant:', error);
        throw error;
      }
    },

    updateParticipant: async (id: number, updates: Partial<Participant>) => {
      try {
        const updated = await api.updateParticipant(String(id), updates);
        dispatch({ type: 'UPDATE_PARTICIPANT', payload: { id, updates: updated } });
      } catch (error) {
        console.error('Error updating participant:', error);
        throw error;
      }
    },

    deleteParticipant: async (id: number) => {
      try {
        await api.deleteParticipant(String(id));
        dispatch({ type: 'DELETE_PARTICIPANT', payload: id });
      } catch (error) {
        console.error('Error deleting participant:', error);
        throw error;
      }
    },

    setSessionLinks: (links: SessionLink[]) =>
      dispatch({ type: 'SET_SESSION_LINKS', payload: links }),
    
    addSessionLink: (link: SessionLink) =>
      dispatch({ type: 'ADD_SESSION_LINK', payload: link }),
    
    updateSessionLink: (id: string, updates: Partial<SessionLink>) =>
      dispatch({ type: 'UPDATE_SESSION_LINK', payload: { id, updates } }),
    
    deleteSessionLink: (id: string) =>
      dispatch({ type: 'DELETE_SESSION_LINK', payload: id }),
    
    setCurrentProject: (project: Project | null) =>
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: project }),
    
    setCurrentParticipant: (participant: Participant | null) =>
      dispatch({ type: 'SET_CURRENT_PARTICIPANT', payload: participant })
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}