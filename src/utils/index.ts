// utils/index.ts
import { Project, Participant, Analytics, SessionLink, EmailTemplate, Task } from '../types';
import { DEFAULT_EMAIL_TEMPLATE } from '../constants';

export { DEFAULT_EMAIL_TEMPLATE };

// Interface for session link data
interface SessionLinkData {
  projectId: number;
  participantId: number;
  expiresAt: string;
  linkId: string;
  // Include minimal essential data
  projectSetup: {
    name: string;
    description: string;
    mode: 'moderated' | 'unmoderated';
    beforeMessage: string;
    duringScenario: string;
    afterMessage: string;
    tasks: Task[];
    randomizeOrder: boolean;
    cameraOption: 'optional' | 'required' | 'disabled';
    micOption: 'optional' | 'required' | 'disabled';
  };
  participant: {
    name: string;
    email: string;
    usageLevel?: 'active' | 'occasionally' | 'non-user';
  };
}

export const getAnalytics = (project: Project): Analytics => {
  const sessions = project.sessions || [];
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.tasksCompleted === s.totalTasks).length;
  const avgDuration = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length)
    : 0;
  const avgClicks = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.mouseClicks, 0) / sessions.length)
    : 0;
  const avgKeystrokes = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.keystrokes, 0) / sessions.length)
    : 0;
  const videoUsage = sessions.filter(s => s.hasVideo).length;
  const audioUsage = sessions.filter(s => s.hasAudio).length;
  
  return {
    totalSessions,
    completedSessions,
    completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    avgDuration,
    avgClicks,
    avgKeystrokes,
    videoUsage,
    audioUsage
  };
};

export const exportToCSV = (project: Project, participants: Participant[]) => {
  if (!project.sessions || project.sessions.length === 0) {
    alert('No session data to export');
    return;
  }

  const headers = [
    'Session ID',
    'Participant Name',
    'Participant Email',
    'Completed Date',
    'Duration (seconds)',
    'Tasks Completed',
    'Total Tasks',
    'Mouse Clicks',
    'Keystrokes',
    'Has Video',
    'Has Audio',
    'Task Title',
    'Rating',
    'Rating Label',
    'Task Feedback',
    'Question',
    'Answer',
    'General Observations'
  ];

  const rows: string[][] = [];

  project.sessions.forEach(session => {
    const participant = participants.find(p => p.id === session.participantId);
    const baseData = [
      session.id.toString(),
      participant?.name || 'Unknown',
      participant?.email || '',
      new Date(session.completedAt).toLocaleString(),
      session.duration.toString(),
      session.tasksCompleted.toString(),
      session.totalTasks.toString(),
      session.mouseClicks.toString(),
      session.keystrokes.toString(),
      session.hasVideo ? 'Yes' : 'No',
      session.hasAudio ? 'Yes' : 'No'
    ];

    if (session.taskFeedback && session.taskFeedback.length > 0) {
      session.taskFeedback.forEach(feedback => {
        const task = project.setup.tasks.find(t => t.id === feedback.taskId);
        
        const feedbackRow = [
          ...baseData,
          task?.title || 'Unknown Task',
          feedback.rating?.toString() || '',
          task?.ratingLabel || '',
          feedback.answer || '',
          '',
          '',
          session.observations || ''
        ];
        rows.push(feedbackRow);

        if (feedback.questionAnswers) {
          feedback.questionAnswers.forEach(qa => {
            const question = task?.customQuestions?.find(q => q.id === qa.questionId);
            const answerStr = Array.isArray(qa.answer) ? qa.answer.join(', ') : qa.answer;
            const qaRow = [
              ...baseData,
              task?.title || 'Unknown Task',
              '',
              '',
              '',
              question?.question || '',
              answerStr,
              ''
            ];
            rows.push(qaRow);
          });
        }
      });
    } else {
      const row = [...baseData, '', '', '', '', '', '', session.observations || ''];
      rows.push(row);
    }
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${project.name.replace(/[^a-z0-9]/gi, '_')}_research_data.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateSessionLink = (
projectId: number, participantId: number, expiryDays: number = 7, project?: Project, participant?: Participant, p0?: boolean): { linkId: string; link: string; sessionLink: SessionLink } => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);
  
  const linkId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Get participant usage level for this project
  const assignment = project?.participantAssignments?.find(
    a => a.participantId === participantId
  );

  const sessionData: SessionLinkData = {
    projectId,
    participantId,
    expiresAt: expiresAt.toISOString(),
    linkId,
    projectSetup: project ? {
      name: project.name,
      description: project.description,
      mode: project.mode,
      beforeMessage: project.setup.beforeMessage,
      duringScenario: project.setup.duringScenario,
      afterMessage: project.setup.afterMessage,
      tasks: project.setup.tasks,
      randomizeOrder: project.setup.randomizeOrder,
      cameraOption: project.cameraOption,
      micOption: project.micOption
    } : {} as any,
    participant: participant ? {
      name: participant.name,
      email: participant.email,
      usageLevel: assignment?.usageLevel || participant.defaultUsageLevel
    } : {} as any
  };
  
  // Base64 encode the session data
  const encodedData = btoa(JSON.stringify(sessionData));
  
  const sessionLink: SessionLink = {
    id: linkId,
    projectId,
    participantId,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    used: false,
    emailSent: false
  };

  const baseUrl = window.location.origin + window.location.pathname;
  const link = `${baseUrl}?session=${encodedData}`;

  return { linkId, link, sessionLink };
};

export const formatEmailTemplate = (
  template: string,
  participantName: string,
  projectName: string,
  sessionLink: string,
  expiryDate: string
): string => {
  return template
    .replace(/{participantName}/g, participantName)
    .replace(/{projectName}/g, projectName)
    .replace(/{sessionLink}/g, sessionLink)
    .replace(/{expiryDate}/g, expiryDate);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};