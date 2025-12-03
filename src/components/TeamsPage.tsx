import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
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
  Users,
  FolderOpen,
  MoreHorizontal,
  Settings,
  UserPlus,
  Crown,
  Shield,
  ChevronRight,
  Palette
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BackToTop } from "./BackToTop";
import { useAzureAuth } from "../hooks/useAzureAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface TeamsPageProps {
  onSignOut?: () => void;
}

// Color options for teams
const teamColors = [
  { name: "Indigo", value: "#4F46E5", bg: "bg-indigo-500" },
  { name: "Blue", value: "#2563EB", bg: "bg-blue-500" },
  { name: "Cyan", value: "#0891B2", bg: "bg-cyan-600" },
  { name: "Teal", value: "#0D9488", bg: "bg-teal-500" },
  { name: "Green", value: "#16A34A", bg: "bg-green-600" },
  { name: "Lime", value: "#65A30D", bg: "bg-lime-600" },
  { name: "Amber", value: "#D97706", bg: "bg-amber-600" },
  { name: "Orange", value: "#EA580C", bg: "bg-orange-600" },
  { name: "Red", value: "#DC2626", bg: "bg-red-600" },
  { name: "Pink", value: "#DB2777", bg: "bg-pink-600" },
  { name: "Purple", value: "#9333EA", bg: "bg-purple-600" },
  { name: "Slate", value: "#475569", bg: "bg-slate-600" },
];

// Team icon options (emojis)
const teamIcons = ["🔬", "🎯", "🚀", "💡", "🎨", "📱", "🖥️", "🔧", "📊", "🧪", "👥", "⭐"];

// Mock teams data
const mockTeams = [
  {
    id: "1",
    name: "UX Research",
    description: "Core user experience research team focused on product usability and user needs discovery.",
    icon: "🔬",
    color: "#4F46E5",
    memberCount: 8,
    projectCount: 12,
    role: "lead" as const,
    members: [
      { id: "1", name: "Sarah Chen", role: "lead", avatar: null },
      { id: "2", name: "Mike Johnson", role: "member", avatar: null },
      { id: "3", name: "Emily Rodriguez", role: "member", avatar: null },
    ]
  },
  {
    id: "2",
    name: "Mobile Team",
    description: "Research initiatives for iOS and Android mobile applications.",
    icon: "📱",
    color: "#2563EB",
    memberCount: 5,
    projectCount: 6,
    role: "member" as const,
    members: [
      { id: "4", name: "Alex Kim", role: "lead", avatar: null },
      { id: "1", name: "Sarah Chen", role: "member", avatar: null },
    ]
  },
  {
    id: "3",
    name: "Growth",
    description: "User research supporting growth and acquisition initiatives.",
    icon: "🚀",
    color: "#16A34A",
    memberCount: 4,
    projectCount: 8,
    role: "member" as const,
    members: [
      { id: "5", name: "Jordan Lee", role: "lead", avatar: null },
      { id: "6", name: "Taylor Swift", role: "member", avatar: null },
    ]
  },
  {
    id: "4",
    name: "Enterprise",
    description: "Research focused on enterprise customer needs and B2B workflows.",
    icon: "🏢",
    color: "#9333EA",
    memberCount: 3,
    projectCount: 4,
    role: "lead" as const,
    members: [
      { id: "1", name: "Sarah Chen", role: "lead", avatar: null },
      { id: "7", name: "Chris Martinez", role: "member", avatar: null },
    ]
  },
];

export function TeamsPage({ onSignOut }: TeamsPageProps) {
  const navigate = useNavigate();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    icon: "🔬",
    color: "#4F46E5",
  });

  const navItems = [
    { id: "projects", label: "Projects", icon: LayoutGrid },
    { id: "trends", label: "Trend Analysis", icon: TrendingUp },
    { id: "divider-1", label: "", icon: () => null, isDivider: true },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "divider-2", label: "", icon: () => null, isDivider: true },
//    { id: "tags", label: "Tags", icon: Tag },
    { id: "calendar", label: "Calendar", icon: Calendar },
//    { id: "divider-3", label: "", icon: () => null, isDivider: true },
//    { id: "import-export", label: "Import/Export", icon: Download },
//    { id: "integrations", label: "Integrations", icon: Plug },
  ];

  const handleNavItemClick = (id: string) => {
    if (id.startsWith("divider")) return;
    if (id === "projects") {
      navigate("/app");
    } else {
      navigate(`/app/${id}`);
    }
  };

  const filteredTeams = mockTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myTeamsAsLead = filteredTeams.filter(t => t.role === 'lead');
  const myTeamsAsMember = filteredTeams.filter(t => t.role === 'member');

  const getRoleBadge = (role: 'lead' | 'member') => {
    if (role === 'lead') {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1">
          <Crown className="w-3 h-3" />
          Lead
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Users className="w-3 h-3" />
        Member
      </Badge>
    );
  };

  const handleCreateTeam = () => {
    console.log("Creating team:", newTeam);
    setIsCreateDialogOpen(false);
    setNewTeam({ name: "", description: "", icon: "🔬", color: "#4F46E5" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        navItems={navItems}
        activeItem="teams"
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
              <h1 className="text-3xl text-slate-900 mb-2">Teams</h1>
              <p className="text-slate-600">Manage your teams and collaborate on research projects</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 sm:shrink-0">
              <Plus className="w-4 h-4" />
              Create Team
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">{mockTeams.length}</p>
                    <p className="text-sm text-slate-500">Teams You're On</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">{myTeamsAsLead.length}</p>
                    <p className="text-sm text-slate-500">Teams You Lead</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">
                      {mockTeams.reduce((sum, t) => sum + t.projectCount, 0)}
                    </p>
                    <p className="text-sm text-slate-500">Total Projects</p>
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
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Teams I Lead */}
          {myTeamsAsLead.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Teams You Lead
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myTeamsAsLead.map((team) => (
                  <Card 
                    key={team.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => navigate(`/app/teams/${team.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${team.color}20` }}
                          >
                            {team.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {team.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getRoleBadge(team.role)}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <UserPlus className="w-4 h-4" /> Invite Members
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Settings className="w-4 h-4" /> Team Settings
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{team.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {team.memberCount} members
                          </span>
                          <span className="flex items-center gap-1">
                            <FolderOpen className="w-4 h-4" />
                            {team.projectCount} projects
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      {/* Member Avatars */}
                      <div className="flex items-center gap-1 mt-4 pt-4 border-t border-slate-100">
                        {team.members.slice(0, 5).map((member, idx) => (
                          <div
                            key={member.id}
                            className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 border-2 border-white -ml-2 first:ml-0"
                            title={member.name}
                          >
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {team.memberCount > 5 && (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500 border-2 border-white -ml-2">
                            +{team.memberCount - 5}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Teams I'm a Member Of */}
          {myTeamsAsMember.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-500" />
                Teams You're On
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myTeamsAsMember.map((team) => (
                  <Card 
                    key={team.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => navigate(`/app/teams/${team.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${team.color}20` }}
                          >
                            {team.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {team.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getRoleBadge(team.role)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{team.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {team.memberCount} members
                          </span>
                          <span className="flex items-center gap-1">
                            <FolderOpen className="w-4 h-4" />
                            {team.projectCount} projects
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredTeams.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No teams found</h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery ? "Try a different search term" : "Create your first team to get started"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Team
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Create a new team to organize research projects and collaborate with your colleagues.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Icon and Color */}
            <div className="flex items-start gap-4">
              <div>
                <Label className="text-xs text-slate-500">Icon</Label>
                <div className="mt-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl border-2 border-slate-200 hover:border-slate-300 transition-colors"
                        style={{ backgroundColor: `${newTeam.color}20` }}
                      >
                        {newTeam.icon}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <div className="grid grid-cols-6 gap-1 p-2">
                        {teamIcons.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => setNewTeam({ ...newTeam, icon })}
                            className={`w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 ${
                              newTeam.icon === icon ? 'bg-slate-100 ring-2 ring-indigo-500' : ''
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="e.g., UX Research, Mobile Team"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <Label>Team Color</Label>
              <div className="flex flex-wrap gap-2">
                {teamColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewTeam({ ...newTeam, color: color.value })}
                    className={`w-8 h-8 rounded-full transition-all ${color.bg} ${
                      newTeam.color === color.value
                        ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                        : 'hover:scale-105'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                placeholder="What does this team focus on?"
                rows={3}
              />
            </div>

            {/* Preview */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <Label className="text-xs text-slate-500">Preview</Label>
              <div className="flex items-center gap-3 mt-2">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${newTeam.color}20` }}
                >
                  {newTeam.icon}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{newTeam.name || "Team Name"}</p>
                  <p className="text-xs text-slate-500">1 member · 0 projects</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} disabled={!newTeam.name.trim()}>
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BackToTop />
    </div>
  );
}