import { Task } from "../types";

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
  beforeMessage: `Thank you for participating in this user testing session!

Your feedback will help us improve our product. This session should take approximately 15-20 minutes.

During this session, you'll complete a series of tasks. Please:
- Think aloud as you work through each task
- Share your honest thoughts and reactions
- Ask questions if anything is unclear

There are no right or wrong answers - we're testing the product, not you!`,
  
  duringScenario: `Imagine you're using this product for the first time. You've just signed up and are exploring the interface.`,
  
  afterMessage: `Thank you for completing this testing session!

Your feedback is invaluable and will directly contribute to improving the user experience.

If you have any additional thoughts or questions, please don't hesitate to reach out.`
};

export const DEFAULT_TASK: Omit<Task, 'id'> = {
  title: '',
  description: '',
  estimatedTime: '',
  objective: '',
  scenario: '',
  yourTask: [''],
  successCriteria: '',
  difficulty: 'medium', // Default to medium
  ratingEnabled: false,
  ratingLabel: 'Task Difficulty',
  ratingScale: {
    low: 'Very Easy',
    high: 'Very Difficult'
  },
  customQuestions: []
};

// Estimated time options for dropdown
export const ESTIMATED_TIME_OPTIONS = [
  "1-2 minutes",
  "3-5 minutes",
  "5-10 minutes",
  "10-15 minutes",
  "15-20 minutes",
  "20+ minutes"
];


export const DEFAULT_PARTICIPANTS = [
  { id: 1, name: "Sarah Johnson", email: "sarah.j@email.com" },
  { id: 2, name: "Mike Chen", email: "mike.c@email.com" },
  { id: 3, name: "Emily Rodriguez", email: "emily.r@email.com" }
];

// Mapping of usage levels to task difficulty
export const USAGE_TO_DIFFICULTY_MAP = {
  'non-user': 'easy',
  'occasionally': 'medium',
  'active': 'hard'
} as const;