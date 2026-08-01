import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export type CoachmarkPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface CoachmarkProps {
  /** CSS selector for the element to spotlight. Resolved on mount + on resize. */
  targetSelector: string;
  /** One-sentence headline. */
  title: string;
  /** One-sentence explanation. ≤140 chars per NN/g. */
  body: string;
  /** Total number of steps (shown as "STEP n OF N" in the header). */
  stepNumber: number;
  /** Total number of steps in the tour. */
  totalSteps: number;
  /** Where to place the card relative to the target. 'auto' = pick best side. */
  placement?: CoachmarkPlacement;
  /** Fires when user dismisses (×, Esc, Skip, or click outside). */
  onDismiss: () => void;
  /** Fires when user clicks "Next →" or "Got it" (last step). */
  onNext: () => void;
  /** True for the final step — swaps "Next →" for "Got it". */
  isLast?: boolean;
}

interface Position {
  /** Card top-left in viewport coordinates. */
  cardTop: number;
  cardLeft: number;
  /** Resolved placement (after 'auto' → concrete side). */
  placement: Exclude<CoachmarkPlacement, 'auto'>;
  /** Arrow position relative to card top-left (px). */
  arrowLeft: number;
  arrowTop: number;
}

const CARD_WIDTH = 320;
const CARD_MAX_HEIGHT = 220;
const GAP = 12; // gap between card and target
const ARROW_SIZE = 8;
const VIEWPORT_PAD = 12;

/**
 * One-shot coachmark card. Anchors to a target element in the DOM and
 * positions itself in the closest non-overlapping side. Provides a dim
 * overlay, focus management, Esc/outside-click dismissal, and a body
 * scroll lock while open.
 *
 * v1: dim overlay is a flat rgba layer — no "hole" cut around the target.
 * Future v2 can cut the hole via clip-path with computed box coordinates
 * (tricky when the target scrolls across viewports).
 */
export function Coachmark({
  targetSelector,
  title,
  body,
  stepNumber,
  totalSteps,
  placement = 'auto',
  onDismiss,
  onNext,
  isLast = false,
}: CoachmarkProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const targetElRef = useRef<HTMLElement | null>(null);
  const [pos, setPos] = useState<Position | null>(null);
  const [missingTarget, setMissingTarget] = useState(false);

  // Resolve target + initial position on mount
  useLayoutEffect(() => {
    const el = document.querySelector<HTMLElement>(targetSelector);
    if (!el) {
      setMissingTarget(true);
      return;
    }
    targetElRef.current = el;
    setMissingTarget(false);

    // Smooth-scroll the target into view BEFORE we measure, so the
    // computed rect reflects the post-scroll viewport position.
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {
      // older browsers — ignore
    }
  }, [targetSelector]);

  // Compute and recompute card position
  useLayoutEffect(() => {
    if (missingTarget) return;
    const el = targetElRef.current;
    if (!el) return;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cardH = Math.min(cardRef.current?.offsetHeight ?? CARD_MAX_HEIGHT, CARD_MAX_HEIGHT);

      // Resolve placement
      let resolved: Exclude<CoachmarkPlacement, 'auto'> =
        placement === 'auto'
          ? pickAutoPlacement(rect, vw, vh, cardH)
          : placement;

      // Compute the card's anchored point on the chosen side.
      // Centre the card horizontally on the target by default,
      // then clamp to the viewport horizontally.
      const targetCenterX = rect.left + rect.width / 2;
      let cardLeft = targetCenterX - CARD_WIDTH / 2;
      cardLeft = Math.max(VIEWPORT_PAD, Math.min(cardLeft, vw - CARD_WIDTH - VIEWPORT_PAD));

      let cardTop = 0;
      let arrowLeft = CARD_WIDTH / 2;
      let arrowTop = 0;
      switch (resolved) {
        case 'bottom':
          cardTop = rect.bottom + GAP;
          arrowLeft = clamp(targetCenterX - cardLeft, ARROW_SIZE + 4, CARD_WIDTH - ARROW_SIZE - 4);
          arrowTop = -ARROW_SIZE;
          break;
        case 'top':
          cardTop = rect.top - GAP - cardH;
          arrowLeft = clamp(targetCenterX - cardLeft, ARROW_SIZE + 4, CARD_WIDTH - ARROW_SIZE - 4);
          arrowTop = cardH;
          break;
        case 'right':
          // left-side of card sits to the right of the target
          cardTop = rect.top + rect.height / 2 - cardH / 2;
          cardTop = Math.max(VIEWPORT_PAD, Math.min(cardTop, vh - cardH - VIEWPORT_PAD));
          cardLeft = rect.right + GAP;
          arrowLeft = -ARROW_SIZE;
          arrowTop = clamp(rect.top + rect.height / 2 - cardTop, ARROW_SIZE + 4, cardH - ARROW_SIZE - 4);
          break;
        case 'left':
          cardTop = rect.top + rect.height / 2 - cardH / 2;
          cardTop = Math.max(VIEWPORT_PAD, Math.min(cardTop, vh - cardH - VIEWPORT_PAD));
          cardLeft = rect.left - GAP - CARD_WIDTH;
          arrowLeft = CARD_WIDTH;
          arrowTop = clamp(rect.top + rect.height / 2 - cardTop, ARROW_SIZE + 4, cardH - ARROW_SIZE - 4);
          break;
      }

      // Floor +0 for crisp pixels
      setPos({
        cardTop: Math.round(cardTop),
        cardLeft: Math.round(cardLeft),
        placement: resolved,
        arrowLeft: Math.round(arrowLeft),
        arrowTop: Math.round(arrowTop),
      });
    };

    // First measurement: defer one frame so post-scroll layout settles
    const r1 = requestAnimationFrame(() => {
      compute();
    });
    // Second measurement after a longer settle (smooth-scroll completes)
    const t1 = setTimeout(compute, 350);

    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, { capture: true, passive: true });
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute);
    };
  }, [placement, missingTarget, targetSelector]);

  // Body scroll lock while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Focus the primary action button on mount
  useEffect(() => {
    const t = setTimeout(() => nextBtnRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  // Esc key dismisses
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  // If the target disappears mid-tour (route change, conditional render),
  // just hide gracefully — the orchestrator can decide what to do next.
  if (missingTarget) return null;

  const titleId = 'coachmark-title';
  const bodyId = 'coachmark-body';

  // Arrow CSS — pure border trick (matches InfoTooltip)
  const arrowStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
    };
    const border = `${ARROW_SIZE}px solid transparent`;
    switch (pos?.placement) {
      case 'bottom':
        // Arrow on top of card, pointing UP at the target above
        return {
          ...base,
          top: arrowPos(0),
          left: `${pos.arrowLeft}px`,
          transform: 'translateX(-50%)',
          borderLeft: border,
          borderRight: border,
          borderBottom: `${ARROW_SIZE}px solid var(--color-border)`,
        };
      case 'top':
        // Arrow on bottom of card, pointing DOWN at target below
        return {
          ...base,
          top: arrowPos(pos.arrowTop),
          left: `${pos.arrowLeft}px`,
          transform: 'translateX(-50%)',
          borderLeft: border,
          borderRight: border,
          borderTop: `${ARROW_SIZE}px solid var(--color-border)`,
        };
      case 'right':
        // Arrow on left of card, pointing LEFT at target on left
        return {
          ...base,
          top: `${pos.arrowTop}px`,
          left: arrowPos(0),
          transform: 'translateY(-50%)',
          borderTop: border,
          borderBottom: border,
          borderRight: `${ARROW_SIZE}px solid var(--color-border)`,
        };
      case 'left':
        // Arrow on right of card, pointing RIGHT at target on right
        return {
          ...base,
          top: `${pos.arrowTop}px`,
          left: arrowPos(pos.arrowLeft),
          transform: 'translateY(-50%)',
          borderTop: border,
          borderBottom: border,
          borderLeft: `${ARROW_SIZE}px solid var(--color-border)`,
        };
    }
    return base;
  };

  return (
    <>
      {/* Dim overlay. v1: flat rgba layer (no hole). */}
      <div
        aria-hidden="true"
        onClick={onDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 1100,
        }}
      />

      {/* The card itself */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        style={{
          position: 'fixed',
          top: pos ? `${pos.cardTop}px` : '-9999px',
          left: pos ? `${pos.cardLeft}px` : '50%',
          transform: pos ? 'none' : 'translateX(-50%)',
          width: `${CARD_WIDTH}px`,
          maxWidth: `calc(100vw - ${VIEWPORT_PAD * 2}px)`,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 1101,
          fontFamily: 'var(--font-sans)',
          opacity: pos ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: step indicator + close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px 6px 14px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-text-dim)',
            }}
          >
            Step {stepNumber} of {totalSteps}
          </span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close tour"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-dim)',
              fontSize: '18px',
              lineHeight: 1,
              borderRadius: 'var(--radius-element)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-text)';
              e.currentTarget.style.background = 'var(--color-surface-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-dim)';
              e.currentTarget.style.background = 'none';
            }}
          >
            ×
          </button>
        </div>

        {/* Body: title + description */}
        <div style={{ padding: '4px 14px 12px' }}>
          <h2
            id={titleId}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '16px',
              fontWeight: 500,
              color: 'var(--color-text)',
              lineHeight: 1.3,
              marginBottom: '6px',
            }}
          >
            {title}
          </h2>
          <p
            id={bodyId}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            {body}
          </p>
        </div>

        {/* Footer: skip + next/got-it */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px 12px 14px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px 8px',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--color-text-dim)',
              borderRadius: 'var(--radius-element)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-dim)';
            }}
          >
            Skip tour
          </button>
          <button
            ref={nextBtnRef}
            type="button"
            onClick={onNext}
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-element)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            {isLast ? 'Got it' : 'Next →'}
          </button>
        </div>

        {/* Arrow pointer — positioned in setPos */}
        {pos && <span aria-hidden="true" style={arrowStyle()} />}
      </div>
    </>
  );
}

/** Helper to keep arrowStyle() readable. */
function arrowPos(v: number): string {
  return v === 0 ? '0' : `${v}px`;
}

/** Clamp x into [lo, hi]. */
function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(x, hi));
}

/**
 * Pick the best concrete placement for an 'auto' coachmark.
 * Prefers 'bottom' (card below target) if the target is in the upper
 * half of the viewport — feels more natural. Falls back to 'top' when
 * the target is in the lower half. Sides are last resorts.
 */
function pickAutoPlacement(
  rect: DOMRect,
  vw: number,
  vh: number,
  cardH: number,
): Exclude<CoachmarkPlacement, 'auto'> {
  const targetMidY = rect.top + rect.height / 2;
  const above = rect.top;
  const below = vh - rect.bottom;
  const left = rect.left;
  const right = vw - rect.right;

  // If the bottom half has room for the card with our GAP, place below
  if (below >= cardH + GAP * 2) return 'bottom';
  // Otherwise place above if there's room
  if (above >= cardH + GAP * 2) return 'top';
  // Side placement if there's horizontal room
  if (right >= 360) return 'right';
  if (left >= 360) return 'left';
  // Whatever fits at all — fallback to whichever has more room
  return targetMidY < vh / 2 ? 'bottom' : 'top';
}
