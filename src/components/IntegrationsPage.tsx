import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
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
  CheckCircle2,
  ExternalLink,
  Settings,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Zap
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface IntegrationsPageProps {
  onSignOut?: () => void;
}

// Integration definitions
const integrations = {
  connected: [
    {
      id: "slack",
      name: "Slack",
      description: "Get notified about session completions and insights",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg",
      category: "Communication",
      status: "connected",
      connectedAt: "2024-02-15",
      lastSync: "2 minutes ago"
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Automatically backup recordings and exports",
      icon: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
      category: "Storage",
      status: "connected",
      connectedAt: "2024-01-20",
      lastSync: "1 hour ago"
    },
  ],
  available: [
    {
      id: "jira",
      name: "Jira",
      description: "Create issues from research insights",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg",
      category: "Project Management",
      popular: true
    },
    {
      id: "notion",
      name: "Notion",
      description: "Sync notes and findings to Notion pages",
      icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
      category: "Documentation",
      popular: true
    },
    {
      id: "figma",
      name: "Figma",
      description: "Link insights to Figma designs",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
      category: "Design",
      popular: true
    },
    {
      id: "microsoft-teams",
      name: "Microsoft Teams",
      description: "Get notifications and updates in Teams",
      icon: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg",
      category: "Communication"
    },
    {
      id: "asana",
      name: "Asana",
      description: "Create tasks from research findings",
      icon: "https://cdn.worldvectorlogo.com/logos/asana-logo.svg",
      category: "Project Management"
    },
    {
      id: "linear",
      name: "Linear",
      description: "File issues directly from insights",
      icon: "https://linear.app/static/logo.svg",
      category: "Project Management"
    },
    {
      id: "airtable",
      name: "Airtable",
      description: "Sync participant data with Airtable bases",
      icon: "https://cdn.worldvectorlogo.com/logos/airtable.svg",
      category: "Database"
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect to 5,000+ apps via Zapier",
      icon: "https://cdn.worldvectorlogo.com/logos/zapier.svg",
      category: "Automation",
      popular: true
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Store recordings and exports in Dropbox",
      icon: "https://cdn.worldvectorlogo.com/logos/dropbox-1.svg",
      category: "Storage"
    },
    {
      id: "calendly",
      name: "Calendly",
      description: "Schedule research sessions via Calendly",
      icon: "https://cdn.worldvectorlogo.com/logos/calendly-1.svg",
      category: "Scheduling"
    },
    {
      id: "zoom",
      name: "Zoom",
      description: "Record and transcribe Zoom sessions",
      icon: "https://cdn.worldvectorlogo.com/logos/zoom-communications-logo.svg",
      category: "Video"
    },
    {
      id: "intercom",
      name: "Intercom",
      description: "Import user feedback from Intercom",
      icon: "https://cdn.worldvectorlogo.com/logos/intercom-1.svg",
      category: "Support"
    },
  ]
};

const categories = [
  "All",
  "Communication",
  "Project Management",
  "Documentation",
  "Design",
  "Storage",
  "Automation",
  "Scheduling",
  "Video",
  "Support",
  "Database"
];

export function IntegrationsPage({ onSignOut }: IntegrationsPageProps) {
  const navigate = useNavigate();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<typeof integrations.available[0] | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedConnectedIntegration, setSelectedConnectedIntegration] = useState<typeof integrations.connected[0] | null>(null);

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

  const filteredIntegrations = integrations.available.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConnect = (integration: typeof integrations.available[0]) => {
    setSelectedIntegration(integration);
    setIsConnectDialogOpen(true);
  };

  const handleOpenSettings = (integration: typeof integrations.connected[0]) => {
    setSelectedConnectedIntegration(integration);
    setIsSettingsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        navItems={navItems}
        activeItem="integrations"
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
              <h1 className="text-3xl text-slate-900 mb-2">Integrations</h1>
              <p className="text-slate-600">Connect UserLens with your favorite tools</p>
            </div>
          </div>

          {/* Connected Integrations */}
          {integrations.connected.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Connected
                </CardTitle>
                <CardDescription>{integrations.connected.length} integrations active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {integrations.connected.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-green-50/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-2 flex items-center justify-center">
                          <img 
                            src={integration.icon} 
                            alt={integration.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><rect width="24" height="24" rx="4"/></svg>';
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{integration.name}</h3>
                          <p className="text-sm text-slate-500">{integration.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span>Last synced: {integration.lastSync}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Connected
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenSettings(integration)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>Browse and connect new integrations</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search integrations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Popular Section */}
              {selectedCategory === "All" && searchQuery === "" && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Popular
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {integrations.available.filter(i => i.popular).map((integration) => (
                      <div
                        key={integration.id}
                        className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 p-1.5 flex items-center justify-center">
                            <img 
                              src={integration.icon} 
                              alt={integration.name}
                              className="w-7 h-7 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><rect width="24" height="24" rx="4"/></svg>';
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{integration.name}</h4>
                            <p className="text-xs text-slate-500">{integration.category}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">{integration.description}</p>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleConnect(integration)}
                        >
                          Connect
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Integrations Grid */}
              <div>
                {(selectedCategory !== "All" || searchQuery !== "") && (
                  <h3 className="text-sm font-medium text-slate-500 mb-4">
                    {filteredIntegrations.length} integration{filteredIntegrations.length !== 1 ? 's' : ''}
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIntegrations.filter(i => selectedCategory !== "All" || searchQuery !== "" || !i.popular).map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 p-1.5 flex items-center justify-center">
                          <img 
                            src={integration.icon} 
                            alt={integration.name}
                            className="w-7 h-7 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><rect width="24" height="24" rx="4"/></svg>';
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{integration.name}</h4>
                          <p className="text-xs text-slate-500">{integration.category}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConnect(integration)}
                      >
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>

                {filteredIntegrations.length === 0 && (
                  <div className="text-center py-12">
                    <Plug className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-600">No integrations found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Request Integration */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900">Don't see what you need?</h3>
                  <p className="text-sm text-slate-500">Request a new integration and we'll consider adding it</p>
                </div>
                <Button variant="outline">
                  Request Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Connect Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedIntegration && (
                <div className="w-10 h-10 rounded-lg bg-slate-100 p-1.5 flex items-center justify-center">
                  <img 
                    src={selectedIntegration.icon} 
                    alt={selectedIntegration.name}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><rect width="24" height="24" rx="4"/></svg>';
                    }}
                  />
                </div>
              )}
              Connect {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">This integration will:</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Access your UserLens workspace
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Read project and participant data
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Send notifications and updates
                </li>
              </ul>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                You'll be redirected to {selectedIntegration?.name} to authorize this connection.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsConnectDialogOpen(false)} className="gap-2">
              Continue to {selectedIntegration?.name}
              <ExternalLink className="w-4 h-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedConnectedIntegration && (
                <div className="w-10 h-10 rounded-lg bg-slate-100 p-1.5 flex items-center justify-center">
                  <img 
                    src={selectedConnectedIntegration.icon} 
                    alt={selectedConnectedIntegration.name}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><rect width="24" height="24" rx="4"/></svg>';
                    }}
                  />
                </div>
              )}
              {selectedConnectedIntegration?.name} Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">Enable Integration</h4>
                <p className="text-sm text-slate-500">Toggle to pause or resume sync</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-slate-900 mb-3">Notification Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Session completed</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">New participant added</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Report generated</span>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Connected on</span>
                <span className="text-slate-900">{selectedConnectedIntegration?.connectedAt}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-500">Last synced</span>
                <span className="text-slate-900">{selectedConnectedIntegration?.lastSync}</span>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Sync Now
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
                Disconnect
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BackToTop />
    </div>
  );
}