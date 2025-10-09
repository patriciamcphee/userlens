// components/ProjectSetup/TasksForm.tsx
import React from 'react';
import { Plus, Shuffle } from 'lucide-react';
import { Task } from '../../types';
import { TaskItem } from './TaskItem';
import { DEFAULT_TASK } from '../../constants';

interface TasksFormProps {
  tasks: Task[];
  randomizeOrder: boolean;
  onTasksChange: (tasks: Task[]) => void;
  onRandomizeChange: (randomize: boolean) => void;
}

export function TasksForm({ tasks, randomizeOrder, onTasksChange, onRandomizeChange }: TasksFormProps) {
  const addTask = () => {
    onTasksChange([...tasks, { id: Date.now(), ...DEFAULT_TASK }]);
  };

  const removeTask = (id: number) => {
    if (tasks.length === 1) {
      alert('You must have at least one task');
      return;
    }
    onTasksChange(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    onTasksChange(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-xl font-bold text-gray-900">Tasks</label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={randomizeOrder}
            onChange={(e) => onRandomizeChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <Shuffle className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Randomize task order</span>
        </label>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            canDelete={tasks.length > 1}
            onUpdate={(updates) => updateTask(task.id, updates)}
            onRemove={() => removeTask(task.id)}
          />
        ))}
      </div>

      <button
        onClick={addTask}
        className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>Add Task</span>
      </button>
    </div>
  );
}