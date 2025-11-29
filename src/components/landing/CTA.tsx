import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface CTAProps {
  onGetStarted: () => void;
}

export function CTA({ onGetStarted }: CTAProps) {
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
    <section className="py-20 sm:py-32 bg-gradient-to-br from-indigo-600 to-indigo-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to transform your research workflow?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of researchers who are synthesizing insights faster and more effectively with ParticipantLens.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-white text-indigo-600 hover:bg-slate-50 gap-2 w-full sm:w-auto disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Start your free trial"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-indigo-700 w-full sm:w-auto"
              asChild
            >
              <a href="#pricing">View pricing</a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-indigo-200">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
