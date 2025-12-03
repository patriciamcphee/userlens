import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Upload, Download, FileJson, AlertCircle, CheckCircle2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Task, TaskStep, TaskQuestion } from "../types";

interface TaskImportExportProps {
  onImport: (tasks: Omit<Task, "id" | "order">[]) => Promise<void>;
  existingTaskCount: number;
}

interface ValidationError {
  taskIndex: number;
  field: string;
  message: string;
}

interface ImportResult {
  validTasks: Omit<Task, "id" | "order">[];
  errors: ValidationError[];
}

// Template that users can download
const TASK_TEMPLATE = {
  tasks: [
    {
      title: "Example Task 1 - User Onboarding",
      estimatedTime: "5-10 minutes",
      difficulty: "easy",
      objective: "Successfully create an account and complete profile setup",
      scenario: "You are a new user who just discovered our platform. Your goal is to create an account and set up your profile so you can start using the main features.",
      successCriteria: "User successfully creates account, verifies email, and completes all required profile fields",
      enableRatingScale: true,
      steps: [
        { description: "Navigate to the sign-up page" },
        { description: "Fill in your email and create a password" },
        { description: "Verify your email address" },
        { description: "Complete your profile information" }
      ],
      questions: [
        {
          question: "How easy was it to find the sign-up button?",
          type: "rating",
          required: true
        },
        {
          question: "What was the most confusing part of onboarding?",
          type: "text",
          required: false
        }
      ]
    },
    {
      title: "Example Task 2 - Navigation Test",
      estimatedTime: "3-5 minutes",
      difficulty: "medium",
      objective: "Find and access the settings page",
      scenario: "You need to update your notification preferences. Find where you can manage your account settings.",
      successCriteria: "User successfully navigates to Settings > Notifications",
      enableRatingScale: true,
      steps: [
        { description: "From the dashboard, locate the settings option" },
        { description: "Navigate to the Notifications section" },
        { description: "Review the available options" }
      ],
      questions: [
        {
          question: "Was the settings menu easy to find?",
          type: "yes-no",
          required: true
        },
        {
          question: "How would you rate the navigation experience?",
          type: "multiple-choice",
          options: ["Very Easy", "Easy", "Neutral", "Difficult", "Very Difficult"],
          required: true
        },
        {
          question: "Which features would you like to see in settings?",
          type: "checkbox",
          options: ["Dark mode", "Language settings", "Export data", "Two-factor auth"],
          required: false
        }
      ]
    }
  ],
  _metadata: {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    documentation: {
      requiredFields: ["title"],
      optionalFields: ["estimatedTime", "difficulty", "objective", "scenario", "successCriteria", "enableRatingScale", "steps", "questions"],
      difficultyOptions: ["easy", "medium", "hard", "all"],
      timeOptions: ["1-2 minutes", "3-5 minutes", "5-10 minutes", "10-15 minutes", "15-20 minutes", "20+ minutes"],
      questionTypes: {
        "multiple-choice": "Single select - requires 'options' array",
        "checkbox": "Multi-select - requires 'options' array",
        "text": "Free text response",
        "yes-no": "Yes/No choice",
        "rating": "1-5 scale"
      }
    }
  }
};

const VALID_DIFFICULTIES = ["easy", "medium", "hard", "all"];
const VALID_QUESTION_TYPES = ["multiple-choice", "checkbox", "text", "yes-no", "rating"];

export function TaskImportExport({ onImport, existingTaskCount }: TaskImportExportProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate a single task
  const validateTask = (task: any, index: number): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Required: title
    if (!task.title || typeof task.title !== "string" || !task.title.trim()) {
      errors.push({
        taskIndex: index,
        field: "title",
        message: "Title is required and must be a non-empty string"
      });
    }

    // Optional: difficulty validation
    if (task.difficulty && !VALID_DIFFICULTIES.includes(task.difficulty)) {
      errors.push({
        taskIndex: index,
        field: "difficulty",
        message: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(", ")}`
      });
    }

    // Optional: steps validation
    if (task.steps) {
      if (!Array.isArray(task.steps)) {
        errors.push({
          taskIndex: index,
          field: "steps",
          message: "Steps must be an array"
        });
      } else {
        task.steps.forEach((step: any, stepIndex: number) => {
          if (typeof step === "string") {
            // Allow simple string format, will be converted
          } else if (!step.description || typeof step.description !== "string") {
            errors.push({
              taskIndex: index,
              field: `steps[${stepIndex}]`,
              message: "Each step must have a 'description' string"
            });
          }
        });
      }
    }

    // Optional: questions validation
    if (task.questions) {
      if (!Array.isArray(task.questions)) {
        errors.push({
          taskIndex: index,
          field: "questions",
          message: "Questions must be an array"
        });
      } else {
        task.questions.forEach((q: any, qIndex: number) => {
          if (!q.question || typeof q.question !== "string") {
            errors.push({
              taskIndex: index,
              field: `questions[${qIndex}].question`,
              message: "Each question must have a 'question' string"
            });
          }
          if (!q.type || !VALID_QUESTION_TYPES.includes(q.type)) {
            errors.push({
              taskIndex: index,
              field: `questions[${qIndex}].type`,
              message: `Invalid question type. Must be one of: ${VALID_QUESTION_TYPES.join(", ")}`
            });
          }
          if ((q.type === "multiple-choice" || q.type === "checkbox") && (!q.options || !Array.isArray(q.options) || q.options.length === 0)) {
            errors.push({
              taskIndex: index,
              field: `questions[${qIndex}].options`,
              message: "Multiple choice and checkbox questions require an 'options' array"
            });
          }
        });
      }
    }

    return errors;
  };

  // Transform raw task data into proper Task format
  const transformTask = (task: any): Omit<Task, "id" | "order"> => {
    // Transform steps - handle both string array and object array formats
    const steps: TaskStep[] = task.steps
      ? task.steps.map((step: any, index: number) => ({
          id: `step-${Date.now()}-${index}`,
          description: typeof step === "string" ? step : step.description,
          order: index + 1
        }))
      : [];

    // Transform questions
    const questions: TaskQuestion[] = task.questions
      ? task.questions.map((q: any, index: number) => ({
          id: Date.now() + index,
          question: q.question,
          type: q.type || "text",
          options: q.options || undefined,
          required: q.required || false
        }))
      : [];

    return {
      title: task.title.trim(),
      estimatedTime: task.estimatedTime || "5-10 minutes",
      customTime: task.customTime,
      objective: task.objective || "",
      scenario: task.scenario || "",
      successCriteria: task.successCriteria || "",
      difficulty: task.difficulty || "all",
      enableRatingScale: task.enableRatingScale || false,
      steps,
      questions
    };
  };

  // Parse and validate imported JSON
  const parseImportedFile = (content: string): ImportResult => {
    let data: any;
    
    try {
      data = JSON.parse(content);
    } catch {
      return {
        validTasks: [],
        errors: [{ taskIndex: -1, field: "file", message: "Invalid JSON format" }]
      };
    }

    // Handle both single task and array of tasks
    let tasks: any[];
    if (Array.isArray(data)) {
      tasks = data;
    } else if (data.tasks && Array.isArray(data.tasks)) {
      tasks = data.tasks;
    } else if (data.title) {
      // Single task object
      tasks = [data];
    } else {
      return {
        validTasks: [],
        errors: [{ taskIndex: -1, field: "format", message: "Expected an array of tasks or an object with a 'tasks' array" }]
      };
    }

    const allErrors: ValidationError[] = [];
    const validTasks: Omit<Task, "id" | "order">[] = [];

    tasks.forEach((task, index) => {
      const errors = validateTask(task, index);
      if (errors.length === 0) {
        validTasks.push(transformTask(task));
      } else {
        allErrors.push(...errors);
      }
    });

    return { validTasks, errors: allErrors };
  };

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith(".json")) {
      setImportResult({
        validTasks: [],
        errors: [{ taskIndex: -1, field: "file", message: "Please upload a JSON file" }]
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const content = await file.text();
      const result = parseImportedFile(content);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        validTasks: [],
        errors: [{ taskIndex: -1, field: "file", message: "Failed to read file" }]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle import confirmation
  const handleConfirmImport = async () => {
    if (!importResult || importResult.validTasks.length === 0) return;

    setIsProcessing(true);
    try {
      await onImport(importResult.validTasks);
      setIsImportDialogOpen(false);
      setImportResult(null);
    } catch (error) {
      console.error("Import failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    const template = {
      ...TASK_TEMPLATE,
      _metadata: {
        ...TASK_TEMPLATE._metadata,
        exportedAt: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "task-import-template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset dialog state
  const resetDialog = () => {
    setImportResult(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-2">
      {/* Download Template Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadTemplate}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Template
      </Button>

      {/* Import Dialog */}
      <Dialog 
        open={isImportDialogOpen} 
        onOpenChange={(open) => {
          setIsImportDialogOpen(open);
          if (!open) resetDialog();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Tasks</DialogTitle>
            <DialogDescription>
              Upload a JSON file with your tasks. Download the template for the correct format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Template download hint */}
            <Alert>
              <FileJson className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Need the correct format?</span>
                <Button variant="link" size="sm" onClick={handleDownloadTemplate} className="p-0 h-auto">
                  Download template
                </Button>
              </AlertDescription>
            </Alert>

            {/* File drop zone */}
            {!importResult && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-300 hover:border-slate-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="task-import-file"
                />
                <FileJson className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 mb-2">
                  Drag and drop your JSON file here, or
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  Browse Files
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Only .json files are accepted
                </p>
              </div>
            )}

            {/* Processing state */}
            {isProcessing && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-sm text-slate-600 mt-2">Processing...</p>
              </div>
            )}

            {/* Import results */}
            {importResult && !isProcessing && (
              <div className="space-y-4">
                {/* Success summary */}
                {importResult.validTasks.length > 0 && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>{importResult.validTasks.length}</strong> task(s) ready to import
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error summary */}
                {importResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{importResult.errors.length}</strong> validation error(s) found
                    </AlertDescription>
                  </Alert>
                )}

                {/* Valid tasks preview */}
                {importResult.validTasks.length > 0 && (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                    <p className="text-xs font-medium text-slate-600 mb-2">Tasks to import:</p>
                    <div className="space-y-2">
                      {importResult.validTasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="truncate">{task.title}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {task.difficulty}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error details */}
                {importResult.errors.length > 0 && (
                  <div className="border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-red-50">
                    <p className="text-xs font-medium text-red-800 mb-2">Errors:</p>
                    <div className="space-y-1">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-xs text-red-700">
                          {error.taskIndex >= 0 ? (
                            <span>Task {error.taskIndex + 1} → {error.field}: {error.message}</span>
                          ) : (
                            <span>{error.message}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetDialog}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Start Over
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmImport}
                    disabled={importResult.validTasks.length === 0 || isProcessing}
                  >
                    Import {importResult.validTasks.length} Task(s)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}