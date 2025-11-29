import { Button } from "../ui/button";
import { ParticipantLensLogo } from "../ParticipantLensLogo";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface LandingNavbarProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function LandingNavbar({ onLogin, onSignUp }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Docs", href: "#docs" },
    { name: "Blog", href: "#blog" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <ParticipantLensLogo variant="full" layout="horizontal" size="md" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm text-slate-700 hover:text-slate-900 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" onClick={onLogin}>
              Log in
            </Button>
            <Button onClick={onSignUp}>
              Sign up free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-slate-700 hover:text-slate-900 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 space-y-2 border-t border-slate-200">
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => {
                    onLogin();
                    setMobileMenuOpen(false);
                  }}
                >
                  Log in
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => {
                    onSignUp();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign up free
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
