// src/components/Navbar.tsx
import { Book, HelpCircle, Mail, Menu, LogOut, User, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ParticipantLensLogo } from "./ParticipantLensLogo";
import { useAzureAuth } from "../hooks/useAzureAuth";
import { isAzureAuthEnabled } from "../utils/azure/authConfig";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface NavbarProps {
  onSignOut?: () => void;
}

export function Navbar({ onSignOut }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const azureAuth = useAzureAuth();
  const user = azureAuth.user;

  const navigationLinks = [
    { icon: Book, label: "User Guide", href: "#user-guide" },
    { icon: HelpCircle, label: "Help Center", href: "#help-center" },
    { icon: Mail, label: "Support", href: "#support" },
  ];

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

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
            <Badge variant="secondary" className="h-4 -mt-8 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 hidden sm:flex">
              Beta
            </Badge>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {navigationLinks.map((link) => (
              <Button 
                key={link.href}
                variant="ghost" 
                className="gap-2 text-slate-700 hover:text-slate-900"
                asChild
              >
                <a href={link.href}>
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </a>
              </Button>
            ))}
            
            {/* User Menu - Always shown since user must be logged in */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-700" />
                  </div>
                  <span className="hidden lg:inline text-slate-700">
                    {user?.name || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/app/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Navigation - Sheet/Drawer */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="gap-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>UserLens Navigation</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                {/* User info */}
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-600">{user?.email || ""}</p>
                  {user?.organizationId && (
                    <p className="text-xs text-slate-600 mt-1">
                      Org: {user.organizationId}
                    </p>
                  )}
                </div>
                
                {/* Navigation links */}
                {navigationLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="gap-3 justify-start text-slate-700 hover:text-slate-900"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <a href={link.href}>
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </a>
                  </Button>
                ))}
                
                {/* Settings */}
                <Button
                  variant="ghost"
                  className="gap-3 justify-start text-slate-700 hover:text-slate-900"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/app/settings">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </Button>
                
                {/* Sign Out */}
                <div className="my-2 border-t border-slate-200" />
                <Button
                  variant="ghost"
                  className="gap-3 justify-start text-red-600 hover:text-red-700"
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}