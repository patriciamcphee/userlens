import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Construction, ArrowLeft, FileText, Activity, Tag, Calendar, Download, Plug } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BackToTop } from "./BackToTop";
import { useAzureAuth } from "../hooks/useAzureAuth";
import { useState } from "react";
import { LayoutGrid, TrendingUp } from "lucide-react";

interface ComingSoonProps {
  onSignOut?: () => void;
}

const featureInfo: Record<string, { title: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
  reports: {
    title: "Reports",
    description: "Generate and export comprehensive research reports with insights, findings, and recommendations from your projects.",
    icon: FileText,
  },
  activity: {
    title: "Activity",
    description: "Track recent activity across all your projects including participant sessions, team updates, and synthesis progress.",
    icon: Activity,
  },
  tags: {
    title: "Tags",
    description: "Manage and organize tags used across your research projects for better categorization and filtering.",
    icon: Tag,
  },
  calendar: {
    title: "Calendar",
    description: "View and schedule research sessions across all projects in a unified calendar view.",
    icon: Calendar,
  },
  "import-export": {
    title: "Import/Export",
    description: "Bulk import participants, export research data, and manage data transfers between systems.",
    icon: Download,
  },
  integrations: {
    title: "Integrations",
    description: "Connect UserLens with your favorite tools like Slack, Jira, Notion, and more.",
    icon: Plug,
  },
};

export function ComingSoon({ onSignOut }: ComingSoonProps) {
  const { feature } = useParams<{ feature: string }>();
  const navigate = useNavigate();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const info = feature ? featureInfo[feature] : null;
  const FeatureIcon = info?.icon || Construction;

  // Sidebar navigation items (same as Dashboard)
  const navItems = [
    { id: "projects", label: "Projects", icon: LayoutGrid },
    { id: "trends", label: "Trend Analysis", icon: TrendingUp },
    { id: "divider-1", label: "", icon: () => null, isDivider: true },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "divider-2", label: "", icon: () => null, isDivider: true },
//    { id: "tags", label: "Tags", icon: Tag },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "divider-3", label: "", icon: () => null, isDivider: true },
    { id: "import-export", label: "Import/Export", icon: Download },
    { id: "integrations", label: "Integrations", icon: Plug },
  ];

  const handleNavItemClick = (id: string) => {
    if (id.startsWith("divider")) return;
    
    if (id === "projects" || id === "trends") {
      navigate("/app");
    } else {
      navigate(`/app/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        activeItem={feature || ""}
        onNavItemClick={handleNavItemClick}
        user={azureAuth.user ?? undefined}
        onSignOut={onSignOut}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`
        min-h-screen transition-all duration-300
        ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        <div className="max-w-4xl mx-auto px-6 py-12 mt-12 lg:mt-0">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/app")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <Card className="text-center py-16">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <FeatureIcon className="w-10 h-10 text-indigo-600" />
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Construction className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-amber-600 uppercase tracking-wide">Coming Soon</span>
              </div>
              
              <h1 className="text-2xl font-semibold text-slate-900 mb-3">
                {info?.title || "Feature Coming Soon"}
              </h1>
              
              <p className="text-slate-600 max-w-md mx-auto mb-8">
                {info?.description || "We're working hard to bring you this feature. Stay tuned for updates!"}
              </p>

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={() => navigate("/app")}>
                  Return to Dashboard
                </Button>
                <Button onClick={() => window.open("mailto:support@userlens.io?subject=Feature Request: " + (info?.title || feature), "_blank")}>
                  Request Early Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}