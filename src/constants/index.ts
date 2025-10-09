// constants/index.ts
export const STORAGE_KEYS = {
  PROJECTS: 'userTesting_projects',
  PARTICIPANTS: 'userTesting_participants',
  SESSION_LINKS: 'userTesting_sessionLinks'
} as const;

export const DEFAULT_EMAIL_TEMPLATE = {
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
};

export const DEFAULT_MESSAGES = {
  beforeMessage: 'Welcome! Thank you for participating in this user testing session.',
  duringScenario: 'Imagine you are shopping for a birthday gift for a friend. Browse the site as you normally would.',
  afterMessage: 'Thank you for completing this session! Your feedback is invaluable to us.'
};

export const DEFAULT_TASK = {
  title: "",
  description: "",
  ratingEnabled: false,
  ratingLabel: "Task Difficulty",
  ratingScale: { low: "Very Easy", high: "Very Difficult" },
  customQuestions: []
};

export const DEFAULT_PARTICIPANTS = [
  { id: 1, name: "Sarah Johnson", email: "sarah.j@email.com" },
  { id: 2, name: "Mike Chen", email: "mike.c@email.com" },
  { id: 3, name: "Emily Rodriguez", email: "emily.r@email.com" }
];