/**
 * In-App Help Content for Research Questions & Coverage Planning
 * 
 * This file contains help content that can be integrated into the UserLens UI
 * to provide contextual guidance for users working with research questions,
 * hypotheses, and coverage planning.
 */

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { HelpCircle, Lightbulb, AlertTriangle, CheckCircle2, Target, Layers } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// ============================================
// HELP CONTENT DEFINITIONS
// ============================================

export const HELP_CONTENT = {
  researchQuestions: {
    title: 'About Research Questions',
    description: 'Research questions are the strategic inquiries driving your study.',
    content: {
      whatTheyAre: `Research questions define what you're trying to learn at a high level. They should be open-ended, strategic, and actionable—meaning the answers will inform real product or business decisions.`,
      examples: [
        { 
          weak: 'Is our onboarding good?', 
          strong: 'Why do new users abandon the platform within the first week?' 
        },
        { 
          weak: 'Do people like feature X?', 
          strong: 'What workflows are users trying to accomplish when they use feature X?' 
        },
      ],
      tips: [
        'Start with the decision you need to make',
        'Frame as open-ended questions (avoid yes/no)',
        'Aim for 2-5 questions per study',
        'Each question should have multiple hypotheses beneath it',
      ],
    },
  },
  hypotheses: {
    title: 'About Hypotheses',
    description: 'Hypotheses are testable predictions that help answer your research questions.',
    content: {
      whatTheyAre: `A hypothesis is your team's best prediction about user behavior or needs. Unlike research questions (which are open-ended), hypotheses are specific statements that can be validated or disproven through research.`,
      lifecycle: {
        testing: 'Currently being validated through research sessions',
        validated: 'Evidence strongly supports this (>70% of participants confirm)',
        disproven: 'Evidence contradicts this (<30% of participants confirm)',
        unclear: 'Mixed results—needs refinement or more data (30-70%)',
      },
      tips: [
        'Make hypotheses specific and observable',
        'Include which user segments are affected',
        'Define what evidence would validate or disprove it',
        'Link every hypothesis to a research question',
      ],
    },
  },
  coverage: {
    title: 'About Coverage Planning',
    description: 'Coverage ensures your tasks adequately test your hypotheses.',
    content: {
      whatItIs: `Coverage planning connects your research tasks to your hypotheses. It helps you ensure that your study plan will actually validate or disprove what you need to learn.`,
      statuses: {
        full: 'All relevant user segments are covered by linked tasks',
        partial: 'Some segments covered, but gaps remain',
        none: 'No tasks are linked to validate this hypothesis',
      },
      alignment: `Task difficulty should match hypothesis segments. Easy tasks target new users, hard tasks target power users. Mismatches create "alignment issues" that may produce unreliable results.`,
      tips: [
        'Link tasks to hypotheses before running sessions',
        'Check for alignment issues in the coverage matrix',
        'Prioritize coverage for high-priority hypotheses',
        'Review coverage after adding new hypotheses',
      ],
    },
  },
  relationship: {
    title: 'How They Work Together',
    description: 'Research questions, hypotheses, and coverage form a connected system.',
    content: {
      hierarchy: [
        { level: 'Research Questions', purpose: 'Define what you need to learn (strategic)' },
        { level: 'Hypotheses', purpose: 'Predict specific findings (testable)' },
        { level: 'Tasks', purpose: 'Validate predictions (operational)' },
        { level: 'Evidence', purpose: 'Support or refute hypotheses (data)' },
      ],
      flow: `Start with research questions, break them into hypotheses, link hypotheses to tasks, then roll evidence back up to answer your original questions.`,
    },
  },
};

// ============================================
// REUSABLE HELP COMPONENTS
// ============================================

interface HelpIconButtonProps {
  topic: keyof typeof HELP_CONTENT;
  size?: 'sm' | 'default';
}

/**
 * A help icon button that opens a contextual help dialog
 */
export function HelpIconButton({ topic, size = 'default' }: HelpIconButtonProps) {
  const content = HELP_CONTENT[topic];
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size={size === 'sm' ? 'sm' : 'default'}
          className="gap-1 text-slate-500 hover:text-slate-700"
        >
          <HelpCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          <span className="sr-only">Help: {content.title}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            {content.title}
          </DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>
        <HelpContentRenderer topic={topic} />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Renders the appropriate help content based on topic
 */
function HelpContentRenderer({ topic }: { topic: keyof typeof HELP_CONTENT }) {
  switch (topic) {
    case 'researchQuestions':
      return <ResearchQuestionsHelp />;
    case 'hypotheses':
      return <HypothesesHelp />;
    case 'coverage':
      return <CoverageHelp />;
    case 'relationship':
      return <RelationshipHelp />;
    default:
      return null;
  }
}

// ============================================
// SPECIFIC HELP CONTENT COMPONENTS
// ============================================

function ResearchQuestionsHelp() {
  const content = HELP_CONTENT.researchQuestions.content;
  
  return (
    <div className="space-y-4 py-2">
      <p className="text-sm text-slate-700">{content.whatTheyAre}</p>
      
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-900">Examples</h4>
        {content.examples.map((example, i) => (
          <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-slate-500">Weak:</span>
                <p className="text-sm text-slate-600">{example.weak}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-slate-500">Strong:</span>
                <p className="text-sm text-slate-700 font-medium">{example.strong}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-900">Tips</h4>
        <ul className="space-y-1">
          {content.tips.map((tip, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-slate-400">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HypothesesHelp() {
  const content = HELP_CONTENT.hypotheses.content;
  
  return (
    <div className="space-y-4 py-2">
      <p className="text-sm text-slate-700">{content.whatTheyAre}</p>
      
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-900">Status Definitions</h4>
        <div className="grid gap-2">
          {Object.entries(content.lifecycle).map(([status, description]) => (
            <div key={status} className="flex items-start gap-2 bg-slate-50 rounded p-2">
              <StatusBadge status={status as any} />
              <p className="text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-900">Tips</h4>
        <ul className="space-y-1">
          {content.tips.map((tip, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-slate-400">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CoverageHelp() {
  const content = HELP_CONTENT.coverage.content;
  
  return (
    <div className="space-y-4 py-2">
      <p className="text-sm text-slate-700">{content.whatItIs}</p>
      
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-900">Coverage Status</h4>
        <div className="space-y-2">
          <CoverageStatusItem status="full" description={content.statuses.full} />
          <CoverageStatusItem status="partial" description={content.statuses.partial} />
          <CoverageStatusItem status="none" description={content.statuses.none} />
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-amber-800 mb-1">Segment Alignment</h4>
        <p className="text-sm text-amber-700">{content.alignment}</p>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-900">Tips</h4>
        <ul className="space-y-1">
          {content.tips.map((tip, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-slate-400">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RelationshipHelp() {
  const content = HELP_CONTENT.relationship.content;
  
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-900">The Research Hierarchy</h4>
        <div className="space-y-1">
          {content.hierarchy.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-[140px]">
                <Layers className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">{item.level}</span>
              </div>
              <span className="text-sm text-slate-500">{item.purpose}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-blue-800 mb-1">How It Flows</h4>
        <p className="text-sm text-blue-700">{content.flow}</p>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatusBadge({ status }: { status: 'testing' | 'validated' | 'disproven' | 'unclear' }) {
  const config = {
    testing: 'bg-blue-100 text-blue-800',
    validated: 'bg-green-100 text-green-800',
    disproven: 'bg-red-100 text-red-800',
    unclear: 'bg-yellow-100 text-yellow-800',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${config[status]}`}>
      {status}
    </span>
  );
}

function CoverageStatusItem({ status, description }: { status: 'full' | 'partial' | 'none'; description: string }) {
  const config = {
    full: { color: 'bg-green-100 border-green-200', dot: 'bg-green-500', label: 'Full Coverage' },
    partial: { color: 'bg-yellow-100 border-yellow-200', dot: 'bg-yellow-500', label: 'Partial Coverage' },
    none: { color: 'bg-red-100 border-red-200', dot: 'bg-red-500', label: 'No Coverage' },
  };
  
  const c = config[status];
  
  return (
    <div className={`flex items-start gap-2 ${c.color} border rounded p-2`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} mt-1.5 flex-shrink-0`} />
      <div>
        <span className="text-xs font-medium text-slate-700">{c.label}</span>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

// ============================================
// TOOLTIP HELPERS
// ============================================

interface QuickTipProps {
  children: React.ReactNode;
  tip: string;
}

/**
 * Wraps an element with a tooltip showing a quick tip
 */
export function QuickTip({ children, tip }: QuickTipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{tip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// INLINE HELP TEXT
// ============================================

export const INLINE_HELP = {
  researchQuestion: {
    label: 'Core Research Question',
    placeholder: 'e.g., Why aren\'t engineering teams adopting our platform?',
    hint: 'Open-ended question that defines what you\'re trying to learn',
  },
  hypothesisTitle: {
    label: 'Hypothesis Title',
    placeholder: 'e.g., Onboarding is the #1 universal barrier across all segments',
    hint: 'Brief identifier for this hypothesis',
  },
  hypothesisStatement: {
    label: 'Hypothesis Statement',
    placeholder: 'Developers abandon or avoid Alchemy because there\'s no clear starting point...',
    hint: 'Full testable prediction about user behavior or needs',
  },
  expectedEvidence: {
    label: 'Expected Evidence',
    placeholder: '80%+ participants mention "unclear how to start"\nTask failure on "create your first component"',
    hint: 'What would validate this hypothesis? (one per line)',
  },
  howToTest: {
    label: 'How to Test',
    placeholder: 'Usability test: first-time user creates React component',
    hint: 'Research method or task that would test this hypothesis',
  },
  segments: {
    label: 'Relevant Segments',
    hint: 'Which user groups does this hypothesis apply to?',
  },
  category: {
    label: 'Category',
    hint: 'Type of issue this hypothesis addresses',
    options: {
      primary: 'Major adoption or usage barriers',
      workflow: 'Process or task flow problems',
      usability: 'Interface or interaction issues',
      organizational: 'Team or company-level factors',
    },
  },
};

// ============================================
// EMPTY STATE MESSAGES
// ============================================

export const EMPTY_STATES = {
  noResearchQuestions: {
    title: 'No research questions yet',
    description: 'Research questions define the strategic goals of your study. Add your first question to start organizing hypotheses.',
    action: 'Add Research Question',
  },
  noHypotheses: {
    title: 'No hypotheses yet',
    description: 'Hypotheses are testable predictions that help answer your research questions. Add hypotheses to track what you\'re validating.',
    action: 'Add Hypothesis',
  },
  noLinkedTasks: {
    title: 'No tasks linked',
    description: 'Link usability tasks to this hypothesis to track how you\'ll validate it.',
    action: 'Link Tasks',
  },
  noCoverage: {
    title: 'Coverage not calculated',
    description: 'Add hypotheses and link them to tasks to see your research coverage.',
  },
};

// ============================================
// VALIDATION CRITERIA CONTENT
// ============================================

export const VALIDATION_CRITERIA = {
  title: 'Success Criteria for Hypothesis Validation',
  quantitative: {
    title: 'Quantitative Thresholds',
    items: [
      { condition: '>70% mention issue', result: 'VALIDATED' },
      { condition: '<30% mention issue', result: 'DISPROVEN' },
      { condition: '30-70% mention', result: 'UNCLEAR/NUANCED' },
    ],
  },
  usability: {
    title: 'Usability Benchmarks',
    items: [
      { condition: 'Task success <50%', result: 'Major usability issue' },
      { condition: 'Time >5 min for basic tasks', result: 'Efficiency problem' },
      { condition: 'SEQ scores <4', result: 'Poor task experience' },
    ],
  },
  refinement: {
    title: 'Hypothesis Refinement Tips',
    items: [
      { icon: '💡', title: 'Add new hypotheses', description: 'Based on unexpected insights that emerge during research' },
      { icon: '✏️', title: 'Modify existing ones', description: 'As evidence suggests nuances or new directions' },
      { icon: '🔍', title: 'Pursue surprising findings', description: 'Even if not in original framework—these often yield the best insights' },
      { icon: '👥', title: 'Validate with broader team', description: 'Through mini-synthesis sessions to ensure alignment' },
    ],
  },
};

export default {
  HELP_CONTENT,
  INLINE_HELP,
  EMPTY_STATES,
  VALIDATION_CRITERIA,
  HelpIconButton,
  QuickTip,
};