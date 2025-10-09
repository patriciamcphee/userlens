// components/ProjectSetup/ProjectSetup.tsx
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Project, Task } from '../../types';
import { DEFAULT_MESSAGES, DEFAULT_TASK } from '../../constants';
import { ProjectDetailsForm } from './ProjectDetailsForm';
import { RecordingOptionsForm } from './RecordingOptionsForm';
import { MessagesForm } from './MessagesForm';
import { TasksForm } from './TasksForm';

interface ProjectSetupProps {
  editingProject: Project | null;
  onCancel: () => void;
  onSave: () => void;
}

export function ProjectSetup({ editingProject, onCancel, onSave }: ProjectSetupProps) {
  const { actions } = useAppContext();
  const isEditing = !!editingProject;

  // Form state
  const [projectName, setProjectName] = useState(editingProject?.name || '');
  const [projectDescription, setProjectDescription] = useState(editingProject?.description || '');
  const [projectMode, setProjectMode] = useState<'moderated' | 'unmoderated' | null>(
    editingProject?.mode || null
  );
  const [cameraOption, setCameraOption] = useState<'optional' | 'required' | 'disabled'>(
    editingProject?.cameraOption || 'optional'
  );
  const [micOption, setMicOption] = useState<'optional' | 'required' | 'disabled'>(
    editingProject?.micOption || 'optional'
  );
  const [beforeMessage, setBeforeMessage] = useState(
    editingProject?.setup.beforeMessage || DEFAULT_MESSAGES.beforeMessage
  );
  const [duringScenario, setDuringScenario] = useState(
    editingProject?.setup.duringScenario || DEFAULT_MESSAGES.duringScenario
  );
  const [afterMessage, setAfterMessage] = useState(
    editingProject?.setup.afterMessage || DEFAULT_MESSAGES.afterMessage
  );
  const [randomizeOrder, setRandomizeOrder] = useState(
    editingProject?.setup.randomizeOrder || false
  );
  const [tasks, setTasks] = useState<Task[]>(
    editingProject?.setup.tasks || [{ id: Date.now(), ...DEFAULT_TASK }]
  );

  // Validation errors
  const [errors, setErrors] = useState<{ name?: string; description?: string; mode?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; description?: string; mode?: string } = {};

    if (!projectName.trim()) {
      newErrors.name = 'Project name is required';
    } else if (projectName.length > 100) {
      newErrors.name = 'Project name must be less than 100 characters';
    }

    if (projectDescription.trim() && projectDescription.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!projectMode) {
      newErrors.mode = 'Please select a testing mode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const filteredTasks = tasks.filter(t => t.title.trim() !== '');

    if (filteredTasks.length === 0) {
      alert('Please add at least one task with a title');
      return;
    }

    const projectData: Project = {
      id: editingProject ? editingProject.id : Date.now(),
      name: projectName.trim(),
      description: projectDescription.trim(),
      mode: projectMode!,
      status: editingProject ? editingProject.status : 'draft',
      participantIds: editingProject ? editingProject.participantIds : [],
      sessions: editingProject ? editingProject.sessions : [],
      cameraOption,
      micOption,
      setup: {
        beforeMessage: beforeMessage.trim(),
        duringScenario: duringScenario.trim(),
        afterMessage: afterMessage.trim(),
        randomizeOrder,
        tasks: filteredTasks
      }
    };

    if (editingProject) {
      actions.updateProject(editingProject.id, projectData);
    } else {
      actions.addProject(projectData);
    }

    onSave();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onCancel} 
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Project' : 'New Project'}
            </h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="space-y-6">
          {/* Project Details */}
          <ProjectDetailsForm
            name={projectName}
            description={projectDescription}
            mode={projectMode}
            errors={errors}
            onNameChange={(value) => {
              setProjectName(value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            onDescriptionChange={(value) => {
              setProjectDescription(value);
              if (errors.description) setErrors({ ...errors, description: undefined });
            }}
            onModeChange={(mode) => {
              setProjectMode(mode);
              if (errors.mode) setErrors({ ...errors, mode: undefined });
            }}
          />

          {/* Recording Options */}
          <RecordingOptionsForm
            cameraOption={cameraOption}
            micOption={micOption}
            onCameraChange={setCameraOption}
            onMicChange={setMicOption}
          />

          {/* Messages */}
          <MessagesForm
            beforeMessage={beforeMessage}
            duringScenario={duringScenario}
            afterMessage={afterMessage}
            onBeforeMessageChange={setBeforeMessage}
            onDuringScenarioChange={setDuringScenario}
            onAfterMessageChange={setAfterMessage}
          />

          {/* Tasks */}
          <TasksForm
            tasks={tasks}
            randomizeOrder={randomizeOrder}
            onTasksChange={setTasks}
            onRandomizeChange={setRandomizeOrder}
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

