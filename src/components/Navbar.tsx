// src/components/Navbar.tsx
import { Badge } from "./ui/badge";
import { ParticipantLensLogo } from "./ParticipantLensLogo";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-[100] bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and tagline with Beta badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/app">
              <ParticipantLensLogo 
                variant="full"
                layout="horizontal"
                size="lg"
                showTagline={true}
              />
            </Link>
            <Badge variant="secondary" className="h-4 -mt-8 -ml-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 hidden sm:flex">
              Beta
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  );
}