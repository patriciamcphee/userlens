// constants/questionBank.ts
import { TaskQuestion } from '../types';

export interface QuestionBankItem extends Omit<TaskQuestion, 'id'> {
  category: 'SUS' | 'Post-Task' | 'Pre-Test' | 'Feature-Specific' | 'Demographics' | 'Follow-Up';
  description?: string;
  tags?: string[];
}

export const QUESTION_BANK: QuestionBankItem[] = [
  // ==========================================
  // SUS (System Usability Scale) Questions
  // ==========================================
  {
    category: 'SUS',
    question: 'I think that I would like to use this system frequently.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    description: 'SUS Question 1 - Measures frequency of use intention',
    tags: ['usability', 'sus', 'standardized']
  },
  {
    category: 'SUS',
    question: 'I found the system unnecessarily complex.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    description: 'SUS Question 2 - Measures system complexity',
    tags: ['usability', 'sus', 'standardized']
  },
  {
    category: 'SUS',
    question: 'I thought the system was easy to use.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    description: 'SUS Question 3 - Measures ease of use',
    tags: ['usability', 'sus', 'standardized']
  },
  {
    category: 'SUS',
    question: 'I think that I would need the support of a technical person to be able to use this system.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    description: 'SUS Question 4 - Measures need for technical support',
    tags: ['usability', 'sus', 'standardized']
  },
  {
    category: 'SUS',
    question: 'I found the various functions in this system were well integrated.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    description: 'SUS Question 5 - Measures integration of functions',
    tags: ['usability', 'sus', 'standardized']
  },
  {
    category: 'SUS',
    question: 'I thought there was too much inconsistency in this system.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    description: 'SUS Question 6 - Measures consistency',
    tags: ['usability', 'sus', 'standardized']
  },
  {
    category: 'SUS',
    question: 'I would imagine that most people would learn to use this system very quickly.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    description: 'SUS Question 7 - Measures learnability',
    tags: ['usability', 'sus', 'standardized']
  },
  {
    category: 'SUS',
    question: 'I found the system very cumbersome to use.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    description: 'SUS Question 8 - Measures awkwardness',
    tags: ['usability', 'sus', 'standardized']
  },
  {
    category: 'SUS',
    question: 'I felt very confident using the system.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    description: 'SUS Question 9 - Measures confidence',
    tags: ['usability', 'sus', 'standardized']
  },
  {
    category: 'SUS',
    question: 'I needed to learn a lot of things before I could get going with this system.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: true,
    description: 'SUS Question 10 - Measures learning curve',
    tags: ['usability', 'sus', 'standardized']
  },

  // ==========================================
  // Post-Task Questions
  // ==========================================
  {
    category: 'Post-Task',
    question: 'Overall, this task was:',
    type: 'multiple-choice',
    options: ['Very Difficult', 'Difficult', 'Neutral', 'Easy', 'Very Easy'],
    required: false,
    description: 'Single Ease Question (SEQ) - Standard post-task difficulty rating',
    tags: ['post-task', 'seq', 'difficulty']
  },
  {
    category: 'Post-Task',
    question: 'I am confident that I completed this task correctly.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: false,
    description: 'Measures task completion confidence',
    tags: ['post-task', 'confidence']
  },
  {
    category: 'Post-Task',
    question: 'What, if anything, did you find confusing about this task?',
    type: 'text',
    required: false,
    description: 'Open-ended feedback on task confusion',
    tags: ['post-task', 'feedback', 'confusion']
  },
  {
    category: 'Post-Task',
    question: 'What would have made this task easier to complete?',
    type: 'text',
    required: false,
    description: 'Gathering improvement suggestions',
    tags: ['post-task', 'feedback', 'improvement']
  },
  {
    category: 'Post-Task',
    question: 'Did anything work particularly well during this task?',
    type: 'text',
    required: false,
    description: 'Positive feedback collection',
    tags: ['post-task', 'feedback', 'positive']
  },
  {
    category: 'Post-Task',
    question: 'The amount of time it took to complete this task was:',
    type: 'multiple-choice',
    options: ['Too Long', 'A Bit Long', 'Just Right', 'Quick', 'Very Quick'],
    required: false,
    description: 'Task duration perception',
    tags: ['post-task', 'time', 'efficiency']
  },
  {
    category: 'Post-Task',
    question: 'Were you able to complete this task without assistance?',
    type: 'yes-no',
    required: false,
    description: 'Independence measurement',
    tags: ['post-task', 'assistance', 'independence']
  },
  {
    category: 'Post-Task',
    question: 'Did you encounter any errors during this task?',
    type: 'yes-no',
    required: false,
    description: 'Error tracking',
    tags: ['post-task', 'errors']
  },

  // ==========================================
  // Pre-Test Questions
  // ==========================================
  {
    category: 'Pre-Test',
    question: 'How would you describe your level of experience with similar systems/tools?',
    type: 'multiple-choice',
    options: ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'],
    required: false,
    description: 'Experience level assessment',
    tags: ['pre-test', 'experience', 'expertise']
  },
  {
    category: 'Pre-Test',
    question: 'How frequently do you use similar systems/tools?',
    type: 'multiple-choice',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'],
    required: false,
    description: 'Usage frequency',
    tags: ['pre-test', 'frequency', 'usage']
  },
  {
    category: 'Pre-Test',
    question: 'What is your primary goal for using this system?',
    type: 'text',
    required: false,
    description: 'Understanding user goals',
    tags: ['pre-test', 'goals', 'motivation']
  },

  // ==========================================
  // Feature-Specific Questions
  // ==========================================
  {
    category: 'Feature-Specific',
    question: 'The navigation was clear and intuitive.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: false,
    description: 'Navigation assessment',
    tags: ['feature', 'navigation', 'clarity']
  },
  {
    category: 'Feature-Specific',
    question: 'I easily found what I was looking for.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: false,
    description: 'Findability assessment',
    tags: ['feature', 'findability', 'information-architecture']
  },
  {
    category: 'Feature-Specific',
    question: 'The instructions/help text were clear and useful.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: false,
    description: 'Documentation quality',
    tags: ['feature', 'documentation', 'help']
  },
  {
    category: 'Feature-Specific',
    question: 'The visual design was appealing.',
    type: 'multiple-choice',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    required: false,
    description: 'Visual design assessment',
    tags: ['feature', 'design', 'aesthetics']
  },
  {
    category: 'Feature-Specific',
    question: 'How would you rate the overall experience?',
    type: 'multiple-choice',
    options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
    required: false,
    description: 'Overall experience rating',
    tags: ['feature', 'experience', 'satisfaction']
  },

  // ==========================================
  // Follow-Up Questions
  // ==========================================
  {
    category: 'Follow-Up',
    question: 'What did you like most about this system?',
    type: 'text',
    required: false,
    description: 'Positive aspects identification',
    tags: ['follow-up', 'positive', 'feedback']
  },
  {
    category: 'Follow-Up',
    question: 'What did you like least about this system?',
    type: 'text',
    required: false,
    description: 'Pain points identification',
    tags: ['follow-up', 'negative', 'feedback']
  },
  {
    category: 'Follow-Up',
    question: 'If you could change one thing about this system, what would it be?',
    type: 'text',
    required: false,
    description: 'Priority improvement identification',
    tags: ['follow-up', 'improvement', 'priority']
  },
  {
    category: 'Follow-Up',
    question: 'How likely are you to recommend this system to a friend or colleague?',
    type: 'multiple-choice',
    options: ['0 - Not at all likely', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10 - Extremely likely'],
    required: false,
    description: 'Net Promoter Score (NPS)',
    tags: ['follow-up', 'nps', 'recommendation']
  },
  {
    category: 'Follow-Up',
    question: 'Compared to similar systems you\'ve used, how would you rate this one?',
    type: 'multiple-choice',
    options: ['Much Worse', 'Worse', 'About the Same', 'Better', 'Much Better'],
    required: false,
    description: 'Competitive comparison',
    tags: ['follow-up', 'comparison', 'competitive']
  },
  {
    category: 'Follow-Up',
    question: 'Is there anything else you\'d like to share about your experience?',
    type: 'text',
    required: false,
    description: 'General feedback catch-all',
    tags: ['follow-up', 'feedback', 'general']
  },

  // ==========================================
  // Demographics (Optional)
  // ==========================================
  {
    category: 'Demographics',
    question: 'What is your role/job title?',
    type: 'text',
    required: false,
    description: 'Professional role identification',
    tags: ['demographics', 'role', 'professional']
  },
  {
    category: 'Demographics',
    question: 'How would you describe your technical expertise?',
    type: 'multiple-choice',
    options: ['Non-technical', 'Somewhat technical', 'Technical', 'Very technical'],
    required: false,
    description: 'Technical proficiency assessment',
    tags: ['demographics', 'technical', 'expertise']
  }
];

// Helper to get questions by category
export function getQuestionsByCategory(category: QuestionBankItem['category']): QuestionBankItem[] {
  return QUESTION_BANK.filter(q => q.category === category);
}

// Helper to search questions
export function searchQuestions(searchTerm: string): QuestionBankItem[] {
  const term = searchTerm.toLowerCase();
  return QUESTION_BANK.filter(q => 
    q.question.toLowerCase().includes(term) ||
    q.description?.toLowerCase().includes(term) ||
    q.tags?.some(tag => tag.toLowerCase().includes(term))
  );
}

// Helper to get all categories
export function getCategories(): QuestionBankItem['category'][] {
  return ['SUS', 'Post-Task', 'Pre-Test', 'Feature-Specific', 'Follow-Up', 'Demographics'];
}

// Helper to get complete SUS question set
export function getCompleteSUSQuestions(): QuestionBankItem[] {
  return getQuestionsByCategory('SUS');
}