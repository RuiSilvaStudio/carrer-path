import { useState, useEffect, useRef } from 'react';
import { DashboardProvider, useDashboardState } from '../state/DashboardContext';
import { useDemoData } from '../hooks/useDemoData';
import { ViewTabs } from '../components/dashboard/ViewTabs';
import { TrajectoryView } from '../components/dashboard/views/TrajectoryView';
import { DistributionView } from '../components/dashboard/views/DistributionView';
import { ContextView } from '../components/dashboard/views/ContextView';
import { RhythmView } from '../components/dashboard/views/RhythmView';
import { ChapterRail } from '../components/ui/ChapterRail';
import { CopyButton } from '../components/ui/CopyButton';

// ── Section metadata for table of contents ──────────────────────
interface Section {
  id: string;
  num: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: 'overview', num: '01', title: 'What is the Personality Atlas?' },
  { id: 'science', num: '02', title: 'The Science' },
  { id: 'instruments', num: '03', title: 'Assessment Instruments' },
  { id: 'scoring', num: '04', title: 'Scoring Methodology' },
  { id: 'pulse-design', num: '05', title: 'Pulse Design' },
  { id: 'visualization', num: '06', title: 'Data Visualization' },
  { id: 'sigil', num: '07', title: 'The Sigil' },
  { id: 'data-sources', num: '08', title: 'Data Sources' },
  { id: 'privacy', num: '09', title: 'Privacy & Ethics' },
  { id: 'future', num: '10', title: 'Future: Smoothing & Aggregation' },
  { id: 'accessibility', num: '11', title: 'Accessibility' },
];

// ── Hover-share anchor link ─────────────────────────────────────
// Renders the `#` that appears on hover next to a heading. Copies the
// full URL on click and gives brief visual feedback. Per the audit
// report: best-in-class (Stripe / Linear / MDN) all do this.
function AnchorLink({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <a
      href={`#${id}`}
      aria-label={`Permalink to this section`}
      onClick={(e) => {
        e.preventDefault();
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        navigator.clipboard?.writeText(url).catch(() => {});
        history.replaceState(null, '', `#${id}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="atlas-anchor-link"
      style={{
        marginLeft: '10px',
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        fontWeight: 400,
        color: copied ? 'var(--color-accent)' : 'var(--color-text-dim)',
        textDecoration: 'none',
        opacity: 0,
        transition: 'opacity 0.15s ease, color 0.15s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = ''; }}
    >
      {copied ? '✓' : '#'}
    </a>
  );
}

// ── Reusable card component ─────────────────────────────────────
function DocCard({
  id,
  num,
  title,
  nextSection,
  children,
}: {
  id: string;
  num: string;
  title: string;
  nextSection?: { num: string; title: string; id: string };
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        scrollMarginTop: '60px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px 36px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--color-text-dim)',
          marginBottom: '8px',
        }}
      >
        {num}
      </p>
      <h2
        className="atlas-doc-h2"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--fs-h2)',
          fontWeight: 500,
          color: 'var(--color-text)',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '4px',
        }}
      >
        <span>{title}</span>
        <AnchorLink id={id} />
      </h2>
      <div
        className="atlas-doc-content"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          lineHeight: 1.7,
          color: 'var(--color-text-muted)',
        }}
      >
        {children}
      </div>
      {nextSection && (
        <a
          href={`#${nextSection.id}`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(nextSection.id);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              history.replaceState(null, '', `#${nextSection.id}`);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border)',
            textDecoration: 'none',
            color: 'var(--color-text-muted)',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
          }}>
            Read next →
          </span>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '15px',
            color: 'var(--color-text)',
            textAlign: 'right',
          }}>
            {nextSection.num} — {nextSection.title}
          </span>
        </a>
      )}
    </section>
  );
}

// ── Inline code/formula ─────────────────────────────────────────
function Code({ children, text }: { children: React.ReactNode; text?: string }) {
  const copyText = text ?? (typeof children === 'string' ? children : String(children ?? ''));
  return (
    <code
      data-atlas-code
      onClick={() => {
        // Click-to-copy for inline code (Linear/GitHub pattern)
        const sel = window.getSelection();
        if (sel && sel.toString().length > 0) return; // user is selecting, don't hijack
        navigator.clipboard?.writeText(copyText).catch(() => {});
      }}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        background: 'var(--color-surface-elevated)',
        color: 'var(--color-accent-bright)',
        padding: '2px 6px',
        borderRadius: 'var(--radius-element)',
        border: '1px solid var(--color-border)',
        cursor: 'copy',
      }}
      title="Click to copy"
    >
      {children}
    </code>
  );
}

// ── Formula block ───────────────────────────────────────────────
function Formula({ children, text }: { children: React.ReactNode; text?: string }) {
  const copyText = text ?? (typeof children === 'string' ? children : String(children ?? ''));
  return (
    <div
      data-atlas-formula
      style={{
        position: 'relative',
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        background: 'var(--color-surface-elevated)',
        color: 'var(--color-text)',
        padding: '14px 60px 14px 18px',
        borderRadius: 'var(--radius-button)',
        border: '1px solid var(--color-border)',
        margin: '16px 0',
        lineHeight: 1.6,
        overflowX: 'auto',
      }}
    >
      {children}
      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
        <CopyButton text={copyText} variant="block" />
      </div>
    </div>
  );
}

// ── Callout / note box ───────────────────────────────────────────
function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warning';
  children: React.ReactNode;
}) {
  const color = type === 'warning' ? 'var(--color-warning)' : 'var(--color-accent)';
  return (
    <div
      style={{
        borderLeft: `3px solid ${color}`,
        background: 'var(--color-surface-elevated)',
        padding: '14px 18px',
        borderRadius: `0 var(--radius-button) var(--radius-button) 0`,
        margin: '16px 0',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--color-text-muted)',
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

// ── Reference / citation ────────────────────────────────────────
function Ref({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        lineHeight: 1.6,
        color: 'var(--color-text-dim)',
        paddingLeft: '16px',
        borderLeft: '2px solid var(--color-border)',
        marginBottom: '8px',
      }}
    >
      {children}
    </p>
  );
}

// ── Demo Dashboard (collapsible) ────────────────────────────────
function DemoDashboard() {
  const [expanded, setExpanded] = useState(false);
  const { demoData, loading } = useDemoData();

  if (loading || demoData.length === 0) return null;

  return (
    <div
      className="atlas-page"
      style={{
        maxWidth: '1200px',
        margin: '0 auto 32px',
        padding: '0 40px',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
        }}
      >
        {/* Toggle header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="atlas-demo-header"
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            padding: '20px 24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-accent)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Explore
            </span>
            <span>Demo Dashboard (Synthetic Data)</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-dim)', whiteSpace: 'nowrap' }}>
            {expanded ? '− Collapse' : '+ Expand'}
          </span>
        </button>

        {expanded && (
          <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: '16px 0 20px' }}>
              This is a live demo using a synthetic 158-pulse dataset (Beck, 2022). Explore the charts
              and views to see how your own data will look once you complete the baseline and weekly pulses.
            </p>
            <DashboardProvider>
              <div style={{ marginBottom: '20px' }}>
                <ViewTabs />
              </div>
              <DemoViews demoData={demoData} />
            </DashboardProvider>
          </div>
        )}
      </div>
    </div>
  );
}

// Inner component that reads view from DashboardContext and renders the right view
function DemoViews({ demoData }: { demoData: any[] }) {
  const { view } = useDashboardState();
  return (
    <>
      {view === 'trajectory' && <TrajectoryView demoData={demoData} baseline={null} pulses={[]} dataSource="demo" />}
      {view === 'distribution' && <DistributionView demoData={demoData} baseline={null} pulses={[]} dataSource="demo" />}
      {view === 'context' && <ContextView demoData={demoData} baseline={null} pulses={[]} dataSource="demo" />}
      {view === 'rhythm' && <RhythmView demoData={demoData} baseline={null} pulses={[]} dataSource="demo" />}
    </>
  );
}

// ── Main component ──────────────────────────────────────────────
export function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const sectionsRef = useRef<HTMLElement>(null);

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    const container = sectionsRef.current;
    if (container) {
      const sections = container.querySelectorAll('section[id]');
      sections.forEach((s) => observer.observe(s));
    }

    return () => observer.disconnect();
  }, []);

  // Smooth scroll to section
  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
      }}
    >
      <ChapterRail sections={SECTIONS} />
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="atlas-page"
        style={{
          padding: '48px 40px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--color-text-dim)',
            marginBottom: '12px',
          }}
        >
          Documentation
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--fs-h1)',
            fontWeight: 500,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: '8px',
          }}
        >
          The Personality Atlas
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'var(--color-text-muted)',
            marginBottom: '32px',
          }}
        >
          A longitudinal self-insight instrument. This page documents the science, methodology,
          and calculations behind every chart you see.
        </p>
      </div>

      {/* ── Demo Dashboard (collapsible) ───────────────────── */}
      <DemoDashboard />

      {/* ── Table of Contents ──────────────────────────────── */}
      <div
        className="atlas-page"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px 32px',
        }}
      >
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px 24px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-text-dim)',
              marginBottom: '14px',
            }}
          >
            Contents
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '6px 24px',
            }}
          >
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => handleTocClick(e, s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  color: activeSection === s.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  transition: 'color 0.2s ease',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--color-text-dim)',
                    minWidth: '18px',
                  }}
                >
                  {s.num}
                </span>
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sections ───────────────────────────────────────── */}
      <main
        id="atlas-main"
        tabIndex={-1}
        ref={sectionsRef}
        className="atlas-page"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* 01 — Overview */}
        <DocCard id="overview" num="01" title="What is the Personality Atlas?" nextSection={{ id: 'science', num: '02', title: 'The Science' }}>
          <p style={{ marginBottom: '16px' }}>
            The Personality Atlas is a <strong style={{ color: 'var(--color-text)' }}>longitudinal
            self-insight instrument</strong>. It is not a hiring tool. It is not a predictive
            screening device. It does not rank you against a norm group to decide anything about you.
          </p>
          <p style={{ marginBottom: '16px' }}>
            Instead, it tracks how your personality expresses itself over time — across days, weeks,
            and months — using the <strong style={{ color: 'var(--color-text)' }}>Experience Sampling
            Method (ESM)</strong> grounded in <strong style={{ color: 'var(--color-text)' }}>Whole
            Trait Theory</strong>. You answer short, repeated assessments in natural contexts. Over
            time, a picture of <em>how you move</em> emerges.
          </p>
          <p style={{ marginBottom: '16px' }}>
            The instrument draws on three public-domain assessment batteries:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--color-text)' }}>IPIP-NEO-120</strong> — 120 items
              measuring the Big Five personality traits (Openness, Conscientiousness, Extraversion,
              Agreeableness, Neuroticism)
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--color-text)' }}>ICAR-16</strong> — 16 items measuring
              cognitive ability (letter series, verbal reasoning, matrix reasoning, 3D rotation)
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--color-text)' }}>SD3-27</strong> — 27 items measuring
              Machiavellianism, Narcissism, and Psychopathy, relabeled as "Motivational Drivers"
            </li>
          </ul>
          <p style={{ marginBottom: '0' }}>
            All three instruments are in the public domain. There are zero licensing costs and
            commercial use is permitted.
          </p>
        </DocCard>

        {/* 02 — Science */}
        <DocCard id="science" num="02" title="The Science" nextSection={{ id: 'instruments', num: '03', title: 'Assessment Instruments' }}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}
          >
            Whole Trait Theory
          </h3>
          <p style={{ marginBottom: '16px' }}>
            Whole Trait Theory (Fleeson, 2001) proposes that a trait is not a fixed point but a{' '}
            <strong style={{ color: 'var(--color-text)' }}>density distribution of states</strong>.
            Your Extraversion is not "67." It is the full shape of how extraverted you are across
            moments — sometimes high, sometimes low, with a characteristic mean and spread. The
            distribution reveals more than any single score ever could.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Experience Sampling Method
          </h3>
          <p style={{ marginBottom: '16px' }}>
            ESM asks participants to complete brief assessments repeatedly, in their natural
            contexts, as they go about daily life. Instead of a one-shot lab questionnaire, you get
            a time series. The Personality Atlas uses a lightweight form of ESM — weekly pulses of
            5–10 items — rather than the intensive 6–9×/day schedule of academic ESM studies.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Personality is Not Fixed
          </h3>
          <p style={{ marginBottom: '16px' }}>
            The idea that personality is set in stone by age 30 has been thoroughly debunked.
            Roberts et al. (2006) conducted a meta-analysis showing that personality traits change
            across the lifespan in predictable ways. Bleidorn et al. (2022) surveyed 189 studies
            confirming personality plasticity across cultures and age groups.
          </p>
          <p style={{ marginBottom: '16px' }}>
            The implication for self-insight: a single measurement is a snapshot. A longitudinal
            series shows the direction, magnitude, and shape of change.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Density Distributions
          </h3>
          <p style={{ marginBottom: '12px' }}>
            When you plot a trait score over many time points, you get a distribution. That
            distribution's shape — its peaks, its spread, its skew — reveals patterns that a single
            mean cannot. Are your openness scores consistently high? Or do they swing from 40 to 90
            depending on context? The shape answers questions the average cannot.
          </p>

          <div style={{ marginTop: '20px' }}>
            <Ref><strong style={{ color: 'var(--color-text-muted)' }}>Fleeson, W.</strong> (2001). Toward a structure- and process-integrated view of personality. <em>Journal of Personality and Social Psychology</em>, 80(6), 1011–1027.</Ref>
            <Ref><strong style={{ color: 'var(--color-text-muted)' }}>Roberts, B. W., Walton, K. E., & Viechtbauer, W.</strong> (2006). Patterns of mean-level change in personality traits across the life course. <em>Psychological Bulletin</em>, 132(1), 1–25.</Ref>
            <Ref><strong style={{ color: 'var(--color-text-muted)' }}>Bleidorn, W., et al.</strong> (2022). Personality plasticity and health: A cross-cultural study. <em>European Journal of Personality</em>.</Ref>
          </div>
        </DocCard>

        {/* 03 — Instruments */}
        <DocCard id="instruments" num="03" title="Assessment Instruments" nextSection={{ id: 'scoring', num: '04', title: 'Scoring Methodology' }}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}
          >
            IPIP-NEO-120
          </h3>
          <p style={{ marginBottom: '16px' }}>
            120 items from the International Personality Item Pool, organized as 5 traits × 6
            facets. Each item is rated on a 5-point Likert scale:
          </p>
          <Formula>
            Very Inaccurate (1) · Inaccurate (2) · Neutral (3) · Accurate (4) · Very Accurate (5)
          </Formula>
          <p style={{ marginBottom: '16px' }}>
            The five domains and their six facets each:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px', listStyle: 'none' }}>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>Neuroticism (N):</strong> Anxiety, Anger, Depression, Self-Consciousness, Immoderation, Vulnerability</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>Extraversion (E):</strong> Friendliness, Gregariousness, Assertiveness, Activity, Excitement-Seeking, Cheerfulness</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>Openness (O):</strong> Imagination, Artistic, Emotionality, Adventurousness, Intellect, Liberalism</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>Agreeableness (A):</strong> Trust, Morality, Altruism, Cooperation, Modesty, Sympathy</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>Conscientiousness (C):</strong> Self-Efficacy, Orderliness, Dutifulness, Achievement-Striving, Self-Discipline, Cautiousness</li>
          </ul>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            ICAR-16
          </h3>
          <p style={{ marginBottom: '16px' }}>
            16 cognitive items from the International Cognitive Ability Resource. Four item types,
            four each:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--color-text)' }}>Letter series</strong> — identify the next letter in a sequence</li>
            <li style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--color-text)' }}>Verbal reasoning</strong> — short logical puzzles</li>
            <li style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--color-text)' }}>Matrix reasoning</strong> — identify the missing element in a visual grid</li>
            <li style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--color-text)' }}>3D rotation</strong> — mental rotation of geometric shapes</li>
          </ul>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            SD3-27 — "Motivational Drivers"
          </h3>
          <p style={{ marginBottom: '16px' }}>
            The Short Dark Triad (SD3) measures three motivational constructs: Machiavellianism
            (strategic manipulation), Narcissism (grandiosity and entitlement), and Psychopathy
            (callous impulsivity). Each is measured with 9 items on the same 5-point Likert scale
            as IPIP. We relabel these collectively as "Motivational Drivers" to reduce the stigma
            of the original "Dark Triad" label while preserving the underlying constructs.
          </p>

          <Callout type="info">
            All three instruments are <strong style={{ color: 'var(--color-text)' }}>public
            domain</strong>. The IPIP, ICAR, and SD3 carry no licensing fees and permit commercial
            use. The entire 168-item battery can be deployed at zero per-respondent cost.
          </Callout>
        </DocCard>

        {/* 04 — Scoring Methodology */}
        <DocCard id="scoring" num="04" title="Scoring Methodology" nextSection={{ id: 'pulse-design', num: '05', title: 'Pulse Design — Why 5–10 Items?' }}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}
          >
            IPIP Big Five Scoring
          </h3>
          <p style={{ marginBottom: '16px' }}>
            Each IPIP item belongs to one of the five trait domains. Some items are reverse-scored
            — they are phrased in the opposite direction of the trait they measure. For reverse
            items, the response is flipped:
          </p>
          <Formula>
            reverse_score = 6 − response<br />
            forward_score = response<br /><br />
            trait_score = mean(all_item_scores) × 20
          </Formula>
          <p style={{ marginBottom: '16px' }}>
            This maps the 1–5 Likert scale to a 0–100 range (mean of 1 → 20, mean of 5 → 100).
            Reverse items are identified in the <Code>IPIP_ITEMS</Code> table by a <Code>reverse:
            true</Code> flag.
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong style={{ color: 'var(--color-text)' }}>Neuroticism inversion:</strong> The
            Neuroticism (N) domain is inverted so that higher scores indicate greater emotional
            stability:
          </p>
          <Formula>
            emotional_stability = 100 − neuroticism_score
          </Formula>
          <p style={{ marginBottom: '16px' }}>
            This means a high Neuroticism raw score (e.g., 80) becomes a low Emotional Stability
            score (20). All five traits are presented on the same 0–100 scale where higher is
            "more of the trait as named."
          </p>
          <p style={{ marginBottom: '16px' }}>
            Facet scores use the same formula but are computed per-facet (each facet has 4 items in
            the 120-item set). Neuroticism facets are similarly inverted.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            ICAR Scoring
          </h3>
          <p style={{ marginBottom: '16px' }}>
            Each ICAR item has a single correct answer (stored as an index into the options array).
            Scoring counts correct responses and converts to a percentage:
          </p>
          <Formula>
            icar_percent = (correct / total) × 100
          </Formula>
          <p style={{ marginBottom: '16px' }}>
            The result is rounded to one decimal place. The full ICAR-16 battery yields a percentage
            score from 0% to 100%.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            SD3 Scoring
          </h3>
          <p style={{ marginBottom: '16px' }}>
            The 27 SD3 items are divided into three subscales of 9 items each. Five items are
            reverse-scored (IDs 5, 6, 17, 21, 23):
          </p>
          <Formula>
            reverse_score = 6 − response<br />
            subscale_score = mean(all_9_items) × 20
          </Formula>
          <p style={{ marginBottom: '16px' }}>
            Each subscale (Machiavellianism, Narcissism, Psychopathy) is scored independently on
            the 0–100 scale.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Baseline vs. Pulses
          </h3>
          <p style={{ marginBottom: '0' }}>
            The <strong style={{ color: 'var(--color-text)' }}>baseline</strong> is the full
            168-item assessment (120 IPIP + 16 ICAR + 27 SD3 + 5 context questions), taking
            approximately 25 minutes. It establishes your initial trait profile, facet scores, SD3
            profile, and ICAR percentage.
          </p>
          <p style={{ marginTop: '12px', marginBottom: '0' }}>
            <strong style={{ color: 'var(--color-text)' }}>Pulses</strong> are 5–10 IPIP items
            taking roughly 2 minutes. They are framed in the state tense — <em>"Right now, I
            ..."</em> — as opposed to the baseline's trait framing — <em>"In general, I ..."</em>.
            Only IPIP items appear in pulses; ICAR and SD3 are baseline-only. Pulse scores are
            computed using the same IPIP scoring formula, but with fewer items per trait.
          </p>
        </DocCard>

        {/* 05 — Pulse Design */}
        <DocCard id="pulse-design" num="05" title="Pulse Design — Why 5–10 Items?" nextSection={{ id: 'visualization', num: '06', title: 'Data Visualization' }}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}
          >
            The Compliance Problem
          </h3>
          <p style={{ marginBottom: '16px' }}>
            Eisele et al. (2022) found that 30-item questionnaires maintain 89% compliance, while
            60-item questionnaires drop to 84%. <strong style={{ color: 'var(--color-text)'
            }}>Questionnaire length is the primary predictor of dropout</strong> — not frequency of
            administration. A short survey answered consistently beats a long survey abandoned.
          </p>
          <p style={{ marginBottom: '16px' }}>
            Traditional ESM studies sample 6–9 times per day. The Personality Atlas uses a weekly
            cadence — orders of magnitude less burdensome. The challenge is keeping each pulse
            short enough that users never think "this is too much."
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Phased Approach
          </h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--color-text)' }}>Loading phase</strong> — 10 items per
              week for 3 weeks. Higher density to quickly build a distribution.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--color-text)' }}>Maintenance phase</strong> — 5 items
              bi-weekly. Sustained low-burden monitoring.
            </li>
          </ul>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Facet Rotation
          </h3>
          <p style={{ marginBottom: '0' }}>
            Over 6 weeks, the rotation covers all 30 facets (5 traits × 6 facets), then repeats.
            Each weekly pulse samples different facets, so over a 6-week cycle every facet is
            measured at least twice. This ensures the trajectory chart and distributions reflect
            the full trait space, not just the facets that happened to appear in early pulses.
          </p>

          <div style={{ marginTop: '20px' }}>
            <Ref><strong style={{ color: 'var(--color-text-muted)' }}>Eisele, G., et al.</strong> (2022). Ecological momentary assessment in health research. <em>Health Psychology Review</em>.</Ref>
          </div>
        </DocCard>

        {/* 06 — Data Visualization */}
        <DocCard id="visualization" num="06" title="Data Visualization" nextSection={{ id: 'sigil', num: '07', title: 'The Sigil' }}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}
          >
            Trajectory Chart
          </h3>
          <p style={{ marginBottom: '16px' }}>
            A multi-line chart showing all five Big Five trait scores over time. Each trait is a
            separate colored line. The curves are smoothed using D3's{' '}
            <Code>d3.curveCatmullRom.alpha(0.5)</Code> interpolation, which produces natural-looking
            curves that pass through each data point. The x-axis is index-based (not time-based)
            because multiple pulses can share the same date, which would cause vertical stacking on
            a time scale.
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong style={{ color: 'var(--color-text)' }}>Missing pulse filtering:</strong> Pulses
            where all five scores match the pattern <Code>0 / 0 / 0 / 0 / 100</Code> are filtered
            out — this pattern indicates no responses were recorded, producing a default/empty score
            set that would distort the chart.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Radar Chart
          </h3>
          <p style={{ marginBottom: '16px' }}>
            A 5-axis polygon showing the current Big Five profile at the scrubber's selected point in
            time. Each axis represents one trait (0–100). The polygon's shape gives an immediate
            visual gestalt of your trait configuration at that moment.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Distribution Charts
          </h3>
          <p style={{ marginBottom: '16px' }}>
            Each trait gets a histogram (20 bins) overlaid with a <strong style={{ color:
            'var(--color-text)' }}>kernel density estimate (KDE)</strong>. The KDE uses a Gaussian
            kernel with a bandwidth of 8, normalized so the peak equals 1. A dashed vertical line
            marks the mean (μ). Together, the histogram and KDE reveal the shape of trait
            expression — unimodal, bimodal, skewed, narrow, or wide.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Context Heatmap
          </h3>
          <p style={{ marginBottom: '16px' }}>
            A grid showing average trait scores per context category. Rows are the top 12 most
            frequent contexts (e.g., "at home," "at work," "with friends"). Columns are the five
            traits. Cell color intensity maps to the average trait score, revealing how your
            personality shifts across situations.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Rhythm Charts
          </h3>
          <p style={{ marginBottom: '16px' }}>
            Radial clock charts showing average trait scores by hour of day. Each hour is a point
            on the circle; its distance from center represents the average trait score at that hour.
            The resulting polygon reveals circadian patterns — when you're most open, most stable,
            most extraverted. An emotion heatmap complements this with a 24-hour × emotion matrix.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Color Palette
          </h3>
          <p style={{ marginBottom: '0' }}>
            All charts use <strong style={{ color: 'var(--color-text)' }}>Paul Tol's "Bright"
            qualitative scheme</strong>, which is colorblind-safe. The five trait colors are mapped
            to CSS variables: <Code>--color-openness</Code>, <Code>--color-conscientiousness</Code>,
            <Code>--color-extraversion</Code>, <Code>--color-agreeableness</Code>, and{' '}
            <Code>--color-stability</Code> (for Emotional Stability).
          </p>
        </DocCard>

        {/* 07 — The Sigil */}
        <DocCard id="sigil" num="07" title="The Sigil" nextSection={{ id: 'data-sources', num: '08', title: 'Data Sources' }}>
          <p style={{ marginBottom: '16px' }}>
            The Sigil is a <strong style={{ color: 'var(--color-text)' }}>deterministic identity mark</strong> —
            a unique visual signature derived entirely from your assessment data. It is not random.
            The same scores always produce the same mark, on any machine, because every choice
            (outline shape, weave pattern, colors, dot positions) is seeded by your trait and facet
            values through a hash function. Your mark is yours alone.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            How it's built
          </h3>
          <p style={{ marginBottom: '16px' }}>
            The outer <strong style={{ color: 'var(--color-text)' }}>bloom outline</strong> is a
            closed curve whose harmonics are weighted by your five trait scores — each trait
            contributes a sine wave at a different frequency, so the shape literally encodes your
            personality profile. Facet values add fine texture to the outline, and your
            Motivational Drivers (SD3) scores set the phase offset that shifts the whole pattern.
          </p>
          <p style={{ marginBottom: '16px' }}>
            Inside the bloom, an <strong style={{ color: 'var(--color-text)' }}>inner weave</strong>{' '}
            of strands appears once you start pulsing. Strand count, reach, and wildness are seeded
            by your facet values and cognitive (ICAR) score. The weave is what makes the mark feel
            alive — it grows with your data.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Maturity stages
          </h3>
          <p style={{ marginBottom: '16px' }}>
            The sigil evolves through <strong style={{ color: 'var(--color-text)' }}>six maturity
            stages</strong> as you contribute more data. Each stage adds a new visual layer:
          </p>
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '8px 16px',
              padding: '16px 20px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-button)',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--color-text-muted)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>0</span>
              <span><strong style={{ color: 'var(--color-text)' }}>No baseline</strong> — dashed frame with a center dot</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>1</span>
              <span><strong style={{ color: 'var(--color-text)' }}>Baseline complete</strong> — bloom outline appears</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>2</span>
              <span><strong style={{ color: 'var(--color-text)' }}>Pulse ≥ 1</strong> — inner weave, single muted color</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>3</span>
              <span><strong style={{ color: 'var(--color-text)' }}>Pulse ≥ 5</strong> — weave gains trait colors</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>4</span>
              <span><strong style={{ color: 'var(--color-text)' }}>Pulse ≥ 12</strong> — more weave strands</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>5</span>
              <span><strong style={{ color: 'var(--color-text)' }}>Pulse ≥ 25</strong> — solid ring in dominant-trait color + emotion dots</span>
            </div>
          </div>
          <p style={{ marginBottom: '16px' }}>
            Stages 0–1 are about establishing that you exist. Stages 2–4 are about depth — the mark
            fills in as more pulses accumulate. Stage 5 is the full signature: a solid ring in your
            dominant trait's color, with emotion dots whose positions are seeded by your facet
            values and whose opacity reflects how frequently you've reported each emotion across
            all pulses.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Milestone pips
          </h3>
          <p style={{ marginBottom: '16px' }}>
            Four <strong style={{ color: 'var(--color-text)' }}>milestone pips</strong> sit on the
            frame ring at 1, 5, 12, and 25 pulses. Unlike the rest of the mark, the pips are{' '}
            <em>identical for every user</em> — they are the shared status channel, not part of your
            fingerprint. They tell you (and anyone looking) how much longitudinal data backs the
            mark, without revealing anything about your personality. A pip lights up when you cross
            its threshold.
          </p>

          <Callout>
            The sigil is a <strong style={{ color: 'var(--color-text)' }}>fingerprint, not a
            portrait</strong>. It does not attempt to look like you or represent your mood. It is a
            deterministic hash of your data rendered as geometry — proof that the mark you see was
            produced by exactly your scores and no one else's.
          </Callout>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Sigil Lab
          </h3>
          <p style={{ marginBottom: '0' }}>
            The <strong style={{ color: 'var(--color-text)' }}>Sigil Lab</strong> page
            (<Code>/sigil-lab</Code>) lets you explore the mark interactively — adjust scores and
            pulse count to see how each input changes the output. It's the fastest way to
            understand the encoding: drag a trait slider and watch the bloom reshape, increase the
            pulse count and watch new layers appear.
          </p>
        </DocCard>

        {/* 08 — Data Sources */}
        <DocCard id="data-sources" num="08" title="Data Sources" nextSection={{ id: 'privacy', num: '09', title: 'Privacy & Ethics' }}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}
          >
            Demo Data
          </h3>
          <p style={{ marginBottom: '16px' }}>
            The default dashboard view uses a real ESM dataset from the openESM database (Beck &
            Jackson, 2022). Specifically, <strong style={{ color: 'var(--color-text)' }}>Participant
            221</strong> contributed <strong style={{ color: 'var(--color-text)' }}>158 pulses over
            43 days</strong>. The data covers a university semester spanning four phases: Semester
            (active daily sampling), Christmas break, New Year holiday, and Exam period.
          </p>
          <Callout type="info">
            Demo data is licensed under <strong style={{ color: 'var(--color-text)' }}>Creative
            Commons BY-NC 4.0</strong> — free to share and adapt with attribution, but not for
            commercial use. Your own user data is separate and is not subject to this license.
          </Callout>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            User Data
          </h3>
          <p style={{ marginBottom: '0' }}>
            Your assessment data is stored in <strong style={{ color: 'var(--color-text)'
            }}>Supabase PostgreSQL</strong> with row-level security (RLS) policies ensuring only you
            can read and write your own records. The <Code>assessments</Code> table stores both
            baseline and pulse assessments; the <Code>demo_data</Code> table holds the public demo
            dataset.
          </p>
        </DocCard>

        {/* 09 — Privacy & Ethics */}
        <DocCard id="privacy" num="09" title="Privacy & Ethics" nextSection={{ id: 'future', num: '10', title: 'Future: Smoothing & Aggregation' }}>
          <Callout type="warning">
            <strong style={{ color: 'var(--color-text)' }}>This is not a clinical assessment or
            diagnostic tool.</strong> The Personality Atlas does not diagnose, treat, or recommend
            treatment for any mental health condition. The data is descriptive, not prescriptive. If
            you are experiencing psychological distress, please consult a licensed professional.
          </Callout>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '20px',
            }}
          >
            Public Domain Items
          </h3>
          <p style={{ marginBottom: '16px' }}>
            All assessment items — IPIP-NEO-120, ICAR-16, and SD3-27 — are in the public domain.
            You can inspect, modify, and redistribute the item texts freely. There are no
            proprietary instruments hidden behind the scenes.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Data Security
          </h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: 'var(--color-text)' }}>Encryption in transit:</strong> All
              data is transmitted over HTTPS (TLS).
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: 'var(--color-text)' }}>Encryption at rest:</strong> Supabase
              encrypts stored data at the database level.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: 'var(--color-text)' }}>Row-level security:</strong> Supabase
              RLS policies enforce that only your authenticated user ID can access your records.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong style={{ color: 'var(--color-text)' }}>No third-party sharing:</strong> Your
              data is never sold, shared, or transmitted to any third party.
            </li>
          </ul>
        </DocCard>

        {/* 10 — Future */}
        <DocCard id="future" num="10" title="Future: Smoothing & Aggregation">
          <p style={{ marginBottom: '16px' }}>
            ESM time-series data is inherently noisy — a single bad day can create a spike that
            distorts the trajectory. Research shows that <strong style={{ color: 'var(--color-text)'
            }}>moving averages</strong> (either Simple Moving Average or Exponentially Weighted
            Moving Average) reduce noise while preserving meaningful trends.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Planned Feature
          </h3>
          <p style={{ marginBottom: '16px' }}>
            A toggle will let you switch between:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--color-text)' }}>Raw data</strong> — every pulse as a point</li>
            <li style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--color-text)' }}>Daily average</strong> — pulses grouped by day</li>
            <li style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--color-text)' }}>Weekly average</strong> — pulses grouped by week</li>
            <li style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--color-text)' }}>Monthly average</strong> — pulses grouped by month</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            A <strong style={{ color: 'var(--color-text)' }}>Simple Moving Average with window
            size 4</strong> (one day in the demo dataset, where pulses occur roughly 4×/day) would
            smooth intra-day variance while preserving daily trends. The choice of window is
            adaptive — for weekly pulses, a window of 4 represents approximately one month.
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '12px',
              marginTop: '24px',
            }}
          >
            Visualization Reference
          </h3>
          <p style={{ marginBottom: '0' }}>
            ESMvis (Bringmann et al., 2021) provides best-practice guidelines for visualizing
            ESM data — including recommendations for time-series plots, distribution views, and
            person-specific network models that we draw on for future chart design.
          </p>

          <div style={{ marginTop: '20px' }}>
            <Ref><strong style={{ color: 'var(--color-text-muted)' }}>Bringmann, L. F., et al.</strong> (2021). ESMvis: A tool for visualizing experience sampling method data. <em>Assessment</em>.</Ref>
          </div>
        </DocCard>

        {/* 11 — Accessibility Statement */}
        <DocCard id="accessibility" num="11" title="Accessibility Statement">
          <p style={{ marginBottom: '16px' }}>
            The Personality Atlas aims to conform to{' '}
            <strong style={{ color: 'var(--color-text)' }}>WCAG 2.2 Level AA</strong>.
            We test against keyboard navigation, screen readers (NVDA, VoiceOver),
            and reduced-motion preferences, and we publish the results here.
          </p>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h3-sm)', fontWeight: 500, color: 'var(--color-text)', marginBottom: '10px' }}>
            Supported
          </h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>Keyboard navigation:</strong> every interactive element is reachable via Tab; chart scrubbing via arrow keys; ⌘K opens the command palette; <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', border: '1px solid var(--color-border)', padding: '1px 5px', borderRadius: 'var(--radius-element)' }}>?</kbd> opens help.</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>Screen readers:</strong> semantic landmarks (<code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'var(--color-surface-elevated)', padding: '1px 5px', borderRadius: 'var(--radius-element)' }}>&lt;nav&gt;</code>, <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'var(--color-surface-elevated)', padding: '1px 5px', borderRadius: 'var(--radius-element)' }}>&lt;main&gt;</code>, <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'var(--color-surface-elevated)', padding: '1px 5px', borderRadius: 'var(--radius-element)' }}>&lt;footer&gt;</code>), skip-to-main link, <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'var(--color-surface-elevated)', padding: '1px 5px', borderRadius: 'var(--radius-element)' }}>aria-label</code> on icon-only buttons, data-table fallbacks for every chart.</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>Reduced motion:</strong> chart entrance animations skip when <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'var(--color-surface-elevated)', padding: '1px 5px', borderRadius: 'var(--radius-element)' }}>prefers-reduced-motion: reduce</code> is set. Final state renders directly.</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>Color contrast:</strong> text on background ≥ 4.5:1 in both dark and light themes; trait labels on chart backgrounds ≥ 3:1.</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>Touch targets:</strong> all interactive elements ≥ 32px hit area (most ≥ 44px).</li>
          </ul>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h3-sm)', fontWeight: 500, color: 'var(--color-text)', marginBottom: '10px' }}>
            Partially supported
          </h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>High-contrast mode:</strong> we detect <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'var(--color-surface-elevated)', padding: '1px 5px', borderRadius: 'var(--radius-element)' }}>forced-colors</code> media query but don't yet restyle every chart axis for it. In progress.</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text)' }}>Multi-language:</strong> currently English only.</li>
          </ul>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h3-sm)', fontWeight: 500, color: 'var(--color-text)', marginBottom: '10px' }}>
            Reporting issues
          </h3>
          <p style={{ marginBottom: '0' }}>
            If something is hard to use with your assistive tech, please{' '}
            <a href="mailto:rui.fc.silva@proton.me?subject=Atlas accessibility" style={{ color: 'var(--color-accent)', borderBottom: '1px solid var(--color-accent)' }}>email us</a>.
            We treat accessibility bugs as P1.
          </p>
        </DocCard>
      </main>
    </div>
  );
}
