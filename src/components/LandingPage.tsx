import { Hero } from "./landing/Hero";
import { Stats } from "./landing/Stats";
import { Features } from "./landing/Features";
import { Testimonials } from "./landing/Testimonials";
import { Pricing } from "./landing/Pricing";
import { FAQ } from "./landing/FAQ";
import { CTA } from "./landing/CTA";
import { Footer } from "./landing/Footer";
import { LandingNavbar } from "./landing/LandingNavbar";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar onLogin={onGetStarted} onSignUp={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <Stats />
      <Features />
      <Testimonials />
      <Pricing onGetStarted={onGetStarted} />
      <FAQ />
      <CTA onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}
