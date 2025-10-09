// components/ProjectDetail/OverviewTab.tsx
import React, { useState } from 'react';
import { Users, User, UserPlus, Trash2, Mail, Edit2, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Project, SessionLink } from '../../types';
import { generateSessionLink, copyToClipboard } from '../../utils';
import { EmailModal } from '../Modals/EmailModal';
import { ExpiryModal } from '../Modals/ExpiryModal';
import { DEFAULT_EMAIL_TEMPLATE } from '../../constants';

interface OverviewTabProps {
  project: Project;
  onStartSession: (participantId: number) => void;
}

export function OverviewTab({ project, onStartSession }: OverviewTabProps) {
  const { state, actions } = useAppContext();
  
  // Get the current project from state to ensure we have the latest data
  const currentProject = state.projects.find(p => p.id === project.id) || project;
  
  const [customExpiryDays, setCustomExpiryDays] = useState(7);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [emailModalLink, setEmailModalLink] = useState('');
  const [emailModalParticipant, setEmailModalParticipant] = useState<any>(null);
  const [emailModalExpiry, setEmailModalExpiry] = useState('');
  const [emailTemplate, setEmailTemplate] = useState(DEFAULT_EMAIL_TEMPLATE);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const projectParticipants = state.participants.filter(p => 
    currentProject.participantIds.includes(p.id)
  );
  const availableParticipants = state.participants.filter(p => 
    !currentProject.participantIds.includes(p.id)
  );

  const handleAddParticipant = (participantId: number) => {
    actions.addParticipantToProject(currentProject.id, participantId);
  };

  const handleRemoveParticipant = (participantId: number) => {
    actions.removeParticipantFromProject(currentProject.id, participantId);
  };

  const openEmailModal = (participantId: number) => {
    const { link, sessionLink } = generateSessionLink(currentProject.id, participantId, customExpiryDays);
    const participant = state.participants.find(p => p.id === participantId);
    
    actions.addSessionLink(sessionLink);
    
    setEmailModalLink(link);
    setEmailModalParticipant(participant);
    setEmailModalExpiry(sessionLink.expiresAt);
    setShowEmailModal(true);
  };

  const handleCopyEmail = async () => {
    if (!emailModalParticipant) return;

    const formattedBody = emailTemplate.body
      .replace(/{participantName}/g, emailModalParticipant.name)
      .replace(/{projectName}/g, currentProject.name)
      .replace(/{sessionLink}/g, emailModalLink)
      .replace(/{expiryDate}/g, new Date(emailModalExpiry).toLocaleDateString());

    const fullEmail = `Subject: ${emailTemplate.subject}\n\n${formattedBody}`;
    
    const success = await copyToClipboard(fullEmail);
    if (success) {
      const linkId = emailModalLink.split('session=')[1];
      actions.updateSessionLink(linkId, { emailSent: true });
      alert('Email copied to clipboard!');
    }
  };

  const handleCopyLink = async (linkId: string, projectId: number, participantId: number) => {
    const { link, sessionLink } = generateSessionLink(projectId, participantId);
    actions.addSessionLink(sessionLink);
    
    const success = await copyToClipboard(link);
    if (success) {
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    }
  };

  const handleUpdateExpiry = () => {
    if (editingLinkId && newExpiryDate) {
      actions.updateSessionLink(editingLinkId, { 
        expiresAt: new Date(newExpiryDate).toISOString() 
      });
      setShowExpiryModal(false);
      setEditingLinkId(null);
      setNewExpiryDate('');
    }
  };

  const handleDeleteLink = (linkId: string) => {
    if (window.confirm('Are you sure you want to delete this session link?')) {
      actions.deleteSessionLink(linkId);
    }
  };

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Project Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Session Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Mode</div>
                <div className="flex items-center space-x-2">
                  {currentProject.mode === 'moderated' ? (
                    <Users className="w-5 h-5 text-blue-600" />
                  ) : (
                    <User className="w-5 h-5 text-purple-600" />
                  )}
                  <span className="font-semibold text-gray-900 capitalize">{currentProject.mode}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Tasks</div>
                <div className="font-semibold text-gray-900">{currentProject.setup.tasks.length} tasks</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Camera</div>
                <div className="font-semibold text-gray-900 capitalize">{currentProject.cameraOption}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Microphone</div>
                <div className="font-semibold text-gray-900 capitalize">{currentProject.micOption}</div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tasks</h2>
            <div className="space-y-3">
              {currentProject.setup.tasks.map((task, index) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      {task.ratingEnabled && (
                        <div className="mt-2 text-xs text-gray-500">
                          Rating: {task.ratingLabel} ({task.ratingScale?.low} → {task.ratingScale?.high})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Link Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Session Link Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Link Expiration (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={customExpiryDays}
                onChange={(e) => setCustomExpiryDays(parseInt(e.target.value) || 7)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                New session links will expire after this many days
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Participants</h2>
            
            {availableParticipants.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Participant
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddParticipant(parseInt(e.target.value));
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a participant...</option>
                  {availableParticipants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {projectParticipants.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">No participants assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projectParticipants.map(participant => {
                  const participantLinks = state.sessionLinks.filter(
                    l => l.projectId === currentProject.id && l.participantId === participant.id && !l.used
                  );
                  
                  return (
                    <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{participant.name}</div>
                          <div className="text-sm text-gray-600">{participant.email}</div>
                          {participantLinks.length > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              {participantLinks.length} active link{participantLinks.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remove participant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <button
                          onClick={() => onStartSession(participant.id)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Start Session
                        </button>
                        
                        <button
                          onClick={() => openEmailModal(participant.id)}
                          className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Send Invitation</span>
                        </button>
                      </div>

                      {participantLinks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs font-medium text-gray-700 mb-2">Active Links:</div>
                          <div className="space-y-2">
                            {participantLinks.map(link => (
                              <div key={link.id} className="bg-gray-50 rounded p-2 text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-gray-600">
                                    Expires: {new Date(link.expiresAt).toLocaleDateString()}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => {
                                        setEditingLinkId(link.id);
                                        setNewExpiryDate(new Date(link.expiresAt).toISOString().slice(0, 16));
                                        setShowExpiryModal(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-700 transition-colors"
                                      title="Edit expiration"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLink(link.id)}
                                      className="text-red-600 hover:text-red-700 transition-colors"
                                      title="Delete link"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                {link.emailSent && (
                                  <div className="text-green-600 flex items-center space-x-1">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Email sent</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEmailModal && emailModalParticipant && (
        <EmailModal
          show={showEmailModal}
          participant={emailModalParticipant}
          project={currentProject}
          link={emailModalLink}
          expiryDate={emailModalExpiry}
          template={emailTemplate}
          onTemplateChange={setEmailTemplate}
          onCopyEmail={handleCopyEmail}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {showExpiryModal && editingLinkId && (
        <ExpiryModal
          show={showExpiryModal}
          link={state.sessionLinks.find(l => l.id === editingLinkId) || null}
          newExpiryDate={newExpiryDate}
          onExpiryDateChange={setNewExpiryDate}
          onUpdate={handleUpdateExpiry}
          onClose={() => {
            setShowExpiryModal(false);
            setEditingLinkId(null);
            setNewExpiryDate('');
          }}
        />
      )}
    </>
  );
}