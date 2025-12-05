/**
 * ResearchHelpPanel.tsx
 * 
 * A compact help panel that can be integrated into the HypothesisTracker
 * to explain research questions, hypotheses, and their relationship to coverage.
 * 
 * Usage: Replace or enhance the existing "Learn more" dialog in HypothesisTracker.tsx
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ResearchHelpPanelProps {
  trigger?: React.ReactNode;
  defaultTab?: 'questions' | 'hypotheses' | 'coverage' | 'workflow';
}

export function ResearchHelpPanel({ trigger, defaultTab = 'questions' }: ResearchHelpPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-1 text-slate-600 hover:text-slate-900">
            <HelpCircle className="w-4 h-4" />
            Learn more
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Research Framework Guide</DialogTitle>
          <DialogDescription>
            Understanding how research questions, hypotheses, and coverage work together
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="hypotheses">Hypotheses</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="questions" className="mt-0 space-y-4">
              <ResearchQuestionsContent />
            </TabsContent>

            <TabsContent value="hypotheses" className="mt-0 space-y-4">
              <HypothesesContent />
            </TabsContent>

            <TabsContent value="coverage" className="mt-0 space-y-4">
              <CoverageContent />
            </TabsContent>

            <TabsContent value="workflow" className="mt-0 space-y-4">
              <WorkflowContent />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ResearchQuestionsContent() {
  return (
    <>
      <section>
        <h3 className="text-base font-semibold text-slate-900 mb-2">What are Research Questions?</h3>
        <p className="text-sm text-slate-600">
          Research questions are the high-level, strategic inquiries that drive your study. They define 
          <strong> what you need to learn</strong> to make informed product or business decisions.
        </p>
      </section>

      <section className="bg-slate-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-800 mb-2">Good Research Questions Are:</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <span><strong>Strategic</strong> — Address real business or product decisions</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <span><strong>Open-ended</strong> — Don't assume a particular answer</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <span><strong>Actionable</strong> — Answers will inform concrete next steps</span>
          </li>
        </ul>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-slate-800 mb-2">Examples</h4>
        <div className="space-y-2">
          <ExampleComparison
            weak="Is our onboarding good?"
            strong="Why do new users abandon the platform within the first week?"
          />
          <ExampleComparison
            weak="Do people like feature X?"
            strong="What workflows are users trying to accomplish when they use feature X?"
          />
        </div>
      </section>

      <TipBox>
        Aim for 2-5 core research questions per study. Each question should have multiple 
        hypotheses beneath it that you'll validate through research.
      </TipBox>
    </>
  );
}

function HypothesesContent() {
  return (
    <>
      <section>
        <h3 className="text-base font-semibold text-slate-900 mb-2">What are Hypotheses?</h3>
        <p className="text-sm text-slate-600">
          Hypotheses are <strong>specific, testable predictions</strong> about user behavior, needs, or experiences. 
          They represent your team's best current beliefs that will be validated or disproven through research.
        </p>
      </section>

      <section className="bg-slate-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-800 mb-2">Hypothesis Status Definitions</h4>
        <div className="space-y-2">
          <StatusDefinition
            status="testing"
            color="blue"
            description="Currently being validated through research sessions"
          />
          <StatusDefinition
            status="validated"
            color="green"
            description="Evidence strongly supports this (>70% of participants confirm)"
          />
          <StatusDefinition
            status="disproven"
            color="red"
            description="Evidence contradicts this (<30% of participants confirm)"
          />
          <StatusDefinition
            status="unclear"
            color="yellow"
            description="Mixed results—needs refinement or more data (30-70%)"
          />
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-slate-800 mb-2">Linking to Research Questions</h4>
        <p className="text-sm text-slate-600">
          Every hypothesis should connect to at least one research question. This ensures your 
          hypotheses remain strategically relevant and findings map back to decisions.
        </p>
      </section>

      <TipBox>
        A good hypothesis includes: what you believe, which user segments are affected, 
        what evidence would validate it, and how you'll test it.
      </TipBox>
    </>
  );
}

function CoverageContent() {
  return (
    <>
      <section>
        <h3 className="text-base font-semibold text-slate-900 mb-2">What is Coverage Planning?</h3>
        <p className="text-sm text-slate-600">
          Coverage planning connects your <strong>research tasks to your hypotheses</strong>. It ensures 
          your study plan will actually validate or disprove what you need to learn.
        </p>
      </section>

      <section className="bg-slate-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-800 mb-2">Coverage Status</h4>
        <div className="space-y-2">
          <CoverageStatusItem
            status="Full"
            color="green"
            description="All relevant user segments covered by linked tasks"
          />
          <CoverageStatusItem
            status="Partial"
            color="yellow"
            description="Some segments covered, but gaps remain"
          />
          <CoverageStatusItem
            status="None"
            color="red"
            description="No tasks linked to validate this hypothesis"
          />
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-slate-800 mb-2">Segment Alignment</h4>
        <p className="text-sm text-slate-600 mb-2">
          Task difficulty should match hypothesis target segments:
        </p>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Task Difficulty</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Target Segments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr><td className="px-3 py-2">Easy</td><td className="px-3 py-2">Non-Users, Abandoned</td></tr>
              <tr><td className="px-3 py-2">Medium</td><td className="px-3 py-2">Occasional Users</td></tr>
              <tr><td className="px-3 py-2">Hard</td><td className="px-3 py-2">Active, Power Users</td></tr>
              <tr><td className="px-3 py-2">All</td><td className="px-3 py-2">Everyone</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <WarningBox>
        <strong>Alignment issues</strong> occur when a hypothesis targets segments that aren't 
        covered by its linked tasks. Check the Coverage tab to identify and fix these gaps.
      </WarningBox>
    </>
  );
}

function WorkflowContent() {
  return (
    <>
      <section>
        <h3 className="text-base font-semibold text-slate-900 mb-2">The Research Hierarchy</h3>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="space-y-3">
            <HierarchyLevel
              level="Research Questions"
              purpose="Define what you're trying to learn"
              type="Strategic"
            />
            <div className="flex justify-center">
              <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
            </div>
            <HierarchyLevel
              level="Hypotheses"
              purpose="Predict specific findings"
              type="Testable"
            />
            <div className="flex justify-center">
              <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
            </div>
            <HierarchyLevel
              level="Tasks"
              purpose="Validate predictions"
              type="Operational"
            />
            <div className="flex justify-center">
              <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
            </div>
            <HierarchyLevel
              level="Evidence"
              purpose="Support or refute hypotheses"
              type="Data"
            />
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-slate-800 mb-2">Recommended Workflow</h4>
        <ol className="text-sm text-slate-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
            <span>Define 2-5 core research questions for your study</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
            <span>Generate 3-10 hypotheses per research question</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
            <span>Link each hypothesis to at least one task</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0">4</span>
            <span>Check coverage for alignment issues before sessions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0">5</span>
            <span>Run sessions and update hypothesis status with evidence</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0">6</span>
            <span>Synthesize findings back to research questions</span>
          </li>
        </ol>
      </section>

      <TipBox>
        <strong>Iterate as you learn:</strong> Add new hypotheses when surprising patterns emerge, 
        modify existing ones as evidence suggests nuance, and pursue unexpected findings—they often 
        yield the best insights.
      </TipBox>
    </>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function ExampleComparison({ weak, strong }: { weak: string; strong: string }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-red-50 px-3 py-2 border-b border-red-100">
        <span className="text-xs text-red-600 font-medium">❌ Weak: </span>
        <span className="text-sm text-red-700">{weak}</span>
      </div>
      <div className="bg-green-50 px-3 py-2">
        <span className="text-xs text-green-600 font-medium">✓ Strong: </span>
        <span className="text-sm text-green-700">{strong}</span>
      </div>
    </div>
  );
}

function StatusDefinition({ status, color, description }: { status: string; color: string; description: string }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };
  
  return (
    <div className="flex items-start gap-2">
      <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${colors[color as keyof typeof colors]}`}>
        {status}
      </span>
      <span className="text-sm text-slate-600">{description}</span>
    </div>
  );
}

function CoverageStatusItem({ status, color, description }: { status: string; color: string; description: string }) {
  const dotColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };
  
  return (
    <div className="flex items-start gap-2">
      <span className={`w-2 h-2 rounded-full ${dotColors[color as keyof typeof dotColors]} mt-1.5 flex-shrink-0`} />
      <div>
        <span className="text-sm font-medium text-slate-700">{status}: </span>
        <span className="text-sm text-slate-600">{description}</span>
      </div>
    </div>
  );
}

function HierarchyLevel({ level, purpose, type }: { level: string; purpose: string; type: string }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border">
      <div>
        <div className="text-sm font-medium text-slate-800">{level}</div>
        <div className="text-xs text-slate-500">{purpose}</div>
      </div>
      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{type}</span>
    </div>
  );
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <span className="text-blue-500">💡</span>
        <p className="text-sm text-blue-700">{children}</p>
      </div>
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <span className="text-amber-500">⚠️</span>
        <p className="text-sm text-amber-700">{children}</p>
      </div>
    </div>
  );
}

export default ResearchHelpPanel;