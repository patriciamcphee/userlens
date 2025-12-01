import { useState, useEffect } from "react";
import { AlchemyResearchHypotheses } from "./HypothesisTracker";
import { Hypothesis, ResearchQuestion } from "../types";
import { api } from "../utils/api";

interface HypothesesTabProps {
  projectId: string;
}

export function HypothesesTab({ projectId }: HypothesesTabProps) {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [researchQuestions, setResearchQuestions] = useState<ResearchQuestion[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading hypotheses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AlchemyResearchHypotheses 
        hypotheses={hypotheses} 
        researchQuestions={researchQuestions}
        onUpdate={loadData}
        projectId={projectId}
      />
    </div>
  );
}