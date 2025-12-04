import { useState, useEffect } from "react";
import { Task, TaskStep, TaskQuestion, Hypothesis } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Plus, Trash2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { QuestionBankDialog } from "./QuestionBankDialog";
import { TaskHypothesisSelector } from "./TaskHypothesisSelector";
import { api } from "../utils/api";

interface TaskEditorProps {
  task?: Task;
  onSave: (task: Omit<Task, 'id' | 'order'>) => void;
  onCancel: () => void;
  existingTaskCount: number;
  projectId: string;
}

const TIME_OPTIONS = [
  "1-2 minutes",
  "3-5 minutes",
  "5-10 minutes",
  "10-15 minutes",
  "15-20 minutes",
  "20+ minutes",
];

const STEPS = [
  { id: 1, name: "Basic Info", description: "Title, time, and difficulty" },
  { id: 2, name: "Task Content", description: "Objective, scenario, and steps" },
  { id: 3, name: "Criteria", description: "Success criteria and options" },
  { id: 4, name: "Questions", description: "Custom follow-up questions" },
];

export function TaskEditor({ task, onSave, onCancel, existingTaskCount, projectId }: TaskEditorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Task>>({
    title: task?.title || "",
    estimatedTime: task?.estimatedTime || TIME_OPTIONS[0],
    customTime: task?.customTime || "",
    objective: task?.objective || "",
    scenario: task?.scenario || "",
    successCriteria: task?.successCriteria || "",
    difficulty: task?.difficulty || "medium",
    enableRatingScale: task?.enableRatingScale || false,
    steps: task?.steps || [
      { id: `step-${Date.now()}-1`, description: "", order: 1 },
      { id: `step-${Date.now()}-2`, description: "", order: 2 },
      { id: `step-${Date.now()}-3`, description: "", order: 3 },
    ],
    questions: task?.questions || [],
    hypothesisIds: task?.hypothesisIds || [],
  });

  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [useCustomTime, setUseCustomTime] = useState(!!task?.customTime);
  
  // Hypothesis loading state
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loadingHypotheses, setLoadingHypotheses] = useState(true);

  // Load hypotheses for the project
  useEffect(() => {
    const loadHypotheses = async () => {
      try {
        setLoadingHypotheses(true);
        const synthesisData = await api.getSynthesisData(projectId);
        setHypotheses(synthesisData.hypotheses || []);
      } catch (error) {
        console.error('Error loading hypotheses:', error);
        setHypotheses([]);
      } finally {
        setLoadingHypotheses(false);
      }
    };
    
    if (projectId) {
      loadHypotheses();
    }
  }, [projectId]);

  // Step validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.title?.trim();
      case 2:
        return true; // Optional fields
      case 3:
        return true; // Optional fields
      case 4:
        return true; // Optional fields
      default:
        return true;
    }
  };

  const canProceed = isStepValid(currentStep);

  const handleNext = () => {
    if (currentStep < 4 && canProceed) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddStep = () => {
    const newStep: TaskStep = {
      id: `step-${Date.now()}`,
      description: "",
      order: (formData.steps?.length || 0) + 1,
    };
    setFormData({
      ...formData,
      steps: [...(formData.steps || []), newStep],
    });
  };

  const handleUpdateStep = (stepId: string, description: string) => {
    setFormData({
      ...formData,
      steps: formData.steps?.map((step) =>
        step.id === stepId ? { ...step, description } : step
      ),
    });
  };

  const handleRemoveStep = (stepId: string) => {
    setFormData({
      ...formData,
      steps: formData.steps?.filter((step) => step.id !== stepId),
    });
  };

  const handleAddCustomQuestion = () => {
    const newQuestion: TaskQuestion = {
      id: Date.now(),
      question: "",
      type: "multiple-choice",
      options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      required: false,
    };
    setFormData({
      ...formData,
      questions: [...(formData.questions || []), newQuestion],
    });
  };

  const handleUpdateQuestion = (questionId: number, updates: Partial<TaskQuestion>) => {
    setFormData({
      ...formData,
      questions: formData.questions?.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const handleRemoveQuestion = (questionId: number) => {
    setFormData({
      ...formData,
      questions: formData.questions?.filter((q) => q.id !== questionId),
    });
  };

  const handleAddOption = (questionId: number) => {
    setFormData({
      ...formData,
      questions: formData.questions?.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...(q.options || []), ""];
          return { ...q, options: newOptions };
        }
        return q;
      }),
    });
  };

  const handleUpdateOption = (questionId: number, optionIndex: number, value: string) => {
    setFormData({
      ...formData,
      questions: formData.questions?.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      }),
    });
  };

  const handleRemoveOption = (questionId: number, optionIndex: number) => {
    setFormData({
      ...formData,
      questions: formData.questions?.map((q) => {
        if (q.id === questionId && q.options) {
          return { ...q, options: q.options.filter((_, i) => i !== optionIndex) };
        }
        return q;
      }),
    });
  };

  const handleAddFromBank = (questions: TaskQuestion[]) => {
    setFormData({
      ...formData,
      questions: [...(formData.questions || []), ...questions],
    });
    setIsQuestionBankOpen(false);
  };

  const handleSave = () => {
    if (!formData.title?.trim()) {
      setCurrentStep(1);
      return;
    }

    onSave({
      title: formData.title,
      estimatedTime: useCustomTime ? formData.customTime : formData.estimatedTime,
      objective: formData.objective,
      scenario: formData.scenario,
      successCriteria: formData.successCriteria,
      difficulty: formData.difficulty,
      enableRatingScale: formData.enableRatingScale,
      steps: formData.steps,
      questions: formData.questions,
      hypothesisIds: formData.hypothesisIds,
    } as Omit<Task, 'id' | 'order'>);
  };

  const scenarioLength = formData.scenario?.length || 0;
  const questionCount = formData.questions?.length || 0;

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  // Allow going back to any previous step, or forward only if current is valid
                  if (step.id < currentStep || (step.id === currentStep + 1 && canProceed)) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step.id < currentStep
                    ? "bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700"
                    : step.id === currentStep
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step.id < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </button>
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${
                  step.id === currentStep ? "text-indigo-600" : "text-slate-600"
                }`}>
                  {step.name}
                </p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                step.id < currentStep ? "bg-indigo-600" : "bg-slate-200"
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render Step 1: Basic Info
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="task-title">Task Title <span className="text-red-500">*</span></Label>
        <Input
          id="task-title"
          placeholder="e.g., Complete user onboarding"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          autoFocus
        />
        {!formData.title?.trim() && (
          <p className="text-xs text-red-500">Title is required</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-time">Estimated Time</Label>
        <div className="flex gap-2">
          <Select
            value={useCustomTime ? "custom" : formData.estimatedTime}
            onValueChange={(value) => {
              if (value === "custom") {
                setUseCustomTime(true);
              } else {
                setUseCustomTime(false);
                setFormData({ ...formData, estimatedTime: value });
              }
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom time...</SelectItem>
            </SelectContent>
          </Select>
          {useCustomTime && (
            <Input
              placeholder="Or enter custom time"
              value={formData.customTime}
              onChange={(e) => setFormData({ ...formData, customTime: e.target.value })}
              className="flex-1"
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Task Difficulty Level</Label>
        <p className="text-xs text-slate-600">
          Determines which participants see this task based on their usage level
        </p>
        <RadioGroup
          value={formData.difficulty}
          onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
          className="grid grid-cols-2 gap-2 pt-1"
        >
          {[
            { value: "easy", label: "Easy", segment: "Non-Users" },
            { value: "medium", label: "Medium", segment: "Occasional" },
            { value: "hard", label: "Hard", segment: "Active" },
            { value: "all", label: "All Users", segment: "Everyone" },
          ].map((option) => (
            <label
              key={option.value}
              htmlFor={`difficulty-${option.value}`}
              className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-all text-sm ${
                formData.difficulty === option.value
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <RadioGroupItem value={option.value} id={`difficulty-${option.value}`} className="sr-only" />
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-slate-500">({option.segment})</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Hypothesis Selection */}
      <div className="pt-2 border-t">
        <TaskHypothesisSelector
          selectedHypothesisIds={formData.hypothesisIds || []}
          onChange={(ids) => setFormData({ ...formData, hypothesisIds: ids })}
          hypotheses={hypotheses}
          taskDifficulty={(formData.difficulty as 'easy' | 'medium' | 'hard' | 'all') || 'medium'}
          loading={loadingHypotheses}
        />
      </div>
    </div>
  );

  // Render Step 2: Task Content
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="task-objective">Objective (one sentence)</Label>
        <Input
          id="task-objective"
          placeholder="What should participants achieve?"
          value={formData.objective}
          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-scenario">Scenario (paragraph)</Label>
        <Textarea
          id="task-scenario"
          placeholder="Describe the context and situation..."
          value={formData.scenario}
          onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
          rows={4}
        />
        <p className="text-xs text-slate-500">{scenarioLength}/600 characters</p>
      </div>

      <div className="space-y-2">
        <Label>Your Task (numbered steps)</Label>
        <div className="space-y-2">
          {formData.steps?.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <span className="text-sm text-slate-600 w-6">{index + 1}.</span>
              <Input
                placeholder="Describe this step..."
                value={step.description}
                onChange={(e) => handleUpdateStep(step.id, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveStep(step.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddStep}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>
      </div>
    </div>
  );

  // Render Step 3: Criteria & Settings
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="task-success">Success Criteria</Label>
        <p className="text-xs text-slate-600">Define how you'll measure if the participant completed this task successfully</p>
        <Textarea
          id="task-success"
          placeholder="e.g., User successfully navigates to the settings page and updates their profile picture"
          value={formData.successCriteria}
          onChange={(e) => setFormData({ ...formData, successCriteria: e.target.value })}
          rows={3}
          autoFocus
        />
      </div>

      <div className="border rounded-lg p-4 bg-slate-50">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="rating-scale"
            checked={formData.enableRatingScale}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, enableRatingScale: checked as boolean })
            }
            className="mt-0.5"
          />
          <div>
            <Label htmlFor="rating-scale" className="cursor-pointer font-medium">
              Enable Task Rating Scale
            </Label>
            <p className="text-xs text-slate-600 mt-1">
              Participants will rate the task difficulty on a 1-5 scale after completion
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Success Criteria</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Be specific about what "success" looks like</li>
          <li>• Include measurable outcomes when possible</li>
          <li>• Consider partial completion scenarios</li>
          <li>• Note any time limits if applicable</li>
        </ul>
      </div>
    </div>
  );

  // Render Step 4: Questions
  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Custom Follow-up Questions</Label>
          <p className="text-xs text-slate-600 mt-1">
            Add questions to gather specific feedback after this task
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsQuestionBankOpen(true)}
          >
            Browse Bank
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCustomQuestion}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Custom
          </Button>
        </div>
      </div>

      {questionCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {questionCount} question(s) added
        </Badge>
      )}

      {formData.questions && formData.questions.length > 0 ? (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
          {formData.questions.map((question, qIndex) => (
            <Card key={question.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm text-slate-600 mt-2">Q{qIndex + 1}</span>
                  <Input
                    placeholder="Enter your question..."
                    value={question.question}
                    onChange={(e) =>
                      handleUpdateQuestion(question.id, { question: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuestion(question.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 ml-8">
                  <Select
                    value={question.type}
                    onValueChange={(value) =>
                      handleUpdateQuestion(question.id, {
                        type: value as TaskQuestion["type"],
                      })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice (single)</SelectItem>
                      <SelectItem value="checkbox">Multiple Choice (multiple)</SelectItem>
                      <SelectItem value="text">Text Response</SelectItem>
                      <SelectItem value="yes-no">Yes/No</SelectItem>
                      <SelectItem value="rating">Rating Scale</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${question.id}`}
                      checked={question.required}
                      onCheckedChange={(checked) =>
                        handleUpdateQuestion(question.id, { required: checked as boolean })
                      }
                    />
                    <Label htmlFor={`required-${question.id}`} className="text-xs cursor-pointer">
                      Required
                    </Label>
                  </div>
                </div>

                {(question.type === "multiple-choice" || question.type === "checkbox") && (
                  <div className="ml-8 space-y-2">
                    <Label className="text-xs">Options:</Label>
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 w-6">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        <Input
                          placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          value={option}
                          onChange={(e) =>
                            handleUpdateOption(question.id, optIndex, e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(question.id, optIndex)}
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddOption(question.id)}
                      className="text-xs"
                    >
                      + Add Option
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-500 text-sm mb-3">No questions added yet</p>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsQuestionBankOpen(true)}
            >
              Browse Question Bank
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCustomQuestion}
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Custom
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-1 min-h-[300px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t mt-4">
        <div>
          {currentStep > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          ) : (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.title?.trim()}>
                {task ? "Update Task" : "Create Task"}
              </Button>
            </>
          )}
        </div>
      </div>

      <QuestionBankDialog
        open={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        onAdd={handleAddFromBank}
      />
    </div>
  );
}