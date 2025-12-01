import { useState, useEffect } from "react";
import { AlchemyResearchHypotheses } from "./HypothesisTracker";
import { Hypothesis, ResearchQuestion } from "../types";
import { api } from "../utils/api";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Download, Check } from "lucide-react";
import { toast } from "sonner";

interface HypothesesTabProps {
  projectId: string;
}

interface GlobalData {
  hypotheses: Hypothesis[];
  questions: ResearchQuestion[];
}

export function HypothesesTab({ projectId }: HypothesesTabProps) {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [researchQuestions, setResearchQuestions] = useState<ResearchQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Import dialog state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [selectedHypotheses, setSelectedHypotheses] = useState<Set<string>>(new Set());
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load synthesis data (hypotheses and research questions)
      const synthesisResponse = await api.getSynthesisData(projectId);
      
      setHypotheses(synthesisResponse.hypotheses || []);
      setResearchQuestions(synthesisResponse.questions || []);
      
    } catch (error) {
      console.error('Error loading hypotheses data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  // Load global research data when import dialog opens
  const handleOpenImportDialog = async () => {
    setIsImportDialogOpen(true);
    setLoadingGlobal(true);
    
    try {
      const [hypothesesRes, questionsRes] = await Promise.all([
        fetch('/api/research/hypotheses').then(r => r.json()),
        fetch('/api/research/questions').then(r => r.json())
      ]);
      
      setGlobalData({
        hypotheses: hypothesesRes.hypotheses || [],
        questions: questionsRes.questions || []
      });
      
      // Pre-select all by default
      setSelectedHypotheses(new Set((hypothesesRes.hypotheses || []).map((h: Hypothesis) => h.id)));
      setSelectedQuestions(new Set((questionsRes.questions || []).map((q: ResearchQuestion) => q.id)));
      
    } catch (error) {
      console.error('Error loading global data:', error);
      toast.error('Failed to load global research data');
    } finally {
      setLoadingGlobal(false);
    }
  };

  const toggleHypothesis = (id: string) => {
    const newSelected = new Set(selectedHypotheses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedHypotheses(newSelected);
  };

  const toggleQuestion = (id: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuestions(newSelected);
  };

  const selectAllHypotheses = () => {
    if (globalData) {
      setSelectedHypotheses(new Set(globalData.hypotheses.map(h => h.id)));
    }
  };

  const selectNoneHypotheses = () => {
    setSelectedHypotheses(new Set());
  };

  const selectAllQuestions = () => {
    if (globalData) {
      setSelectedQuestions(new Set(globalData.questions.map(q => q.id)));
    }
  };

  const selectNoneQuestions = () => {
    setSelectedQuestions(new Set());
  };

  const handleImport = async () => {
    if (!globalData) return;
    
    setImporting(true);
    
    try {
      let importedCount = 0;
      
      // Import selected questions first (hypotheses may reference them)
      for (const question of globalData.questions) {
        if (selectedQuestions.has(question.id)) {
          // Check if question already exists in project
          const exists = researchQuestions.some(q => q.id === question.id);
          if (!exists) {
            await api.addResearchQuestion(projectId, {
              ...question,
              _importedFrom: 'global',
              _importedAt: new Date().toISOString()
            });
            importedCount++;
          }
        }
      }
      
      // Import selected hypotheses
      for (const hypothesis of globalData.hypotheses) {
        if (selectedHypotheses.has(hypothesis.id)) {
          // Check if hypothesis already exists in project
          const exists = hypotheses.some(h => h.id === hypothesis.id);
          if (!exists) {
            await api.addHypothesisToProject(projectId, {
              ...hypothesis,
              _importedFrom: 'global',
              _importedAt: new Date().toISOString()
            });
            importedCount++;
          }
        }
      }
      
      toast.success(`Imported ${importedCount} items successfully!`);
      setIsImportDialogOpen(false);
      loadData(); // Refresh the data
      
    } catch (error) {
      console.error('Error importing:', error);
      toast.error('Failed to import some items');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading hypotheses...</div>
      </div>
    );
  }

  const hasGlobalData = globalData && (globalData.hypotheses.length > 0 || globalData.questions.length > 0);

  return (
    <div className="space-y-6">
      <AlchemyResearchHypotheses 
        hypotheses={hypotheses} 
        researchQuestions={researchQuestions}
        onUpdate={loadData}
        projectId={projectId}
        renderImportButton={() => (
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={handleOpenImportDialog} className="gap-2">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Import from Library</span>
                      <span className="sm:hidden">Import</span>
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import from the global research library to get started quickly.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Import from Global Research Library</DialogTitle>
                    <DialogDescription>
                      Select hypotheses and research questions to import into this project.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {loadingGlobal ? (
                    <div className="py-8 text-center text-slate-600">Loading global research data...</div>
                  ) : !hasGlobalData ? (
                    <div className="py-8 text-center text-slate-600">No global research data found to import.</div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-6 py-4">
                      {/* Research Questions */}
                      {globalData && globalData.questions.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-slate-900">Research Questions ({globalData.questions.length})</h3>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={selectAllQuestions}>Select All</Button>
                              <Button variant="ghost" size="sm" onClick={selectNoneQuestions}>Select None</Button>
                            </div>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                            {globalData.questions.map(question => (
                              <label 
                                key={question.id} 
                                className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedQuestions.has(question.id)}
                                  onChange={() => toggleQuestion(question.id)}
                                  className="mt-1"
                                />
                                <div>
                                  <span className="text-xs text-slate-500">{question.id}</span>
                                  <p className="text-sm text-slate-900">{question.question}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Hypotheses */}
                      {globalData && globalData.hypotheses.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-slate-900">Hypotheses ({globalData.hypotheses.length})</h3>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={selectAllHypotheses}>Select All</Button>
                              <Button variant="ghost" size="sm" onClick={selectNoneHypotheses}>Select None</Button>
                            </div>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                            {globalData.hypotheses.map(hypothesis => (
                              <label 
                                key={hypothesis.id} 
                                className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedHypotheses.has(hypothesis.id)}
                                  onChange={() => toggleHypothesis(hypothesis.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">{hypothesis.id}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                      hypothesis.status === 'validated' ? 'bg-green-100 text-green-800' :
                                      hypothesis.status === 'disproven' ? 'bg-red-100 text-red-800' :
                                      hypothesis.status === 'testing' ? 'bg-blue-100 text-blue-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {hypothesis.status}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-slate-900">{hypothesis.hypothesis}</p>
                                  {hypothesis.description && (
                                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{hypothesis.description}</p>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {hasGlobalData && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-slate-600">
                        {selectedQuestions.size} questions, {selectedHypotheses.size} hypotheses selected
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleImport} 
                          disabled={importing || (selectedHypotheses.size === 0 && selectedQuestions.size === 0)}
                          className="gap-2"
                        >
                          {importing ? (
                            <>Importing...</>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Import Selected
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
          </Dialog>
        )}
      />
    </div>
  );
}