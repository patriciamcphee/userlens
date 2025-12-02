import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import {
  Video,
  Link2,
  Clock,
  FileVideo,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Upload,
  Youtube,
  Globe,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { SessionRecording, RecordingPlatform } from '../types';

// Platform configurations
interface PlatformConfig {
  id: RecordingPlatform | 'youtube' | 'vimeo' | 'sharepoint' | 'gdrive' | 'dropbox' | 'loom' | 'other';
  name: string;
  icon: React.ReactNode;
  urlPatterns?: RegExp[];
  embedSupported: boolean;
  description: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'zoom',
    name: 'Zoom',
    icon: <Video className="h-4 w-4" />,
    urlPatterns: [/zoom\.us\/rec/i, /zoom\.us\/share/i],
    embedSupported: true,
    description: 'Zoom cloud recordings',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    icon: <Video className="h-4 w-4" />,
    urlPatterns: [/teams\.microsoft\.com/i, /sharepoint\.com.*\.mp4/i],
    embedSupported: true,
    description: 'Teams meeting recordings',
  },
  {
    id: 'meet',
    name: 'Google Meet',
    icon: <Video className="h-4 w-4" />,
    urlPatterns: [/drive\.google\.com/i, /meet\.google\.com/i],
    embedSupported: true,
    description: 'Meet recordings (stored in Google Drive)',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: <Youtube className="h-4 w-4" />,
    urlPatterns: [/youtube\.com\/watch/i, /youtu\.be\//i],
    embedSupported: true,
    description: 'YouTube videos (unlisted recommended)',
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    icon: <Video className="h-4 w-4" />,
    urlPatterns: [/vimeo\.com/i],
    embedSupported: true,
    description: 'Vimeo videos',
  },
  {
    id: 'loom',
    name: 'Loom',
    icon: <Video className="h-4 w-4" />,
    urlPatterns: [/loom\.com\/share/i],
    embedSupported: true,
    description: 'Loom recordings',
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    icon: <FileVideo className="h-4 w-4" />,
    urlPatterns: [/sharepoint\.com/i, /\.sharepoint\./i],
    embedSupported: false,
    description: 'SharePoint/OneDrive files',
  },
  {
    id: 'gdrive',
    name: 'Google Drive',
    icon: <FileVideo className="h-4 w-4" />,
    urlPatterns: [/drive\.google\.com/i],
    embedSupported: true,
    description: 'Google Drive video files',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: <FileVideo className="h-4 w-4" />,
    urlPatterns: [/dropbox\.com/i],
    embedSupported: false,
    description: 'Dropbox shared links',
  },
  {
    id: 'other',
    name: 'Other / Custom URL',
    icon: <Globe className="h-4 w-4" />,
    embedSupported: false,
    description: 'Any other video URL',
  },
];

// Detect platform from URL
function detectPlatform(url: string): PlatformConfig | null {
  if (!url) return null;
  
  for (const platform of PLATFORMS) {
    if (platform.urlPatterns) {
      for (const pattern of platform.urlPatterns) {
        if (pattern.test(url)) {
          return platform;
        }
      }
    }
  }
  return null;
}

// Basic URL validation
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Parse duration string to seconds
function parseDuration(duration: string): number | undefined {
  if (!duration) return undefined;
  
  // Try formats: "45:23", "1:23:45", "45m", "1h 30m", "90 minutes"
  const hmsParts = duration.match(/^(\d+):(\d{2})(?::(\d{2}))?$/);
  if (hmsParts) {
    if (hmsParts[3]) {
      // H:MM:SS
      return parseInt(hmsParts[1]) * 3600 + parseInt(hmsParts[2]) * 60 + parseInt(hmsParts[3]);
    } else {
      // M:SS or MM:SS
      return parseInt(hmsParts[1]) * 60 + parseInt(hmsParts[2]);
    }
  }
  
  // Try "45m", "1h", "1h 30m"
  let seconds = 0;
  const hours = duration.match(/(\d+)\s*h/i);
  const minutes = duration.match(/(\d+)\s*m/i);
  const mins = duration.match(/(\d+)\s*min/i);
  
  if (hours) seconds += parseInt(hours[1]) * 3600;
  if (minutes) seconds += parseInt(minutes[1]) * 60;
  if (mins) seconds += parseInt(mins[1]) * 60;
  
  return seconds > 0 ? seconds : undefined;
}

interface AddRecordingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionType: 'interview' | 'usability';
  participantId: string;
  participantName?: string;
  existingRecording?: SessionRecording;
  onSave: (recording: SessionRecording) => void;
}

export function AddRecordingDialog({
  open,
  onOpenChange,
  sessionType,
  participantId,
  participantName,
  existingRecording,
  onSave,
}: AddRecordingDialogProps) {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<string>('other');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformConfig | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (existingRecording) {
        setUrl(existingRecording.externalUrl || existingRecording.blobUrl || '');
        setPlatform(existingRecording.platform || 'other');
        if (existingRecording.duration) {
          const mins = Math.floor(existingRecording.duration / 60);
          const secs = existingRecording.duration % 60;
          setDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
        }
      } else {
        setUrl('');
        setPlatform('other');
        setDuration('');
        setNotes('');
      }
      setUrlError(null);
      setDetectedPlatform(null);
    }
  }, [open, existingRecording]);

  // Auto-detect platform when URL changes
  useEffect(() => {
    if (url) {
      const detected = detectPlatform(url);
      setDetectedPlatform(detected);
      
      // Auto-select detected platform
      if (detected && platform === 'other') {
        setPlatform(detected.id);
      }
      
      // Validate URL
      if (!isValidUrl(url)) {
        setUrlError('Please enter a valid URL');
      } else {
        setUrlError(null);
      }
    } else {
      setDetectedPlatform(null);
      setUrlError(null);
    }
  }, [url]);

  const handleSave = () => {
    console.log("AddRecordingDialog handleSave called");
    console.log("URL:", url);
    console.log("Platform:", platform);
    console.log("Duration:", duration);

    if (!url || !isValidUrl(url)) {
      console.log("URL validation failed");
      setUrlError('Please enter a valid URL');
      return;
    }

    const recording: SessionRecording = {
      status: 'external',
      storageType: 'external',
      platform: platform as any,  // Store all platform types for display purposes
      externalUrl: url,
      duration: parseDuration(duration),
      hasTranscript: false,
      transcriptStatus: 'none',
      recordedAt: new Date().toISOString(),
    };

    console.log("Created recording object:", recording);
    console.log("Calling onSave...");
    onSave(recording);
    console.log("onSave called, closing dialog");
    onOpenChange(false);
  };

  const selectedPlatformConfig = PLATFORMS.find(p => p.id === platform);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-indigo-600" />
            {existingRecording ? 'Edit Recording' : 'Add Recording'}
          </DialogTitle>
          <DialogDescription>
            Add a recording URL for {participantName || participantId}'s{' '}
            {sessionType === 'interview' ? 'interview' : 'usability testing'} session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="recording-url" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Recording URL <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="recording-url"
                type="url"
                placeholder="https://zoom.us/rec/share/... or any video URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={urlError ? 'border-red-300 focus:border-red-500' : ''}
              />
              {url && !urlError && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {urlError && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
              )}
            </div>
            {urlError && (
              <p className="text-xs text-red-500">{urlError}</p>
            )}
            {detectedPlatform && !urlError && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Detected: {detectedPlatform.name}
              </div>
            )}
          </div>

          {/* Platform Selector */}
          <div className="space-y-2">
            <Label htmlFor="platform" className="flex items-center gap-2">
              Platform
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Select where your recording is hosted. This helps us display the right icon and may enable embedding.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      {p.icon}
                      <span>{p.name}</span>
                      {p.embedSupported && (
                        <Badge variant="secondary" className="text-xs ml-2">
                          Embed
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPlatformConfig && (
              <p className="text-xs text-slate-500">{selectedPlatformConfig.description}</p>
            )}
          </div>

          {/* Duration Input */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
              <span className="text-slate-400 text-xs font-normal">(optional)</span>
            </Label>
            <Input
              id="duration"
              placeholder="e.g., 45:23, 1h 30m, or 90 minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              Formats: 45:23, 1:30:00, 45m, 1h 30m
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              Notes
              <span className="text-slate-400 text-xs font-normal">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Any notes about this recording..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Info Box */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-sm">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="text-slate-600 dark:text-slate-400">
                <p className="font-medium text-slate-700 dark:text-slate-300">Recording stays on your platform</p>
                <p className="text-xs mt-1">
                  UserLens Insights will link to your recording—it won't be copied or downloaded. 
                  Make sure the link is accessible to your team members.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!url || !!urlError}>
            {existingRecording ? 'Update Recording' : 'Add Recording'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Compact button version for inline use
interface AddRecordingButtonProps {
  sessionType: 'interview' | 'usability';
  participantId: string;
  participantName?: string;
  existingRecording?: SessionRecording;
  onSave: (recording: SessionRecording) => void;
  variant?: 'text' | 'button' | 'icon';
}

export function AddRecordingButton({
  sessionType,
  participantId,
  participantName,
  existingRecording,
  onSave,
  variant = 'text',
}: AddRecordingButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasRecording = existingRecording && existingRecording.status !== 'none';

  return (
    <>
      {variant === 'text' && (
        <button
          onClick={() => setDialogOpen(true)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex items-center gap-1"
        >
          {hasRecording ? (
            <>
              <Video className="h-3 w-3" />
              Edit
            </>
          ) : (
            <>
              <Link2 className="h-3 w-3" />
              Add URL
            </>
          )}
        </button>
      )}

      {variant === 'button' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1.5 h-7 text-xs"
        >
          {hasRecording ? (
            <>
              <Video className="h-3 w-3" />
              Edit Recording
            </>
          ) : (
            <>
              <Link2 className="h-3 w-3" />
              Add Recording URL
            </>
          )}
        </Button>
      )}

      {variant === 'icon' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setDialogOpen(true)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {hasRecording ? (
                  <Video className="h-3.5 w-3.5" />
                ) : (
                  <Link2 className="h-3.5 w-3.5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {hasRecording ? 'Edit recording URL' : 'Add recording URL'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <AddRecordingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sessionType={sessionType}
        participantId={participantId}
        participantName={participantName}
        existingRecording={existingRecording}
        onSave={onSave}
      />
    </>
  );
}

export default AddRecordingDialog;