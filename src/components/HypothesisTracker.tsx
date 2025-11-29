import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Plus, Edit2, Trash2, Pencil, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { api } from '../utils/api';
import { toast } from 'sonner';
// Define types locally since they're not exported from App
export interface Hypothesis {
  id: string;
  hypothesis: string;
  description?: string;
  evidence: string;
  status: 'validated' | 'disproven' | 'unclear' | 'testing';
  priority?: 'high' | 'medium' | 'low';
  supportingEvidence?: string;
  segments?: string[];
  expectedEvidence?: string;
  howToTest?: string;
  category?: 'primary' | 'workflow' | 'usability' | 'organizational';
  researchQuestionId?: string;
  expectedOutcome?: string;
  roadmapImpact?: string;
}

export interface ResearchQuestion {
  id: string;
  question: string;
  order: number;
}
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend';

// Enhanced status configuration with better visual hierarchy
const statusConfig = {
  validated: {
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-50',
    badgeClass: 'bg-green-500 text-white hover:bg-green-600',
    label: 'VALIDATED',
  },
  disproven: {
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-50',
    badgeClass: 'bg-red-500 text-white hover:bg-red-600',
    label: 'DISPROVEN',
  },
  unclear: {
    borderColor: 'border-l-yellow-500',
    bgColor: 'bg-yellow-50',
    badgeClass: 'bg-yellow-500 text-white hover:bg-yellow-600',
    label: 'UNCLEAR',
  },
  testing: {
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-50',
    badgeClass: 'bg-blue-500 text-white hover:bg-blue-600',
    label: 'TESTING',
  },
};

const priorityConfig = {
  high: {
    badgeClass: 'bg-red-500 text-white',
    label: 'HIGH PRIORITY',
  },
  medium: {
    badgeClass: 'bg-yellow-500 text-white',
    label: 'MEDIUM PRIORITY',
  },
  low: {
    badgeClass: 'bg-green-500 text-white',
    label: 'LOW PRIORITY',
  },
};

const segmentColors = {
  'Non-Users': 'bg-red-100 text-red-800 border-red-300',
  'Abandoned': 'bg-orange-100 text-orange-800 border-orange-300',
  'Occasional': 'bg-purple-100 text-purple-800 border-purple-300',
  'Active': 'bg-green-100 text-green-800 border-green-300',
};

// Category configuration for research organization
const categoryConfig = {
  primary: { label: 'Primary Barriers', color: 'border-l-red-500 bg-red-50', badgeClass: 'bg-red-100 text-red-800' },
  workflow: { label: 'Workflow Issues', color: 'border-l-orange-500 bg-orange-50', badgeClass: 'bg-orange-100 text-orange-800' },
  usability: { label: 'Usability Issues', color: 'border-l-blue-500 bg-blue-50', badgeClass: 'bg-blue-100 text-blue-800' },
  organizational: { label: 'Organizational Factors', color: 'border-l-purple-500 bg-purple-50', badgeClass: 'bg-purple-100 text-purple-800' }
};

interface Props {
  hypotheses: Hypothesis[];
  researchQuestions: ResearchQuestion[];
  onUpdate: () => void;
  projectId: string;
}

interface ValidationMetrics {
  totalHypotheses: number;
  validated: number;
  disproven: number;
  unclear: number;
  testing: number;
}

export function AlchemyResearchHypotheses({ hypotheses, researchQuestions, onUpdate, projectId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingHypothesis, setEditingHypothesis] = useState<Hypothesis | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set()); // Start collapsed
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [isAddHypothesisDialogOpen, setIsAddHypothesisDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ResearchQuestion | null>(null);
  const [isCreatingNewQuestion, setIsCreatingNewQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  
  const [hypothesisFormData, setHypothesisFormData] = useState<Partial<Hypothesis>>({
    status: 'testing',
    hypothesis: '',
    description: '',
    evidence: '',
    priority: 'medium',
    supportingEvidence: '',
    segments: [],
    expectedEvidence: '',
    howToTest: '',
    category: 'primary',
    researchQuestionId: '',
  });

  const [questionFormData, setQuestionFormData] = useState({
    question: '',
  });

  // Calculate validation metrics
  const calculateMetrics = (): ValidationMetrics => {
    const total = hypotheses.length;
    const validated = hypotheses.filter(h => h.status === 'validated').length;
    const disproven = hypotheses.filter(h => h.status === 'disproven').length;
    const unclear = hypotheses.filter(h => h.status === 'unclear').length;
    const testing = hypotheses.filter(h => h.status === 'testing').length;

    return { totalHypotheses: total, validated, disproven, unclear, testing };
  };

  // Filter hypotheses
  const filteredHypotheses = hypotheses.filter(h => {
    const categoryMatch = selectedCategory === 'all' || h.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || h.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  // Group hypotheses by research question
  const groupedHypotheses = researchQuestions
    .sort((a, b) => a.order - b.order)
    .map(question => ({
      question,
      hypotheses: filteredHypotheses.filter(h => h.researchQuestionId === question.id)
    }));

  // Unassigned hypotheses
  const unassignedHypotheses = filteredHypotheses.filter(h => !h.researchQuestionId);

  const toggleQuestion = (id: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleSubmitHypothesis = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHypothesis) {
        await api.updateHypothesisInProject(projectId, editingHypothesis.id, { ...editingHypothesis, ...hypothesisFormData });
        toast.success('Hypothesis updated!');
      } else {
        const existingNumbers = hypotheses
          .map(h => parseInt(h.id.replace(/\D/g, ''), 10))
          .filter(n => !isNaN(n));
        const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
        const newId = `H${maxNumber + 1}`;
        
        await api.addHypothesisToProject(projectId, { ...hypothesisFormData, id: newId });
        toast.success('Hypothesis added!');
      }
      setIsAddHypothesisDialogOpen(false);
      setEditingHypothesis(null);
      setHypothesisFormData({
        status: 'testing',
        hypothesis: '',
        description: '',
        evidence: '',
        priority: 'medium',
        supportingEvidence: '',
        segments: [],
        expectedEvidence: '',
        howToTest: '',
        category: 'primary',
        researchQuestionId: '',
      });
      onUpdate();
    } catch (error) {
      console.error('Error saving hypothesis:', error);
      toast.error('Failed to save hypothesis');
    }
  };

  const handleDeleteHypothesis = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hypothesis?')) return;
    try {
      await api.deleteHypothesisFromProject(projectId, id);
      toast.success('Hypothesis deleted!');
      onUpdate();
    } catch (error) {
      console.error('Error deleting hypothesis:', error);
      toast.error('Failed to delete hypothesis');
    }
  };

  const handleEditHypothesis = (hypothesis: Hypothesis) => {
    setEditingHypothesis(hypothesis);
    setHypothesisFormData(hypothesis);
    setShowForm(true);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await api.updateResearchQuestionInProject(projectId, editingQuestion.id, { 
          ...editingQuestion, 
          question: questionFormData.question 
        });
        toast.success('Research question updated!');
      } else {
        const existingNumbers = researchQuestions
          .map(q => parseInt(q.id.replace(/\D/g, ''), 10))
          .filter(n => !isNaN(n));
        const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
        const newId = `RQ${maxNumber + 1}`;
        const maxOrder = researchQuestions.length > 0 ? Math.max(...researchQuestions.map(q => q.order)) : 0;
        
        await api.addResearchQuestionToProject(projectId, { 
          id: newId, 
          question: questionFormData.question,
          order: maxOrder + 1
        });
        toast.success('Research question added!');
      }
      setIsAddQuestionDialogOpen(false);
      setEditingQuestion(null);
      setQuestionFormData({ question: '' });
      onUpdate();
    } catch (error) {
      console.error('Error saving research question:', error);
      toast.error('Failed to save research question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    const hypothesesForQuestion = hypotheses.filter(h => h.researchQuestionId === id);
    if (hypothesesForQuestion.length > 0) {
      toast.error(`Cannot delete: ${hypothesesForQuestion.length} hypothesis(es) are assigned to this question`);
      return;
    }
    
    if (!confirm('Are you sure you want to delete this research question?')) return;
    try {
      await api.deleteResearchQuestionFromProject(projectId, id);
      toast.success('Research question deleted!');
      onUpdate();
    } catch (error) {
      console.error('Error deleting research question:', error);
      toast.error('Failed to delete research question');
    }
  };

  const handleEditQuestion = (question: ResearchQuestion) => {
    setEditingQuestion(question);
    setQuestionFormData({ question: question.question });
    setIsAddQuestionDialogOpen(true);
  };

  const parseEvidence = (evidence: string) => {
    if (!evidence) return [];
    return evidence
      .split(/\n|•/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const toggleSegment = (segment: string) => {
    const currentSegments = hypothesisFormData.segments || [];
    if (currentSegments.includes(segment)) {
      setHypothesisFormData({ 
        ...hypothesisFormData, 
        segments: currentSegments.filter(s => s !== segment) 
      });
    } else {
      setHypothesisFormData({ 
        ...hypothesisFormData, 
        segments: [...currentSegments, segment] 
      });
    }
  };

  const metrics = calculateMetrics();

  // Handle dropping a hypothesis onto a research question
  const handleDropHypothesis = async (hypothesisId: string, targetQuestionId: string | null) => {
    try {
      const hypothesis = hypotheses.find(h => h.id === hypothesisId);
      if (!hypothesis) return;

      await api.updateHypothesisInProject(projectId, hypothesisId, {
        ...hypothesis,
        researchQuestionId: targetQuestionId || undefined
      });
      
      toast.success('Hypothesis moved!');
      onUpdate();
    } catch (error) {
      console.error('Error moving hypothesis:', error);
      toast.error('Failed to move hypothesis');
    }
  };

  const DraggableHypothesis = ({ hypothesis }: { hypothesis: Hypothesis }) => {
    const [{ isDragging }, drag, dragPreview] = useDrag({
      type: 'hypothesis',
      item: { id: hypothesis.id, currentQuestionId: hypothesis.researchQuestionId },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const config = statusConfig[hypothesis.status];
    const priorityBadge = hypothesis.priority ? priorityConfig[hypothesis.priority] : null;
    const evidencePoints = parseEvidence(hypothesis.evidence);
    const expectedEvidencePoints = parseEvidence(hypothesis.expectedEvidence || '');
    const categoryConf = categoryConfig[hypothesis.category as keyof typeof categoryConfig] || categoryConfig.primary;
    
    // Check if there's any collapsible content
    const hasCollapsibleContent = expectedEvidencePoints.length > 0 || hypothesis.howToTest || evidencePoints.length > 0 || hypothesis.supportingEvidence;
    
    // Auto-open Research Details when showPredictions is enabled and there's content
    useEffect(() => {
      if (showPredictions && hasCollapsibleContent && !isDetailsOpen) {
        setIsDetailsOpen(true);
      }
    }, [showPredictions, hasCollapsibleContent, isDetailsOpen]);
    
    return (
      <div 
        ref={dragPreview} 
        style={{ opacity: isDragging ? 0.5 : 1 }}
        className="select-none"
      >
        <Card
          className={`${config.borderColor} ${config.bgColor} border-l-4 transition-all hover:shadow-lg hover:scale-[1.02] group`}
        >
          <div className="p-5">
            {/* Header with title, category, priority, and actions */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div 
                  ref={drag} 
                  className="cursor-grab active:cursor-grabbing pt-1 touch-none flex-shrink-0"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={categoryConf.badgeClass}>
                      {categoryConf.label}
                    </Badge>
                    <Badge className={`${config.badgeClass}`}>
                      {config.label}
                    </Badge>
                    {priorityBadge && (
                      <Badge className={`${priorityBadge.badgeClass} px-2 py-0.5`}>
                        {priorityBadge.label}
                      </Badge>
                    )}
                  </div>
                  <div className="text-slate-900 text-base">
                    <span className="font-semibold">{hypothesis.id}: </span>
                    {hypothesis.hypothesis}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    handleEditHypothesis(hypothesis);
                    setIsAddHypothesisDialogOpen(true);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600"
                  onClick={() => handleDeleteHypothesis(hypothesis.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Segment badges */}
            {hypothesis.segments && hypothesis.segments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {hypothesis.segments.map((segment) => (
                  <Badge
                    key={segment}
                    className={`px-2 py-1 border ${
                      segmentColors[segment as keyof typeof segmentColors] || 
                      'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {segment}
                  </Badge>
                ))}
              </div>
            )}

            {/* Hypothesis Statement */}
            {hypothesis.description && (
              <div className="mb-4">
                <div className="text-sm text-slate-900 mb-2 font-semibold">Hypothesis:</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {hypothesis.description}
                </p>
              </div>
            )}

            {/* Collapsible Research Details Section */}
            {hasCollapsibleContent && (
              <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors mb-2">
                  {isDetailsOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  )}
                  <span className="text-sm font-semibold text-slate-900">Research Details</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                  {/* Expected Evidence section */}
                  {expectedEvidencePoints.length > 0 && (
                    <div>
                      <div className="bg-white/80 border border-slate-200 rounded-lg p-4">
                        <div className="text-sm text-slate-900 mb-2 font-semibold">Expected Evidence:</div>
                        <ul className="space-y-2">
                          {expectedEvidencePoints.map((point, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex gap-2">
                              <span className="text-slate-400">•</span>
                              <span className="flex-1">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* How to Test section */}
                  {hypothesis.howToTest && (
                    <div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-slate-900 mb-2 font-semibold">How to Test:</div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {hypothesis.howToTest}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actual Evidence section */}
                  {evidencePoints.length > 0 && (
                    <div>
                      <div className="text-sm text-slate-900 mb-2 font-semibold">Actual Evidence:</div>
                      <ul className="space-y-2">
                        {evidencePoints.map((point, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex gap-2">
                            <span className="text-slate-400">•</span>
                            <span className="flex-1">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Supporting Evidence section */}
                  {hypothesis.supportingEvidence && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="text-sm text-slate-900 mb-2 font-semibold">Supporting Evidence:</div>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {hypothesis.supportingEvidence}
                      </p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Show expected outcomes if enabled */}
            {showPredictions && hypothesis.expectedOutcome && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-slate-900 mb-2 font-semibold">Predicted Outcome:</div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Expected Status: </span>
                    <Badge className={statusConfig[hypothesis.expectedOutcome as keyof typeof statusConfig]?.badgeClass}>
                      {statusConfig[hypothesis.expectedOutcome as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                  {hypothesis.roadmapImpact && (
                    <div>
                      <span className="font-medium">Roadmap Impact: </span>
                      <span className="text-slate-700">{hypothesis.roadmapImpact}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const DropZone = ({ questionId, children }: { questionId: string | null; children: React.ReactNode }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: 'hypothesis',
      drop: (item: { id: string; currentQuestionId?: string }) => {
        if (item.currentQuestionId !== questionId) {
          handleDropHypothesis(item.id, questionId);
        }
      },
      canDrop: (item: { id: string; currentQuestionId?: string }) => {
        return item.currentQuestionId !== questionId;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });

    return (
      <div
        ref={drop}
        className={`transition-all ${
          isOver && canDrop
            ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50'
            : canDrop
            ? 'ring-1 ring-blue-300 ring-offset-1'
            : ''
        }`}
      >
        {children}
      </div>
    );
  };

  const renderHypothesisCard = (hypothesis: Hypothesis) => {
    const config = statusConfig[hypothesis.status];
    const priorityBadge = hypothesis.priority ? priorityConfig[hypothesis.priority] : null;
    const evidencePoints = parseEvidence(hypothesis.evidence);
    const expectedEvidencePoints = parseEvidence(hypothesis.expectedEvidence || '');
    const categoryConf = categoryConfig[hypothesis.category as keyof typeof categoryConfig] || categoryConfig.primary;
    
    return (
      <Card
        key={hypothesis.id}
        className={`${config.borderColor} ${config.bgColor} border-l-4 transition-all hover:shadow-lg hover:scale-[1.02] group`}
      >
        <div className="p-5">
          {/* Header with title, category, priority, and actions */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={categoryConf.badgeClass}>
                  {categoryConf.label}
                </Badge>
                <Badge className={`${config.badgeClass}`}>
                  {config.label}
                </Badge>
              </div>
              <div className="text-slate-900 text-base">
                <span className="font-semibold">{hypothesis.id}: </span>
                {hypothesis.hypothesis}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {priorityBadge && (
                <Badge className={`${priorityBadge.badgeClass} px-2 py-0.5`}>
                  {priorityBadge.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Segment badges */}
          {hypothesis.segments && hypothesis.segments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {hypothesis.segments.map((segment) => (
                <Badge
                  key={segment}
                  className={`px-2 py-1 border ${
                    segmentColors[segment as keyof typeof segmentColors] || 
                    'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {segment}
                </Badge>
              ))}
            </div>
          )}

          {/* Hypothesis Statement */}
          {hypothesis.description && (
            <div className="mb-4">
              <div className="text-sm text-slate-900 mb-2 font-semibold">Hypothesis:</div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {hypothesis.description}
              </p>
            </div>
          )}

          {/* Expected Evidence section */}
          {expectedEvidencePoints.length > 0 && (
            <div className="mb-4">
              <div className="bg-white/80 border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-900 mb-2 font-semibold">Expected Evidence:</div>
                <ul className="space-y-2">
                  {expectedEvidencePoints.map((point, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-slate-400">•</span>
                      <span className="flex-1">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* How to Test section */}
          {hypothesis.howToTest && (
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-slate-900 mb-2 font-semibold">How to Test:</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {hypothesis.howToTest}
                </p>
              </div>
            </div>
          )}

          {/* Actual Evidence section */}
          {evidencePoints.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-slate-900 mb-2 font-semibold">Actual Evidence:</div>
              <ul className="space-y-2">
                {evidencePoints.map((point, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-slate-400">•</span>
                    <span className="flex-1">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Supporting Evidence section */}
          {hypothesis.supportingEvidence && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="text-sm text-slate-900 mb-2 font-semibold">Supporting Evidence:</div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {hypothesis.supportingEvidence}
              </p>
            </div>
          )}

          {/* Show expected outcomes if enabled */}
          {showPredictions && hypothesis.expectedOutcome && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-slate-900 mb-2 font-semibold">Predicted Outcome:</div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Expected Status: </span>
                  <Badge className={statusConfig[hypothesis.expectedOutcome as keyof typeof statusConfig]?.badgeClass}>
                    {statusConfig[hypothesis.expectedOutcome as keyof typeof statusConfig]?.label}
                  </Badge>
                </div>
                {hypothesis.roadmapImpact && (
                  <div>
                    <span className="font-medium">Roadmap Impact: </span>
                    <span className="text-slate-700">{hypothesis.roadmapImpact}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="p-6 bg-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h2 className="flex-shrink-0">Hypothesis Validation Tracker</h2>
        </div>
        
        {/* Enhanced Header */}
        <div className="mb-6">
          {/* Live Metrics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900">{metrics.totalHypotheses}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-800">{metrics.validated}</div>
              <div className="text-sm text-green-600">Validated</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-800">{metrics.disproven}</div>
              <div className="text-sm text-red-600">Disproven</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-800">{metrics.unclear}</div>
              <div className="text-sm text-yellow-600">Unclear</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-800">{metrics.testing}</div>
              <div className="text-sm text-blue-600">Testing</div>
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="flex flex-col gap-4">
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="primary">Primary Barriers</SelectItem>
                  <SelectItem value="workflow">Workflow Issues</SelectItem>
                  <SelectItem value="usability">Usability Issues</SelectItem>
                  <SelectItem value="organizational">Organizational Factors</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="disproven">Disproven</SelectItem>
                  <SelectItem value="unclear">Unclear</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Actions Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
              <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={showPredictions}
                  onChange={(e) => setShowPredictions(e.target.checked)}
                  className="rounded"
                />
                Show Expected Outcomes
              </label>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Dialog open={isAddQuestionDialogOpen} onOpenChange={setIsAddQuestionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => {
                      setEditingQuestion(null);
                      setQuestionFormData({ question: '' });
                    }}>
                      <Plus className="w-4 h-4" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion ? 'Edit Research Question' : 'Add Research Question'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingQuestion ? 'Edit the core research question.' : 'Enter a new core research question for your study.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitQuestion} className="space-y-4">
                    <div>
                      <Label htmlFor="question">Research Question</Label>
                      <Textarea
                        id="question"
                        value={questionFormData.question}
                        onChange={(e) => setQuestionFormData({ question: e.target.value })}
                        placeholder="e.g., Why aren't engineering teams adopting our platform?"
                        rows={3}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {editingQuestion ? 'Update Question' : 'Add Question'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

                <Dialog open={isAddHypothesisDialogOpen} onOpenChange={(open) => {
                  setIsAddHypothesisDialogOpen(open);
                  if (!open) {
                    // Reset creation state when dialog closes
                    setIsCreatingNewQuestion(false);
                    setNewQuestionText('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 w-full sm:w-auto" onClick={() => {
                      setEditingHypothesis(null);
                      setHypothesisFormData({
                        status: 'testing',
                        hypothesis: '',
                        description: '',
                        evidence: '',
                        priority: 'medium',
                        supportingEvidence: '',
                        segments: [],
                        expectedEvidence: '',
                        howToTest: '',
                        category: 'primary',
                        researchQuestionId: researchQuestions.length > 0 ? researchQuestions[0].id : '',
                      });
                    }}>
                      <Plus className="w-4 h-4" />
                      Add Hypothesis
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingHypothesis ? 'Edit Hypothesis' : 'Add New Hypothesis'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingHypothesis ? 'Edit the details of the hypothesis.' : 'Enter the details of the new hypothesis.'}
                      </DialogDescription>
                    </DialogHeader>
                  <form onSubmit={handleSubmitHypothesis} className="space-y-4">
                    <div>
                      <Label htmlFor="researchQuestionId">Research Question</Label>
                      {isCreatingNewQuestion ? (
                        <div className="space-y-2">
                          <Textarea
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                            placeholder="Enter your new research question..."
                            rows={2}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={async () => {
                                if (newQuestionText.trim()) {
                                  try {
                                    const existingNumbers = researchQuestions
                                      .map(q => parseInt(q.id.replace(/\D/g, ''), 10))
                                      .filter(n => !isNaN(n));
                                    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
                                    const newId = `RQ${maxNumber + 1}`;
                                    const maxOrder = researchQuestions.length > 0 ? Math.max(...researchQuestions.map(q => q.order)) : 0;
                                    
                                    const newQuestion = {
                                      id: newId,
                                      question: newQuestionText,
                                      order: maxOrder + 1
                                    };
                                    
                                    await api.addResearchQuestionToProject(projectId, newQuestion);
                                    toast.success('Research question added!');
                                    
                                    // Update form to use the new question
                                    setHypothesisFormData({ ...hypothesisFormData, researchQuestionId: newId });
                                    setIsCreatingNewQuestion(false);
                                    setNewQuestionText('');
                                    onUpdate();
                                  } catch (error) {
                                    console.error('Error creating research question:', error);
                                    toast.error('Failed to create research question');
                                  }
                                }
                              }}
                            >
                              Save Question
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsCreatingNewQuestion(false);
                                setNewQuestionText('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Select
                            value={hypothesisFormData.researchQuestionId || ''}
                            onValueChange={(value) => {
                              if (value === '__create_new__') {
                                setIsCreatingNewQuestion(true);
                              } else {
                                setHypothesisFormData({ ...hypothesisFormData, researchQuestionId: value });
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a research question" />
                            </SelectTrigger>
                            <SelectContent>
                              {researchQuestions.map((q) => (
                                <SelectItem key={q.id} value={q.id}>
                                  {q.question}
                                </SelectItem>
                              ))}
                              <SelectItem value="__create_new__" className="text-blue-600 font-medium">
                                <div className="flex items-center gap-2">
                                  <Plus className="w-4 h-4" />
                                  Create new research question...
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="hypothesis">Hypothesis Title</Label>
                      <Input
                        id="hypothesis"
                        value={hypothesisFormData.hypothesis}
                        onChange={(e) => setHypothesisFormData({ ...hypothesisFormData, hypothesis: e.target.value })}
                        placeholder="e.g., Onboarding is the #1 universal barrier across all segments"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Hypothesis Statement</Label>
                      <Textarea
                        id="description"
                        value={hypothesisFormData.description}
                        onChange={(e) => setHypothesisFormData({ ...hypothesisFormData, description: e.target.value })}
                        placeholder="Developers abandon or avoid Alchemy because there's no clear starting point, guided flow, or 'success in first 5 minutes' experience."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Category</Label>
                      <Select
                        value={hypothesisFormData.category || 'primary'}
                        onValueChange={(value) => setHypothesisFormData({ ...hypothesisFormData, category: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary Barriers</SelectItem>
                          <SelectItem value="workflow">Workflow Issues</SelectItem>
                          <SelectItem value="usability">Usability Issues</SelectItem>
                          <SelectItem value="organizational">Organizational Factors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Relevant Segments</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.keys(segmentColors).map((segment) => {
                          const isSelected = (hypothesisFormData.segments || []).includes(segment);
                          return (
                            <Badge
                              key={segment}
                              className={`cursor-pointer border ${
                                isSelected 
                                  ? segmentColors[segment as keyof typeof segmentColors]
                                  : 'bg-slate-100 text-slate-600 border-slate-300'
                              }`}
                              onClick={() => toggleSegment(segment)}
                            >
                              {segment}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={hypothesisFormData.status}
                          onValueChange={(value) => setHypothesisFormData({ ...hypothesisFormData, status: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="testing">Testing</SelectItem>
                            <SelectItem value="validated">Validated</SelectItem>
                            <SelectItem value="disproven">Disproven</SelectItem>
                            <SelectItem value="unclear">Unclear</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={hypothesisFormData.priority || 'medium'}
                          onValueChange={(value) => setHypothesisFormData({ ...hypothesisFormData, priority: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="expectedEvidence">Expected Evidence (one per line)</Label>
                      <Textarea
                        id="expectedEvidence"
                        value={hypothesisFormData.expectedEvidence}
                        onChange={(e) => setHypothesisFormData({ ...hypothesisFormData, expectedEvidence: e.target.value })}
                        placeholder="80%+ participants mention 'unclear how to start' or 'overwhelming'&#10;Task failure on 'create your first component' usability test&#10;SUS scores <50 correlated with onboarding confusion"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="howToTest">How to Test</Label>
                      <Input
                        id="howToTest"
                        value={hypothesisFormData.howToTest}
                        onChange={(e) => setHypothesisFormData({ ...hypothesisFormData, howToTest: e.target.value })}
                        placeholder="Usability test 'first-time user creates React component' + interview questions about initial experience"
                      />
                    </div>

                    <div>
                      <Label htmlFor="evidence">Actual Evidence (one per line)</Label>
                      <Textarea
                        id="evidence"
                        value={hypothesisFormData.evidence}
                        onChange={(e) => setHypothesisFormData({ ...hypothesisFormData, evidence: e.target.value })}
                        placeholder="• First evidence point&#10;• Second evidence point&#10;• Third evidence point"
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="supportingEvidence">Supporting Evidence (optional)</Label>
                      <Textarea
                        id="supportingEvidence"
                        value={hypothesisFormData.supportingEvidence}
                        onChange={(e) => setHypothesisFormData({ ...hypothesisFormData, supportingEvidence: e.target.value })}
                        placeholder="Additional context, quotes, or detailed findings..."
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      {editingHypothesis ? 'Update Hypothesis' : 'Add Hypothesis'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Research Questions with Grouped Hypotheses */}
      <div className="space-y-6">
        {groupedHypotheses.map(({ question, hypotheses: questionHypotheses }) => (
          <Card key={question.id} className="shadow-lg border-l-4 border-l-orange-500">
            <div className="p-4 bg-orange-50">
              <div className="flex items-start justify-between gap-4 group">
                <button
                  onClick={() => toggleQuestion(question.id)}
                  className="flex-1 flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
                >
                  {expandedQuestions.has(question.id) ? (
                    <ChevronDown className="w-5 h-5 flex-shrink-0 mt-1 text-orange-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1 text-orange-600" />
                  )}
                  <div className="flex-1">
                    <div className="text-xs text-slate-600 mb-1">Core Research Question {question.order}:</div>
                    <div className="text-slate-900 text-lg font-medium">{question.question}</div>
                    <div className="text-sm text-slate-600 mt-2">
                      {questionHypotheses.length} {questionHypotheses.length === 1 ? 'hypothesis' : 'hypotheses'}
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-red-600"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            
            {expandedQuestions.has(question.id) && (
              <DropZone questionId={question.id}>
                <div className="p-6">
                  {questionHypotheses.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {questionHypotheses.map(h => <DraggableHypothesis key={h.id} hypothesis={h} />)}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      Drag hypotheses here or click "Add Hypothesis" to create one.
                    </div>
                  )}
                </div>
              </DropZone>
            )}
          </Card>
        ))}

        {/* Unassigned Hypotheses Section */}
        {unassignedHypotheses.length > 0 && (
          <Card className="shadow-lg border-l-4 border-l-slate-400">
            <div className="p-4 bg-slate-50">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="text-xs text-slate-600 mb-1">Unassigned Hypotheses:</div>
                  <div className="text-slate-900 text-lg font-medium">Not linked to a research question</div>
                  <div className="text-sm text-slate-600 mt-2">
                    {unassignedHypotheses.length} {unassignedHypotheses.length === 1 ? 'hypothesis' : 'hypotheses'}
                  </div>
                </div>
              </div>
            </div>
            <DropZone questionId={null}>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {unassignedHypotheses.map(h => <DraggableHypothesis key={h.id} hypothesis={h} />)}
                </div>
              </div>
            </DropZone>
          </Card>
        )}
      </div>

      {/* Success Criteria & Guidelines */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Success Criteria - Takes up 2 columns on large screens */}
        <Card className="lg:col-span-2 p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Success Criteria for Hypothesis Validation</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-2">Quantitative Thresholds:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• If &gt;70% mention issue = <strong>VALIDATED</strong></li>
                <li>• If &lt;30% mention issue = <strong>DISPROVEN</strong></li>
                <li>• If 30-70% mention = <strong>UNCLEAR/NUANCED</strong></li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2">Usability Benchmarks:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Task success &lt;50% = Major usability issue</li>
                <li>• Time &gt;5 min for basic tasks = Efficiency problem</li>
                <li>• SEQ scores &lt;4 = Poor task experience</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Research Notes - Takes up 1 column on large screens */}
        <Card className="lg:col-span-1 p-6 shadow-lg bg-yellow-50 border border-yellow-200">
          <h3 className="font-bold text-yellow-800 mb-2">🔄 Hypothesis Refinement During Research</h3>
          <p className="text-yellow-700 mb-2">These hypotheses will evolve as data emerges. Be prepared to:</p>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Add new hypotheses</strong> based on unexpected insights</li>
            <li>• <strong>Modify existing ones</strong> as evidence suggests nuances</li>
            <li>• <strong>Pursue surprising findings</strong> even if not in original framework</li>
            <li>• <strong>Validate with broader team</strong> through mini-synthesis sessions</li>
          </ul>
        </Card>
      </div>
      </Card>
    </DndProvider>
  );
}