import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Edit2, Trash2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { api } from "../utils/api";
import { toast } from "sonner";
import type { StickyNote } from "../types";

const typeColors = {
  barrier: "bg-rose-200 border-rose-300 text-rose-900",
  insight: "bg-yellow-200 border-yellow-300 text-yellow-900",
  opportunity: "bg-emerald-200 border-emerald-300 text-emerald-900",
  quote: "bg-purple-200 border-purple-300 text-purple-900",
};

const clusterIcons: Record<string, string> = {
  "Onboarding Barriers": "🚧",
  "Template Pain Points": "📝",
  "Documentation Gaps": "📚",
  "What Works Well": "✅",
  "Emerging Opportunities": "💡",
  "User Frustrations": "😤",
  "Feature Requests": "🎯",
  "Workflow Issues": "🔄",
  "Learning Curve": "📈",
  "Integration Challenges": "🔗",
  "Performance Concerns": "⚡",
  "UI/UX Feedback": "🎨",
  "Communication Gaps": "💬",
  "Success Stories": "🏆",
  "Quick Wins": "🚀",
};

// Predefined clusters that users can choose from
const predefinedClusters = [
  { name: "Onboarding Barriers", icon: "🚧", description: "Issues users face when getting started" },
  { name: "Template Pain Points", icon: "📝", description: "Problems with templates or boilerplates" },
  { name: "Documentation Gaps", icon: "📚", description: "Missing or unclear documentation" },
  { name: "What Works Well", icon: "✅", description: "Positive feedback and successes" },
  { name: "Emerging Opportunities", icon: "💡", description: "New ideas and potential improvements" },
  { name: "User Frustrations", icon: "😤", description: "Pain points and annoyances" },
  { name: "Feature Requests", icon: "🎯", description: "Requested new features" },
  { name: "Workflow Issues", icon: "🔄", description: "Problems in user workflows" },
  { name: "Learning Curve", icon: "📈", description: "Difficulty learning the product" },
  { name: "Integration Challenges", icon: "🔗", description: "Issues connecting with other tools" },
  { name: "Performance Concerns", icon: "⚡", description: "Speed and performance issues" },
  { name: "UI/UX Feedback", icon: "🎨", description: "Interface and experience feedback" },
  { name: "Communication Gaps", icon: "💬", description: "Information sharing issues" },
  { name: "Success Stories", icon: "🏆", description: "User wins and achievements" },
  { name: "Quick Wins", icon: "🚀", description: "Easy improvements to implement" },
];

interface Props {
  stickyNotes: StickyNote[];
  onUpdate: () => void;
  projectId: string;
  emptyClusters?: string[];
}

export function AffinityMapping({ stickyNotes, onUpdate, projectId, emptyClusters = [] }: Props) {
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StickyNote | null>(null);
  const [formData, setFormData] = useState<Partial<StickyNote>>({
    text: "",
    type: "insight",
    cluster: "Emerging Opportunities",
  });
  const [isNewCluster, setIsNewCluster] = useState(false);
  const [newClusterName, setNewClusterName] = useState("");
  const [isAddClusterDialogOpen, setIsAddClusterDialogOpen] = useState(false);
  const [newStandaloneClusterName, setNewStandaloneClusterName] = useState("");
  const [selectedPredefinedClusters, setSelectedPredefinedClusters] = useState<Set<string>>(new Set());
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Combine clusters from notes and empty clusters
  const noteClusters = Array.from(new Set(stickyNotes.map(note => note.cluster)));
  const allClusters = Array.from(new Set([...noteClusters, ...emptyClusters]));
  const clusters = allClusters;

  // Filter out predefined clusters that already exist
  const availablePredefinedClusters = predefinedClusters.filter(
    pc => !clusters.includes(pc.name)
  );

  const togglePredefinedCluster = (clusterName: string) => {
    const newSelected = new Set(selectedPredefinedClusters);
    if (newSelected.has(clusterName)) {
      newSelected.delete(clusterName);
    } else {
      newSelected.add(clusterName);
    }
    setSelectedPredefinedClusters(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Determine final cluster name
      const finalCluster = isNewCluster ? newClusterName : formData.cluster;
      
      if (editingNote) {
        await api.updateStickyNoteInProject(projectId, editingNote.id, { ...editingNote, ...formData, cluster: finalCluster });
        toast.success("Note updated!");
      } else {
        const newId = String(Math.max(...stickyNotes.map(n => Number(n.id) || 0), 0) + 1);
        await api.addStickyNoteToProject(projectId, { ...formData, cluster: finalCluster, id: newId });
        toast.success("Note added!");
      }
      setIsAddDialogOpen(false);
      setEditingNote(null);
      setFormData({
        text: "",
        type: "insight",
        cluster: "Emerging Opportunities",
      });
      setIsNewCluster(false);
      setNewClusterName("");
      onUpdate();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.deleteStickyNoteFromProject(projectId, id);
      toast.success("Note deleted!");
      onUpdate();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleEdit = (note: StickyNote) => {
    setEditingNote(note);
    setFormData(note);
    setIsAddDialogOpen(true);
  };

  const handleDrop = async (targetCluster: string, noteId: string) => {
    const note = stickyNotes.find(n => n.id === noteId);
    if (!note || note.cluster === targetCluster) return;
    
    try {
      await api.updateStickyNoteInProject(projectId, noteId, { ...note, cluster: targetCluster });
      toast.success("Note moved!");
      onUpdate();
    } catch (error) {
      console.error("Error moving note:", error);
      toast.error("Failed to move note");
    }
  };

  const handleAddClusters = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const project = await api.getProject(projectId);
      const currentEmptyClusters = project.emptyClusters || [];
      
      // Collect all new clusters to add
      const newClusters: string[] = [];
      
      // Add selected predefined clusters
      selectedPredefinedClusters.forEach(clusterName => {
        if (!currentEmptyClusters.includes(clusterName) && !clusters.includes(clusterName)) {
          newClusters.push(clusterName);
        }
      });
      
      // Add custom cluster if provided
      if (showCustomInput && newStandaloneClusterName.trim()) {
        const customName = newStandaloneClusterName.trim();
        if (!currentEmptyClusters.includes(customName) && !clusters.includes(customName)) {
          newClusters.push(customName);
        }
      }
      
      if (newClusters.length > 0) {
        const updatedEmptyClusters = [...currentEmptyClusters, ...newClusters];
        await api.updateProject(projectId, { ...project, emptyClusters: updatedEmptyClusters });
        toast.success(`Added ${newClusters.length} cluster${newClusters.length > 1 ? 's' : ''}!`);
      } else {
        toast.info("No new clusters to add");
      }
      
      setIsAddClusterDialogOpen(false);
      setNewStandaloneClusterName("");
      setSelectedPredefinedClusters(new Set());
      setShowCustomInput(false);
      onUpdate();
    } catch (error) {
      console.error("Error adding cluster:", error);
      toast.error("Failed to add cluster");
    }
  };

  const resetAddClusterDialog = () => {
    setNewStandaloneClusterName("");
    setSelectedPredefinedClusters(new Set());
    setShowCustomInput(false);
  };

  return (
    <Card className="p-6 bg-white shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="flex-shrink-0">Affinity Mapping/Pattern Recognition</h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Dialog open={isAddClusterDialogOpen} onOpenChange={(open) => {
            setIsAddClusterDialogOpen(open);
            if (!open) resetAddClusterDialog();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Cluster
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Add Clusters</DialogTitle>
                <DialogDescription>
                  Select from predefined clusters or create your own.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddClusters} className="flex-1 overflow-hidden flex flex-col">
                {/* Predefined Clusters */}
                {availablePredefinedClusters.length > 0 && (
                  <div className="mb-4">
                    <Label className="mb-2 block">Predefined Clusters</Label>
                    <div className="max-h-64 overflow-y-auto border rounded-lg p-2 space-y-1">
                      {availablePredefinedClusters.map((cluster) => (
                        <label
                          key={cluster.name}
                          className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                            selectedPredefinedClusters.has(cluster.name)
                              ? 'bg-indigo-50 border border-indigo-200'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPredefinedClusters.has(cluster.name)}
                            onChange={() => togglePredefinedCluster(cluster.name)}
                            className="rounded"
                          />
                          <span className="text-xl">{cluster.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900">{cluster.name}</div>
                            <div className="text-xs text-slate-500 truncate">{cluster.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {availablePredefinedClusters.length === 0 && (
                  <p className="text-sm text-slate-500 mb-4">
                    All predefined clusters have already been added to this project.
                  </p>
                )}

                {/* Custom Cluster */}
                <div className="border-t pt-4">
                  {!showCustomInput ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setShowCustomInput(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Add Custom Cluster
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="customClusterName">Custom Cluster Name</Label>
                      <div className="flex gap-2">
                        <Input
                          id="customClusterName"
                          value={newStandaloneClusterName}
                          onChange={(e) => setNewStandaloneClusterName(e.target.value)}
                          placeholder="Enter custom cluster name..."
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowCustomInput(false);
                            setNewStandaloneClusterName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <span className="text-sm text-slate-600">
                    {selectedPredefinedClusters.size + (showCustomInput && newStandaloneClusterName.trim() ? 1 : 0)} cluster(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddClusterDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={selectedPredefinedClusters.size === 0 && (!showCustomInput || !newStandaloneClusterName.trim())}
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Add Selected
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              // Reset creation state when dialog closes
              setIsNewCluster(false);
              setNewClusterName('');
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>{editingNote ? "Edit Note" : "Add New Note"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="text">Note Text</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full border border-slate-300 rounded px-3 py-2"
                    required
                  >
                    <option value="insight">Insight</option>
                    <option value="barrier">Barrier</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="quote">Quote</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="cluster">Cluster</Label>
                  {isNewCluster ? (
                    <div className="space-y-2">
                      <Input
                        value={newClusterName}
                        onChange={(e) => setNewClusterName(e.target.value)}
                        placeholder="Enter new cluster name..."
                        autoFocus
                        required
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (newClusterName.trim()) {
                              setFormData({ ...formData, cluster: newClusterName.trim() });
                              setIsNewCluster(false);
                            }
                          }}
                        >
                          Save Cluster
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsNewCluster(false);
                            setNewClusterName('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Select
                      value={formData.cluster}
                      onValueChange={(value) => {
                        if (value === '__create_new__') {
                          setIsNewCluster(true);
                        } else {
                          setFormData({ ...formData, cluster: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cluster" />
                      </SelectTrigger>
                      <SelectContent>
                        {clusters.map((cluster) => (
                          <SelectItem key={cluster} value={cluster}>
                            <div className="flex items-center gap-2">
                              <span>{clusterIcons[cluster] || "📌"}</span>
                              <span>{cluster}</span>
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem value="__create_new__" className="text-blue-600 font-medium">
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create new cluster...
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  {editingNote ? "Update Note" : "Add Note"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clusters.map((cluster) => (
          <div
            key={cluster}
            className="space-y-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedNote) {
                handleDrop(cluster, draggedNote);
              }
            }}
          >
            <div className="flex items-center gap-2 sticky top-0 bg-white pb-2 z-10">
              <span>{clusterIcons[cluster] || "📌"}</span>
              <h3 className="text-sm">{cluster}</h3>
            </div>
            <div className="space-y-2">
              {stickyNotes
                .filter((note) => note.cluster === cluster)
                .map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded border-2 shadow-sm cursor-move transition-transform hover:scale-105 relative group max-w-sm ${ 
                      typeColors[note.type]
                    } ${draggedNote === note.id ? "opacity-50" : ""}`}
                    draggable
                    onDragStart={() => setDraggedNote(note.id)}
                    onDragEnd={() => setDraggedNote(null)}
                  >
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 bg-white/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(note);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 bg-white/80 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs leading-relaxed">{note.text}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}