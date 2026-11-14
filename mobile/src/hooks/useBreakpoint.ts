import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface BreakpointState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTabletOrWider: boolean;
  width: number;
}

function getBreakpointState(width: number): BreakpointState {
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isMobile = width < 768;
  const isTabletOrWider = width >= 768;

  let breakpoint: Breakpoint = 'mobile';
  if (isDesktop) breakpoint = 'desktop';
  else if (isTablet) breakpoint = 'tablet';

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isTabletOrWider,
    width,
  };
}

export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(() => {
    const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
    return getBreakpointState(initialWidth);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setState(getBreakpointState(window.innerWidth));
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}
