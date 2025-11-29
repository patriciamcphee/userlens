import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Mail, Calendar, X, Link as LinkIcon, Send } from "lucide-react";
import { ProjectParticipant, Project } from "../types";
import { copyToClipboard } from "../utils/sessionLinks";
import { toast } from "sonner@2.0.3";

interface SessionLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: ProjectParticipant;
  project: Project;
  sessionLink: string;
  sessionLinkExpiry: string;
  onExpiryDaysChange: (days: number) => void;
}

const EXPIRY_OPTIONS = [
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" }
];

const DEFAULT_SUBJECT = "Invitation to Participate in User Testing Session";
const DEFAULT_MESSAGE_BODY = `Hi {participantName},

You've been invited to participate in a user testing session for {projectName}.

This session should take approximately 15-20 minutes to complete. You can complete it at your convenience before the expiration date.

Click the link below to begin:
{sessionLink}

This link will expire on {expiryDate}.

If you have any questions, please don't hesitate to reach out.

Thank you for your participation!

Best regards`;

export function SessionLinkModal({
  open,
  onOpenChange,
  participant,
  project,
  sessionLink,
  sessionLinkExpiry,
  onExpiryDaysChange
}: SessionLinkModalProps) {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [messageBody, setMessageBody] = useState(DEFAULT_MESSAGE_BODY);

  // Reset to defaults when modal opens
  useEffect(() => {
    if (open) {
      setSubject(DEFAULT_SUBJECT);
      setMessageBody(DEFAULT_MESSAGE_BODY);
    }
  }, [open]);

  const replacePlaceholders = (text: string): string => {
    return text
      .replace(/{participantName}/g, participant.name)
      .replace(/{projectName}/g, project.name)
      .replace(/{sessionLink}/g, sessionLink)
      .replace(/{expiryDate}/g, new Date(sessionLinkExpiry).toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric', 
        year: 'numeric' 
      }));
  };

  const handleCopyEmail = async () => {
    const emailText = `To: ${participant.email}
Subject: ${subject}

${replacePlaceholders(messageBody)}`;
    
    const success = await copyToClipboard(emailText);
    if (success) {
      toast.success("Email copied to clipboard!");
    } else {
      toast.error("Failed to copy email");
    }
  };

  const handleSendEmail = () => {
    const emailBody = replacePlaceholders(messageBody);
    
    // Create mailto URL with proper encoding
    const mailtoUrl = `mailto:${encodeURIComponent(participant.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open default email client
    window.location.href = mailtoUrl;
    
    toast.success("Opening your email client...");
  };

  const previewEmail = replacePlaceholders(messageBody);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">Email Preview</DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-1">
                Customize the email message and copy it to send to {participant.name}
              </DialogDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Link Expiration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Calendar className="w-4 h-4" />
              Link Expiration
            </Label>
            <Select
              value={String(Math.round((new Date(sessionLinkExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
              onValueChange={(value) => onExpiryDaysChange(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPIRY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Link will expire on {new Date(sessionLinkExpiry).toLocaleDateString('en-US', { 
                month: 'numeric', 
                day: 'numeric', 
                year: 'numeric' 
              })} at {new Date(sessionLinkExpiry).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium text-slate-700">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Message Body */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-slate-700">
              Message Body
            </Label>
            <p className="text-xs text-slate-500">
              Available placeholders: {'{participantName}'}, {'{projectName}'}, {'{sessionLink}'}, {'{expiryDate}'}
            </p>
            <Textarea
              id="message"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={10}
              className="w-full font-mono text-sm"
            />
          </div>

          {/* Preview Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Preview:</Label>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="space-y-3">
                <div className="pb-3 border-b border-slate-300">
                  <div className="text-xs text-slate-600 mb-1">
                    To: {participant.email}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    Subject: {subject}
                  </div>
                </div>
                <div className="text-sm text-slate-700 whitespace-pre-wrap">
                  {previewEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Session Link Information */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-blue-900 mb-2">
                  Session Link Information:
                </div>
                <div className="text-sm text-blue-800 mb-2">
                  Link expires: {new Date(sessionLinkExpiry).toLocaleDateString('en-US', { 
                    month: 'numeric', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })} at {new Date(sessionLinkExpiry).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="bg-white rounded p-2 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <code className="text-xs text-blue-900 break-all">
                      {sessionLink}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center gap-3">
          <Button
            onClick={handleSendEmail}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
            Send via Email Client
          </Button>
          <Button
            onClick={handleCopyEmail}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Mail className="w-4 h-4" />
            Copy to Clipboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
