import React, { useState, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Download,
  Share2,
  Scissors,
  MessageSquare,
  Tag,
  Clock,
  Video,
  Mic,
  Monitor,
  ChevronDown,
  ChevronRight,
  Check,
  Plus,
  FileText,
  Sparkles,
  AlertCircle,
  Loader2,
  ExternalLink,
  Camera,
} from 'lucide-react';

// Types
interface Recording {
  id: string;
  sessionNumber: number;
  sessionDate: string;
  duration: number; // seconds
  type: 'moderated' | 'unmoderated';
  platform: 'zoom' | 'teams' | 'meet' | 'webex' | 'browser';
  status: 'processing' | 'ready' | 'failed';
  hasTranscript: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
}

interface TranscriptSegment {
  id: string;
  speaker: 'participant' | 'researcher' | 'unknown';
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
  isHighlighted?: boolean;
}

interface Note {
  id: string;
  timestamp: number;
  text: string;
  tags: string[];
  createdAt: string;
}

interface Participant {
  id: string;
  participantId: string;
  name?: string;
  avatar?: string;
  sessionCount: number;
  recordingCount: number;
}

interface RecordingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: Participant | null;
}

// Mock data
const mockRecordings: Recording[] = [
  {
    id: 'rec-1',
    sessionNumber: 1,
    sessionDate: '2024-11-12',
    duration: 2723, // 45:23
    type: 'moderated',
    platform: 'zoom',
    status: 'ready',
    hasTranscript: true,
    hasVideo: true,
    hasAudio: true,
    thumbnailUrl: '/api/placeholder/320/180',
  },
  {
    id: 'rec-2',
    sessionNumber: 2,
    sessionDate: '2024-11-15',
    duration: 727, // 12:07
    type: 'unmoderated',
    platform: 'browser',
    status: 'processing',
    hasTranscript: false,
    hasVideo: true,
    hasAudio: true,
  },
  {
    id: 'rec-3',
    sessionNumber: 3,
    sessionDate: '2024-11-18',
    duration: 1834, // 30:34
    type: 'moderated',
    platform: 'teams',
    status: 'ready',
    hasTranscript: true,
    hasVideo: true,
    hasAudio: true,
    thumbnailUrl: '/api/placeholder/320/180',
  },
];

const mockTranscript: TranscriptSegment[] = [
  {
    id: 't-1',
    speaker: 'researcher',
    speakerName: 'Sarah (Researcher)',
    startTime: 0,
    endTime: 8,
    text: "Thanks for joining today. I'd like to start by understanding how you typically approach finding information in our product.",
  },
  {
    id: 't-2',
    speaker: 'participant',
    speakerName: 'Participant',
    startTime: 9,
    endTime: 24,
    text: "Sure, so usually I start with the search bar. But honestly, I find it kind of frustrating because the results aren't always relevant to what I'm looking for.",
    isHighlighted: true,
  },
  {
    id: 't-3',
    speaker: 'researcher',
    speakerName: 'Sarah (Researcher)',
    startTime: 25,
    endTime: 32,
    text: "That's really helpful. Can you tell me more about a specific time when the search didn't work well for you?",
  },
  {
    id: 't-4',
    speaker: 'participant',
    speakerName: 'Participant',
    startTime: 33,
    endTime: 58,
    text: "Yeah, last week I was trying to find the settings for notifications. I typed 'notifications' but it showed me articles about notification features instead of where to actually change my settings. I ended up clicking around for like five minutes before I found it.",
  },
  {
    id: 't-5',
    speaker: 'researcher',
    speakerName: 'Sarah (Researcher)',
    startTime: 59,
    endTime: 65,
    text: "I see. And where did you eventually find the notification settings?",
  },
  {
    id: 't-6',
    speaker: 'participant',
    speakerName: 'Participant',
    startTime: 66,
    endTime: 82,
    text: "It was buried in my profile, under preferences. I wouldn't have expected it there. I thought it would be in a main settings area or something more obvious.",
    isHighlighted: true,
  },
  {
    id: 't-7',
    speaker: 'researcher',
    speakerName: 'Sarah (Researcher)',
    startTime: 83,
    endTime: 91,
    text: "That makes sense. Where would you have expected to find notification settings?",
  },
  {
    id: 't-8',
    speaker: 'participant',
    speakerName: 'Participant',
    startTime: 92,
    endTime: 115,
    text: "Probably in a gear icon at the top, or maybe in a sidebar. Most apps I use have a dedicated settings section that's pretty prominent. Here it feels hidden.",
  },
];

const mockNotes: Note[] = [
  {
    id: 'n-1',
    timestamp: 15,
    text: 'Search frustration - results not relevant',
    tags: ['pain-point', 'search'],
    createdAt: '2024-11-12T14:32:00Z',
  },
  {
    id: 'n-2',
    timestamp: 72,
    text: 'Expected settings in different location - mental model mismatch',
    tags: ['navigation', 'mental-model'],
    createdAt: '2024-11-12T14:35:00Z',
  },
];

// Helper functions
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getPlatformIcon = (platform: Recording['platform']) => {
  switch (platform) {
    case 'zoom':
      return <Video className="h-3 w-3" />;
    case 'teams':
      return <Video className="h-3 w-3" />;
    case 'meet':
      return <Video className="h-3 w-3" />;
    case 'webex':
      return <Video className="h-3 w-3" />;
    case 'browser':
      return <Monitor className="h-3 w-3" />;
    default:
      return <Video className="h-3 w-3" />;
  }
};

const getPlatformName = (platform: Recording['platform']): string => {
  switch (platform) {
    case 'zoom':
      return 'Zoom';
    case 'teams':
      return 'Teams';
    case 'meet':
      return 'Google Meet';
    case 'webex':
      return 'Webex';
    case 'browser':
      return 'Browser';
    default:
      return platform;
  }
};

export function RecordingSheet({ open, onOpenChange, participant }: RecordingSheetProps) {
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('transcript');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [expandedRecordings, setExpandedRecordings] = useState<string[]>([]);

  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-select first ready recording
  useEffect(() => {
    if (open && !selectedRecording) {
      const firstReady = mockRecordings.find((r) => r.status === 'ready');
      if (firstReady) {
        setSelectedRecording(firstReady);
        setExpandedRecordings([firstReady.id]);
      }
    }
  }, [open, selectedRecording]);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setSelectedRecording(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveTab('transcript');
    }
  }, [open]);

  // Simulate playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedRecording) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= selectedRecording.duration) {
            setIsPlaying(false);
            return selectedRecording.duration;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, selectedRecording]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current && isPlaying) {
      const activeSegment = mockTranscript.find(
        (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
      );
      if (activeSegment) {
        const element = document.getElementById(`segment-${activeSegment.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, isPlaying]);

  const toggleRecordingExpand = (recordingId: string) => {
    setExpandedRecordings((prev) =>
      prev.includes(recordingId)
        ? prev.filter((id) => id !== recordingId)
        : [...prev, recordingId]
    );
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleTranscriptClick = (startTime: number) => {
    setCurrentTime(startTime);
    setIsPlaying(true);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `n-${Date.now()}`,
      timestamp: currentTime,
      text: newNote.trim(),
      tags: [],
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, note].sort((a, b) => a.timestamp - b.timestamp));
    setNewNote('');
  };

  const skipBack = () => {
    setCurrentTime((prev) => Math.max(0, prev - 10));
  };

  const skipForward = () => {
    if (selectedRecording) {
      setCurrentTime((prev) => Math.min(selectedRecording.duration, prev + 10));
    }
  };

  if (!participant) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium">
              {participant.name?.[0] || participant.participantId.slice(0, 2)}
            </div>
            <div>
              <SheetTitle className="text-left">
                {participant.name || participant.participantId}
              </SheetTitle>
              <SheetDescription className="text-left">
                {participant.sessionCount} sessions • {participant.recordingCount} recordings
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Recording List */}
        <div className="border-b">
          <ScrollArea className="max-h-48">
            <div className="p-2 space-y-1">
              {mockRecordings.map((recording) => (
                <div key={recording.id} className="rounded-lg border bg-white dark:bg-slate-950">
                  {/* Recording Header */}
                  <button
                    onClick={() => {
                      if (recording.status === 'ready') {
                        setSelectedRecording(recording);
                        setCurrentTime(0);
                        setIsPlaying(false);
                      }
                      toggleRecordingExpand(recording.id);
                    }}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors ${
                      selectedRecording?.id === recording.id
                        ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800'
                        : ''
                    }`}
                  >
                    {expandedRecordings.includes(recording.id) ? (
                      <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          Session {recording.sessionNumber}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(recording.sessionDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs py-0 h-5 gap-1">
                          {getPlatformIcon(recording.platform)}
                          {getPlatformName(recording.platform)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs py-0 h-5 ${
                            recording.type === 'moderated'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400'
                              : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400'
                          }`}
                        >
                          {recording.type === 'moderated' ? 'Moderated' : 'Unmoderated'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {recording.status === 'ready' ? (
                        <>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDuration(recording.duration)}
                          </span>
                          {recording.hasTranscript && (
                            <Badge
                              variant="outline"
                              className="text-xs py-0 h-5 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Transcribed
                            </Badge>
                          )}
                        </>
                      ) : recording.status === 'processing' ? (
                        <Badge
                          variant="outline"
                          className="text-xs py-0 h-5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400"
                        >
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Processing
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs py-0 h-5 bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  </button>

                  {/* Recording Details (expanded) */}
                  {expandedRecordings.includes(recording.id) && (
                    <div className="px-3 pb-3 pt-0 ml-7 border-t mt-2">
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        {recording.hasVideo && (
                          <span className="flex items-center gap-1">
                            <Camera className="h-3 w-3" /> Video
                          </span>
                        )}
                        {recording.hasAudio && (
                          <span className="flex items-center gap-1">
                            <Mic className="h-3 w-3" /> Audio
                          </span>
                        )}
                        {recording.type === 'unmoderated' && (
                          <span className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" /> Screen
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Video Player */}
        {selectedRecording && selectedRecording.status === 'ready' && (
          <div className="border-b bg-black">
            {/* Video Area */}
            <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
              <div className="text-slate-500 text-sm">
                {/* Placeholder for actual video */}
                <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <span>Video Player</span>
              </div>

              {/* Play/Pause Overlay */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-slate-900" />
                  ) : (
                    <Play className="h-8 w-8 text-slate-900 ml-1" />
                  )}
                </div>
              </button>

              {/* Current Time Badge */}
              <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatTime(currentTime)} / {formatDuration(selectedRecording.duration)}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-900 px-4 py-2">
              {/* Progress Bar */}
              <div className="mb-2">
                <Slider
                  value={[currentTime]}
                  max={selectedRecording.duration}
                  step={1}
                  onValueChange={([value]) => handleSeek(value)}
                  className="cursor-pointer"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={skipBack}
                          className="text-white hover:bg-white/20"
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Skip back 10s</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={skipForward}
                          className="text-white hover:bg-white/20"
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Skip forward 10s</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Volume */}
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={100}
                        step={1}
                        onValueChange={([value]) => {
                          setVolume(value);
                          setIsMuted(value === 0);
                        }}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Timestamp */}
                  <span className="text-white/70 text-xs ml-3">
                    {formatTime(currentTime)} / {formatDuration(selectedRecording.duration)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Playback Speed */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 text-xs"
                      >
                        {playbackSpeed}x
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                        <DropdownMenuItem
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                        >
                          {speed === playbackSpeed && (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          {speed}x
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <Scissors className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Create clip</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Fullscreen</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transcript & Notes Tabs */}
        {selectedRecording && selectedRecording.status === 'ready' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="border-b px-4">
              <TabsList className="h-10">
                <TabsTrigger value="transcript" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Transcript
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Notes
                  {notes.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {notes.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="insights" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Insights
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Transcript Tab */}
            <TabsContent value="transcript" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full" ref={transcriptRef}>
                <div className="p-4 space-y-3">
                  {mockTranscript.map((segment) => {
                    const isActive =
                      currentTime >= segment.startTime && currentTime < segment.endTime;
                    return (
                      <div
                        key={segment.id}
                        id={`segment-${segment.id}`}
                        onClick={() => handleTranscriptClick(segment.startTime)}
                        className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                        } ${segment.isHighlighted ? 'border-l-4 border-l-amber-400' : ''}`}
                      >
                        <button className="flex-shrink-0 text-xs text-indigo-600 dark:text-indigo-400 font-mono hover:underline">
                          {formatTime(segment.startTime)}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs font-medium mb-0.5 ${
                              segment.speaker === 'researcher'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}
                          >
                            {segment.speakerName}
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {segment.text}
                          </p>
                        </div>
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Tag className="h-4 w-4 mr-2" />
                                Add Tag
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Scissors className="h-4 w-4 mr-2" />
                                Create Clip
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Extract Insight
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="flex-1 m-0 flex flex-col overflow-hidden">
              {/* Add Note Input */}
              <div className="p-4 border-b">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 text-xs text-slate-500 font-mono pt-2">
                    {formatTime(currentTime)}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Add a note at this timestamp..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleAddNote();
                        }
                      }}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-slate-500">⌘+Enter to save</span>
                      <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                        Add Note
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes List */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notes yet</p>
                      <p className="text-xs mt-1">Add your first note above</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="flex gap-3 p-3 rounded-lg border bg-white dark:bg-slate-950 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                      >
                        <button
                          onClick={() => handleSeek(note.timestamp)}
                          className="flex-shrink-0 text-xs text-indigo-600 dark:text-indigo-400 font-mono hover:underline"
                        >
                          {formatTime(note.timestamp)}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {note.text}
                          </p>
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {note.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="text-center py-8 text-slate-500">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">AI Analysis Coming Soon</p>
                    <p className="text-xs mt-1 max-w-xs mx-auto">
                      Automatic theme extraction, sentiment analysis, and key moment detection
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State - No Recording Selected */}
        {!selectedRecording && (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500">
            <div>
              <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Select a recording to view</p>
              <p className="text-sm mt-1">Choose from the sessions above</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default RecordingSheet;