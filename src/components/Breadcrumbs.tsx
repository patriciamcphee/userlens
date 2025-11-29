import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
          {item.onClick ? (
            <button
              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline transition-colors font-medium"
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ) : (
            <span className="text-xs text-slate-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}