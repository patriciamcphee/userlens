import React, { useState, useEffect } from 'react';
import { Video, Monitor, Mic, MicOff, VideoOff, Play, Pause, Square, Users, User, CheckCircle, Circle, Clock, Eye, Settings, Plus, Trash2, GripVertical, Shuffle, LayoutDashboard, UserPlus, ArrowLeft, Edit2, Mail, Mouse, Keyboard, BarChart3, TrendingUp, Activity } from 'lucide-react';

// Types
interface TaskQuestion {
  id: number;
  question: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  ratingEnabled?: boolean;
  ratingLabel?: string; // e.g., "Task Difficulty", "Confidence Level"
  ratingScale?: {
    low: string;  // e.g., "Very Easy"
    high: string; // e.g., "Very Difficult"
  };
  customQuestions?: TaskQuestion[];
}

interface TaskFeedback {
  taskId: number;
  answer: string;
  rating?: number; // 1-5 rating
  questionAnswers?: { questionId: number; answer: string }[];
  timestamp: string;
}

interface ProjectSetup {
  beforeMessage: string;
  duringScenario: string;
  afterMessage: string;
  randomizeOrder: boolean;
  tasks: Task[];
}


interface Session {
  id: number;
  participantId: number;
  completedAt: string;
  duration: number;
  tasksCompleted: number;
  totalTasks: number;
  mouseClicks: number;
  keystrokes: number;
  hasVideo: boolean;
  hasAudio: boolean;
  notes: string;
  taskFeedback: TaskFeedback[];  // NEW: Task-specific answers
  observations: string;           // NEW: General observations
}

interface Project {
  id: number;
  name: string;
  description: string;
  mode: 'moderated' | 'unmoderated';
  status: 'draft' | 'active' | 'completed';
  participantIds: number[];
  sessions: Session[];
  cameraOption: 'optional' | 'required' | 'disabled';
  micOption: 'optional' | 'required' | 'disabled';
  setup: ProjectSetup;
}

interface Participant {
  id: number;
  name: string;
  email: string;
}

interface Analytics {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  avgDuration: number;
  avgClicks: number;
  avgKeystrokes: number;
  videoUsage: number;
  audioUsage: number;
}

interface TrackingData {
  clicks: number;
  keystrokes: number;
}

interface SessionLink {
  id: string;
  projectId: number;
  participantId: number;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  emailSent?: boolean; // Track if email was sent
}

interface EmailTemplate {
  subject: string;
  body: string;
}

type View = 'dashboard' | 'createProject' | 'projectDetail' | 'runSession';
type ActiveTab = 'overview' | 'analytics';

const STORAGE_KEYS = {
  PROJECTS: 'userTesting_projects',
  PARTICIPANTS: 'userTesting_participants'
};

export default function UserTestingApp() {
  const [view, setView] = useState<View>('dashboard');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  });
  
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
      return saved ? JSON.parse(saved) : [
        { id: 1, name: "Sarah Johnson", email: "sarah.j@email.com" },
        { id: 2, name: "Mike Chen", email: "mike.c@email.com" },
        { id: 3, name: "Emily Rodriguez", email: "emily.r@email.com" }
      ];
    } catch (error) {
      console.error('Error loading participants:', error);
      return [];
    }
  });

  const [sessionLinks, setSessionLinks] = useState<SessionLink[]>(() => {
  try {
    const saved = localStorage.getItem('userTesting_sessionLinks');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading session links:', error);
    return [];
  }
});

  const [publicSessionToken, setPublicSessionToken] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [recording, setRecording] = useState(false);
  const [currentTask, setCurrentTask] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [notes, setNotes] = useState('');
  const [displayTasks, setDisplayTasks] = useState<Task[]>([]);
  const [trackingData, setTrackingData] = useState<TrackingData>({ clicks: 0, keystrokes: 0 });
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectMode, setProjectMode] = useState<'moderated' | 'unmoderated' | null>(null);
  const [cameraOption, setCameraOption] = useState<'optional' | 'required' | 'disabled'>('optional');
  const [micOption, setMicOption] = useState<'optional' | 'required' | 'disabled'>('optional');
  const [beforeMessage, setBeforeMessage] = useState('Welcome! Thank you for participating in this user testing session.');
  const [duringScenario, setDuringScenario] = useState('Imagine you are shopping for a birthday gift for a friend. Browse the site as you normally would.');
  const [afterMessage, setAfterMessage] = useState('Thank you for completing this session! Your feedback is invaluable to us.');
  const [randomizeOrder, setRandomizeOrder] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: Date.now(), title: "", description: "" }
  ]);

  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalLink, setEmailModalLink] = useState<string>('');
  const [emailModalParticipant, setEmailModalParticipant] = useState<Participant | null>(null);
  const [emailModalExpiry, setEmailModalExpiry] = useState<string>('');

  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState<string>('');

  const [taskFeedback, setTaskFeedback] = useState<TaskFeedback[]>([]);
  const [currentTaskAnswer, setCurrentTaskAnswer] = useState('');
  const [currentTaskRating, setCurrentTaskRating] = useState<number>(0);
  const [currentQuestionAnswers, setCurrentQuestionAnswers] = useState<{ questionId: number; answer: string }[]>([]);
  const [observations, setObservations] = useState('');
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  const [customExpiryDays, setCustomExpiryDays] = useState<number>(7);

  // Default email template
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
    subject: 'Invitation to Participate in User Testing Session',
    body: `Hi {participantName},

  You've been invited to participate in a user testing session for {projectName}.

  This session should take approximately 15-20 minutes to complete. You can complete it at your convenience before the expiration date.

  Click the link below to begin:
  {sessionLink}

  This link will expire on {expiryDate}.

  If you have any questions, please don't hesitate to reach out.

  Thank you for your participation!

  Best regards`
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
    } catch (error) {
      console.error('Error saving participants:', error);
    }
  }, [participants]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (sessionStarted && recording) {
      interval = setInterval(() => {
        setTrackingData(prev => ({
          clicks: prev.clicks + Math.floor(Math.random() * 3),
          keystrokes: prev.keystrokes + Math.floor(Math.random() * 5)
        }));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [sessionStarted, recording]);

  useEffect(() => {
    try {
      localStorage.setItem('userTesting_sessionLinks', JSON.stringify(sessionLinks));
    } catch (error) {
      console.error('Error saving session links:', error);
    }
  }, [sessionLinks]);

  // Check for public session token on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('session');
    if (token) {
      setPublicSessionToken(token);
      const link = sessionLinks.find(l => l.id === token);
      if (link && !link.used && new Date(link.expiresAt) > new Date()) {
        const project = projects.find(p => p.id === link.projectId);
        const participant = participants.find(p => p.id === link.participantId);
        if (project && participant) {
          startSession(project, participant);
        }
      }
    }
  }, []);

  const createNewProject = () => {
    setProjectName('');
    setProjectDescription('');
    setProjectMode(null);
    setCameraOption('optional');
    setMicOption('optional');
    setBeforeMessage('Welcome! Thank you for participating in this user testing session.');
    setDuringScenario('Imagine you are shopping for a birthday gift for a friend. Browse the site as you normally would.');
    setAfterMessage('Thank you for completing this session! Your feedback is invaluable to us.');
    setRandomizeOrder(false);
    setTasks([{ 
      id: Date.now(), 
      title: "", 
      description: "",
      ratingEnabled: false,
      ratingLabel: "Task Difficulty",
      ratingScale: { low: "Very Easy", high: "Very Difficult" },
      customQuestions: []
    }]);
    setEditingProject(null);
    setView('createProject');
  };

  const editProject = (project: Project) => {
    setProjectName(project.name);
    setProjectDescription(project.description);
    setProjectMode(project.mode);
    setCameraOption(project.cameraOption || 'optional');
    setMicOption(project.micOption || 'optional');
    setBeforeMessage(project.setup.beforeMessage);
    setDuringScenario(project.setup.duringScenario);
    setAfterMessage(project.setup.afterMessage);
    setRandomizeOrder(project.setup.randomizeOrder);
    setTasks(project.setup.tasks);
    setEditingProject(project);
    setView('createProject');
  };

  const saveProject = () => {
    if (!projectMode) return;

    const projectData: Project = {
      id: editingProject ? editingProject.id : Date.now(),
      name: projectName,
      description: projectDescription,
      mode: projectMode,
      status: editingProject ? editingProject.status : 'draft',
      participantIds: editingProject ? editingProject.participantIds : [],
      sessions: editingProject ? editingProject.sessions : [],
      cameraOption,
      micOption,
      setup: {
        beforeMessage,
        duringScenario,
        afterMessage,
        randomizeOrder,
        tasks: tasks.filter(t => t.title.trim() !== '')
      }
    };

    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? projectData : p));
    } else {
      setProjects([...projects, projectData]);
    }
    
    setView('dashboard');
  };

  const deleteProject = (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const addTask = () => {
    setTasks([...tasks, { 
      id: Date.now(), 
      title: "", 
      description: "",
      ratingEnabled: false,
      ratingLabel: "Task Difficulty",
      ratingScale: { low: "Very Easy", high: "Very Difficult" },
      customQuestions: []
    }]);
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id: number, field: keyof Task, value: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const addQuestionToTask = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            customQuestions: [
              ...(task.customQuestions || []),
              { id: Date.now(), question: '' }
            ]
          }
        : task
    ));
  };

  const updateTaskQuestion = (taskId: number, questionId: number, question: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            customQuestions: (task.customQuestions || []).map(q =>
              q.id === questionId ? { ...q, question } : q
            )
          }
        : task
    ));
  };

  const removeTaskQuestion = (taskId: number, questionId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            customQuestions: (task.customQuestions || []).filter(q => q.id !== questionId)
          }
        : task
    ));
  };

  const toggleTaskRating = (taskId: number, enabled: boolean) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, ratingEnabled: enabled } : task
    ));
  };

  const updateTaskRatingConfig = (taskId: number, field: string, value: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        if (field === 'ratingLabel') {
          return { ...task, ratingLabel: value };
        } else if (field === 'low' || field === 'high') {
          return {
            ...task,
            ratingScale: {
              ...task.ratingScale!,
              [field]: value
            }
          };
        }
      }
      return task;
    }));
  };

  const addParticipantToProject = (projectId: number, participantId: number) => {
    setProjects(projects.map(p => 
      p.id === projectId && !p.participantIds.includes(participantId)
        ? { ...p, participantIds: [...p.participantIds, participantId] }
        : p
    ));
  };

  const removeParticipantFromProject = (projectId: number, participantId: number) => {
    setProjects(projects.map(p => 
      p.id === projectId
        ? { ...p, participantIds: p.participantIds.filter(id => id !== participantId) }
        : p
    ));
  };

  const createParticipant = () => {
    if (newParticipantName.trim() && newParticipantEmail.trim()) {
      const newParticipant: Participant = {
        id: Date.now(),
        name: newParticipantName.trim(),
        email: newParticipantEmail.trim()
      };
      setParticipants([...participants, newParticipant]);
      setNewParticipantName('');
      setNewParticipantEmail('');
      setShowAddParticipant(false);
    }
  };

  const deleteParticipant = (id: number) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      setParticipants(participants.filter(p => p.id !== id));
      setProjects(projects.map(proj => ({
        ...proj,
        participantIds: proj.participantIds.filter(pId => pId !== id)
      })));
    }
  };

  const startSession = (project: Project, participant: Participant) => {
    setCurrentProject(project);
    setCurrentParticipant(participant);
    let tasksToUse = [...project.setup.tasks];
    if (project.setup.randomizeOrder) {
      tasksToUse = tasksToUse.sort(() => Math.random() - 0.5);
    }
    setDisplayTasks(tasksToUse);
    setCurrentTask(0);
    setCompletedTasks([]);
    setSessionStarted(false);
    setSessionComplete(false);
    setRecording(false);
    setNotes('');
    setTrackingData({ clicks: 0, keystrokes: 0 });
    setSessionStartTime(null);
    
    // Reset feedback
    setTaskFeedback([]);
    setCurrentTaskAnswer('');
    setObservations('');
    setShowFeedbackPrompt(false);
    
    if (project.cameraOption === 'disabled') setVideoOn(false);
    else if (project.cameraOption === 'required') setVideoOn(true);
    else setVideoOn(true);
    
    if (project.micOption === 'disabled') setMicOn(false);
    else if (project.micOption === 'required') setMicOn(true);
    else setMicOn(true);
    
    setView('runSession');
  };

  const handleTaskComplete = (taskId: number) => {
    if (!completedTasks.includes(taskId)) {
      // Show feedback prompt
      setShowFeedbackPrompt(true);
    }
  };

  const submitTaskFeedback = () => {
    const currentTaskId = displayTasks[currentTask].id;
    const task = displayTasks[currentTask];
    
    const feedback: TaskFeedback = {
      taskId: currentTaskId,
      answer: currentTaskAnswer.trim(),
      rating: task.ratingEnabled ? currentTaskRating : undefined,
      questionAnswers: currentQuestionAnswers.length > 0 ? currentQuestionAnswers : undefined,
      timestamp: new Date().toISOString()
    };
    
    setTaskFeedback([...taskFeedback, feedback]);
    setCompletedTasks([...completedTasks, currentTaskId]);
    
    // Reset
    setCurrentTaskAnswer('');
    setCurrentTaskRating(0);
    setCurrentQuestionAnswers([]);
    setShowFeedbackPrompt(false);
    
    if (currentTask < displayTasks.length - 1) {
      setCurrentTask(currentTask + 1);
    }
  };

  const skipTaskFeedback = () => {
    const currentTaskId = displayTasks[currentTask].id;
    setCompletedTasks([...completedTasks, currentTaskId]);
    setCurrentTaskAnswer('');
    setShowFeedbackPrompt(false);
    
    if (currentTask < displayTasks.length - 1) {
      setCurrentTask(currentTask + 1);
    }
  };

  const beginSessionRecording = () => {
    setSessionStarted(true);
    setRecording(true);
    setSessionStartTime(Date.now());
  };

  const endSession = () => {
    setRecording(false);
    
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
    
    const sessionRecord: Session = {
      id: Date.now(),
      participantId: currentParticipant?.id || 0,
      completedAt: new Date().toISOString(),
      duration: duration,
      tasksCompleted: completedTasks.length,
      totalTasks: displayTasks.length,
      mouseClicks: trackingData.clicks,
      keystrokes: trackingData.keystrokes,
      hasVideo: videoOn,
      hasAudio: micOn,
      notes: notes,
      taskFeedback: taskFeedback,      // NEW
      observations: observations        // NEW
    };
    
    if (currentProject) {
      setProjects(projects.map(p => 
        p.id === currentProject.id
          ? { ...p, sessions: [...(p.sessions || []), sessionRecord] }
          : p
      ));
    }
    
    if (publicSessionToken) {
      markLinkAsUsed(publicSessionToken);
    }
    
    setSessionComplete(true);
  };

  const backToDashboard = () => {
    setView('dashboard');
    setCurrentProject(null);
    setCurrentParticipant(null);
    setActiveTab('overview');
  };

  const backToProject = () => {
    setView('projectDetail');
    setSessionStarted(false);
    setSessionComplete(false);
    setRecording(false);
  };

  const generateSessionLink = (projectId: number, participantId: number, expiryDays: number = 7): string => {
    const linkId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const newLink: SessionLink = {
      id: linkId,
      projectId,
      participantId,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      used: false,
      emailSent: false
    };

    setSessionLinks([...sessionLinks, newLink]);

    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?session=${linkId}`;
  };

  const updateLinkExpiry = (linkId: string, newExpiryDate: string) => {
    setSessionLinks(sessionLinks.map(link =>
      link.id === linkId ? { ...link, expiresAt: newExpiryDate } : link
    ));
    setShowExpiryModal(false);
    setEditingLinkId(null);
  };

  const deleteSessionLink = (linkId: string) => {
    if (window.confirm('Are you sure you want to delete this session link?')) {
      setSessionLinks(sessionLinks.filter(link => link.id !== linkId));
    }
  };

  const openEmailModal = (projectId: number, participantId: number) => {
    const link = generateSessionLink(projectId, participantId, customExpiryDays);
    const participant = participants.find(p => p.id === participantId);
    const project = projects.find(p => p.id === projectId);
    
    setEmailModalLink(link);
    setEmailModalParticipant(participant || null);
    
    const linkData = sessionLinks.find(l => l.id === link.split('session=')[1]);
    setEmailModalExpiry(linkData?.expiresAt || '');
    
    setShowEmailModal(true);
  };

  const copyEmailToClipboard = async () => {
    if (!emailModalParticipant || !currentProject) return;

    const formattedEmail = formatEmailTemplate(
      emailTemplate.body,
      emailModalParticipant.name,
      currentProject.name,
      emailModalLink,
      new Date(emailModalExpiry).toLocaleDateString()
    );

    const fullEmail = `Subject: ${emailTemplate.subject}\n\n${formattedEmail}`;

    try {
      await navigator.clipboard.writeText(fullEmail);
      alert('Email copied to clipboard!');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = fullEmail;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Email copied to clipboard!');
    }

    // Mark email as sent
    const linkId = emailModalLink.split('session=')[1];
    setSessionLinks(sessionLinks.map(link =>
      link.id === linkId ? { ...link, emailSent: true } : link
    ));
  };

  const formatEmailTemplate = (
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

const copyLinkToClipboard = async (linkId: string, projectId: number, participantId: number) => {
  const link = generateSessionLink(projectId, participantId);
  
  try {
    await navigator.clipboard.writeText(link);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  }
};

const markLinkAsUsed = (linkId: string) => {
  setSessionLinks(sessionLinks.map(link =>
    link.id === linkId ? { ...link, used: true } : link
  ));
};

  const getAnalytics = (project: Project): Analytics => {
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

  const exportToCSV = (project: Project) => {
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

    // If there's task feedback
    if (session.taskFeedback && session.taskFeedback.length > 0) {
      session.taskFeedback.forEach(feedback => {
        const task = project.setup.tasks.find(t => t.id === feedback.taskId);
        
        // Main feedback row
        const feedbackRow = [
          ...baseData,
          task?.title || 'Unknown Task',
          feedback.rating?.toString() || '',
          task?.ratingLabel || '',
          feedback.answer || '',
          '', // Question placeholder
          '', // Answer placeholder
          session.observations || ''
        ];
        rows.push(feedbackRow);

        // Additional rows for custom question answers
        if (feedback.questionAnswers) {
          feedback.questionAnswers.forEach(qa => {
            const question = task?.customQuestions?.find(q => q.id === qa.questionId);
            const qaRow = [
              ...baseData,
              task?.title || 'Unknown Task',
              '', // Rating
              '', // Rating Label
              '', // Task Feedback
              question?.question || '',
              qa.answer,
              '' // Observations
            ];
            rows.push(qaRow);
          });
        }
      });
    } else {
      // Session with no feedback
      const row = [...baseData, '', '', '', '', '', '', session.observations || ''];
      rows.push(row);
    }
  });

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Download
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

  const exportToPDF = (project: Project) => {
    // Create a printable view
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }

    const analytics = getAnalytics(project);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${project.name} - Research Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px;
            color: #333;
          }
          h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
          h3 { color: #4b5563; margin-top: 20px; }
          .header { margin-bottom: 30px; }
          .stats { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px; 
            margin: 20px 0;
          }
          .stat-card { 
            border: 1px solid #e5e7eb; 
            padding: 15px; 
            border-radius: 8px;
            background: #f9fafb;
          }
          .stat-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
          .session { 
            border: 1px solid #e5e7eb; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .session-header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          .feedback-section { 
            background: #f3f4f6; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 6px;
          }
          .task-feedback {
            background: #dbeafe;
            padding: 10px;
            margin: 8px 0;
            border-radius: 4px;
            border-left: 4px solid #3b82f6;
          }
          .observations {
            background: #faf5ff;
            padding: 10px;
            margin: 8px 0;
            border-radius: 4px;
            border-left: 4px solid #a855f7;
          }
          .rating { 
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            margin-right: 10px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
          }
          th, td { 
            border: 1px solid #e5e7eb; 
            padding: 10px; 
            text-align: left;
          }
          th { background: #f9fafb; font-weight: bold; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${project.name}</h1>
          <p><strong>Description:</strong> ${project.description}</p>
          <p><strong>Testing Mode:</strong> ${project.mode}</p>
          <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <h2>Executive Summary</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${analytics.totalSessions}</div>
            <div class="stat-label">Total Sessions</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${analytics.completionRate}%</div>
            <div class="stat-label">Completion Rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Math.floor(analytics.avgDuration / 60)}m ${analytics.avgDuration % 60}s</div>
            <div class="stat-label">Avg Duration</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${analytics.avgClicks + analytics.avgKeystrokes}</div>
            <div class="stat-label">Avg Interactions</div>
          </div>
        </div>

        <h2>Tasks</h2>
        ${project.setup.tasks.map(task => `
          <div style="margin: 15px 0; padding: 10px; background: #f9fafb; border-radius: 6px;">
            <h3 style="margin: 0 0 5px 0;">${task.title}</h3>
            <p style="margin: 0; color: #6b7280;">${task.description}</p>
            ${task.ratingEnabled ? `<p style="margin: 5px 0 0 0; font-size: 12px;"><strong>Rating:</strong> ${task.ratingLabel} (${task.ratingScale?.low} → ${task.ratingScale?.high})</p>` : ''}
          </div>
        `).join('')}

        <h2>Session Details</h2>
        ${project.sessions.map(session => {
          const participant = participants.find(p => p.id === session.participantId);
          return `
            <div class="session">
              <div class="session-header">
                <div>
                  <strong>${participant?.name || 'Unknown'}</strong><br>
                  <small>${participant?.email || ''}</small>
                </div>
                <div style="text-align: right;">
                  <small>${new Date(session.completedAt).toLocaleString()}</small>
                </div>
              </div>

              <table>
                <tr>
                  <th>Duration</th>
                  <th>Tasks</th>
                  <th>Clicks</th>
                  <th>Keystrokes</th>
                </tr>
                <tr>
                  <td>${Math.floor(session.duration / 60)}m ${session.duration % 60}s</td>
                  <td>${session.tasksCompleted}/${session.totalTasks}</td>
                  <td>${session.mouseClicks}</td>
                  <td>${session.keystrokes}</td>
                </tr>
              </table>

              ${session.taskFeedback && session.taskFeedback.length > 0 ? `
                <h3>Task Feedback</h3>
                ${session.taskFeedback.map(feedback => {
                  const task = project.setup.tasks.find(t => t.id === feedback.taskId);
                  return `
                    <div class="task-feedback">
                      <strong>${task?.title || 'Unknown Task'}</strong>
                      ${feedback.rating ? `<span class="rating">${feedback.rating}/5</span>` : ''}
                      ${feedback.answer ? `<p>${feedback.answer}</p>` : ''}
                      ${feedback.questionAnswers ? feedback.questionAnswers.map(qa => {
                        const question = task?.customQuestions?.find(q => q.id === qa.questionId);
                        return `
                          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #3b82f6;">
                            <strong style="font-size: 12px;">${question?.question}</strong>
                            <p style="margin: 5px 0 0 0;">${qa.answer}</p>
                          </div>
                        `;
                      }).join('') : ''}
                    </div>
                  `;
                }).join('')}
              ` : ''}

              ${session.observations ? `
                <h3>Observations</h3>
                <div class="observations">
                  <p>${session.observations}</p>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">
            Print / Save as PDF
          </button>
          <button onclick="window.close()" style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

// Continue from Part 2...

  // DASHBOARD VIEW
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Testing Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your testing projects and participants</p>
              </div>
              <button
                onClick={createNewProject}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Project</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Projects</h2>
              {projects.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <LayoutDashboard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-6">Create your first testing project to get started</p>
                  <button
                    onClick={createNewProject}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map(project => {
                    const analytics = getAnalytics(project);
                    return (
                      <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  project.status === 'active' ? 'bg-green-100 text-green-700' :
                                  project.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {project.status}
                                </span>
                              </div>
                              <p className="text-gray-600">{project.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => editProject(project)}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteProject(project.id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              {project.mode === 'moderated' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                              <span className="capitalize">{project.mode}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <UserPlus className="w-4 h-4" />
                              <span>{project.participantIds.length} participants</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>{project.setup.tasks.length} tasks</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <BarChart3 className="w-4 h-4" />
                              <span>{analytics.totalSessions} sessions</span>
                            </div>
                          </div>

                          {analytics.totalSessions > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-lg font-bold text-gray-900">{analytics.completionRate}%</div>
                                  <div className="text-xs text-gray-600">Completion</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-gray-900">{Math.floor(analytics.avgDuration / 60)}m</div>
                                  <div className="text-xs text-gray-600">Avg Duration</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-gray-900">{analytics.avgClicks}</div>
                                  <div className="text-xs text-gray-600">Avg Clicks</div>
                                </div>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              setCurrentProject(project);
                              setView('projectDetail');
                            }}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Open Project
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Participants</h2>
                <button onClick={() => setShowAddParticipant(true)} className="text-blue-600 hover:text-blue-700 p-2">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {showAddParticipant && (
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Add Participant</h3>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newParticipantName}
                    onChange={(e) => setNewParticipantName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={createParticipant}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddParticipant(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow">
                {participants.length === 0 ? (
                  <div className="p-8 text-center">
                    <UserPlus className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No participants yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {participants.map(participant => (
                      <div key={participant.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{participant.name}</div>
                            <div className="text-sm text-gray-600 flex items-center mt-1">
                              <Mail className="w-3 h-3 mr-1" />
                              {participant.email}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteParticipant(participant.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CREATE/EDIT PROJECT VIEW
  if (view === 'createProject') {
    const isEditing = !!editingProject;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setView('dashboard')} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Project' : 'New Project'}
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., E-commerce Checkout Flow"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Brief description of what you're testing..."
                    className="w-full h-20 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Testing Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setProjectMode('moderated')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        projectMode === 'moderated'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Users className={`w-6 h-6 mb-2 ${projectMode === 'moderated' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div className="font-semibold text-gray-900">Moderated</div>
                      <div className="text-sm text-gray-600">Live sessions with observation</div>
                    </button>
                    <button
                      onClick={() => setProjectMode('unmoderated')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        projectMode === 'unmoderated'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <User className={`w-6 h-6 mb-2 ${projectMode === 'unmoderated' ? 'text-purple-600' : 'text-gray-600'}`} />
                      <div className="font-semibold text-gray-900">Unmoderated</div>
                      <div className="text-sm text-gray-600">Self-guided task completion</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recording Options</h2>
              <p className="text-sm text-gray-600 mb-4">All sessions automatically track keyboard and mouse movements. Configure camera and microphone settings below.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Camera</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['optional', 'required', 'disabled'] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => setCameraOption(option)}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          cameraOption === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium capitalize">{option}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {option === 'optional' ? 'User can choose' : option === 'required' ? 'Must be on' : 'Not used'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Microphone</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['optional', 'required', 'disabled'] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => setMicOption(option)}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          micOption === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium capitalize">{option}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {option === 'optional' ? 'User can choose' : option === 'required' ? 'Must be on' : 'Not used'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Activity className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <div className="font-medium mb-1">Automatic Tracking Enabled</div>
                      <div>All sessions will record keyboard input, mouse clicks, cursor movements, and screen interactions for detailed analytics.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <h2 className="text-xl font-bold text-gray-900">Before Session Message</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">This message will be the first thing participants see before the session starts.</p>
              <textarea
                value={beforeMessage}
                onChange={(e) => setBeforeMessage(e.target.value)}
                placeholder="Enter welcome message..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <h2 className="text-xl font-bold text-gray-900">During Session Test Scenarios</h2>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Scenario Context</label>
                <p className="text-sm text-gray-600 mb-3">Tell participants what their frame of mind should be before starting their first task.</p>
                <textarea
                  value={duringScenario}
                  onChange={(e) => setDuringScenario(e.target.value)}
                  placeholder="e.g., Imagine you are shopping for a birthday gift..."
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Tasks</label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={randomizeOrder}
                    onChange={(e) => setRandomizeOrder(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <Shuffle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Randomize task order</span>
                </label>
              </div>

              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3 mb-4">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                          placeholder="Task title..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <textarea
                          value={task.description}
                          onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                          placeholder="Task description..."
                          className="w-full h-16 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        {/* RATING SCALE CONFIGURATION */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={task.ratingEnabled || false}
                              onChange={(e) => toggleTaskRating(task.id, e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Enable Rating Scale (1-5)</span>
                          </label>

                          {task.ratingEnabled && (
                            <div className="space-y-3 pl-6 border-l-2 border-blue-300">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  What are you measuring?
                                </label>
                                <select
                                  value={task.ratingLabel}
                                  onChange={(e) => updateTaskRatingConfig(task.id, 'ratingLabel', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="Task Difficulty">Task Difficulty</option>
                                  <option value="Confidence Level">Confidence Level</option>
                                  <option value="Satisfaction">Satisfaction</option>
                                  <option value="Clarity">Clarity</option>
                                  <option value="Custom">Custom</option>
                                </select>
                              </div>

                              {task.ratingLabel === 'Custom' && (
                                <input
                                  type="text"
                                  placeholder="Enter custom label..."
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    1 = Low (e.g., "Very Easy")
                                  </label>
                                  <input
                                    type="text"
                                    value={task.ratingScale?.low || ''}
                                    onChange={(e) => updateTaskRatingConfig(task.id, 'low', e.target.value)}
                                    placeholder="Very Easy"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    5 = High (e.g., "Very Difficult")
                                  </label>
                                  <input
                                    type="text"
                                    value={task.ratingScale?.high || ''}
                                    onChange={(e) => updateTaskRatingConfig(task.id, 'high', e.target.value)}
                                    placeholder="Very Difficult"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* CUSTOM QUESTIONS */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Custom Questions</span>
                            <button
                              onClick={() => addQuestionToTask(task.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Question</span>
                            </button>
                          </div>

                          {(task.customQuestions || []).length === 0 ? (
                            <p className="text-xs text-gray-500 italic">No custom questions yet</p>
                          ) : (
                            <div className="space-y-2">
                              {(task.customQuestions || []).map((q, idx) => (
                                <div key={q.id} className="flex items-start space-x-2">
                                  <span className="text-xs text-gray-500 mt-2 flex-shrink-0">Q{idx + 1}:</span>
                                  <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) => updateTaskQuestion(task.id, q.id, e.target.value)}
                                    placeholder="Enter your question..."
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <button
                                    onClick={() => removeTaskQuestion(task.id, q.id)}
                                    className="text-red-500 hover:text-red-700 mt-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {tasks.length > 1 && (
                        <button
                          onClick={() => removeTask(task.id)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0 mt-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addTask}
                className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <h2 className="text-xl font-bold text-gray-900">After Session Message</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">This is the message participants will see upon completion of the session.</p>
              <textarea
                value={afterMessage}
                onChange={(e) => setAfterMessage(e.target.value)}
                placeholder="Enter thank you message..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                onClick={() => setView('dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProject}
                disabled={!projectName.trim() || !projectMode}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditing ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PROJECT DETAIL VIEW
  if (view === 'projectDetail' && currentProject) {
    const projectParticipants = participants.filter(p => currentProject.participantIds.includes(p.id));
    const availableParticipants = participants.filter(p => !currentProject.participantIds.includes(p.id));
    const analytics = getAnalytics(currentProject);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button onClick={backToDashboard} className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
                  <p className="text-gray-600">{currentProject.description}</p>
                </div>
              </div>
              <button
                onClick={() => editProject(currentProject)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Edit Setup</span>
              </button>
            </div>
            
            <div className="flex space-x-1 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'overview' ? (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Session Details</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Mode</div>
                      <div className="flex items-center space-x-2">
                        {currentProject.mode === 'moderated' ? <Users className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-purple-600" />}
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

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Tasks</h2>
                  <div className="space-y-3">
                    {currentProject.setup.tasks.map((task) => (
                      <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
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
                    New session links will expire after this many days. You can edit expiration for individual links later.
                  </p>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Participants</h2>
                  
                  {availableParticipants.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Participant</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addParticipantToProject(currentProject.id, parseInt(e.target.value));
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
                        const participantLinks = sessionLinks.filter(
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
                                onClick={() => removeParticipantFromProject(currentProject.id, participant.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              <button
                                onClick={() => startSession(currentProject, participant)}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                              >
                                Start Session
                              </button>
                              
                              <button
                                onClick={() => openEmailModal(currentProject.id, participant.id)}
                                className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                              >
                                <Mail className="w-4 h-4" />
                                <span>Send Invitation Email</span>
                              </button>
                            </div>

                            {participantLinks.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs font-medium text-gray-700 mb-2">Active Session Links:</div>
                                <div className="space-y-2">
                                  {participantLinks.map(link => (
                                    <div key={link.id} className="bg-gray-50 rounded p-2 text-xs">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-gray-600">
                                          Expires: {new Date(link.expiresAt).toLocaleDateString()} at {new Date(link.expiresAt).toLocaleTimeString()}
                                        </span>
                                        <div className="flex items-center space-x-1">
                                          <button
                                            onClick={() => {
                                              setEditingLinkId(link.id);
                                              setNewExpiryDate(new Date(link.expiresAt).toISOString().slice(0, 16));
                                              setShowExpiryModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-700"
                                            title="Edit expiration"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => deleteSessionLink(link.id)}
                                            className="text-red-600 hover:text-red-700"
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
          ) : (
            <div className="space-y-6">
              {analytics.totalSessions === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No session data yet</h3>
                  <p className="text-gray-600">Analytics will appear here once participants complete sessions</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-600">Total Sessions</div>
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{analytics.totalSessions}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-600">Completion Rate</div>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{analytics.completionRate}%</div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-600">Avg Duration</div>
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{Math.floor(analytics.avgDuration / 60)}m</div>
                      <div className="text-xs text-gray-600">{analytics.avgDuration % 60}s</div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-600">Avg Interactions</div>
                        <Activity className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{analytics.avgClicks + analytics.avgKeystrokes}</div>
                      <div className="text-xs text-gray-600">clicks + keys</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <Mouse className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Mouse Activity</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Average Clicks</span>
                            <span className="text-lg font-bold text-gray-900">{analytics.avgClicks}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((analytics.avgClicks / 100) * 100, 100)}%` }}></div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Mouse movement heatmaps and click patterns are recorded for each session
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <Keyboard className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-900">Keyboard Activity</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Average Keystrokes</span>
                            <span className="text-lg font-bold text-gray-900">{analytics.avgKeystrokes}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min((analytics.avgKeystrokes / 200) * 100, 100)}%` }}></div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Keyboard inputs are logged to understand user interaction patterns
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recording Usage</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <Video className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">Video Recording</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {analytics.videoUsage}/{analytics.totalSessions}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(analytics.videoUsage / analytics.totalSessions) * 100}%` }}></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          {Math.round((analytics.videoUsage / analytics.totalSessions) * 100)}% of sessions included video
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <Mic className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-gray-900">Audio Recording</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {analytics.audioUsage}/{analytics.totalSessions}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(analytics.audioUsage / analytics.totalSessions) * 100}%` }}></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          {Math.round((analytics.audioUsage / analytics.totalSessions) * 100)}% of sessions included audio
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Session History</h3>
                    <div className="space-y-3">
                      {currentProject.sessions.map(session => {
                        const participant = participants.find(p => p.id === session.participantId);
                        const hasFeedback = session.taskFeedback && session.taskFeedback.some(f => f.answer.trim());
                        const hasObservations = session.observations && session.observations.trim();
                        
                        return (
                          <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-semibold text-gray-900">{participant?.name || 'Unknown'}</div>
                                <div className="text-sm text-gray-600">{new Date(session.completedAt).toLocaleDateString()}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {session.hasVideo && <Video className="w-4 h-4 text-blue-600" />}
                                {session.hasAudio && <Mic className="w-4 h-4 text-purple-600" />}
                                {(hasFeedback || hasObservations) && (
                                  <span title="Has feedback">
                                    <Mail className="w-4 h-4 text-green-600" />
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                              <div>
                                <div className="text-gray-600">Duration</div>
                                <div className="font-semibold">{Math.floor(session.duration / 60)}m {session.duration % 60}s</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Tasks</div>
                                <div className="font-semibold">{session.tasksCompleted}/{session.totalTasks}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Clicks</div>
                                <div className="font-semibold">{session.mouseClicks}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Keystrokes</div>
                                <div className="font-semibold">{session.keystrokes}</div>
                              </div>
                            </div>

                            {/* TASK FEEDBACK */}
                            {hasFeedback && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-sm font-semibold text-gray-900 mb-3">Task Feedback:</div>
                                <div className="space-y-3">
                                  {session.taskFeedback.filter(f => f.answer.trim()).map(feedback => {
                                    const task = currentProject.setup.tasks.find(t => t.id === feedback.taskId);
                                    return (
                                      <div key={feedback.taskId} className="bg-blue-50 rounded-lg p-3">
                                        <div className="text-xs font-semibold text-gray-900 mb-1">
                                          {task?.title || 'Unknown Task'}
                                        </div>
                                        <div className="text-sm text-gray-700">{feedback.answer}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* OBSERVATIONS */}
                            {hasObservations && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-sm font-semibold text-gray-900 mb-2">Observations:</div>
                                <div className="bg-purple-50 rounded-lg p-3 text-sm text-gray-700">
                                  {session.observations}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // RUN SESSION VIEW
  if (view === 'runSession' && currentProject) {
    const canToggleVideo = currentProject.cameraOption === 'optional';
    const canToggleMic = currentProject.micOption === 'optional';

    if (sessionComplete) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-12 text-center">
            <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Session Complete!</h2>
            <div className="text-lg text-gray-700 mb-8 whitespace-pre-wrap">
              {currentProject.setup.afterMessage}
            </div>
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{completedTasks.length}</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{displayTasks.length}</div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={backToProject}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Back to Project
              </button>
              <button
                onClick={backToDashboard}
                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (currentProject.mode === 'moderated') {
      return (
        <div className="min-h-screen bg-gray-100">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-4">
                <button onClick={backToProject} className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Moderated Testing Session</h1>
                {recording && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-600">Recording</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {!sessionStarted ? (
                  <button
                    onClick={beginSessionRecording}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Session</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setRecording(!recording)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      {recording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={endSession}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Square className="w-4 h-4" />
                      <span>End Session</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {!sessionStarted ? (
            <div className="max-w-3xl mx-auto p-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome Message</h2>
                <div className="text-gray-700 mb-6 whitespace-pre-wrap">{currentProject.setup.beforeMessage}</div>
                {currentProject.setup.duringScenario && (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Scenario</h3>
                    <div className="bg-blue-50 rounded-lg p-4 text-gray-700 mb-6 whitespace-pre-wrap">
                      {currentProject.setup.duringScenario}
                    </div>
                  </>
                )}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <div className="font-medium mb-1">Tracking Enabled</div>
                      <div>This session will record screen activity, keyboard input, and mouse movements.</div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Click "Start Session" in the top right when ready to begin.
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Monitor className="w-16 h-16 text-gray-600" />
                    </div>
                    <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                      Participant Screen
                    </div>
                    <div className="absolute bottom-4 left-4 flex space-x-4 text-white text-sm">
                      <div className="bg-black bg-opacity-50 px-3 py-1 rounded flex items-center space-x-2">
                        <Mouse className="w-4 h-4" />
                        <span>{trackingData.clicks} clicks</span>
                      </div>
                      <div className="bg-black bg-opacity-50 px-3 py-1 rounded flex items-center space-x-2">
                        <Keyboard className="w-4 h-4" />
                        <span>{trackingData.keystrokes} keys</span>
                      </div>
                    </div>
                  </div>

                  {currentProject.cameraOption !== 'disabled' && (
                    <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video relative w-64">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="w-12 h-12 text-gray-600" />
                      </div>
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        Participant Webcam
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-lg p-4 flex items-center justify-center space-x-4">
                    <button
                      onClick={() => canToggleMic && setMicOn(!micOn)}
                      disabled={!canToggleMic}
                      className={`p-4 rounded-full ${
                        !canToggleMic ? 'opacity-50 cursor-not-allowed' : ''
                      } ${micOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                      {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-white" />}
                    </button>
                    <button
                      onClick={() => canToggleVideo && setVideoOn(!videoOn)}
                      disabled={!canToggleVideo}
                      className={`p-4 rounded-full ${
                        !canToggleVideo ? 'opacity-50 cursor-not-allowed' : ''
                      } ${videoOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                      {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6 text-white" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Tasks</h3>
                    <div className="space-y-3">
                      {displayTasks.map((task, index) => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-lg border-2 ${
                            completedTasks.includes(task.id)
                              ? 'border-green-300 bg-green-50'
                              : index === currentTask
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-900">{task.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                            </div>
                            <button
                              onClick={() => handleTaskComplete(task.id)}
                              className="ml-2 flex-shrink-0"
                            >
                              {completedTasks.includes(task.id) ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Observer Notes</h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Take notes during the session..."
                      className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* ADD THIS NEW SECTION FOR MODERATED SESSIONS */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Participant Observations</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Ask participant about their expectations and observations
                    </p>
                    <textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Record participant's observations here..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // UNMODERATED SESSION
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <button onClick={backToProject} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">User Testing Session</h1>
            </div>
            {recording && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-600">Recording</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          {!sessionStarted ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6 mx-auto">
                <Eye className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Welcome</h2>
              <div className="text-lg text-gray-700 mb-8 whitespace-pre-wrap text-center">
                {currentProject.setup.beforeMessage}
              </div>
              {currentProject.setup.duringScenario && (
                <div className="bg-purple-50 rounded-lg p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-3">Scenario</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{currentProject.setup.duringScenario}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">What to expect:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <Clock className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>You'll complete {displayTasks.length} tasks</span>
                  </li>
                  <li className="flex items-start">
                    <Monitor className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Screen recording will capture your actions</span>
                  </li>
                  {currentProject.micOption !== 'disabled' && (
                    <li className="flex items-start">
                      <Mic className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Please think aloud and share your thoughts</span>
                    </li>
                  )}
                  <li className="flex items-start">
                    <Activity className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Keyboard and mouse movements will be tracked</span>
                  </li>
                  <li className="flex items-start">
                    <Mail className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>You'll be asked for feedback after each task</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={beginSessionRecording}
                className="w-full bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-lg"
              >
                Start Testing Session
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Task {currentTask + 1} of {displayTasks.length}
                  </span>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mouse className="w-4 h-4" />
                      <span>{trackingData.clicks}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Keyboard className="w-4 h-4" />
                      <span>{trackingData.keystrokes}</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedTasks.length / displayTasks.length) * 100}%` }}
                  ></div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {displayTasks[currentTask].title}
                  </h3>
                  <p className="text-lg text-gray-700">{displayTasks[currentTask].description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleTaskComplete(displayTasks[currentTask].id)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Mark Task Complete</span>
                  </button>

                  {completedTasks.length === displayTasks.length && (
                    <button
                      onClick={endSession}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Finish Session
                    </button>
                  )}
                </div>
              </div>

              {/* OBSERVATIONS FIELD */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Your Observations</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  As you complete tasks, note anything unexpected, confusing, or worth mentioning. What did you expect to see or happen?
                </p>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Example: I expected to see a confirmation message after clicking submit, but nothing happened immediately..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <div className="text-xs text-gray-500 mt-2">
                  This field is saved automatically. You can update it anytime during the session.
                </div>
              </div>

              {/* ALL TASKS */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">All Tasks</h3>
                <div className="space-y-3">
                  {displayTasks.map((task, index) => {
                    const feedback = taskFeedback.find(f => f.taskId === task.id);
                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border-2 ${
                          completedTasks.includes(task.id)
                            ? 'border-green-300 bg-green-50'
                            : index === currentTask
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{task.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          </div>
                          {completedTasks.includes(task.id) && (
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 ml-4" />
                          )}
                        </div>
                        {feedback && feedback.answer && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-600 mb-1">Your feedback:</div>
                            <div className="text-sm text-gray-700 bg-white p-2 rounded">
                              {feedback.answer}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // FEEDBACK MODAL
  const FeedbackModal = () => {
    if (!showFeedbackPrompt || !displayTasks[currentTask]) return null;

    const task = displayTasks[currentTask];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Task Feedback</h2>
          </div>

          <div className="p-6">
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
              <p className="text-sm text-gray-600">{task.description}</p>
            </div>

            {/* RATING SCALE */}
            {task.ratingEnabled && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {task.ratingLabel || 'Rate this task'}
                </label>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{task.ratingScale?.low}</span>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setCurrentTaskRating(rating)}
                        className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                          currentTaskRating === rating
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-gray-300 text-gray-700 hover:border-purple-400'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{task.ratingScale?.high}</span>
                </div>
              </div>
            )}

            {/* CUSTOM QUESTIONS */}
            {task.customQuestions && task.customQuestions.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200 space-y-4">
                {task.customQuestions.map((q, idx) => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question {idx + 1}: {q.question}
                    </label>
                    <textarea
                      value={currentQuestionAnswers.find(a => a.questionId === q.id)?.answer || ''}
                      onChange={(e) => {
                        const existing = currentQuestionAnswers.filter(a => a.questionId !== q.id);
                        setCurrentQuestionAnswers([...existing, { questionId: q.id, answer: e.target.value }]);
                      }}
                      placeholder="Your answer..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* GENERAL FEEDBACK */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Describe your thought process, any challenges you faced, or other feedback.
              </p>
              <textarea
                value={currentTaskAnswer}
                onChange={(e) => setCurrentTaskAnswer(e.target.value)}
                placeholder="Example: I found the button easily but wasn't sure what would happen when I clicked it..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={submitTaskFeedback}
                disabled={task.ratingEnabled && currentTaskRating === 0}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {task.ratingEnabled && currentTaskRating === 0 ? 'Please provide a rating' : 'Submit & Continue'}
              </button>
              <button
                onClick={skipTaskFeedback}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // EMAIL MODAL
  const EmailModal = () => {
    if (!showEmailModal || !emailModalParticipant || !currentProject) return null;

    const formattedBody = formatEmailTemplate(
      emailTemplate.body,
      emailModalParticipant.name,
      currentProject.name,
      emailModalLink,
      new Date(emailModalExpiry).toLocaleDateString()
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Email Preview</h2>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-500 hover:text-gray-700">
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
                value={emailTemplate.subject}
                onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
              <div className="mb-2 text-xs text-gray-500">
                Available placeholders: {'{participantName}'}, {'{projectName}'}, {'{sessionLink}'}, {'{expiryDate}'}
              </div>
              <textarea
                value={emailTemplate.body}
                onChange={(e) => setEmailTemplate({ ...emailTemplate, body: e.target.value })}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Preview:</h3>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">To: {emailModalParticipant.email}</div>
                  <div className="text-sm font-semibold text-gray-900">Subject: {emailTemplate.subject}</div>
                </div>
                <div className="whitespace-pre-wrap text-gray-700 text-sm">{formattedBody}</div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">Session Link Information:</div>
                  <div>Link expires: {new Date(emailModalExpiry).toLocaleDateString()} at {new Date(emailModalExpiry).toLocaleTimeString()}</div>
                  <div className="mt-2 font-mono text-xs bg-white p-2 rounded border border-gray-200 break-all">
                    {emailModalLink}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={copyEmailToClipboard}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Mail className="w-5 h-5" />
                <span>Copy Email to Clipboard</span>
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // EXPIRY MODAL
  const ExpiryModal = () => {
    if (!showExpiryModal || !editingLinkId) return null;

    const link = sessionLinks.find(l => l.id === editingLinkId);
    if (!link) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Expiration Date</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Expiration</label>
            <div className="text-gray-900">{new Date(link.expiresAt).toLocaleString()}</div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">New Expiration Date & Time</label>
            <input
              type="datetime-local"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                if (newExpiryDate) {
                  updateLinkExpiry(editingLinkId, new Date(newExpiryDate).toISOString());
                }
              }}
              disabled={!newExpiryDate}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update
            </button>
            <button
              onClick={() => {
                setShowExpiryModal(false);
                setEditingLinkId(null);
                setNewExpiryDate('');
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

// Render modals
  if (showEmailModal) return <EmailModal />;
  if (showExpiryModal) return <ExpiryModal />;

  return null;
}