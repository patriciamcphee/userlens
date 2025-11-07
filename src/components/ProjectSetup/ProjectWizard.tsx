// components/ProjectSetup/ProjectWizard.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Circle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Breadcrumbs, BreadcrumbBuilders } from '../Navigation/Breadcrumbs';
import { useLiveAnnouncer, useKeyboardShortcuts } from '../../utils/accessibility';
import { useAppContext } from '../../contexts/AppContext';
import { Project, Task, ParticipantAssignment } from '../../types';
import { DEFAULT_MESSAGES, DEFAULT_TASK } from '../../constants';

// Step Components
import { BasicDetailsStep } from './WizardSteps/BasicDetailsStep';
import { RecordingOptionsStep } from './WizardSteps/RecordingOptionsStep';
import { ParticipantsStep } from './WizardSteps/ParticipantsStep';
import { MessagesStep } from './WizardSteps/MessagesStep';
import { TasksStep } from './WizardSteps/TasksStep';
import { ReviewStep } from './WizardSteps/ReviewStep';

interface ProjectWizardProps {
  editingProject: Project | null;
  onCancel: () => void;
  onSave: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isValid: () => boolean;
  isOptional?: boolean;
}

interface ProjectWizardData {
  // Basic Details
  name: string;
  description: string;
  mode: 'moderated' | 'unmoderated' | null;
  
  // Recording Options
  cameraOption: 'optional' | 'required' | 'disabled';
  micOption: 'optional' | 'required' | 'disabled';
  
  // Participants
  selectedParticipants: Array<{ participantId: string | number; usageLevel: 'active' | 'occasionally' | 'non-user' }>;
  
  // Messages
  beforeMessage: string;
  duringScenario: string;
  afterMessage: string;
  
  // Tasks
  tasks: Task[];
  randomizeOrder: boolean;
}

export function ProjectWizard({ editingProject, onCancel, onSave }: ProjectWizardProps) {
  const { state, actions } = useAppContext();
  const { announce } = useLiveAnnouncer();
  const isEditing = !!editingProject;

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Form data
  const [data, setData] = useState<ProjectWizardData>(() => {
    if (editingProject) {
      return {
        name: editingProject.name,
        description: editingProject.description,
        mode: editingProject.mode,
        cameraOption: editingProject.cameraOption,
        micOption: editingProject.micOption,
        selectedParticipants: editingProject.participantAssignments?.map(pa => ({
          participantId: pa.participantId,
          usageLevel: pa.usageLevel
        })) || [],
        beforeMessage: editingProject.setup.beforeMessage,
        duringScenario: editingProject.setup.duringScenario,
        afterMessage: editingProject.setup.afterMessage,
        tasks: editingProject.setup.tasks,
        randomizeOrder: editingProject.setup.randomizeOrder
      };
    }
    
    return {
      name: '',
      description: '',
      mode: null,
      cameraOption: 'optional',
      micOption: 'optional',
      selectedParticipants: [],
      beforeMessage: DEFAULT_MESSAGES.beforeMessage,
      duringScenario: DEFAULT_MESSAGES.duringScenario,
      afterMessage: DEFAULT_MESSAGES.afterMessage,
      tasks: [{ id: Date.now(), ...DEFAULT_TASK }],
      randomizeOrder: false
    };
  });

  // Validation functions
  const validateBasicDetails = (): boolean => {
    return data.name.trim() !== '' && data.mode !== null;
  };

  const validateRecordingOptions = (): boolean => {
    // Always valid - these are just preferences
    return true;
  };

  const validateParticipants = (): boolean => {
    // Optional step - can have 0 participants initially
    return true;
  };

  const validateMessages = (): boolean => {
    return data.beforeMessage.trim() !== '' && data.afterMessage.trim() !== '';
  };

  const validateTasks = (): boolean => {
    return data.tasks.length > 0 && data.tasks.some(task => task.title.trim() !== '');
  };

  const validateReview = (): boolean => {
    return validateBasicDetails() && validateMessages() && validateTasks();
  };

  // Define wizard steps
  const steps: WizardStep[] = [
    {
      id: 'basics',
      title: 'Project Basics',
      description: 'Set up your project name, description, and testing mode',
      component: BasicDetailsStep,
      isValid: validateBasicDetails
    },
    {
      id: 'recording',
      title: 'Recording Options',
      description: 'Configure camera and microphone settings for sessions',
      component: RecordingOptionsStep,
      isValid: validateRecordingOptions
    },
    {
      id: 'participants',
      title: 'Participants',
      description: 'Add participants and set their experience levels',
      component: ParticipantsStep,
      isValid: validateParticipants,
      isOptional: true
    },
    {
      id: 'messages',
      title: 'Session Messages',
      description: 'Customize messages shown before, during, and after sessions',
      component: MessagesStep,
      isValid: validateMessages
    },
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Define the tasks participants will complete',
      component: TasksStep,
      isValid: validateTasks
    },
    {
      id: 'review',
      title: 'Review & Create',
      description: 'Review your project settings and create the project',
      component: ReviewStep,
      isValid: validateReview
    }
  ];

  // Update completed steps when data changes
  useEffect(() => {
    const newCompletedSteps = new Set<number>();
    steps.forEach((step, index) => {
      if (step.isValid()) {
        newCompletedSteps.add(index);
      }
    });
    setCompletedSteps(newCompletedSteps);
  }, [data]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    escape: (event) => {
      event.preventDefault();
      handleCancel();
    },
    save: (event) => {
      event.preventDefault();
      if (currentStep === steps.length - 1) {
        handleSave();
      }
    }
  }, [currentStep, data]);

  const updateData = (updates: Partial<ProjectWizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      announce(`Moved to step ${nextStep + 1}: ${steps[nextStep].title}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      announce(`Moved to step ${prevStep + 1}: ${steps[prevStep].title}`);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    announce(`Jumped to step ${stepIndex + 1}: ${steps[stepIndex].title}`);
  };

  const handleCancel = () => {
    if (Object.values(data).some(value => 
      typeof value === 'string' ? value.trim() !== '' : 
      Array.isArray(value) ? value.length > 0 : 
      value !== null
    )) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const handleSave = async () => {
    if (!validateReview()) {
      announce('Please complete all required fields before saving', 'assertive');
      return;
    }

    setIsSaving(true);
    announce('Saving project...', 'polite');

    try {
      const filteredTasks = data.tasks.filter(t => t.title.trim() !== '');

      const participantAssignments: ParticipantAssignment[] = data.selectedParticipants.map(sel => ({
        participantId: sel.participantId,
        usageLevel: sel.usageLevel
      }));

      const participantIds = data.selectedParticipants.map(sel => sel.participantId);

      const projectData: Omit<Project, 'id'> = {
        name: data.name.trim(),
        description: data.description.trim(),
        mode: data.mode!,
        status: editingProject ? editingProject.status : 'active',
        participantIds: participantIds,
        participantAssignments: participantAssignments,
        sessions: editingProject ? editingProject.sessions : [],
        cameraOption: data.cameraOption,
        micOption: data.micOption,
        setup: {
          beforeMessage: data.beforeMessage.trim(),
          duringScenario: data.duringScenario.trim(),
          afterMessage: data.afterMessage.trim(),
          randomizeOrder: data.randomizeOrder,
          tasks: filteredTasks
        }
      };

      if (editingProject) {
        await actions.updateProject(editingProject.id, projectData as Partial<Project>);
        announce('Project updated successfully!', 'polite');
      } else {
        const newProject: Project = {
          ...projectData,
          id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        await actions.addProject(newProject);
        announce('Project created successfully!', 'polite');
      }

      onSave();
    } catch (error) {
      console.error('Error saving project:', error);
      announce('Failed to save project. Please try again.', 'assertive');
    } finally {
      setIsSaving(false);
    }
  };

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;
  const canProceed = currentStepData.isValid();
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with breadcrumbs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            items={isEditing 
              ? BreadcrumbBuilders.editProject(data.name || 'Untitled Project', onCancel)
              : BreadcrumbBuilders.createProject(onCancel)
            }
            className="mb-4"
          />
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Project' : 'Create New Project'}
              </h1>
              <p className="text-gray-600 mt-1">
                Step {currentStep + 1} of {steps.length}: {currentStepData.title}
              </p>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Step Navigation Sidebar */}
          <div className="lg:col-span-1">
            <nav aria-label="Project setup progress" className="sticky top-6">
              <ol className="space-y-4">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = completedSteps.has(index);
                  const isClickable = index <= currentStep || isCompleted;

                  return (
                    <li key={step.id}>
                      <button
                        onClick={() => isClickable ? handleStepClick(index) : undefined}
                        disabled={!isClickable}
                        className={`w-full text-left p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isActive 
                            ? 'bg-blue-50 border-2 border-blue-300' 
                            : isCompleted
                            ? 'bg-green-50 border-2 border-green-300 hover:bg-green-100'
                            : isClickable
                            ? 'bg-white border-2 border-gray-200 hover:bg-gray-50'
                            : 'bg-gray-50 border-2 border-gray-200 cursor-not-allowed opacity-60'
                        }`}
                        aria-current={isActive ? 'step' : undefined}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                            isCompleted 
                              ? 'bg-green-600 text-white'
                              : isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold ${
                              isActive ? 'text-blue-900' : 
                              isCompleted ? 'text-green-900' : 
                              'text-gray-700'
                            }`}>
                              {step.title}
                              {step.isOptional && (
                                <span className="text-xs text-gray-500 ml-2">(Optional)</span>
                              )}
                            </div>
                            <div className={`text-xs mt-1 ${
                              isActive ? 'text-blue-700' : 
                              isCompleted ? 'text-green-700' : 
                              'text-gray-500'
                            }`}>
                              {step.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Step Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {currentStepData.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {currentStepData.description}
                    </p>
                  </div>
                  
                  {currentStepData.isOptional && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      Optional
                    </span>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                <StepComponent
                  data={data}
                  updateData={updateData}
                  participants={state.participants}
                  isEditing={isEditing}
                />
              </div>

              {/* Step Navigation */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center space-x-3">
                    {!canProceed && !currentStepData.isOptional && (
                      <span className="text-sm text-red-600">
                        Please complete required fields to continue
                      </span>
                    )}
                    
                    {isLastStep ? (
                      <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={!canProceed}
                        isLoading={isSaving}
                      >
                        {isSaving 
                          ? (isEditing ? 'Saving...' : 'Creating...')
                          : (isEditing ? 'Save Changes' : 'Create Project')
                        }
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={handleNext}
                        disabled={!canProceed && !currentStepData.isOptional}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}