import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  ArrowLeft,
  Mail,
  Trash2,
  Shield,
  Clock,
  ChevronRight,
  UserMinus,
  Edit,
  CheckCircle2,
  XCircle,
  Copy
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface TeamDetailPageProps {
  onSignOut?: () => void;
}

// Mock team data
const mockTeam = {
  id: "1",
  name: "UX Research",
  description: "Core user experience research team focused on product usability and user needs discovery.",
  icon: "🔬",
  color: "#4F46E5",
  memberCount: 8,
  projectCount: 12,
  createdAt: "2024-01-15T10:00:00Z",
  createdBy: "Sarah Chen",
};

const mockMembers = [
  { id: "1", name: "Sarah Chen", email: "sarah.chen@company.com", role: "lead" as const, joinedAt: "2024-01-15", lastActive: "2 hours ago", projectCount: 12 },
  { id: "2", name: "Mike Johnson", email: "mike.johnson@company.com", role: "member" as const, joinedAt: "2024-01-20", lastActive: "1 day ago", projectCount: 8 },
  { id: "3", name: "Emily Rodriguez", email: "emily.rodriguez@company.com", role: "member" as const, joinedAt: "2024-02-01", lastActive: "3 hours ago", projectCount: 6 },
  { id: "4", name: "David Kim", email: "david.kim@company.com", role: "member" as const, joinedAt: "2024-02-15", lastActive: "Just now", projectCount: 4 },
  { id: "5", name: "Lisa Wang", email: "lisa.wang@company.com", role: "member" as const, joinedAt: "2024-03-01", lastActive: "5 hours ago", projectCount: 3 },
];

const mockProjects = [
  { id: "1", name: "Q2:2026 Usability Testing", status: "active", participantCount: 24, taskCount: 8, lastUpdated: "2 hours ago" },
  { id: "2", name: "Onboarding Flow Study", status: "active", participantCount: 15, taskCount: 5, lastUpdated: "1 day ago" },
  { id: "3", name: "Mobile App Beta", status: "completed", participantCount: 30, taskCount: 12, lastUpdated: "3 days ago" },
  { id: "4", name: "Checkout Optimization", status: "draft", participantCount: 0, taskCount: 6, lastUpdated: "1 week ago" },
];

const mockPendingInvites = [
  { id: "1", email: "new.member@company.com", role: "member" as const, invitedAt: "2024-03-10", invitedBy: "Sarah Chen" },
  { id: "2", email: "another.person@company.com", role: "member" as const, invitedAt: "2024-03-12", invitedBy: "Sarah Chen" },
];

export function TeamDetailPage({ onSignOut }: TeamDetailPageProps) {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof mockMembers[0] | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"lead" | "member">("member");

  // For this demo, assume current user is the team lead
  const isTeamLead = true;
  const currentUserId = "1";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
      case "draft":
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: 'lead' | 'member') => {
    if (role === 'lead') {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1">
          <Crown className="w-3 h-3" />
          Lead
        </Badge>
      );
    }
    return <Badge variant="outline">Member</Badge>;
  };

  const handleRemoveMember = (member: typeof mockMembers[0]) => {
    setSelectedMember(member);
    setIsRemoveMemberDialogOpen(true);
  };

  const handleChangeMemberRole = (member: typeof mockMembers[0], newRole: 'lead' | 'member') => {
    console.log(`Changing ${member.name}'s role to ${newRole}`);
  };

  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = mockProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/app/teams")}
            className="mb-4 gap-2 mt-12 lg:mt-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Teams
          </Button>

          {/* Team Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
                    style={{ backgroundColor: `${mockTeam.color}20` }}
                  >
                    {mockTeam.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-semibold text-slate-900">{mockTeam.name}</h1>
                      {isTeamLead && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1">
                          <Crown className="w-3 h-3" />
                          You're a Lead
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-600 mb-3">{mockTeam.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {mockTeam.memberCount} members
                      </span>
                      <span className="flex items-center gap-1">
                        <FolderOpen className="w-4 h-4" />
                        {mockTeam.projectCount} projects
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Created {new Date(mockTeam.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {isTeamLead && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                    <Button onClick={() => setIsInviteDialogOpen(true)} className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Invite
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="members" className="gap-2">
                <Users className="w-4 h-4" />
                Members ({mockMembers.length})
              </TabsTrigger>
              <TabsTrigger value="projects" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                Projects ({mockProjects.length})
              </TabsTrigger>
              {isTeamLead && (
                <TabsTrigger value="pending" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Pending ({mockPendingInvites.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>People who have access to this team's projects</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-700">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-900">{member.name}</h4>
                              {member.id === currentUserId && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                              {getRoleBadge(member.role)}
                            </div>
                            <p className="text-sm text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm text-slate-900">{member.projectCount} projects</p>
                            <p className="text-xs text-slate-500">Active {member.lastActive}</p>
                          </div>
                          {isTeamLead && member.id !== currentUserId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {member.role === 'member' ? (
                                  <DropdownMenuItem 
                                    className="gap-2"
                                    onClick={() => handleChangeMemberRole(member, 'lead')}
                                  >
                                    <Crown className="w-4 h-4" /> Make Team Lead
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    className="gap-2"
                                    onClick={() => handleChangeMemberRole(member, 'member')}
                                  >
                                    <Shield className="w-4 h-4" /> Change to Member
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="gap-2 text-red-600"
                                  onClick={() => handleRemoveMember(member)}
                                >
                                  <UserMinus className="w-4 h-4" /> Remove from Team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}

                    {filteredMembers.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-600">No members found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Team Projects</CardTitle>
                      <CardDescription>Research projects owned by this team</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Search projects..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" />
                        New Project
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/app/project/${project.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {project.name}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span>{project.participantCount} participants</span>
                              <span>•</span>
                              <span>{project.taskCount} tasks</span>
                              <span>•</span>
                              <span>Updated {project.lastUpdated}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(project.status)}
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      </div>
                    ))}

                    {filteredProjects.length === 0 && (
                      <div className="text-center py-8">
                        <FolderOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-600 mb-4">No projects found</p>
                        <Button className="gap-2">
                          <Plus className="w-4 h-4" />
                          Create First Project
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pending Invites Tab */}
            {isTeamLead && (
              <TabsContent value="pending">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>People who have been invited but haven't joined yet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mockPendingInvites.length > 0 ? (
                      <div className="space-y-2">
                        {mockPendingInvites.map((invite) => (
                          <div
                            key={invite.id}
                            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-slate-400" />
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900">{invite.email}</h4>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <span>Invited by {invite.invitedBy}</span>
                                  <span>•</span>
                                  <span>{new Date(invite.invitedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="gap-1">
                                <Clock className="w-3 h-3" />
                                Pending
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2">
                                    <Copy className="w-4 h-4" /> Copy Invite Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <Mail className="w-4 h-4" /> Resend Invitation
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="gap-2 text-red-600">
                                    <XCircle className="w-4 h-4" /> Cancel Invitation
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-300" />
                        <p className="text-slate-600">No pending invitations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join the {mockTeam.name} team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'lead' | 'member')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Member
                    </div>
                  </SelectItem>
                  <SelectItem value="lead">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Team Lead
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {inviteRole === 'lead' 
                  ? 'Team leads can manage members, create projects, and change team settings.'
                  : 'Members can access team projects based on project permissions.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsInviteDialogOpen(false)} disabled={!inviteEmail.trim()}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={isRemoveMemberDialogOpen} onOpenChange={setIsRemoveMemberDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMember?.name} from the {mockTeam.name} team? 
              They will lose access to all team projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                console.log(`Removing ${selectedMember?.name} from team`);
                setIsRemoveMemberDialogOpen(false);
              }}
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BackToTop />
    </div>
  );
}