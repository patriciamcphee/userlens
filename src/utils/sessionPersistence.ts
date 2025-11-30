// utils/sessionPersistence.ts
import { Task, TaskFeedback, TrackingData } from '../types';

export interface SavedSessionState {
  sessionId: string;
  projectId: string | number;
  participantId: string | number;
  projectName: string;
  participantName: string;
  currentTask: number;
  completedTasks: number[];
  taskFeedback: TaskFeedback[];
  trackingData: TrackingData;
  sessionStartTime: number;
  lastSavedAt: number;
  displayTasks: Task[];
  currentTaskAnswer: string;
  currentTaskRating: number;
  currentQuestionAnswers: { questionId: number; answer: string | string[] }[];
  observations: string;
  notes: string;
  // Recording state
  hasRecordingStarted: boolean;
  recordingOptions: {
    video: boolean;
    audio: boolean;
  };
}

const STORAGE_KEY_PREFIX = 'userlens_session_';
const MAX_SAVED_SESSIONS = 10;

export class SessionPersistenceManager {
  private static getStorageKey(sessionId: string): string {
    return `${STORAGE_KEY_PREFIX}${sessionId}`;
  }

  /**
   * Save current session state to localStorage
   */
  static saveSession(state: SavedSessionState): boolean {
    try {
      const storageKey = this.getStorageKey(state.sessionId);
      const serialized = JSON.stringify({
        ...state,
        lastSavedAt: Date.now()
      });
      
      localStorage.setItem(storageKey, serialized);
      
      // Update the session index
      this.updateSessionIndex(state);
      
      console.log('✅ Session saved:', {
        sessionId: state.sessionId,
        currentTask: state.currentTask,
        completedTasks: state.completedTasks.length,
        totalTasks: state.displayTasks.length
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to save session:', error);
      return false;
    }
  }

  /**
   * Load session state from localStorage
   */
  static loadSession(sessionId: string): SavedSessionState | null {
    try {
      const storageKey = this.getStorageKey(sessionId);
      const serialized = localStorage.getItem(storageKey);
      
      if (!serialized) {
        console.log('📭 No saved session found for:', sessionId);
        return null;
      }
      
      const state: SavedSessionState = JSON.parse(serialized);
      
      // Validate the session isn't too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const isExpired = (Date.now() - state.lastSavedAt) > maxAge;
      
      if (isExpired) {
        console.log('⏰ Session expired, removing:', sessionId);
        this.removeSession(sessionId);
        return null;
      }
      
      console.log('📂 Session loaded:', {
        sessionId: state.sessionId,
        currentTask: state.currentTask,
        completedTasks: state.completedTasks.length,
        totalTasks: state.displayTasks.length,
        savedAt: new Date(state.lastSavedAt).toLocaleString()
      });
      
      return state;
    } catch (error) {
      console.error('❌ Failed to load session:', error);
      return null;
    }
  }

  /**
   * Remove a saved session
   */
  static removeSession(sessionId: string): boolean {
    try {
      const storageKey = this.getStorageKey(sessionId);
      localStorage.removeItem(storageKey);
      
      // Update the session index
      this.removeFromSessionIndex(sessionId);
      
      console.log('🗑️ Session removed:', sessionId);
      return true;
    } catch (error) {
      console.error('❌ Failed to remove session:', error);
      return false;
    }
  }

  /**
   * Get all saved sessions for the current user
   */
  static getSavedSessions(): Array<{
    sessionId: string;
    projectName: string;
    participantName: string;
    progress: number;
    lastSavedAt: number;
  }> {
    try {
      const indexData = localStorage.getItem(`${STORAGE_KEY_PREFIX}index`);
      if (!indexData) return [];
      
      const index: Array<{
        sessionId: string;
        projectName: string;
        participantName: string;
        progress: number;
        lastSavedAt: number;
      }> = JSON.parse(indexData);
      
      // Filter out expired sessions
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      const validSessions = index.filter(session => {
        const isValid = (Date.now() - session.lastSavedAt) <= maxAge;
        if (!isValid) {
          this.removeSession(session.sessionId);
        }
        return isValid;
      });
      
      // Sort by last saved (most recent first)
      return validSessions.sort((a, b) => b.lastSavedAt - a.lastSavedAt);
    } catch (error) {
      console.error('❌ Failed to get saved sessions:', error);
      return [];
    }
  }

  /**
   * Check if a session exists
   */
  static sessionExists(sessionId: string): boolean {
    const storageKey = this.getStorageKey(sessionId);
    return localStorage.getItem(storageKey) !== null;
  }

  /**
   * Calculate session progress percentage
   */
  static calculateProgress(state: SavedSessionState): number {
    if (state.displayTasks.length === 0) return 0;
    return Math.round((state.completedTasks.length / state.displayTasks.length) * 100);
  }

  /**
   * Get session duration in seconds
   */
  static getSessionDuration(state: SavedSessionState): number {
    return Math.floor((Date.now() - state.sessionStartTime) / 1000);
  }

  /**
   * Clean up old sessions (keep only the most recent MAX_SAVED_SESSIONS)
   */
  static cleanupOldSessions(): void {
    try {
      const sessions = this.getSavedSessions();
      
      if (sessions.length > MAX_SAVED_SESSIONS) {
        const sessionsToRemove = sessions.slice(MAX_SAVED_SESSIONS);
        sessionsToRemove.forEach(session => {
          this.removeSession(session.sessionId);
        });
        
        console.log(`🧹 Cleaned up ${sessionsToRemove.length} old sessions`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup old sessions:', error);
    }
  }

  /**
   * Update the session index for quick access to session metadata
   */
  private static updateSessionIndex(state: SavedSessionState): void {
    try {
      const indexKey = `${STORAGE_KEY_PREFIX}index`;
      const existingData = localStorage.getItem(indexKey);
      let index: Array<{
        sessionId: string;
        projectName: string;
        participantName: string;
        progress: number;
        lastSavedAt: number;
      }> = existingData ? JSON.parse(existingData) : [];
      
      // Remove existing entry for this session
      index = index.filter(item => item.sessionId !== state.sessionId);
      
      // Add current session
      index.push({
        sessionId: state.sessionId,
        projectName: state.projectName,
        participantName: state.participantName,
        progress: this.calculateProgress(state),
        lastSavedAt: state.lastSavedAt
      });
      
      // Keep only the most recent sessions
      index.sort((a, b) => b.lastSavedAt - a.lastSavedAt);
      index = index.slice(0, MAX_SAVED_SESSIONS);
      
      localStorage.setItem(indexKey, JSON.stringify(index));
    } catch (error) {
      console.error('❌ Failed to update session index:', error);
    }
  }

  /**
   * Remove session from index
   */
  private static removeFromSessionIndex(sessionId: string): void {
    try {
      const indexKey = `${STORAGE_KEY_PREFIX}index`;
      const existingData = localStorage.getItem(indexKey);
      if (!existingData) return;
      
      let index = JSON.parse(existingData);
      index = index.filter((item: any) => item.sessionId !== sessionId);
      
      localStorage.setItem(indexKey, JSON.stringify(index));
    } catch (error) {
      console.error('❌ Failed to remove from session index:', error);
    }
  }

  /**
   * Generate a unique session ID
   */
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Auto-save session every N seconds
   */
  static setupAutoSave(state: SavedSessionState, intervalSeconds: number = 30): () => void {
    const interval = setInterval(() => {
      this.saveSession(state);
    }, intervalSeconds * 1000);

    // Return cleanup function
    return () => clearInterval(interval);
  }
}