/**
 * Responsive Utilities and Helpers
 * 
 * Collection of utilities for responsive design and mobile-first development
 * Includes:
 *  - useResponsive: Hook for media query breakpoints
 *  - useWindowSize: Hook for window dimensions
 *  - useMobileMenu: Hook for mobile menu state
 *  - Responsive grid helpers
 *  - Breakpoint constants
 */

import { useState, useEffect, useCallback } from 'react';

// Breakpoint Constants
export const BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const BREAKPOINT_NAMES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

/**
 * useResponsive Hook
 * Returns the current breakpoint and boolean checks for device type
 * 
 * Usage:
 * const { breakpoint, isMobile, isTablet, isDesktop } = useResponsive();
 */
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState('md');
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 768
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width < BREAKPOINTS.sm) setBreakpoint('xs');
      else if (width < BREAKPOINTS.md) setBreakpoint('sm');
      else if (width < BREAKPOINTS.lg) setBreakpoint('md');
      else if (width < BREAKPOINTS.xl) setBreakpoint('lg');
      else if (width < BREAKPOINTS['2xl']) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    windowWidth,
    isMobile: windowWidth < BREAKPOINTS.md,
    isTablet: windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg,
    isDesktop: windowWidth >= BREAKPOINTS.lg,
    isSmallMobile: windowWidth < BREAKPOINTS.sm,
    isLargeDesktop: windowWidth >= BREAKPOINTS.xl,
  };
}

/**
 * useWindowSize Hook
 * Returns current window width and height
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * useMobileMenu Hook
 * Manages mobile menu open/close state
 */
export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useResponsive();

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close menu on desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return {
    isOpen,
    toggle,
    open,
    close,
  };
}

/**
 * useMediaQuery Hook
 * Watch for specific media query
 * 
 * Usage:
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/**
 * useOrientation Hook
 * Detects device orientation changes
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth ? 'portrait' : 'landscape' : 'portrait'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * Grid Helper Functions
 */

// Get grid column classes based on breakpoint
export function getGridColumns(desktop = 3, tablet = 2, mobile = 1) {
  return `grid grid-cols-${mobile} sm:grid-cols-${tablet} lg:grid-cols-${desktop}`;
}

// Get responsive padding classes
export function getResponsivePadding(mobile = 4, tablet = 6, desktop = 8) {
  return `p-${mobile} md:p-${tablet} lg:p-${desktop}`;
}

// Get responsive gap classes
export function getResponsiveGap(mobile = 3, tablet = 4, desktop = 6) {
  return `gap-${mobile} md:gap-${tablet} lg:gap-${desktop}`;
}

// Get responsive text size classes
export function getResponsiveTextSize(mobile = 'sm', tablet = 'base', desktop = 'lg') {
  return `text-${mobile} md:text-${tablet} lg:text-${desktop}`;
}

/**
 * Responsive Hooks for specific layouts
 */

// useTabletOptimization - Optimize for tablet layout
export function useTabletOptimization() {
  const { isTablet, isMobile, isDesktop } = useResponsive();

  return {
    isTablet,
    isMobile,
    isDesktop,
    shouldShowSidebar: !isMobile,
    sidebarPosition: isDesktop ? 'left' : 'bottom',
    gridColumns: isDesktop ? 4 : isTablet ? 2 : 1,
    containerWidth: isDesktop ? 'max-w-7xl' : isTablet ? 'max-w-4xl' : 'max-w-2xl',
  };
}

// useFormLayout - Optimize form layout responsiveness
export function useFormLayout() {
  const { isMobile } = useResponsive();

  return {
    isMobile,
    inputSize: isMobile ? 'md' : 'lg',
    buttonFullWidth: isMobile,
    fieldSpacing: isMobile ? 'gap-4' : 'gap-6',
    columnsLayout: isMobile ? 'grid-cols-1' : 'grid-cols-2',
  };
}

// useConsultationLayout - Optimize consultation room layout
export function useConsultationLayout() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return {
    layout: isMobile ? 'stacked' : isTablet ? 'split' : 'expanded',
    videoHeight: isMobile ? 'h-64' : isTablet ? 'h-96' : 'h-full',
    chatWidth: isMobile ? 'w-full' : isTablet ? 'w-1/3' : 'w-1/4',
    showControlsVertically: isMobile,
  };
}

/**
 * useTouchDetection Hook
 * Detect if device supports touch
 */
export function useTouchDetection() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      () =>
        (typeof window !== 'undefined' &&
          ('ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0)) ||
        false
    );
  }, []);

  return isTouchDevice;
}

/**
 * useInfiniteScroll Hook
 * Detect when user scrolls to bottom
 */
export function useInfiniteScroll(callback, threshold = 100) {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - threshold
      ) {
        if (!isFetching) {
          setIsFetching(true);
          callback();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, isFetching, threshold]);

  return { isFetching, setIsFetching };
}

/**
 * useLazyLoad Hook
 * Lazy load images
 */
export function useLazyLoad(ref, onLoad) {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoad();
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, onLoad]);
}

/**
 * useDarkMode Hook
 * Detect dark mode preference
 */
export function useDarkMode() {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  return isDark;
}

/**
 * useReducedMotion Hook
 * Respect user's reduced motion preference
 */
export function useReducedMotion() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return prefersReducedMotion;
}
