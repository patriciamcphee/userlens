import { Button } from "../ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      await onGetStarted();
    } finally {
      // Keep loading state if navigating away
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 sm:py-32">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 mb-8">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm text-indigo-900">Transforming User Research</span>
          </div>
          
          <h1 className="mx-auto max-w-4xl">
            Turn User Interviews Into
            <span className="block text-indigo-600 mt-2">Actionable Insights</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            ParticipantLens streamlines your user research workflow with AI-powered synthesis, 
            collaborative affinity mapping, and real-time insights. Spend less time organizing, 
            more time understanding your users.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted} 
              disabled={isLoading}
              className="gap-2 w-full sm:w-auto"
            >
              {isLoading ? "Loading..." : "Get Started Free"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <a href="#pricing">View Pricing</a>
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-slate-500">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
        
        {/* Hero Image/Screenshot Placeholder */}
        <div className="mt-16 relative">
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
            <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 aspect-video flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl font-bold">UL</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-900">ParticipantLens Dashboard</span>
                  </div>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Interactive synthesis boards, participant tracking, and real-time collaboration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
