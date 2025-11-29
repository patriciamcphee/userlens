import { useState } from "react";
import { Task, TaskStep, TaskQuestion } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { QuestionBankDialog } from "./QuestionBankDialog";

interface TaskEditorProps {
  task?: Task;
  onSave: (task: Omit<Task, 'id' | 'order'>) => void;
  onCancel: () => void;
  existingTaskCount: number;
}

const TIME_OPTIONS = [
  "1-2 minutes",
  "3-5 minutes",
  "5-10 minutes",
  "10-15 minutes",
  "15-20 minutes",
  "20+ minutes",
];

export function TaskEditor({ task, onSave, onCancel, existingTaskCount }: TaskEditorProps) {
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
  });

  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [useCustomTime, setUseCustomTime] = useState(!!task?.customTime);

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
    } as Omit<Task, 'id' | 'order'>);
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Easy - Non-Users";
      case "medium": return "Medium - Occasional";
      case "hard": return "Hard - Active";
      case "all": return "All Users - Everyone";
      default: return difficulty;
    }
  };

  const scenarioLength = formData.scenario?.length || 0;
  const questionCount = formData.questions?.length || 0;

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
      {/* Task Title */}
      <div className="space-y-2">
        <Label htmlFor="task-title">Task Title</Label>
        <Input
          id="task-title"
          placeholder="e.g., Complete user onboarding"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      {/* Estimated Time */}
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

      {/* Objective */}
      <div className="space-y-2">
        <Label htmlFor="task-objective">Objective (one sentence)</Label>
        <Input
          id="task-objective"
          placeholder="What should participants achieve?"
          value={formData.objective}
          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
        />
      </div>

      {/* Scenario */}
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

      {/* Task Steps */}
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

      {/* Success Criteria */}
      <div className="space-y-2">
        <Label htmlFor="task-success">Success Criteria</Label>
        <Input
          id="task-success"
          placeholder="How will you measure success?"
          value={formData.successCriteria}
          onChange={(e) => setFormData({ ...formData, successCriteria: e.target.value })}
        />
      </div>

      <Separator />

      {/* Task Difficulty Level */}
      <div className="space-y-3">
        <div>
          <Label>Task Difficulty Level</Label>
          <p className="text-xs text-slate-600 mt-1">
            This determines which participants will see this task based on their usage level
          </p>
        </div>
        <RadioGroup
          value={formData.difficulty}
          onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
          className="space-y-2"
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
              className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.difficulty === option.value
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <RadioGroupItem value={option.value} id={`difficulty-${option.value}`} />
              <div className="flex items-center gap-2">
                <span className="text-sm">{option.label}</span>
                <span className="text-xs text-slate-500">({option.segment})</span>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Enable Rating Scale */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rating-scale"
          checked={formData.enableRatingScale}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, enableRatingScale: checked as boolean })
          }
        />
        <Label htmlFor="rating-scale" className="cursor-pointer">
          Enable Rating Scale (1-5)
        </Label>
      </div>

      <Separator />

      {/* Custom Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Custom Questions</Label>
            <p className="text-xs text-slate-600 mt-1">{questionCount} question(s) added</p>
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

        {formData.questions && formData.questions.length > 0 && (
          <div className="space-y-4 mt-4">
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
                    <div className="ml-8 space-y-3">
                      <Label className="text-xs">Options:</Label>
                      
                      {/* Preview of how it will look for participants */}
                      {question.options && question.options.length > 0 && 
                       question.options.every(opt => opt.trim() !== '') && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-600 mb-2">Preview:</p>
                          {question.type === "multiple-choice" ? (
                            <RadioGroup disabled className="space-y-2">
                              {question.options.map((option, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <RadioGroupItem value={String(idx)} id={`preview-${question.id}-${idx}`} />
                                  <Label htmlFor={`preview-${question.id}-${idx}`} className="text-xs cursor-pointer">
                                    {option}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            <div className="space-y-2">
                              {question.options.map((option, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <Checkbox disabled id={`preview-${question.id}-${idx}`} />
                                  <Label htmlFor={`preview-${question.id}-${idx}`} className="text-xs cursor-pointer">
                                    {option}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Edit options */}
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
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!formData.title?.trim()}>
          {task ? "Update Task" : "Create Task"}
        </Button>
      </div>

      <QuestionBankDialog
        open={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        onAdd={handleAddFromBank}
      />
    </div>
  );
}