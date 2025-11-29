import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Plus, Edit, Trash2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { api } from "../utils/api";
import { toast } from "sonner";
import { TaskEditor } from "./TaskEditor";
import { Project, Task } from "../types";

interface TasksTabProps {
  project: Project;
  onUpdate: () => void;
}

export function TasksTab({ project, onUpdate }: TasksTabProps) {
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const tasks = project.tasks || [];

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'order'>) => {
    try {
      if (editingTask) {
        // Update existing task
        const updatedTask: Task = {
          ...editingTask,
          ...taskData,
        };
        await api.updateTaskInProject(project.id, String(editingTask.id), updatedTask);
        toast.success("Task updated successfully");
      } else {
        // Create new task
        const newTask: Task = {
          ...taskData,
          id: `T${Date.now()}`,
          order: tasks.length + 1,
        };
        await api.addTaskToProject(project.id, newTask);
        toast.success("Task created successfully");
      }
      setIsTaskEditorOpen(false);
      setEditingTask(undefined);
      onUpdate();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskEditorOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.removeTaskFromProject(project.id, taskId);
      onUpdate();
      toast.success("Task removed");
    } catch (error) {
      console.error("Error removing task:", error);
      toast.error("Failed to remove task");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Define tasks for participants to complete</CardDescription>
          </div>
          <Dialog open={isTaskEditorOpen} onOpenChange={(open) => {
            setIsTaskEditorOpen(open);
            if (!open) setEditingTask(undefined);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Update task details and questions' : 'Define a new task for participants to complete'}
                </DialogDescription>
              </DialogHeader>
              <TaskEditor
                task={editingTask}
                onSave={handleSaveTask}
                onCancel={() => {
                  setIsTaskEditorOpen(false);
                  setEditingTask(undefined);
                }}
                existingTaskCount={tasks.length}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-4">No tasks created yet</p>
            <Button size="sm" onClick={() => setIsTaskEditorOpen(true)}>
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {tasks
              .sort((a, b) => a.order - b.order)
              .map((task, index) => (
                <div
                  key={task.id}
                  className="flex flex-col p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 relative group"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="w-3 h-3 text-slate-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeleteTask(String(task.id))}
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-700 text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">{task.title}</p>
                      {task.objective && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{task.objective}</p>
                      )}
                      {task.steps && task.steps.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-slate-500">{task.steps.length} steps</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {task.estimatedTime && (
                      <Badge variant="outline" className="text-xs">
                        {task.estimatedTime}
                      </Badge>
                    )}
                    {task.difficulty && (
                      <Badge variant="outline" className="capitalize text-xs">
                        {task.difficulty === 'all' ? 'All Users' : task.difficulty}
                      </Badge>
                    )}
                    {task.questions && task.questions.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {task.questions.length} Q
                      </Badge>
                    )}
                    {task.enableRatingScale && (
                      <Badge variant="secondary" className="text-xs">
                        Rating
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
