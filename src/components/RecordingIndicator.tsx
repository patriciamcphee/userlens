import React from 'react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  Play,
  ExternalLink,
  Loader2,
  Upload,
  Clock,
  VideoOff,
  Video,
  Link2,
  Plus,
} from 'lucide-react';
import { SessionRecording } from '../types';

// Platform icons
const PlatformIcons: Record<string, React.ReactNode> = {
  zoom: <Play className="h-3 w-3" />,
  teams: <Play className="h-3 w-3" />,
  meet: <Play className="h-3 w-3" />,
  webex: <Play className="h-3 w-3" />,
  browser: <Play className="h-3 w-3" />,
  youtube: <Play className="h-3 w-3" />,
  vimeo: <Play className="h-3 w-3" />,
  loom: <Play className="h-3 w-3" />,
  sharepoint: <Play className="h-3 w-3" />,
  gdrive: <Play className="h-3 w-3" />,
  dropbox: <Play className="h-3 w-3" />,
  other: <Play className="h-3 w-3" />,
};

const PlatformNames: Record<string, string> = {
  zoom: 'Zoom',
  teams: 'Teams',
  meet: 'Meet',
  webex: 'Webex',
  browser: 'Browser',
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  loom: 'Loom',
  sharepoint: 'SharePoint',
  gdrive: 'Google Drive',
  dropbox: 'Dropbox',
  other: 'External',
};

// Re-export types from types.ts for convenience
export type { SessionRecording, RecordingStatus, RecordingStorageType as StorageType, RecordingPlatform as Platform } from '../types';

interface RecordingIndicatorProps {
  recording?: SessionRecording;
  onPlay?: () => void;
  onExternalOpen?: (url: string) => void;
  onAddRecording?: () => void;  // New: callback to open add recording dialog
  showAddOption?: boolean;       // New: whether to show "Add URL" when no recording
  size?: 'sm' | 'md';
  className?: string;
}

// Helper to format duration
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function RecordingIndicator({
  recording,
  onPlay,
  onExternalOpen,
  onAddRecording,
  showAddOption = true,
  size = 'sm',
  className = '',
}: RecordingIndicatorProps) {
  // No recording data at all
  if (!recording || recording.status === 'none') {
    // Show "Add URL" option if callback is provided
    if (showAddOption && onAddRecording) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onAddRecording}
                className={`text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors ${className}`}
              >
                <Link2 className="h-3 w-3" />
                <span className="hidden sm:inline">Add URL</span>
                <span className="sm:hidden">Add</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={5} className="z-[9999]">
              <p>Add a recording URL</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Default: show "No recording" text
    return (
      <span className={`text-xs text-slate-400 flex items-center gap-1 ${className}`}>
        <VideoOff className="h-3 w-3" />
        No recording
      </span>
    );
  }

  // Session scheduled but not yet recorded
  if (recording.status === 'scheduled') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-xs text-slate-400 flex items-center gap-1 cursor-help ${className}`}>
              <Clock className="h-3 w-3" />
              Pending
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5} className="z-[9999]">
            <p>Recording will be available after the session</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Currently uploading
  if (recording.status === 'uploading') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 cursor-help ${className}`}>
              <Upload className="h-3 w-3 animate-pulse" />
              Uploading...
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5} className="z-[9999]">
            <p>Recording is being uploaded</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Processing (transcoding, transcribing)
  if (recording.status === 'processing') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 cursor-help ${className}`}>
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing...
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5} className="z-[9999]">
            <p>Recording is being processed and will be available soon</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // External recording (stored on Zoom/Teams/etc.)
  if (recording.status === 'external' && recording.externalUrl) {
    const platformName = recording.platform ? PlatformNames[recording.platform] : 'External';
    const platformIcon = recording.platform ? PlatformIcons[recording.platform] : <Play className="h-3 w-3" />;
    const tooltipText = recording.duration 
      ? `Open recording in ${platformName} (${formatDuration(recording.duration)})`
      : `Open recording in ${platformName}`;

    return (
      <Button
        variant="ghost"
        size="sm"
        title={tooltipText}
        className={`h-6 px-2 text-xs gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 ${className}`}
        onClick={() => onExternalOpen?.(recording.externalUrl!)}
      >
        {platformIcon}
        {platformName}
        <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
      </Button>
    );
  }

  // Ready to play (internal storage)
  if (recording.status === 'ready') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 ${className}`}
              onClick={onPlay}
            >
              <Play className="h-3 w-3" />
              Play
              {recording.duration && (
                <span className="text-slate-400 ml-1">
                  {formatDuration(recording.duration)}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5} className="z-[9999]">
            <p>Play recording</p>
            {recording.hasTranscript && <p className="text-xs text-slate-400">Transcript available</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Fallback
  return (
    <span className={`text-xs text-slate-400 ${className}`}>
      No recording
    </span>
  );
}

// Demo component showing all states
export function RecordingIndicatorDemo() {
  const states: { label: string; recording?: SessionRecording; showAdd?: boolean }[] = [
    { label: 'No recording + Add URL', recording: undefined, showAdd: true },
    { label: 'No recording (no add option)', recording: undefined, showAdd: false },
    { label: 'No recording (none status)', recording: { status: 'none' }, showAdd: true },
    { label: 'Scheduled', recording: { status: 'scheduled' } },
    { label: 'Uploading', recording: { status: 'uploading' } },
    { label: 'Processing', recording: { status: 'processing' } },
    { 
      label: 'External (Zoom)', 
      recording: { 
        status: 'external', 
        storageType: 'external',
        platform: 'zoom',
        externalUrl: 'https://zoom.us/rec/123',
        duration: 2723,
      } 
    },
    { 
      label: 'External (Teams)', 
      recording: { 
        status: 'external', 
        storageType: 'external',
        platform: 'teams',
        externalUrl: 'https://teams.microsoft.com/rec/456',
        duration: 1845,
      } 
    },
    { 
      label: 'External (no platform)', 
      recording: { 
        status: 'external', 
        storageType: 'external',
        externalUrl: 'https://example.com/video/123',
        duration: 1200,
      } 
    },
    { 
      label: 'Ready (short)', 
      recording: { 
        status: 'ready', 
        storageType: 'internal',
        platform: 'browser',
        duration: 327,
        hasTranscript: true,
      } 
    },
    { 
      label: 'Ready (long)', 
      recording: { 
        status: 'ready', 
        storageType: 'internal',
        platform: 'zoom',
        duration: 5423,
        hasTranscript: true,
      } 
    },
  ];

  return (
    <div className="p-6 bg-white dark:bg-slate-950 rounded-lg space-y-4">
      <h3 className="font-semibold mb-4">Recording Indicator States</h3>
      <div className="space-y-3">
        {states.map((state, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
            <span className="text-sm text-slate-600 dark:text-slate-400">{state.label}</span>
            <RecordingIndicator
              recording={state.recording}
              onPlay={() => console.log('Play clicked')}
              onExternalOpen={(url) => window.open(url, '_blank')}
              onAddRecording={state.showAdd !== false ? () => console.log('Add recording clicked') : undefined}
              showAddOption={state.showAdd !== false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecordingIndicator;