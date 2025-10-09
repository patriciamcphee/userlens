// utils/recording.ts

/**
 * Recording utilities for screen and audio capture
 * 
 * IMPORTANT NOTES:
 * - Screen recordings can be LARGE (10MB+ per minute)
 * - localStorage has 5-10MB limit
 * - In production, upload to server/S3 instead of storing locally
 * - This implementation stores in memory and provides download functionality
 */

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  size: number;
  startTime: string | null;
  endTime: string | null;
}

export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  
  async startRecording(): Promise<boolean> {
    try {
      // Request screen capture with audio
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });

      // Create MediaRecorder
      const options = { mimeType: 'video/webm;codecs=vp9' };
      
      // Fallback to vp8 if vp9 not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8';
      }

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.chunks = [];
      this.startTime = Date.now();

      // Collect data chunks
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second

      return true;
    } catch (error) {
      console.error('Error starting screen recording:', error);
      return false;
    }
  }

  stopRecording(): Promise<{ blob: Blob; duration: number; size: number }> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve({ blob: new Blob(), duration: 0, size: 0 });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }

        resolve({
          blob,
          duration,
          size: blob.size
        });
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;

  async startRecording(): Promise<boolean> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create MediaRecorder
      const options = { mimeType: 'audio/webm' };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/ogg';
      }

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.chunks = [];
      this.startTime = Date.now();

      // Collect data chunks
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(1000);

      return true;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      return false;
    }
  }

  stopRecording(): Promise<{ blob: Blob; duration: number; size: number }> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve({ blob: new Blob(), duration: 0, size: 0 });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }

        resolve({
          blob,
          duration,
          size: blob.size
        });
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }
}

/**
 * Utility to download a recording
 */
export function downloadRecording(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if browser supports recording
 */
export function isRecordingSupported(): {
  screen: boolean;
  audio: boolean;
  message?: string;
} {
  const hasGetDisplayMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined';

  if (!hasMediaRecorder) {
    return {
      screen: false,
      audio: false,
      message: 'MediaRecorder API not supported in this browser'
    };
  }

  return {
    screen: hasGetDisplayMedia,
    audio: hasGetUserMedia,
    message: !hasGetDisplayMedia ? 'Screen recording not supported in this browser' : undefined
  };
}