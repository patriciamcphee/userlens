import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { 
  LayoutGrid, 
  TrendingUp, 
  FileText, 
  Activity, 
  Tag, 
  Calendar, 
  Download, 
  Plug,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Palette,
  FolderOpen,
  Hash
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BackToTop } from "./BackToTop";
import { useAzureAuth } from "../hooks/useAzureAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface TagsPageProps {
  onSignOut?: () => void;
}

// Color options for tags
const colorOptions = [
  { name: "Gray", value: "gray", bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-200" },
  { name: "Red", value: "red", bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  { name: "Orange", value: "orange", bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  { name: "Amber", value: "amber", bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
  { name: "Yellow", value: "yellow", bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  { name: "Lime", value: "lime", bg: "bg-lime-100", text: "text-lime-800", border: "border-lime-200" },
  { name: "Green", value: "green", bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  { name: "Teal", value: "teal", bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
  { name: "Cyan", value: "cyan", bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-200" },
  { name: "Blue", value: "blue", bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  { name: "Indigo", value: "indigo", bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
  { name: "Purple", value: "purple", bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  { name: "Pink", value: "pink", bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
];

// Mock tags data
const mockTags = [
  { id: "1", name: "pain-point", color: "red", projectCount: 8, noteCount: 45 },
  { id: "2", name: "navigation", color: "blue", projectCount: 5, noteCount: 32 },
  { id: "3", name: "onboarding", color: "green", projectCount: 4, noteCount: 28 },
  { id: "4", name: "mobile", color: "purple", projectCount: 6, noteCount: 52 },
  { id: "5", name: "accessibility", color: "teal", projectCount: 3, noteCount: 18 },
  { id: "6", name: "performance", color: "orange", projectCount: 4, noteCount: 22 },
  { id: "7", name: "feature-request", color: "amber", projectCount: 7, noteCount: 38 },
  { id: "8", name: "usability", color: "indigo", projectCount: 9, noteCount: 67 },
  { id: "9", name: "checkout", color: "cyan", projectCount: 3, noteCount: 15 },
  { id: "10", name: "search", color: "pink", projectCount: 2, noteCount: 11 },
  { id: "11", name: "positive-feedback", color: "lime", projectCount: 6, noteCount: 41 },
  { id: "12", name: "bug", color: "red", projectCount: 5, noteCount: 23 },
];

export function TagsPage({ onSignOut }: TagsPageProps) {
  const navigate = useNavigate();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<typeof mockTags[0] | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("gray");

  const navItems = [
    { id: "projects", label: "Projects", icon: LayoutGrid },
    { id: "trends", label: "Trend Analysis", icon: TrendingUp },
    { id: "divider-1", label: "", icon: () => null, isDivider: true },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "divider-2", label: "", icon: () => null, isDivider: true },
    { id: "tags", label: "Tags", icon: Tag },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "divider-3", label: "", icon: () => null, isDivider: true },
    { id: "import-export", label: "Import/Export", icon: Download },
    { id: "integrations", label: "Integrations", icon: Plug },
  ];

  const handleNavItemClick = (id: string) => {
    if (id.startsWith("divider")) return;
    if (id === "projects") {
      navigate("/app");
    } else {
      navigate(`/app/${id}`);
    }
  };

  const getColorClasses = (colorName: string) => {
    const color = colorOptions.find(c => c.value === colorName);
    return color || colorOptions[0];
  };

  const filteredTags = mockTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditTag = (tag: typeof mockTags[0]) => {
    setSelectedTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
    setIsEditDialogOpen(true);
  };

  const totalNotes = mockTags.reduce((sum, tag) => sum + tag.noteCount, 0);
  const totalProjects = new Set(mockTags.flatMap(t => t.projectCount)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        navItems={navItems}
        activeItem="tags"
        onNavItemClick={handleNavItemClick}
        user={azureAuth.user ?? undefined}
        onSignOut={onSignOut}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      <div className={`min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12 lg:mt-0 mb-8">
            <div>
              <h1 className="text-3xl text-slate-900 mb-2">Tags</h1>
              <p className="text-slate-600">Organize and manage tags across your projects</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 sm:shrink-0">
              <Plus className="w-4 h-4" />
              Create Tag
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Hash className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">{mockTags.length}</p>
                    <p className="text-sm text-slate-500">Total Tags</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">{totalNotes}</p>
                    <p className="text-sm text-slate-500">Tagged Notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">{totalProjects}</p>
                    <p className="text-sm text-slate-500">Projects Using Tags</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags Grid */}
          <Card>
            <CardHeader>
              <CardTitle>All Tags</CardTitle>
              <CardDescription>{filteredTags.length} tags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTags.map((tag) => {
                  const colors = getColorClasses(tag.color);
                  return (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
                          {tag.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-slate-900 font-medium">{tag.noteCount} notes</p>
                          <p className="text-slate-500">{tag.projectCount} projects</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTag(tag)} className="gap-2">
                              <Edit className="w-4 h-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Palette className="w-4 h-4" /> Change Color
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-red-600">
                              <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTags.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600">No tags found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Tag Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Tag</DialogTitle>
            <DialogDescription>
              Create a new tag to organize your research notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tag Name</Label>
              <Input
                placeholder="e.g., pain-point, feature-request"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-7 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewTagColor(color.value)}
                    className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-all ${
                      newTagColor === color.value
                        ? 'border-slate-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="pt-2">
              <Label className="text-slate-500">Preview</Label>
              <div className="mt-2">
                <Badge className={`${getColorClasses(newTagColor).bg} ${getColorClasses(newTagColor).text} ${getColorClasses(newTagColor).border}`}>
                  {newTagName || "tag-name"}
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update tag name or color
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tag Name</Label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-7 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewTagColor(color.value)}
                    className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-all ${
                      newTagColor === color.value
                        ? 'border-slate-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="pt-2">
              <Label className="text-slate-500">Preview</Label>
              <div className="mt-2">
                <Badge className={`${getColorClasses(newTagColor).bg} ${getColorClasses(newTagColor).text} ${getColorClasses(newTagColor).border}`}>
                  {newTagName || "tag-name"}
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BackToTop />
    </div>
  );
}