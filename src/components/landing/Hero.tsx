// src/components/landing/Hero.tsx
import { Button } from "../ui/button";
import { ArrowRight, Play, Users, Lightbulb, FileText, ListTodo, LayoutDashboard, CheckCircle2 } from "lucide-react";
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
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32" style={{ background: 'linear-gradient(to bottom, #1e293b, #2924fc, #785ff9)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              <span className="text-sm text-white font-medium">Now in Public Beta</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              From Chaos to
              <span className="block mt-2">
                Crystal-Clear Insights
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Stop drowning in interview notes. UserLens Insights helps you synthesize research, 
              spot patterns, and deliver insights that drive product decisions.
            </p>

            {/* Feature bullets */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start text-sm">
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>Synthesis boards</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>Participant tracking</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>Task management</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                size="lg"
                onClick={handleGetStarted}
                disabled={isLoading}
                className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-white/90 shadow-lg font-semibold px-8"
              >
                {isLoading ? "Loading..." : "Start Free Trial"}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                asChild
              >
                <a href="#demo" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </a>
              </Button>
            </div>

            {/* Trust indicators */}
            <p className="mt-6 text-sm text-white/70">
              No credit card required • Setup in 2 minutes • Cancel anytime
            </p>
          </div>

          {/* Right Content - App Screenshot Preview */}
          <div className="relative lg:pl-8">
            {/* Browser window frame */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800">
              {/* Browser chrome */}
              <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-slate-900 rounded-md px-3 py-1.5 text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-green-400">●</span>
                    userlens.app/app
                  </div>
                </div>
              </div>
              
              {/* App content - mimics actual dashboard */}
              <div className="bg-slate-50">
                {/* Mini navbar */}
                <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">UL</span>
                    </div>
                    <span className="font-semibold text-slate-900 text-sm">UserLens Insights</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 text-xs font-medium">PM</span>
                  </div>
                </div>
                
                {/* Dashboard content */}
                <div className="p-4">
                  {/* Page header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-slate-900 font-semibold text-sm">Your Projects</h3>
                      <p className="text-slate-500 text-xs">3 active projects</p>
                    </div>
                    <div className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                      + New Project
                    </div>
                  </div>
                  
                  {/* Project cards */}
                  <div className="space-y-3">
                    {/* Project 1 */}
                    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-slate-900 font-medium text-sm">Q4 User Research</p>
                          <p className="text-slate-500 text-xs">Mobile app redesign study</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Active</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>12 participants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ListTodo className="w-3 h-3" />
                          <span>8 tasks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          <span>24 insights</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Project 2 */}
                    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-slate-900 font-medium text-sm">Onboarding Flow Study</p>
                          <p className="text-slate-500 text-xs">New user experience</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Active</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>8 participants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ListTodo className="w-3 h-3" />
                          <span>5 tasks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          <span>15 insights</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Project 3 - partial */}
                    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm opacity-60">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-slate-900 font-medium text-sm">Checkout Optimization</p>
                          <p className="text-slate-500 text-xs">E-commerce flow</p>
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">Draft</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating accent elements */}
            <div className="absolute -top-3 -right-3 bg-indigo-600 text-white rounded-lg px-3 py-2 shadow-lg text-xs font-medium">
              ✨ New: Synthesis boards
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}