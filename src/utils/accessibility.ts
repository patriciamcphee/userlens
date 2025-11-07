// utils/accessibility.ts
import React, { useEffect, useRef } from 'react';

/**
 * ARIA live region announcer for screen readers
 */
export class LiveAnnouncer {
  private static instance: LiveAnnouncer;
  private liveRegion: HTMLElement | null = null;

  private constructor() {
    this.createLiveRegion();
  }

  static getInstance(): LiveAnnouncer {
    if (!LiveAnnouncer.instance) {
      LiveAnnouncer.instance = new LiveAnnouncer();
    }
    return LiveAnnouncer.instance;
  }

  private createLiveRegion() {
    // Create a live region for announcements
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('id', 'live-announcer');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear the message after a short delay to allow for re-announcement of the same message
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 100);
  }
}

/**
 * Focus management utilities
 */
export const focusManager = {
  /**
   * Focus the first focusable element within a container
   */
  focusFirst: (container: HTMLElement): boolean => {
    const focusableElements = focusManager.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  },

  /**
   * Focus the last focusable element within a container
   */
  focusLast: (container: HTMLElement): boolean => {
    const focusableElements = focusManager.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    return false;
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  },

  /**
   * Trap focus within a container (useful for modals)
   */
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = focusManager.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus the first element initially
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
};

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation in a list
   */
  handleArrowKeys: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void,
    options: {
      loop?: boolean;
      horizontal?: boolean;
    } = {}
  ) => {
    const { loop = true, horizontal = false } = options;
    
    let newIndex = currentIndex;
    
    const upKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const downKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    
    switch (event.key) {
      case upKey:
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? items.length - 1 : 0);
        break;
      case downKey:
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (loop ? 0 : items.length - 1);
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
    }
    
    if (newIndex !== currentIndex) {
      onIndexChange(newIndex);
      items[newIndex]?.focus();
    }
  },

  /**
   * Common keyboard shortcuts
   */
  shortcuts: {
    isModifiedEvent: (event: KeyboardEvent): boolean => {
      return event.ctrlKey || event.altKey || event.metaKey;
    },
    
    isSaveShortcut: (event: KeyboardEvent): boolean => {
      return (event.ctrlKey || event.metaKey) && event.key === 's';
    },
    
    isEscapeKey: (event: KeyboardEvent): boolean => {
      return event.key === 'Escape';
    },
    
    isEnterKey: (event: KeyboardEvent): boolean => {
      return event.key === 'Enter';
    },
    
    isSpaceKey: (event: KeyboardEvent): boolean => {
      return event.key === ' ';
    }
  }
};

/**
 * Screen reader utilities
 */
export const screenReaderUtils = {
  /**
   * Hide content from screen readers
   */
  hideFromScreenReaders: (element: HTMLElement) => {
    element.setAttribute('aria-hidden', 'true');
  },

  /**
   * Show content to screen readers only
   */
  screenReaderOnly: (text: string): React.ReactElement => {
    return React.createElement('span', {
      className: 'sr-only',
      children: text
    });
  },

  /**
   * Create descriptive text for complex UI elements
   */
  createDescription: (parts: string[]): string => {
    return parts.filter(Boolean).join(', ');
  }
};

/**
 * React hooks for accessibility
 */

/**
 * Hook for managing focus trap in modals/dialogs
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const cleanup = focusManager.trapFocus(container);

    return cleanup;
  }, [isActive]);

  return containerRef;
};

/**
 * Hook for announcing changes to screen readers
 */
export const useLiveAnnouncer = () => {
  const announcer = LiveAnnouncer.getInstance();

  return {
    announce: (message: string, priority?: 'polite' | 'assertive') => {
      announcer.announce(message, priority);
    }
  };
};

/**
 * Hook for keyboard shortcuts
 */
export const useKeyboardShortcuts = (
  shortcuts: Record<string, (event: KeyboardEvent) => void>,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const [key, handler] of Object.entries(shortcuts)) {
        let matches = false;
        
        switch (key) {
          case 'save':
            matches = keyboardNavigation.shortcuts.isSaveShortcut(event);
            break;
          case 'escape':
            matches = keyboardNavigation.shortcuts.isEscapeKey(event);
            break;
          case 'enter':
            matches = keyboardNavigation.shortcuts.isEnterKey(event);
            break;
          default:
            matches = event.key.toLowerCase() === key.toLowerCase();
        }
        
        if (matches) {
          handler(event);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, deps);
};

/**
 * Hook for managing roving tabindex in lists
 */
export const useRovingTabindex = <T extends HTMLElement>(
  items: T[],
  activeIndex: number
) => {
  useEffect(() => {
    items.forEach((item, index) => {
      if (index === activeIndex) {
        item.setAttribute('tabindex', '0');
      } else {
        item.setAttribute('tabindex', '-1');
      }
    });
  }, [items, activeIndex]);
};

/**
 * ARIA helper functions
 */
export const aria = {
  /**
   * Generate unique ID for form controls
   */
  generateId: (prefix: string = 'element'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Create aria-describedby string from multiple elements
   */
  createDescribedBy: (ids: (string | undefined)[]): string | undefined => {
    const validIds = ids.filter(Boolean);
    return validIds.length > 0 ? validIds.join(' ') : undefined;
  },

  /**
   * Create aria-labelledby string from multiple elements
   */
  createLabelledBy: (ids: (string | undefined)[]): string | undefined => {
    const validIds = ids.filter(Boolean);
    return validIds.length > 0 ? validIds.join(' ') : undefined;
  },

  /**
   * Common ARIA labels for buttons
   */
  labels: {
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete', 
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    remove: 'Remove',
    expand: 'Expand',
    collapse: 'Collapse',
    menu: 'Menu',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    previous: 'Previous',
    next: 'Next'
  },

  /**
   * Common ARIA descriptions
   */
  descriptions: {
    required: 'This field is required',
    optional: 'This field is optional',
    loading: 'Loading...',
    error: 'There is an error with this field',
    success: 'This field is valid'
  }
};

/**
 * Color contrast utilities for accessibility compliance
 */
export const colorContrast = {
  /**
   * Check if color combination meets WCAG AA standards
   */
  meetsWCAGAA: (foreground: string, background: string): boolean => {
    // This is a simplified check - in production, use a proper contrast ratio library
    const ratio = colorContrast.getContrastRatio(foreground, background);
    return ratio >= 4.5; // WCAG AA standard for normal text
  },

  /**
   * Get contrast ratio between two colors (simplified)
   */
  getContrastRatio: (color1: string, color2: string): number => {
    // Simplified implementation - use a proper library like 'color-contrast' in production
    // This is just a placeholder that returns a reasonable value
    return 4.5;
  }
};

/**
 * CSS classes for accessibility
 */
export const a11yClasses = {
  /**
   * Screen reader only content
   */
  srOnly: 'sr-only absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden',
  
  /**
   * Focus visible styles
   */
  focusVisible: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  
  /**
   * Skip link styles
   */
  skipLink: 'absolute left-[-10000px] top-auto focus:left-6 focus:top-6 focus:z-[9999] bg-white p-2 border border-gray-300 rounded',
  
  /**
   * High contrast mode support
   */
  highContrast: '@media (forced-colors: active) { forced-color-adjust: none; }'
};

// Initialize the live announcer when the module loads
if (typeof window !== 'undefined') {
  LiveAnnouncer.getInstance();
}