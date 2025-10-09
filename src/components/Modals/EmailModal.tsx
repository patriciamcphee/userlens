// components/Modals/EmailModal.tsx
import React from 'react';
import { Mail } from 'lucide-react';
import { EmailTemplate, Participant, Project } from '../../types';

interface EmailModalProps {
  show: boolean;
  participant: Participant | null;
  project: Project | null;
  link: string;
  expiryDate: string;
  template: EmailTemplate;
  onTemplateChange: (template: EmailTemplate) => void;
  onCopyEmail: () => void;
  onClose: () => void;
}

export function EmailModal({
  show,
  participant,
  project,
  link,
  expiryDate,
  template,
  onTemplateChange,
  onCopyEmail,
  onClose
}: EmailModalProps) {
  if (!show || !participant || !project) return null;

  const formatTemplate = (body: string) => {
    return body
      .replace(/{participantName}/g, participant.name)
      .replace(/{projectName}/g, project.name)
      .replace(/{sessionLink}/g, link)
      .replace(/{expiryDate}/g, new Date(expiryDate).toLocaleDateString());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Email Preview</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={template.subject}
              onChange={(e) => onTemplateChange({ ...template, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
            <div className="mb-2 text-xs text-gray-500">
              Available placeholders: {'{participantName}'}, {'{projectName}'}, {'{sessionLink}'}, {'{expiryDate}'}
            </div>
            <textarea
              value={template.body}
              onChange={(e) => onTemplateChange({ ...template, body: e.target.value })}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Preview:</h3>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="text-sm text-gray-600 mb-1">To: {participant.email}</div>
                <div className="text-sm font-semibold text-gray-900">Subject: {template.subject}</div>
              </div>
              <div className="whitespace-pre-wrap text-gray-700 text-sm">{formatTemplate(template.body)}</div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <div className="font-medium mb-1">Session Link Information:</div>
                <div>Link expires: {new Date(expiryDate).toLocaleDateString()} at {new Date(expiryDate).toLocaleTimeString()}</div>
                <div className="mt-2 font-mono text-xs bg-white p-2 rounded border border-gray-200 break-all">
                  {link}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onCopyEmail}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Copy Email to Clipboard</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}