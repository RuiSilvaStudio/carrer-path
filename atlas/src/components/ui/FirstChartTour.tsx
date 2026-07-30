import { useEffect, useState } from 'react';
import { Coachmark, type CoachmarkPlacement } from './Coachmark';

/**
 * Atlas first-chart tour — five steps, fires once per user after their
 * first chart interaction, persists the result in localStorage.
 *
 * Triggers:
 *   - First chart interaction: any code that dispatches a
 *     `atlas:chart-interacted` window event (e.g. TrajectoryChart
 *     click/move, or DocsPage mount).
 *
 * Persistence:
 *   - localStorage key `atlas_tour_v1`.
 *   - State 'done' → never re-shows automatically.
 *   - State 'dismissed-at-step-N' → does not auto-reoffer; user must
 *     trigger via Help menu (emits `atlas:restart-tour` window event).
 *
 * Restart:
 *   - `window.dispatchEvent(new CustomEvent('atlas:restart-tour'))`
 *     clears localStorage and shows step 1 again.
 */

export const ATLAS_TOUR_KEY = 'atlas_tour_v1';
export const ATLAS_TOUR_RESTART_EVENT = 'atlas:restart-tour';
export const ATLAS_TOUR_CHART_INTERACTED_EVENT = 'atlas:chart-interacted';

type TourStatus = 'pending' | 'dismissed' | 'done';

interface Step {
  targetSelector: string;
  title: string;
  body: string;
  placement: CoachmarkPlacement;
}

const STEPS: Step[] = [
  {
    targetSelector: 'button[aria-label^="Toggle "]',
    title: 'Toggle traits on/off',
    body:
      'Click any trait chip — or its ⓘ icon — to see what it means and hide it from view.',
    placement: 'bottom',
  },
  {
    targetSelector: '.atlas-insight-strip',
    title: 'Read the insight, then the chart',
    body:
      'The pattern insight tells you what moved and by how much — the chart shows you when.',
    placement: 'top',
  },
  {
    // The Nav uses buttons, not anchors. The docs button has uppercase "DOCS" text.
    // We match via aria-label fallback OR text content via :contains — neither works in
    // vanilla querySelector. Use the closest semantic match: the Docs nav button's
    // accessible name is "DOCS" (button text content). We rely on the
    // `.atlas-nav-links` container and pick the last button (Docs is last in NAV_LINKS).
    // Use a more durable marker instead: match the nav button whose text content is
    // exactly "Docs".
    targetSelector: '.atlas-nav-links button',
    title: 'Every chart has a methodology',
    body:
      'The Docs page explains what every chart means, how it\u2019s calculated, and where the data came from.',
    placement: 'bottom',
  },
  {
    targetSelector: '.trajectory-chart-container',
    title: 'Click any point on the chart',
    body:
      'Scrubs to that data point. Use \u2191\u2193 to cycle visible series, \u2190\u2192 to move between points.',
    placement: 'top',
  },
  {
    targetSelector: '.atlas-pulse-cta-take',
    title: 'One pulse a week is enough',
    body:
      'Atlas tracks how your personality moves through life. A 5-item weekly check-in keeps the trajectory honest.',
    placement: 'top',
  },
];

// Step 3's selector points at "all nav buttons" — pick the last one (Docs is last
// in NAV_LINKS: Dashboard, Baseline, Pulse, Docs). Override after the basic
// resolveTarget runs. This keeps the selector literal & testable.
function resolveTargetEl(selector: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(selector);
  if (els.length === 0) return null;
  // For the nav selector, pick the last button — that's the Docs link
  if (selector === '.atlas-nav-links button') {
    return els[els.length - 1] ?? null;
  }
  return els[0];
}

export function FirstChartTour() {
  const [hasChartInteracted, setHasChartInteracted] = useState(false);
  const [status, setStatus] = useState<TourStatus>('pending');
  const [step, setStep] = useState<number>(0); // 0 = hidden, 1..N = visible step
  const [resolvedKey, setResolvedKey] = useState(0); // bump to re-resolve target

  // On mount: read localStorage + restore prior state.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(ATLAS_TOUR_KEY);
      if (stored === 'done') {
        setStatus('done');
      } else if (stored && stored.startsWith('dismissed-at-step-')) {
        // dismissed-while-running: don't auto-reoffer; user must use Help menu
        setStatus('dismissed');
      } else {
        setStatus('pending');
      }
    } catch {
      // localStorage may be disabled (e.g. SSR / private mode) — treat as pending
      setStatus('pending');
    }
  }, []);

  // Listen for the global "user interacted with a chart" event.
  useEffect(() => {
    const handler = () => setHasChartInteracted(true);
    window.addEventListener(ATLAS_TOUR_CHART_INTERACTED_EVENT, handler);
    return () => window.removeEventListener(ATLAS_TOUR_CHART_INTERACTED_EVENT, handler);
  }, []);

  // Listen for restart events from the future Help menu.
  useEffect(() => {
    const handler = () => {
      try {
        window.localStorage.removeItem(ATLAS_TOUR_KEY);
      } catch {
        // ignore
      }
      setStatus('pending');
      setStep(1);
      setHasChartInteracted(true);
      // bump so the Coachmark re-resolves its target on the next mount
      setResolvedKey(k => k + 1);
    };
    window.addEventListener(ATLAS_TOUR_RESTART_EVENT, handler);
    return () => window.removeEventListener(ATLAS_TOUR_RESTART_EVENT, handler);
  }, []);

  // Trigger condition: chart was interacted with AND tour is still pending
  // AND we haven't already started step 1.
  useEffect(() => {
    if (hasChartInteracted && status === 'pending' && step === 0) {
      setStep(1);
    }
  }, [hasChartInteracted, status, step]);

  // ── Action handlers ──────────────────────────────────────────────
  const handleDismiss = () => {
    try {
      window.localStorage.setItem(
        ATLAS_TOUR_KEY,
        `dismissed-at-step-${step}`,
      );
    } catch {
      // ignore
    }
    setStatus('dismissed');
    setStep(0);
  };

  const handleNext = () => {
    if (step >= STEPS.length) {
      // Past the end — treat as done
      try {
        window.localStorage.setItem(ATLAS_TOUR_KEY, 'done');
      } catch {
        // ignore
      }
      setStatus('done');
      setStep(0);
      return;
    }
    if (step === STEPS.length) {
      // Just-clicked "Got it" on the last visible step
      try {
        window.localStorage.setItem(ATLAS_TOUR_KEY, 'done');
      } catch {
        // ignore
      }
      setStatus('done');
      setStep(0);
      return;
    }
    const next = step + 1;
    setStep(next);
    // Bump resolvedKey so the next Coachmark instance re-resolves its target
    setResolvedKey(k => k + 1);
    if (next > STEPS.length) {
      try {
        window.localStorage.setItem(ATLAS_TOUR_KEY, 'done');
      } catch {
        // ignore
      }
      setStatus('done');
      setStep(0);
    }
  };

  if (status !== 'pending' || step < 1 || step > STEPS.length) {
    return null;
  }

  const current = STEPS[step - 1];
  if (!current) return null;

  // Pre-check target presence — if not in DOM yet (route hasn't loaded), wait
  const targetEl = resolveTargetEl(current.targetSelector);
  if (!targetEl) {
    // Don't render anything if the anchor isn't on screen yet. The tour
    // will wait for the user to navigate to the right view OR for the
    // chart-interacted dispatcher to fire.
    return null;
  }

  return (
    <Coachmark
      key={resolvedKey}
      targetSelector={current.targetSelector}
      title={current.title}
      body={current.body}
      placement={current.placement}
      stepNumber={step}
      totalSteps={STEPS.length}
      isLast={step === STEPS.length}
      onDismiss={handleDismiss}
      onNext={handleNext}
    />
  );
}

/**
 * Test/dev helper: expose `window.atlasTour.restart()` so the user can
 * re-trigger from devtools without rebuilding. Production code should
 * dispatch the event instead.
 */
if (typeof window !== 'undefined') {
  (window as unknown as { atlasTour?: { restart: () => void } }).atlasTour = {
    restart: () => window.dispatchEvent(new CustomEvent(ATLAS_TOUR_RESTART_EVENT)),
  };
}
