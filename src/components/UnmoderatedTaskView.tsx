import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Monitor } from "lucide-react";
import { api } from "../utils/api";

// Import types
interface Project {
  id: string;
  name: string;
  mode?: 'moderated' | 'unmoderated';
  tasks?: Task[];
}

interface ProjectParticipant {
  id: string;
  name: string;
  email: string;
  usageLevel?: string;
  segmentLevel?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
}

interface UnmoderatedTaskViewProps {
  project: Project;
  participant: ProjectParticipant;
  mediaStream: MediaStream;
  onSessionEnd: () => void;
}

export function UnmoderatedTaskView({ 
  project, 
  participant, 
  mediaStream,
  onSessionEnd 
}: UnmoderatedTaskViewProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Analytics tracking
  const [clickCount, setClickCount] = useState(0);
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const sessionStartTime = useRef<number>(Date.now());
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  
  const tasks = project.tasks || [];
  const currentTask = tasks[currentTaskIndex];
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  // Track mouse clicks and keystrokes
  useEffect(() => {
    const handleClick = () => {
      setClickCount((prev) => prev + 1);
    };
    
    const handleKeydown = () => {
      setKeystrokeCount((prev) => prev + 1);
    };
    
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);
  
  // Start recording
  useEffect(() => {
    if (!mediaStream) return;
    
    try {
      // Use lower bitrate to reduce file size
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 1000000, // 1 Mbps (lower quality but smaller files)
        audioBitsPerSecond: 64000,   // 64 kbps
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      
      recorder.onstop = async () => {
        console.log('Recording stopped, uploading...');
        await uploadRecording();
      };
      
      recorder.start(1000); // Capture data every second
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please refresh and try again.');
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [mediaStream]);
  
  const uploadRecording = async () => {
    try {
      setIsUploading(true);
      console.log('Starting upload process...');
      
      if (recordedChunks.length === 0) {
        console.error('No recorded chunks to upload');
        setIsUploading(false);
        return;
      }
      
      console.log(`Uploading ${recordedChunks.length} chunks...`);
      
      // Create a single blob from all chunks
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      console.log(`Blob size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
      
      // Calculate session analytics
      const sessionDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      
      console.log('Sending to Azure with analytics:', {
        duration: sessionDuration,
        tasksCompleted: currentTaskIndex + 1,
        totalTasks: tasks.length,
        clicks: clickCount,
        keystrokes: keystrokeCount
      });
      
      // Upload using the API service (which now points to Azure)
      const result = await api.uploadRecording(
        blob,
        project.id,
        participant.id,
        {
          sessionId: `session_${Date.now()}`,
          duration: sessionDuration,
          tasksCompleted: currentTaskIndex + 1,
          totalTasks: tasks.length,
          clicks: clickCount,
          keystrokes: keystrokeCount,
          hasVideo: true,
          hasAudio: true
        }
      );
      
      console.log('Recording uploaded successfully to Azure Storage:', result);
      setIsUploading(false);
      
    } catch (error) {
      console.error('Error uploading recording:', error);
      setIsUploading(false);
      alert('Failed to upload recording. Please contact the researcher.');
    }
  };
  
  const handleNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      handleEndSession();
    }
  };
  
  const handleEndSession = () => {
    // Stop recording
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    // Stop all tracks
    mediaStream.getTracks().forEach(track => track.stop());
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Note: onSessionEnd will be called after upload completes
    // We'll add a delay to allow upload to finish
    setTimeout(() => {
      onSessionEnd();
    }, 2000);
  };
  
  const estimatedTotalMinutes = tasks.length * 10;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Left side - Screen preview */}
      <div className="flex-1 p-8 flex flex-col">
        <div className="flex-1 relative">
          {/* Video preview of shared screen */}
          <video
            ref={(video) => {
              if (video && mediaStream) {
                video.srcObject = mediaStream;
                video.play();
              }
            }}
            autoPlay
            muted
            className="w-full h-full object-contain bg-black rounded-xl"
          />
          
          {/* Recording indicator overlay */}
          {isRecording && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-red-50/95 border border-red-200 rounded-lg backdrop-blur-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-700">Recording</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - Instructions panel */}
      <div className="w-96 bg-slate-900 text-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-green-400" />
            <span className="font-medium">Instructions</span>
          </div>
          <div className="text-sm text-slate-300">
            {formatTime(elapsedTime)}/{formatTime(estimatedTotalMinutes * 60)}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <p className="text-sm text-slate-300 mb-4">
              Please follow the instructions below to read your frame of mind for this test.
            </p>
            
            {currentTask && (
              <>
                {/* Task Title */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Task {currentTaskIndex + 1} of {tasks.length}</h3>
                  <p className="text-sm text-slate-300">{currentTask.title}</p>
                </div>
                
                {/* Frame of Mind */}
                <div className="bg-slate-800 rounded-lg p-4 mb-6">
                  <h4 className="font-bold mb-3">Your Frame of Mind:</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    You should adopt this mindset while performing the tasks:
                  </p>
                  
                  <div className="border-l-4 border-purple-500 pl-4 py-2 bg-slate-700/50 rounded-r">
                    <p className="text-sm text-slate-200">
                      {currentTask.description || currentTask.title}
                    </p>
                  </div>
                </div>
                
                {/* Instructions box */}
                <div className="border-l-4 border-purple-500 pl-4 py-3 bg-slate-800/50 rounded-r mb-4">
                  <p className="text-sm text-slate-200 mb-2">
                    - The frame of mind for this test will appear to the left.
                  </p>
                  <p className="text-sm text-slate-200 mb-2">
                    After reading, click the 'Next step' button. As you continue through the test, read every new instruction and text before performing it.{" "}
                    <span className="font-bold text-white">Don't jump ahead!</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Footer with buttons */}
        <div className="p-6 border-t border-slate-700 space-y-3">
          {isUploading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
              <p className="text-sm text-slate-300">Uploading recording to cloud storage...</p>
            </div>
          ) : (
            <>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12"
                onClick={handleNextTask}
              >
                {currentTaskIndex < tasks.length - 1 ? 'Next step' : 'Complete Session'}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={handleEndSession}
              >
                QUIT
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}