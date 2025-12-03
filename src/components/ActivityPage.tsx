import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  Search,
  Filter,
  User,
  Users,
  MessageSquare,
  CheckCircle2,
  Play,
  FileUp,
  Settings,
  Trash2,
  Edit,
  Plus,
  Clock,
  ChevronRight
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BackToTop } from "./BackToTop";
import { useAzureAuth } from "../hooks/useAzureAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ActivityPageProps {
  onSignOut?: () => void;
}

// Mock activity data
const mockActivities = [
  {
    id: "1",
    type: "session_completed",
    icon: CheckCircle2,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    title: "Session completed",
    description: "Participant P-0042 completed all tasks",
    project: "Q2:2026 Usability Testing",
    user: "System",
    timestamp: "2024-03-15T16:45:00Z",
    timeAgo: "2 minutes ago"
  },
  {
    id: "2",
    type: "participant_added",
    icon: Users,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    title: "Participant added",
    description: "3 new participants imported from CSV",
    project: "Onboarding Study",
    user: "Sarah Chen",
    timestamp: "2024-03-15T16:30:00Z",
    timeAgo: "17 minutes ago"
  },
  {
    id: "3",
    type: "note_added",
    icon: MessageSquare,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    title: "Note added",
    description: "New insight tagged with 'pain-point' and 'navigation'",
    project: "Mobile App Beta",
    user: "Mike Johnson",
    timestamp: "2024-03-15T15:20:00Z",
    timeAgo: "1 hour ago"
  },
  {
    id: "4",
    type: "session_started",
    icon: Play,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100",
    title: "Session started",
    description: "Participant P-0041 began unmoderated session",
    project: "Q2:2026 Usability Testing",
    user: "System",
    timestamp: "2024-03-15T14:45:00Z",
    timeAgo: "2 hours ago"
  },
  {
    id: "5",
    type: "task_created",
    icon: Plus,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    title: "Task created",
    description: "New task 'Complete checkout flow' added",
    project: "Onboarding Study",
    user: "Sarah Chen",
    timestamp: "2024-03-15T14:00:00Z",
    timeAgo: "3 hours ago"
  },
  {
    id: "6",
    type: "project_updated",
    icon: Edit,
    iconColor: "text-slate-600",
    iconBg: "bg-slate-100",
    title: "Project updated",
    description: "Status changed from Draft to Active",
    project: "Accessibility Audit",
    user: "Sarah Chen",
    timestamp: "2024-03-15T11:30:00Z",
    timeAgo: "5 hours ago"
  },
  {
    id: "7",
    type: "report_generated",
    icon: FileText,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-100",
    title: "Report generated",
    description: "Executive Summary report completed",
    project: "Mobile App Beta",
    user: "System",
    timestamp: "2024-03-15T10:15:00Z",
    timeAgo: "6 hours ago"
  },
  {
    id: "8",
    type: "file_uploaded",
    icon: FileUp,
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-100",
    title: "File uploaded",
    description: "Recording 'session-041.mp4' uploaded",
    project: "Q2:2026 Usability Testing",
    user: "System",
    timestamp: "2024-03-15T09:00:00Z",
    timeAgo: "8 hours ago"
  },
  {
    id: "9",
    type: "settings_changed",
    icon: Settings,
    iconColor: "text-gray-600",
    iconBg: "bg-gray-100",
    title: "Settings updated",
    description: "Recording settings changed to 'Camera Required'",
    project: "Onboarding Study",
    user: "Mike Johnson",
    timestamp: "2024-03-14T17:30:00Z",
    timeAgo: "Yesterday"
  },
  {
    id: "10",
    type: "participant_removed",
    icon: Trash2,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    title: "Participant removed",
    description: "Duplicate participant P-0039 removed",
    project: "Mobile App Beta",
    user: "Sarah Chen",
    timestamp: "2024-03-14T14:20:00Z",
    timeAgo: "Yesterday"
  },
];

const activityTypes = [
  { value: "all", label: "All Activity" },
  { value: "session", label: "Sessions" },
  { value: "participant", label: "Participants" },
  { value: "note", label: "Notes & Insights" },
  { value: "project", label: "Project Updates" },
  { value: "report", label: "Reports" },
];

export function ActivityPage({ onSignOut }: ActivityPageProps) {
  const navigate = useNavigate();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

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

  // Group activities by date
  const groupedActivities = mockActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof mockActivities>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        navItems={navItems}
        activeItem="activity"
        onNavItemClick={handleNavItemClick}
        user={azureAuth.user ?? undefined}
        onSignOut={onSignOut}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      <div className={`min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-5xl mx-auto px-6 pt-6 pb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12 lg:mt-0 mb-8">
            <div>
              <h1 className="text-3xl text-slate-900 mb-2">Activity</h1>
              <p className="text-slate-600">Recent activity across all your projects</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search activity..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="q2-testing">Q2:2026 Usability Testing</SelectItem>
                    <SelectItem value="onboarding">Onboarding Study</SelectItem>
                    <SelectItem value="mobile-beta">Mobile App Beta</SelectItem>
                    <SelectItem value="accessibility">Accessibility Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <div className="space-y-8">
            {Object.entries(groupedActivities).map(([date, activities]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-slate-500 mb-4">{date}</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-1">
                      {activities.map((activity, index) => {
                        const Icon = activity.icon;
                        return (
                          <div key={activity.id}>
                            <div className="flex items-start gap-4 py-4 hover:bg-slate-50 rounded-lg px-3 -mx-3 transition-colors cursor-pointer group">
                              <div className={`w-10 h-10 rounded-full ${activity.iconBg} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-medium text-slate-900">{activity.title}</h4>
                                  <span className="text-xs text-slate-400 flex-shrink-0">{activity.timeAgo}</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-0.5">{activity.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <LayoutGrid className="w-3 h-3" />
                                    {activity.project}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {activity.user}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0 mt-3" />
                            </div>
                            {index < activities.length - 1 && (
                              <div className="border-t border-slate-100 ml-14" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline">Load More Activity</Button>
          </div>
        </div>
      </div>

      <BackToTop />
    </div>
  );
}