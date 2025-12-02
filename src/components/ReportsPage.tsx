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
  Filter,
  MoreHorizontal,
  FileDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Trash2,
  Copy
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BackToTop } from "./BackToTop";
import { useAzureAuth } from "../hooks/useAzureAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
import { Checkbox } from "./ui/checkbox";

interface ReportsPageProps {
  onSignOut?: () => void;
}

// Mock data for reports
const mockReports = [
  {
    id: "1",
    name: "Q2 2024 Usability Testing Summary",
    project: "Q2:2026 Usability Testing",
    type: "Executive Summary",
    status: "completed",
    createdAt: "2024-03-15T10:30:00Z",
    format: "PDF",
    size: "2.4 MB"
  },
  {
    id: "2",
    name: "Onboarding Flow Analysis",
    project: "Onboarding Study",
    type: "Detailed Findings",
    status: "completed",
    createdAt: "2024-03-14T14:20:00Z",
    format: "DOCX",
    size: "1.8 MB"
  },
  {
    id: "3",
    name: "NPS Trend Report - March 2024",
    project: "Multiple Projects",
    type: "Trend Analysis",
    status: "generating",
    createdAt: "2024-03-15T16:45:00Z",
    format: "PDF",
    size: "-"
  },
  {
    id: "4",
    name: "Participant Feedback Summary",
    project: "Mobile App Beta",
    type: "Participant Insights",
    status: "failed",
    createdAt: "2024-03-13T09:15:00Z",
    format: "PDF",
    size: "-"
  },
];

const reportTemplates = [
  {
    id: "exec-summary",
    name: "Executive Summary",
    description: "High-level overview with key findings and recommendations",
    icon: FileText,
  },
  {
    id: "detailed-findings",
    name: "Detailed Findings",
    description: "Comprehensive report with all insights and data",
    icon: FileText,
  },
  {
    id: "trend-analysis",
    name: "Trend Analysis",
    description: "NPS and SUS trends across projects over time",
    icon: TrendingUp,
  },
  {
    id: "participant-insights",
    name: "Participant Insights",
    description: "Aggregated feedback and quotes from participants",
    icon: Activity,
  },
];

export function ReportsPage({ onSignOut }: ReportsPageProps) {
  const navigate = useNavigate();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

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
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case "generating":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 gap-1">
            <AlertCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        navItems={navItems}
        activeItem="reports"
        onNavItemClick={handleNavItemClick}
        user={azureAuth.user ?? undefined}
        onSignOut={onSignOut}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      <div className={`min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12 lg:mt-0 mb-8">
            <div>
              <h1 className="text-3xl text-slate-900 mb-2">Reports</h1>
              <p className="text-slate-600">Generate and export research reports</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 sm:shrink-0">
              <Plus className="w-4 h-4" />
              Generate Report
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="generating">Generating</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>{filteredReports.length} reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{report.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span>{report.project}</span>
                          <span>•</span>
                          <span>{report.type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(report.status)}
                      {report.status === "completed" && (
                        <Badge variant="outline">{report.format} • {report.size}</Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {report.status === "completed" && (
                            <>
                              <DropdownMenuItem className="gap-2">
                                <Eye className="w-4 h-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <FileDown className="w-4 h-4" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Copy className="w-4 h-4" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {report.status === "failed" && (
                            <DropdownMenuItem className="gap-2">
                              <Loader2 className="w-4 h-4" /> Retry
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {filteredReports.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-600">No reports found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generate Report Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Choose a template and configure your report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Template Selection */}
            <div className="space-y-3">
              <Label>Report Template</Label>
              <div className="grid grid-cols-2 gap-3">
                {reportTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${selectedTemplate === template.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <h4 className="font-medium text-slate-900">{template.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project Selection */}
            <div className="space-y-2">
              <Label>Select Projects</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose projects to include" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="q2-testing">Q2:2026 Usability Testing</SelectItem>
                  <SelectItem value="onboarding">Onboarding Study</SelectItem>
                  <SelectItem value="mobile-beta">Mobile App Beta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" />
              </div>
            </div>

            {/* Include Options */}
            <div className="space-y-3">
              <Label>Include in Report</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="include-charts" defaultChecked />
                  <label htmlFor="include-charts" className="text-sm">Charts and visualizations</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="include-quotes" defaultChecked />
                  <label htmlFor="include-quotes" className="text-sm">Participant quotes</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="include-recommendations" defaultChecked />
                  <label htmlFor="include-recommendations" className="text-sm">Recommendations</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="include-raw-data" />
                  <label htmlFor="include-raw-data" className="text-sm">Raw data appendix</label>
                </div>
              </div>
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="docx">Word Document (.docx)</SelectItem>
                  <SelectItem value="pptx">PowerPoint (.pptx)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BackToTop />
    </div>
  );
}