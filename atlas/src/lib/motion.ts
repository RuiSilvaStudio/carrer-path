// ── Motion-safe useGSAP wrapper ─────────────────────────────────
// Single integration point for prefers-reduced-motion. All chart/view
// animations are short UI motion (opacity/width/scale/translate), which
// is low-risk, but WCAG 2.3.3 + good practice call for honoring the
// user's reduce-motion setting. Wrapping the @gsap/react hook once here
// means every consumer gets the guard without per-file logic.
//
// Behavior:
//   - no-preference (default): run animations normally.
//   - reduce: skip the animation callback entirely. Components already
//     render their final state in markup, so nothing appears "stuck".
import { useGSAP as useGSAPBase } from '@gsap/react';

type GSAPConfig = Parameters<typeof useGSAPBase>[1];

export function useReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useGSAP(callback: (() => void) | undefined, config?: GSAPConfig) {
  // Evaluate at hook-call time. If the user prefers reduced motion, register
  // a no-op so useGSAP still runs its lifecycle but performs no animation.
  const reduced = useReducedMotion();
  useGSAPBase(reduced ? () => {} : callback, config);
}
