// hooks/useRecording.tsx
import { useState, useRef, useCallback } from 'react';
import { azureUploadService } from '../services/azureUploadService';
import { CombinedRecorder } from '../services/CombinedRecorder';

interface RecordingOptions {
  video: boolean;
  audio: boolean;
  projectId: string | number;
  participantId: string | number;
  sessionId: string;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  hasVideo: boolean;
  hasAudio: boolean;
  error: string | null;
  isUploading: boolean;
  uploadProgress: number;
}

interface RecordingResult {
  success: boolean;
  url?: string;
  duration: number;
  size: number;
  hasVideo: boolean;
  hasAudio: boolean;
  error?: string;
}

export function useRecording() {
  const recorderRef = useRef<CombinedRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    hasVideo: false,
    hasAudio: false,
    error: null,
    isUploading: false,
    uploadProgress: 0
  });

  const startRecording = useCallback(async (options: RecordingOptions): Promise<boolean> => {
    try {
      console.log('🎬 Starting recording with options:', options);

      // Create new recorder instance
      recorderRef.current = new CombinedRecorder();

      // Start recording
      const result = await recorderRef.current.startRecording({
        video: options.video,
        audio: options.audio
      });

      if (!result.success) {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to start recording'
        }));
        console.error('❌ Recording failed:', result.error);
        return false;
      }

      // Update state
      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        hasVideo: result.hasVideo,
        hasAudio: result.hasAudio,
        error: null,
        duration: 0
      }));

      // Start duration timer
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setState(prev => ({ ...prev, duration: elapsed }));
      }, 1000);

      console.log('✅ Recording started successfully', {
        hasVideo: result.hasVideo,
        hasAudio: result.hasAudio
      });

      return true;
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      return false;
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current && state.isRecording && !state.isPaused) {
      recorderRef.current.pauseRecording();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setState(prev => ({ ...prev, isPaused: true }));
      console.log('⏸️ Recording paused');
    }
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current && state.isRecording && state.isPaused) {
      recorderRef.current.resumeRecording();
      
      // Resume timer
      startTimeRef.current = Date.now() - (state.duration * 1000);
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setState(prev => ({ ...prev, duration: elapsed }));
      }, 1000);

      setState(prev => ({ ...prev, isPaused: false }));
      console.log('▶️ Recording resumed');
    }
  }, [state.isRecording, state.isPaused, state.duration]);

  const stopRecording = useCallback(async (
    options: RecordingOptions
  ): Promise<RecordingResult> => {
    if (!recorderRef.current) {
      return {
        success: false,
        duration: 0,
        size: 0,
        hasVideo: false,
        hasAudio: false,
        error: 'No active recording'
      };
    }

    try {
      console.log('🛑 Stopping recording...');

      // Stop duration timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Stop recording and get blob
      const result = await recorderRef.current.stopRecording();

      console.log('📊 Recording stopped:', {
        duration: result.duration,
        size: result.size,
        sizeMB: (result.size / 1024 / 1024).toFixed(2),
        hasVideo: result.hasVideo,
        hasAudio: result.hasAudio
      });

      // Update state to show uploading
      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        isUploading: true,
        uploadProgress: 0
      }));

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = result.hasVideo ? 'webm' : 'webm'; // Audio-only is also .webm
      const filename = `recordings/${options.projectId}/${options.sessionId}_${timestamp}.${extension}`;

      console.log('📤 Uploading to Azure:', filename);

      // Upload to Azure
      const url = await azureUploadService.uploadRecording(
        result.blob,
        filename,
        {
          duration: result.duration,
          size: result.size,
          hasVideo: result.hasVideo,
          hasAudio: result.hasAudio
        }
      );

      console.log('✅ Upload complete:', url);

      // Reset state
      setState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        hasVideo: false,
        hasAudio: false,
        error: null,
        isUploading: false,
        uploadProgress: 100
      });

      return {
        success: true,
        url,
        duration: result.duration,
        size: result.size,
        hasVideo: result.hasVideo,
        hasAudio: result.hasAudio
      };

    } catch (error) {
      console.error('❌ Error stopping/uploading recording:', error);
      
      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        isUploading: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }));

      return {
        success: false,
        duration: state.duration,
        size: 0,
        hasVideo: state.hasVideo,
        hasAudio: state.hasAudio,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }, [state.duration, state.hasVideo, state.hasAudio]);

  const cancelRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      hasVideo: false,
      hasAudio: false,
      error: null,
      isUploading: false,
      uploadProgress: 0
    });

    console.log('🚫 Recording cancelled');
  }, []);

  return {
    state,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording
  };
}