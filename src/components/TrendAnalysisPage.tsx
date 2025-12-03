import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Filter, X, LayoutGrid, TrendingUp, FileText, Activity, Tag, Calendar, Download, Plug, BarChart3 } from "lucide-react";
import { Project } from "../types";
import { NPSTrendAnalysis } from "./NPSTrendAnalysis";
import { SUSTrendAnalysis } from "./SUSTrendAnalysis";
import { Sidebar } from "./Sidebar";
import { BackToTop } from "./BackToTop";
import { useAzureAuth } from "../hooks/useAzureAuth";

interface TrendAnalysisPageProps {
  projects: Project[];
  onSignOut?: () => void;
}

export function TrendAnalysisPage({ projects, onSignOut }: TrendAnalysisPageProps) {
  const navigate = useNavigate();
  const azureAuth = useAzureAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");

  // Get active and completed projects for trend analysis
  const activeAndCompletedProjects = projects.filter(p => 
    p.status === 'active' || p.status === 'completed'
  );

  // Get all unique tags from active and completed projects
  const allTags = new Set<string>();
  activeAndCompletedProjects.forEach(proj => {
    proj.tags?.forEach(tag => allTags.add(tag));
  });
  const uniqueTags = Array.from(allTags).sort();

  // Get projects with the selected tag
  const getProjectsByTag = (tag: string): Project[] => {
    return activeAndCompletedProjects.filter(proj => proj.tags?.includes(tag));
  };

  const projectsForTrend = selectedTag 
    ? getProjectsByTag(selectedTag)
    : [];

  // Sidebar navigation items for Dashboard
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
    } else if (id === "trends") {
      // Already on trends page
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(`/app/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        activeItem="trends"
        onNavItemClick={handleNavItemClick}
        user={azureAuth.user || undefined}
        onSignOut={onSignOut}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`
        min-h-screen transition-all duration-300
        ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12 lg:mt-0">
            <div>
              <h1 className="text-3xl text-slate-900 mb-2">Trend Analysis</h1>
              <p className="text-slate-600">Track NPS and SUS scores across your research projects</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {uniqueTags.length > 0 ? (
            <>
              {/* Tag Filter */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter by Tag
                  </CardTitle>
                  <CardDescription>
                    Select a tag to view NPS and SUS trends for all participants in all Active and Completed projects with that tag
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {uniqueTags.map(tag => (
                      <Button
                        key={tag}
                        variant={selectedTag === tag ? "default" : "outline"}
                        onClick={() => setSelectedTag(tag)}
                        size="sm"
                      >
                        {tag}
                      </Button>
                    ))}
                    {selectedTag && (
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedTag("")}
                        size="sm"
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Clear Filter
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Trend Charts */}
              <div className="space-y-6" key={selectedTag}>
                <NPSTrendAnalysis 
                  projects={projectsForTrend}
                  filterTag={selectedTag}
                />

                <SUSTrendAnalysis 
                  projects={projectsForTrend}
                  filterTag={selectedTag}
                />
              </div>
            </>
          ) : (
            /* Empty State */
            <Card className="text-center py-12">
              <CardContent>
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-slate-900 mb-2">No trend data available</h3>
                <p className="text-slate-600 mb-6">
                  Add tags to your active or completed projects to enable trend analysis across projects.
                </p>
                <Button onClick={() => navigate("/app")} variant="outline">
                  Go to Projects
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}