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
  Upload,
  FileUp,
  FileDown,
  Users,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  File,
  FileSpreadsheet,
  Archive,
  Trash2,
  Eye
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BackToTop } from "./BackToTop";
import { useAzureAuth } from "../hooks/useAzureAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

interface ImportExportPageProps {
  onSignOut?: () => void;
}

// Mock import history
const mockImportHistory = [
  {
    id: "1",
    filename: "participants_march_2024.csv",
    type: "Participants",
    records: 45,
    status: "completed",
    date: "2024-03-15T10:30:00Z",
    user: "Sarah Chen"
  },
  {
    id: "2",
    filename: "survey_responses.xlsx",
    type: "Survey Data",
    records: 128,
    status: "completed",
    date: "2024-03-14T14:20:00Z",
    user: "Mike Johnson"
  },
  {
    id: "3",
    filename: "user_feedback.csv",
    type: "Notes",
    records: 0,
    status: "failed",
    date: "2024-03-13T09:15:00Z",
    user: "Sarah Chen",
    error: "Invalid column headers"
  },
];

const mockExportHistory = [
  {
    id: "1",
    name: "Q2 Usability Testing - Full Export",
    type: "Project Data",
    format: "ZIP",
    size: "24.5 MB",
    status: "completed",
    date: "2024-03-15T16:00:00Z",
    user: "Sarah Chen"
  },
  {
    id: "2",
    name: "All Participants - March 2024",
    type: "Participants",
    format: "CSV",
    size: "156 KB",
    status: "completed",
    date: "2024-03-14T11:30:00Z",
    user: "Mike Johnson"
  },
  {
    id: "3",
    name: "Session Recordings Backup",
    type: "Media",
    format: "ZIP",
    size: "2.1 GB",
    status: "processing",
    date: "2024-03-15T17:00:00Z",
    user: "Sarah Chen"
  },
];

export function ImportExportPage({ onSignOut }: ImportExportPageProps) {
  const navigate = useNavigate();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("import");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1">
            <Clock className="w-3 h-3" />
            Processing
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        navItems={navItems}
        activeItem="import-export"
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
              <h1 className="text-3xl text-slate-900 mb-2">Import / Export</h1>
              <p className="text-slate-600">Manage your data imports and exports</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="import" className="gap-2">
                <Upload className="w-4 h-4" />
                Import
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </TabsTrigger>
            </TabsList>

            {/* Import Tab */}
            <TabsContent value="import" className="space-y-6">
              {/* Upload Area */}
              <Card>
                <CardHeader>
                  <CardTitle>Import Data</CardTitle>
                  <CardDescription>Upload CSV or Excel files to import participants, notes, or survey data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    className={`
                      border-2 border-dashed rounded-lg p-12 text-center transition-colors
                      ${dragActive 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-slate-300 hover:border-slate-400'
                      }
                    `}
                  >
                    <FileUp className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      Drag and drop files here
                    </h3>
                    <p className="text-slate-500 mb-4">or click to browse</p>
                    <Button onClick={() => setIsImportDialogOpen(true)}>
                      Select Files
                    </Button>
                    <p className="text-xs text-slate-400 mt-4">
                      Supported formats: CSV, XLSX, XLS (max 50MB)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Import Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Import Templates</CardTitle>
                  <CardDescription>Download templates to ensure correct formatting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium text-slate-900">Participants</p>
                          <p className="text-xs text-slate-500">CSV Template</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium text-slate-900">Survey Data</p>
                          <p className="text-xs text-slate-500">CSV Template</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium text-slate-900">Notes</p>
                          <p className="text-xs text-slate-500">CSV Template</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Import History */}
              <Card>
                <CardHeader>
                  <CardTitle>Import History</CardTitle>
                  <CardDescription>Recent imports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockImportHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <File className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{item.filename}</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span>{item.type}</span>
                              <span>•</span>
                              <span>{item.records} records</span>
                              <span>•</span>
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                            </div>
                            {item.error && (
                              <p className="text-xs text-red-600 mt-1">{item.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-6">
              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Export</CardTitle>
                  <CardDescription>Export your research data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setIsExportDialogOpen(true)}
                      className="p-6 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <FolderOpen className="w-8 h-8 text-indigo-600 mb-3" />
                      <h3 className="font-medium text-slate-900 mb-1">Project Data</h3>
                      <p className="text-xs text-slate-500">Export all data from selected projects</p>
                    </button>
                    <button
                      onClick={() => setIsExportDialogOpen(true)}
                      className="p-6 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <Users className="w-8 h-8 text-green-600 mb-3" />
                      <h3 className="font-medium text-slate-900 mb-1">Participants</h3>
                      <p className="text-xs text-slate-500">Export participant list and responses</p>
                    </button>
                    <button
                      onClick={() => setIsExportDialogOpen(true)}
                      className="p-6 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <FileText className="w-8 h-8 text-purple-600 mb-3" />
                      <h3 className="font-medium text-slate-900 mb-1">Notes & Insights</h3>
                      <p className="text-xs text-slate-500">Export tagged notes and synthesis</p>
                    </button>
                    <button
                      onClick={() => setIsExportDialogOpen(true)}
                      className="p-6 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <Archive className="w-8 h-8 text-amber-600 mb-3" />
                      <h3 className="font-medium text-slate-900 mb-1">Full Backup</h3>
                      <p className="text-xs text-slate-500">Complete workspace backup</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Export History */}
              <Card>
                <CardHeader>
                  <CardTitle>Export History</CardTitle>
                  <CardDescription>Recent exports (available for 30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockExportHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <FileDown className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{item.name}</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span>{item.type}</span>
                              <span>•</span>
                              <span>{item.format}</span>
                              <span>•</span>
                              <span>{item.size}</span>
                              <span>•</span>
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(item.status)}
                          {item.status === "completed" && (
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Configure your import settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Data Type</Label>
              <Select defaultValue="participants">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participants">Participants</SelectItem>
                  <SelectItem value="notes">Notes & Insights</SelectItem>
                  <SelectItem value="survey">Survey Responses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Project</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q2-testing">Q2:2026 Usability Testing</SelectItem>
                  <SelectItem value="onboarding">Onboarding Study</SelectItem>
                  <SelectItem value="mobile-beta">Mobile App Beta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="skip-duplicates" defaultChecked />
                  <label htmlFor="skip-duplicates" className="text-sm">Skip duplicate records</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="validate-emails" defaultChecked />
                  <label htmlFor="validate-emails" className="text-sm">Validate email addresses</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="send-notifications" />
                  <label htmlFor="send-notifications" className="text-sm">Send notification when complete</label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsImportDialogOpen(false)}>
              Start Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Configure your export settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Projects</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="q2-testing">Q2:2026 Usability Testing</SelectItem>
                  <SelectItem value="onboarding">Onboarding Study</SelectItem>
                  <SelectItem value="mobile-beta">Mobile App Beta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" />
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Include</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="include-participants" defaultChecked />
                  <label htmlFor="include-participants" className="text-sm">Participants</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="include-notes" defaultChecked />
                  <label htmlFor="include-notes" className="text-sm">Notes & Insights</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="include-recordings" />
                  <label htmlFor="include-recordings" className="text-sm">Session Recordings</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="include-reports" defaultChecked />
                  <label htmlFor="include-reports" className="text-sm">Generated Reports</label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select defaultValue="zip">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zip">ZIP Archive</SelectItem>
                  <SelectItem value="csv">CSV Files</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsExportDialogOpen(false)}>
              Start Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BackToTop />
    </div>
  );
}