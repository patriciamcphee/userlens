import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
  Video,
  Play,
  MoreHorizontal,
  Calendar,
  FileText,
  Tag,
  Trash2,
  Edit,
  ExternalLink,
  MessageSquare,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { RecordingSheet } from './RecordingSheet';

// Types
interface Recording {
  id: string;
  sessionDate: string;
  duration: number;
  status: 'processing' | 'ready' | 'failed';
  hasTranscript: boolean;
}

interface Participant {
  id: string;
  participantId: string;
  name?: string;
  avatar?: string;
  email?: string;
  sessionCount: number;
  lastSessionDate: string;
  tags?: string[];
  recordings: Recording[];
  status: 'active' | 'completed' | 'no-show';
}

interface ParticipantCardProps {
  participant: Participant;
  onEdit?: (participant: Participant) => void;
  onDelete?: (participant: Participant) => void;
  onViewDetails?: (participant: Participant) => void;
}

// Helper functions
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
};

// Mock participants for demo
export const mockParticipants: Participant[] = [
  {
    id: '1',
    participantId: 'P-1042',
    name: 'Sarah Chen',
    email: 'sarah.c@example.com',
    sessionCount: 3,
    lastSessionDate: '2024-11-18',
    tags: ['power-user', 'enterprise'],
    status: 'completed',
    recordings: [
      { id: 'r1', sessionDate: '2024-11-12', duration: 2723, status: 'ready', hasTranscript: true },
      { id: 'r2', sessionDate: '2024-11-15', duration: 727, status: 'processing', hasTranscript: false },
      { id: 'r3', sessionDate: '2024-11-18', duration: 1834, status: 'ready', hasTranscript: true },
    ],
  },
  {
    id: '2',
    participantId: 'P-1043',
    name: 'Marcus Johnson',
    email: 'marcus.j@example.com',
    sessionCount: 2,
    lastSessionDate: '2024-11-16',
    tags: ['new-user'],
    status: 'active',
    recordings: [
      { id: 'r4', sessionDate: '2024-11-14', duration: 1845, status: 'ready', hasTranscript: true },
      { id: 'r5', sessionDate: '2024-11-16', duration: 2156, status: 'ready', hasTranscript: true },
    ],
  },
  {
    id: '3',
    participantId: 'P-1044',
    sessionCount: 1,
    lastSessionDate: '2024-11-17',
    tags: [],
    status: 'no-show',
    recordings: [],
  },
  {
    id: '4',
    participantId: 'P-1045',
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    sessionCount: 4,
    lastSessionDate: '2024-11-19',
    tags: ['beta-tester', 'mobile'],
    status: 'completed',
    recordings: [
      { id: 'r6', sessionDate: '2024-11-10', duration: 1523, status: 'ready', hasTranscript: true },
      { id: 'r7', sessionDate: '2024-11-13', duration: 1892, status: 'ready', hasTranscript: true },
      { id: 'r8', sessionDate: '2024-11-16', duration: 2234, status: 'ready', hasTranscript: true },
      { id: 'r9', sessionDate: '2024-11-19', duration: 1678, status: 'ready', hasTranscript: true },
    ],
  },
];

export function ParticipantCard({
  participant,
  onEdit,
  onDelete,
  onViewDetails,
}: ParticipantCardProps) {
  const [isRecordingSheetOpen, setIsRecordingSheetOpen] = useState(false);

  const readyRecordings = participant.recordings.filter((r) => r.status === 'ready');
  const processingRecordings = participant.recordings.filter((r) => r.status === 'processing');
  const hasRecordings = participant.recordings.length > 0;
  const hasTranscripts = readyRecordings.some((r) => r.hasTranscript);

  const getStatusBadge = () => {
    switch (participant.status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400">
            Active
          </Badge>
        );
      case 'no-show':
        return (
          <Badge className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400">
            No Show
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
        <CardContent className="p-4">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                {participant.name?.[0] || participant.participantId.slice(0, 2)}
              </div>

              {/* Name & ID */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {participant.name || participant.participantId}
                  </span>
                  {participant.name && (
                    <span className="text-xs text-slate-500 font-mono">
                      {participant.participantId}
                    </span>
                  )}
                </div>
                {participant.email && (
                  <span className="text-xs text-slate-500">{participant.email}</span>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails?.(participant)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(participant)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Participant
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={() => onDelete?.(participant)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {participant.sessionCount} session{participant.sessionCount !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Last: {formatDate(participant.lastSessionDate)}
            </span>
            {getStatusBadge()}
          </div>

          {/* Tags */}
          {participant.tags && participant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {participant.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Recordings Section */}
          {hasRecordings ? (
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Recording Count */}
                  <div className="flex items-center gap-1.5 text-sm">
                    <Video className="h-4 w-4 text-indigo-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {readyRecordings.length} recording{readyRecordings.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Processing Indicator */}
                  {processingRecordings.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400"
                          >
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            {processingRecordings.length} processing
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          Recording is being processed and will be available soon
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* Transcript Indicator */}
                  {hasTranscripts && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Transcribed
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Transcripts available for analysis</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                {/* Play Button */}
                {readyRecordings.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => setIsRecordingSheetOpen(true)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    View Recordings
                  </Button>
                )}
              </div>

              {/* Recording Preview List */}
              {readyRecordings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {readyRecordings.slice(0, 2).map((recording, index) => (
                    <button
                      key={recording.id}
                      onClick={() => setIsRecordingSheetOpen(true)}
                      className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
                    >
                      <span className="flex-shrink-0">
                        Session {index + 1} • {formatDate(recording.sessionDate)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>{formatDuration(recording.duration)}</span>
                      {recording.hasTranscript && (
                        <>
                          <span className="text-slate-400">•</span>
                          <FileText className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  ))}
                  {readyRecordings.length > 2 && (
                    <button
                      onClick={() => setIsRecordingSheetOpen(true)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      +{readyRecordings.length - 2} more recording
                      {readyRecordings.length - 2 !== 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Video className="h-4 w-4" />
                <span>No recordings</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recording Sheet */}
      <RecordingSheet
        open={isRecordingSheetOpen}
        onOpenChange={setIsRecordingSheetOpen}
        participant={{
          id: participant.id,
          participantId: participant.participantId,
          name: participant.name,
          avatar: participant.avatar,
          sessionCount: participant.sessionCount,
          recordingCount: readyRecordings.length,
        }}
      />
    </>
  );
}

// Demo component showing multiple participant cards
export function ParticipantCardDemo() {
  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Participants</h2>
        <div className="space-y-3">
          {mockParticipants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              onEdit={(p) => console.log('Edit:', p)}
              onDelete={(p) => console.log('Delete:', p)}
              onViewDetails={(p) => console.log('View:', p)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ParticipantCard;