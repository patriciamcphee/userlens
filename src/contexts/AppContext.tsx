// contexts/AppContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Project, Participant, SessionLink, Session } from '../types';
import { DEFAULT_PARTICIPANTS } from '../constants';

/**
 * CONTEXT/PROVIDER PATTERN EXPLANATION:
 * 
 * Instead of using localStorage (which doesn't work in Claude.ai artifacts),
 * we use React Context to share state across all components.
 * 
 * Think of it like a "global state store" that any component can access
 * without having to pass props down through many levels (prop drilling).
 * 
 * How it works:
 * 1. AppContext holds all the app's data (projects, participants, etc.)
 * 2. AppProvider wraps the entire app and provides access to this data
 * 3. Any component can use useAppContext() to read/update the data
 * 4. When data changes, only components using that data re-render
 */

// Define the shape of our app's state
interface AppState {
  projects: Project[];
  participants: Participant[];
  sessionLinks: SessionLink[];
  currentProject: Project | null;
  currentParticipant: Participant | null;
}

// Define all possible actions that can update state
type AppAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: number; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: number }
  | { type: 'ADD_SESSION'; payload: { projectId: number; session: Session } }
  | { type: 'SET_PARTICIPANTS'; payload: Participant[] }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'DELETE_PARTICIPANT'; payload: number }
  | { type: 'ADD_PARTICIPANT_TO_PROJECT'; payload: { projectId: number; participantId: number } }
  | { type: 'REMOVE_PARTICIPANT_FROM_PROJECT'; payload: { projectId: number; participantId: number } }
  | { type: 'SET_SESSION_LINKS'; payload: SessionLink[] }
  | { type: 'ADD_SESSION_LINK'; payload: SessionLink }
  | { type: 'UPDATE_SESSION_LINK'; payload: { id: string; updates: Partial<SessionLink> } }
  | { type: 'DELETE_SESSION_LINK'; payload: string }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'SET_CURRENT_PARTICIPANT'; payload: Participant | null };

// Define what methods are available to components
interface AppContextType {
  state: AppState;
  actions: {
    // Project actions
    setProjects: (projects: Project[]) => void;
    addProject: (project: Project) => void;
    updateProject: (id: number, updates: Partial<Project>) => void;
    deleteProject: (id: number) => void;
    addSession: (projectId: number, session: Session) => void;
    
    // Participant actions
    setParticipants: (participants: Participant[]) => void;
    addParticipant: (participant: Participant) => void;
    deleteParticipant: (id: number) => void;
    addParticipantToProject: (projectId: number, participantId: number) => void;
    removeParticipantFromProject: (projectId: number, participantId: number) => void;
    
    // Session link actions
    setSessionLinks: (links: SessionLink[]) => void;
    addSessionLink: (link: SessionLink) => void;
    updateSessionLink: (id: string, updates: Partial<SessionLink>) => void;
    deleteSessionLink: (id: string) => void;
    
    // Current selections
    setCurrentProject: (project: Project | null) => void;
    setCurrentParticipant: (participant: Participant | null) => void;
  };
}

// Create the context with undefined initial value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Load initial state from localStorage with fallback
const loadInitialState = (): AppState => {
  try {
    const savedProjects = localStorage.getItem('userTesting_projects');
    const savedParticipants = localStorage.getItem('userTesting_participants');
    const savedLinks = localStorage.getItem('userTesting_sessionLinks');
    
    return {
      projects: savedProjects ? JSON.parse(savedProjects) : [],
      participants: savedParticipants ? JSON.parse(savedParticipants) : DEFAULT_PARTICIPANTS,
      sessionLinks: savedLinks ? JSON.parse(savedLinks) : [],
      currentProject: null,
      currentParticipant: null
    };
  } catch (error) {
    console.warn('Could not load from localStorage, using defaults:', error);
    return {
      projects: [],
      participants: DEFAULT_PARTICIPANTS,
      sessionLinks: [],
      currentProject: null,
      currentParticipant: null
    };
  }
};

const initialState: AppState = loadInitialState();

// Reducer function handles all state updates
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    
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
            ? { ...p, sessions: [...(p.sessions || []), action.payload.session] }
            : p
        )
      };
    
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.payload] };
    
    case 'DELETE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter(p => p.id !== action.payload),
        projects: state.projects.map(proj => ({
          ...proj,
          participantIds: proj.participantIds.filter(pId => pId !== action.payload)
        }))
      };
    
    case 'ADD_PARTICIPANT_TO_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId && !p.participantIds.includes(action.payload.participantId)
            ? { ...p, participantIds: [...p.participantIds, action.payload.participantId] }
            : p
        )
      };
    
    case 'REMOVE_PARTICIPANT_FROM_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, participantIds: p.participantIds.filter(id => id !== action.payload.participantId) }
            : p
        )
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

// Provider component that wraps the app
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('userTesting_projects', JSON.stringify(state.projects));
    } catch (error) {
      console.warn('Could not save projects to localStorage:', error);
    }
  }, [state.projects]);

  // Persist participants to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('userTesting_participants', JSON.stringify(state.participants));
    } catch (error) {
      console.warn('Could not save participants to localStorage:', error);
    }
  }, [state.participants]);

  // Persist session links to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('userTesting_sessionLinks', JSON.stringify(state.sessionLinks));
    } catch (error) {
      console.warn('Could not save session links to localStorage:', error);
    }
  }, [state.sessionLinks]);

  // Create action methods that components can call
  const actions = {
    setProjects: (projects: Project[]) => dispatch({ type: 'SET_PROJECTS', payload: projects }),
    addProject: (project: Project) => dispatch({ type: 'ADD_PROJECT', payload: project }),
    updateProject: (id: number, updates: Partial<Project>) =>
      dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } }),
    deleteProject: (id: number) => dispatch({ type: 'DELETE_PROJECT', payload: id }),
    addSession: (projectId: number, session: Session) =>
      dispatch({ type: 'ADD_SESSION', payload: { projectId, session } }),
    
    setParticipants: (participants: Participant[]) =>
      dispatch({ type: 'SET_PARTICIPANTS', payload: participants }),
    addParticipant: (participant: Participant) =>
      dispatch({ type: 'ADD_PARTICIPANT', payload: participant }),
    deleteParticipant: (id: number) => dispatch({ type: 'DELETE_PARTICIPANT', payload: id }),
    addParticipantToProject: (projectId: number, participantId: number) =>
      dispatch({ type: 'ADD_PARTICIPANT_TO_PROJECT', payload: { projectId, participantId } }),
    removeParticipantFromProject: (projectId: number, participantId: number) =>
      dispatch({ type: 'REMOVE_PARTICIPANT_FROM_PROJECT', payload: { projectId, participantId } }),
    
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

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

/**
 * USAGE EXAMPLE:
 * 
 * // In your main App.tsx:
 * function App() {
 *   return (
 *     <AppProvider>
 *       <YourComponents />
 *     </AppProvider>
 *   );
 * }
 * 
 * // In any component:
 * function ProjectList() {
 *   const { state, actions } = useAppContext();
 *   
 *   // Read data
 *   const projects = state.projects;
 *   
 *   // Update data
 *   const handleDelete = (id) => {
 *     actions.deleteProject(id);
 *   };
 *   
 *   return <div>...</div>;
 * }
 */