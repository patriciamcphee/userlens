import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Project, ProjectParticipant } from "../types";
import { api } from "../utils/api";
import { isLinkExpired } from "../utils/sessionLinks";
import { RefreshCw, AlertCircle, Eye, Clock, Monitor, CheckCircle as Check, Activity, Mail } from "lucide-react";
import { Button } from "./ui/button";


interface UnmoderatedTaskViewProps {
  project: Project;
  participant: ProjectParticipant;
  mediaStream: MediaStream;
  onSessionEnd: () => void;
}

function UnmoderatedTaskView({ project, participant, mediaStream, onSessionEnd }: UnmoderatedTaskViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Task View - {project.name}</h1>
        <p>Session in progress for {participant.name}</p>
        <Button onClick={onSessionEnd} className="mt-4">End Session</Button>
      </div>
    </div>
  );
}

export function SessionPage() {
  const { projectId, participantId, token } = useParams<{
    projectId: string;
    participantId: string;
    token: string;
  }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [participant, setParticipant] = useState<ProjectParticipant | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const validateAndLoadSession = async () => {
      try {
        setLoading(true);
        
        if (!projectId || !participantId) {
          setError("Invalid session link");
          return;
        }

        // Check if this is test mode (token === 'test')
        const testMode = token === 'test';
        setIsTestMode(testMode);

        // Load project data
        const projectsData = await api.getProjects();
        const foundProject = projectsData.find((p: Project) => p.id === projectId);
        
        if (!foundProject) {
          setError("Project not found");
          return;
        }
        
        setProject(foundProject);

        // Find participant
        const foundParticipant = foundProject.participants?.find(
          (p: ProjectParticipant) => p.id === participantId
        );
        
        if (!foundParticipant) {
          setError("Participant not found");
          return;
        }

        // Validate session link (skip validation in test mode)
        if (!testMode) {
          if (!foundParticipant.sessionLinkToken || foundParticipant.sessionLinkToken !== token) {
            setError("Invalid session link");
            return;
          }

          if (!foundParticipant.sessionLinkExpiry) {
            setError("Session link has no expiry date");
            return;
          }

          if (isLinkExpired(foundParticipant.sessionLinkExpiry)) {
            setError("This session link has expired. Please contact the researcher for a new link.");
            return;
          }
        }

        setParticipant(foundParticipant);
        
        // Redirect to the appropriate session type based on project mode
        // This will be handled in the render based on successful validation
      } catch (error) {
        console.error("Error loading session:", error);
        setError("Failed to load session. Please try again or contact the researcher.");
      } finally {
        setLoading(false);
      }
    };

    validateAndLoadSession();
  }, [projectId, participantId, token]);

  const startUnmoderatedSession = async () => {
    // Show instructions before starting
    const shouldContinue = window.confirm(
      "🎥 IMPORTANT SCREEN SHARING SETUP\n\n" +
      "In the next step, your browser will ask which screen/window to share.\n\n" +
      "✅ DO: Select the window/tab of the app you'll be testing\n" +
      "❌ DON'T: Select this ParticipantLens tab (it will cause an infinite mirror effect)\n\n" +
      "Ready to continue?"
    );
    
    if (!shouldContinue) {
      return;
    }
    
    try {
      // Request screen sharing and audio permissions
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          cursor: 'always',
        } as any,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'exclude',
        systemAudio: 'exclude',
      } as any);
      
      setMediaStream(stream);
      setSessionStarted(true);
      
      // TODO: Start recording and tracking here
      // This would integrate with the recording infrastructure
      
    } catch (error) {
      console.error("Error starting screen share:", error);
      alert("Screen sharing is required to start the session. Please allow access when prompted.");
    }
  };

  // Once validation is complete and successful, render the session component
  // For now, we'll show a success message and instructions
  // The actual session components (ModeratedSession/UnmoderatedSession) would be rendered here
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-slate-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !project || !participant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Access Session</h2>
          <p className="text-gray-600 mb-6">
            {error || "An error occurred while loading the session."}
          </p>
          <Button onClick={() => navigate("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // If session has started, show task view
  if (sessionStarted && mediaStream) {
    return (
      <UnmoderatedTaskView
        project={project}
        participant={participant}
        mediaStream={mediaStream}
        onSessionEnd={() => {
          setSessionStarted(false);
          setMediaStream(null);
          // Show completion message
          navigate('/session-complete');
        }}
      />
    );
  }

  // Calculate participant level
  const participantLevel = participant.segmentLevel || 'Non-User';
  const taskCount = project.tasks?.length || 2;
  const estimatedMinutes = `${taskCount * 7}-${taskCount * 10}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-12">
        {/* Eye Icon */}
        <div className="flex items-center justify-center w-24 h-24 bg-purple-100 rounded-full mb-8 mx-auto">
          <Eye className="w-12 h-12 text-purple-600" />
        </div>
        
        {/* Welcome Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          Welcome
        </h1>
        
        {/* Thank you message */}
        <p className="text-center text-indigo-700 mb-4">
          Thank you for participating in this user testing session!
        </p>

        {/* Description */}
        <p className="text-center text-gray-700 mb-6">
          Your feedback will help us improve our product. This session should take approximately {estimatedMinutes} minutes.
        </p>

        {/* Instructions */}
        <div className="mb-6">
          <p className="text-center text-gray-700 mb-3">
            During this session, you'll complete a series of tasks. Please:
          </p>
          <div className="space-y-1 text-gray-700 text-center">
            <p>- Think aloud as you work through each task</p>
            <p>- Share your honest thoughts and reactions</p>
            <p>- Ask questions if anything is unclear</p>
          </div>
        </div>

        {/* Important note */}
        <p className="text-center text-indigo-700 font-medium mb-8">
          There are no right or wrong answers - we're testing the product, not you!
        </p>

        {/* Scenario */}
        <div className="bg-purple-50 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-2">Scenario</h3>
          <p className="text-gray-700 text-sm">
            Imagine you're using this product for the first time. You've just signed up and are exploring the interface.
          </p>
        </div>

        {/* What to expect */}
        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-gray-900">What to expect:</h3>
          
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-700 text-sm">
                You'll complete {taskCount} tasks
              </p>
              <p className="text-xs text-gray-500">(Matched to your {participantLevel} level)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Monitor className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-700 text-sm">
                Your screen and voice will be recorded together and securely uploaded
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Check className="w-3 h-3" /> Audio and video stay perfectly in sync
              </p>
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-xs text-amber-800 font-medium">
                  📌 Important: When prompted, share the window/tab of the app you're testing — NOT this ParticipantLens tab
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700 text-sm">
              Keyboard and mouse movements will be tracked
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700 text-sm">
              You'll provide feedback and observations after each task
            </p>
          </div>
        </div>

        {/* Start Button */}
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg"
          onClick={startUnmoderatedSession}
        >
          Start Testing Session
        </Button>
      </div>
    </div>
  );
}
