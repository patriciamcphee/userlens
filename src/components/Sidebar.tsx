import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  User, 
  LogOut, 
  Settings, 
  X, 
  Menu,
  HelpCircle,
  FileText,
  Sparkles,
  Bug,
  Lightbulb,
  MessageSquare
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  path?: string;
  isDivider?: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
  activeItem: string;
  onNavItemClick: (id: string) => void;
  user?: {
    name?: string;
    email?: string;
    organizationId?: string;
  };
  onSignOut?: () => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({
  navItems,
  activeItem,
  onNavItemClick,
  user,
  onSignOut,
  isCollapsed: externalCollapsed,
  onCollapsedChange,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();

  const isCollapsed = externalCollapsed ?? internalCollapsed;
  const setIsCollapsed = onCollapsedChange ?? setInternalCollapsed;

  const helpLinks = [
    { id: "docs", label: "User Guide", icon: FileText, href: "#docs" },
    { id: "whats-new", label: "What's New", icon: Sparkles, href: "#whats-new" },
    { id: "report-issue", label: "Report Issue", icon: Bug, href: "#report-issue" },
    { id: "submit-idea", label: "Submit Idea", icon: Lightbulb, href: "#submit-idea" },
    { id: "give-feedback", label: "Give Feedback", icon: MessageSquare, href: "#give-feedback" },
  ];

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-[84px] left-4 z-30">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        bg-white border-r border-slate-200 flex flex-col transition-all duration-300
        fixed left-0 z-50 overflow-y-auto overflow-x-hidden
        top-[72px] bottom-0
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        ${isMobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden absolute top-2 right-2 z-20 p-2 hover:bg-slate-100 rounded-lg"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Main Navigation */}
        <div className={`flex-1 pt-10 lg:pt-8 ${isCollapsed ? 'px-2 pb-2' : 'px-4 pb-4'}`}>
          <nav className="space-y-1">
            {navItems.map((item) => {
              // Render divider
              if (item.isDivider) {
                return (
                  <div key={item.id} className={`${isCollapsed ? 'px-1' : 'px-0'} py-2`}>
                    <div className="border-t border-slate-200"></div>
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavItemClick(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-700 hover:bg-slate-50'
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && item.count !== undefined && item.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation */}
        <div className={`border-t border-slate-200 ${isCollapsed ? 'px-2 py-4' : 'p-4'}`}>
          <nav className="space-y-1">
            {/* Help Section - Collapsible when expanded, Dropdown when collapsed */}
            {isCollapsed ? (
              // Collapsed: Show dropdown menu
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-sm transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    title="Help"
                  >
                    <HelpCircle className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="right" className="w-48">
                  {helpLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <DropdownMenuItem key={link.id} asChild>
                        <a href={link.href} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="w-4 h-4" />
                          {link.label}
                        </a>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Expanded: Show collapsible section
              <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      <span>Help</span>
                    </div>
                    {isHelpOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 ml-4 space-y-1">
                  {helpLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.id}
                        href={link.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        onClick={() => setIsMobileSidebarOpen(false)}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                        <span>{link.label}</span>
                      </a>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* User Menu */}
            <div className={`pt-2 mt-2 border-t border-slate-100 ${isCollapsed ? 'flex justify-center' : ''}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`
                      flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3 py-2 w-full'} rounded-lg text-sm transition-colors
                      text-slate-700 hover:bg-slate-50
                    `}
                    title={isCollapsed ? user?.name || "User" : undefined}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-indigo-700" />
                    </div>
                    {!isCollapsed && (
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium truncate">{user?.name || "User"}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isCollapsed ? "center" : "end"} side="top" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || ""}
                      </p>
                      {user?.organizationId && (
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          Org: {user.organizationId}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </div>

      {/* Collapse/Expand Button - Desktop only */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex fixed top-[96px] z-[60] w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all items-center justify-center"
        style={{ left: isCollapsed ? '52px' : '244px' }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-slate-600" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-slate-600" />
        )}
      </button>
    </>
  );
}