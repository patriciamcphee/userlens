// components/Navigation/Breadcrumbs.tsx
import React from 'react';
import { ChevronRight, Home, FolderOpen, Users, Play, BarChart3, Settings } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const getIcon = (icon?: React.ComponentType<{ className?: string }>) => {
    if (!icon) return null;
    const Icon = icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <nav 
      aria-label="Breadcrumb navigation"
      className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}
    >
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
          )}
          
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={`flex items-center space-x-2 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1 py-0.5 ${
                item.isActive ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {getIcon(item.icon)}
              <span className="truncate max-w-[200px]">{item.label}</span>
            </button>
          ) : (
            <span 
              className={`flex items-center space-x-2 ${
                item.isActive ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {getIcon(item.icon)}
              <span className="truncate max-w-[200px]">{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Predefined breadcrumb builders for common navigation patterns
export const BreadcrumbBuilders = {
  dashboard: (): BreadcrumbItem[] => [
    {
      label: 'Dashboard',
      icon: Home,
      isActive: true
    }
  ],

  createProject: (onDashboardClick: () => void): BreadcrumbItem[] => [
    {
      label: 'Dashboard',
      icon: Home,
      onClick: onDashboardClick
    },
    {
      label: 'Create Project',
      icon: FolderOpen,
      isActive: true
    }
  ],

  editProject: (projectName: string, onDashboardClick: () => void, onProjectClick?: () => void): BreadcrumbItem[] => [
    {
      label: 'Dashboard',
      icon: Home,
      onClick: onDashboardClick
    },
    {
      label: projectName,
      icon: FolderOpen,
      onClick: onProjectClick
    },
    {
      label: 'Edit Project',
      icon: Settings,
      isActive: true
    }
  ],

  projectDetail: (projectName: string, onDashboardClick: () => void): BreadcrumbItem[] => [
    {
      label: 'Dashboard',
      icon: Home,
      onClick: onDashboardClick
    },
    {
      label: projectName,
      icon: FolderOpen,
      isActive: true
    }
  ],

  projectAnalytics: (projectName: string, onDashboardClick: () => void, onProjectClick: () => void): BreadcrumbItem[] => [
    {
      label: 'Dashboard',
      icon: Home,
      onClick: onDashboardClick
    },
    {
      label: projectName,
      icon: FolderOpen,
      onClick: onProjectClick
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      isActive: true
    }
  ],

  runSession: (projectName: string, participantName: string, onDashboardClick: () => void, onProjectClick?: () => void): BreadcrumbItem[] => [
    {
      label: 'Dashboard',
      icon: Home,
      onClick: onDashboardClick
    },
    {
      label: projectName,
      icon: FolderOpen,
      onClick: onProjectClick
    },
    {
      label: `Session: ${participantName}`,
      icon: Play,
      isActive: true
    }
  ],

  participants: (onDashboardClick: () => void): BreadcrumbItem[] => [
    {
      label: 'Dashboard',
      icon: Home,
      onClick: onDashboardClick
    },
    {
      label: 'Participants',
      icon: Users,
      isActive: true
    }
  ]
};