import { useState } from "react";
import { TaskQuestion } from "../types";
import { QUESTION_BANK, QuestionBankItem, getCategories } from "../constants/questionBank";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Search, Plus } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface QuestionBankDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (questions: TaskQuestion[]) => void;
}

export function QuestionBankDialog({ open, onClose, onAdd }: QuestionBankDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState<QuestionBankItem['category'] | 'all'>('all');

  const categories = getCategories();

  const filteredQuestions = QUESTION_BANK.filter((q) => {
    const matchesSearch = 
      searchQuery === "" ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || q.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleToggleQuestion = (questionIndex: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionIndex)) {
      newSelected.delete(questionIndex);
    } else {
      newSelected.add(questionIndex);
    }
    setSelectedQuestions(newSelected);
  };

  const handleAddSelected = () => {
    const questionsToAdd = Array.from(selectedQuestions).map((index) => {
      const bankQuestion = QUESTION_BANK[index];
      return {
        id: `q-${Date.now()}-${index}`,
        question: bankQuestion.question,
        type: bankQuestion.type,
        options: bankQuestion.options,
        required: bankQuestion.required,
      } as TaskQuestion;
    });
    onAdd(questionsToAdd);
    setSelectedQuestions(new Set());
    setSearchQuery("");
    setActiveCategory('all');
  };

  const handleAddAllSUS = () => {
    const susQuestions = QUESTION_BANK
      .map((q, index) => ({ q, index }))
      .filter(({ q }) => q.category === 'SUS')
      .map(({ q, index }) => ({
        id: `q-${Date.now()}-${index}`,
        question: q.question,
        type: q.type,
        options: q.options,
        required: q.required,
      } as TaskQuestion));
    
    onAdd(susQuestions);
    setSelectedQuestions(new Set());
    setSearchQuery("");
  };

  const getQuestionTypeLabel = (type: TaskQuestion["type"]) => {
    switch (type) {
      case "multiple-choice":
        return "Multiple Choice";
      case "checkbox":
        return "Checkboxes";
      case "text":
        return "Text";
      case "yes-no":
        return "Yes/No";
      case "rating":
        return "Rating";
      default:
        return type;
    }
  };

  const getCategoryColor = (category: QuestionBankItem['category']) => {
    switch (category) {
      case 'SUS': return 'bg-blue-100 text-blue-700';
      case 'Post-Task': return 'bg-green-100 text-green-700';
      case 'Pre-Test': return 'bg-purple-100 text-purple-700';
      case 'Feature-Specific': return 'bg-orange-100 text-orange-700';
      case 'Follow-Up': return 'bg-pink-100 text-pink-700';
      case 'Demographics': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Question Bank</DialogTitle>
          <DialogDescription>
            {QUESTION_BANK.length} pre-written research questions organized by category
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search questions, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {activeCategory === 'SUS' && (
            <Button size="sm" variant="outline" onClick={handleAddAllSUS}>
              Add All 10 SUS
            </Button>
          )}
        </div>

        <Tabs value={activeCategory} onValueChange={(val) => setActiveCategory(val as any)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {cat === 'SUS' ? 'SUS' : cat.split('-')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-2">
            {filteredQuestions.map((question, displayIndex) => {
              const originalIndex = QUESTION_BANK.indexOf(question);
              return (
                <Card
                  key={originalIndex}
                  className={`cursor-pointer transition-all ${
                    selectedQuestions.has(originalIndex)
                      ? "border-indigo-600 bg-indigo-50"
                      : "hover:border-slate-300"
                  }`}
                  onClick={() => handleToggleQuestion(originalIndex)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedQuestions.has(originalIndex)}
                        onCheckedChange={() => handleToggleQuestion(originalIndex)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 mb-2">{question.question}</p>
                        {question.description && (
                          <p className="text-xs text-slate-600 mb-2 italic">{question.description}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${getCategoryColor(question.category)}`}>
                            {question.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getQuestionTypeLabel(question.type)}
                          </Badge>
                          {question.options && question.options.length > 0 && (
                            <span className="text-xs text-slate-600">
                              {question.options.length} options
                            </span>
                          )}
                          {question.required && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                          {question.tags && question.tags.length > 0 && (
                            <span className="text-xs text-slate-500">
                              {question.tags.slice(0, 3).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredQuestions.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>No questions found matching your criteria</p>
              </div>
            )}
          </div>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-slate-600">
            {selectedQuestions.size} question(s) selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedQuestions.size === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Selected ({selectedQuestions.size})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
