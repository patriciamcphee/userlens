import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button";

interface BackToTopProps {
  threshold?: number; // Scroll distance before button appears
  target?: string; // Optional selector for scroll container (defaults to window)
}

export function BackToTop({ threshold = 300, target }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = target 
      ? document.querySelector(target) 
      : window;

    const handleScroll = () => {
      const scrollTop = target
        ? (scrollContainer as Element)?.scrollTop || 0
        : window.scrollY;
      
      setIsVisible(scrollTop > threshold);
    };

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      // Check initial scroll position
      handleScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [threshold, target]);

  const scrollToTop = () => {
    const scrollContainer = target 
      ? document.querySelector(target) 
      : window;

    if (scrollContainer) {
      if (target) {
        (scrollContainer as Element).scrollTo({
          top: 0,
          behavior: "smooth"
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    }
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 p-0"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
}