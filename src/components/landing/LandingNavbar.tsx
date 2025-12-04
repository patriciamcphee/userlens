// src/components/landing/LandingNavbar.tsx
import { Book, HelpCircle, Mail, Menu, LogIn } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { UserLensLogo } from "../UserLensLogo";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

interface LandingNavbarProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function LandingNavbar({ onLogin, onSignUp }: LandingNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationLinks = [
    { icon: Book, label: "User Guide", href: "#user-guide" },
    { icon: HelpCircle, label: "Help Center", href: "#help-center" },
    { icon: Mail, label: "Support", href: "#support" },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and tagline with Beta badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/">
              <UserLensLogo 
                variant="full"
                layout="horizontal"
                size="lg"
                showTagline={true}
              />
            </a>
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
            
            {/* Login / Sign Up buttons */}
            <div className="flex items-center gap-3 ml-2">
              <Button 
                variant="ghost" 
                onClick={onLogin}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                Log in
              </Button>
              <Button 
                onClick={onSignUp}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Up Free
              </Button>
            </div>
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
                <SheetDescription>Explore UserLens Insights features</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
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
                
                {/* Login / Sign Up */}
                <div className="my-2 border-t border-slate-200" />
                <Button
                  variant="ghost"
                  className="gap-3 justify-start"
                  onClick={() => {
                    setIsOpen(false);
                    onLogin();
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  Log in
                </Button>
                <Button
                  className="gap-3 justify-center bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => {
                    setIsOpen(false);
                    onSignUp();
                  }}
                >
                  Sign Up Free
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}