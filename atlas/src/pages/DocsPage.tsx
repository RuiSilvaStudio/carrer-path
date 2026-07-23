import { useState, useEffect, useRef } from 'react';

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
  { id: 'data-sources', num: '07', title: 'Data Sources' },
  { id: 'privacy', num: '08', title: 'Privacy & Ethics' },
  { id: 'future', num: '09', title: 'Future: Smoothing & Aggregation' },
];

// ── Reusable card component ─────────────────────────────────────
function DocCard({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        scrollMarginTop: '60px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
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
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '24px',
          fontWeight: 500,
          color: 'var(--color-text)',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          marginBottom: '20px',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          lineHeight: 1.7,
          color: 'var(--color-text-muted)',
        }}
      >
        {children}
      </div>
    </section>
  );
}

// ── Inline code/formula ─────────────────────────────────────────
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        background: 'var(--color-surface-elevated)',
        color: 'var(--color-accent-bright)',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid var(--color-border)',
      }}
    >
      {children}
    </code>
  );
}

// ── Formula block ───────────────────────────────────────────────
function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        background: 'var(--color-surface-elevated)',
        color: 'var(--color-text)',
        padding: '14px 18px',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        margin: '16px 0',
        lineHeight: 1.6,
        overflowX: 'auto',
      }}
    >
      {children}
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
        borderRadius: '0 8px 8px 0',
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
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        style={{
          padding: '48px 40px 24px',
          maxWidth: '720px',
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
            fontSize: '36px',
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

      {/* ── Table of Contents ──────────────────────────────── */}
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 40px 32px',
        }}
      >
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
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
        ref={sectionsRef}
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 40px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* 01 — Overview */}
        <DocCard id="overview" num="01" title="What is the Personality Atlas?">
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
        <DocCard id="science" num="02" title="The Science">
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
        <DocCard id="instruments" num="03" title="Assessment Instruments">
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
        <DocCard id="scoring" num="04" title="Scoring Methodology">
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
        <DocCard id="pulse-design" num="05" title="Pulse Design — Why 5–10 Items?">
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
        <DocCard id="visualization" num="06" title="Data Visualization">
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

        {/* 07 — Data Sources */}
        <DocCard id="data-sources" num="07" title="Data Sources">
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

        {/* 08 — Privacy & Ethics */}
        <DocCard id="privacy" num="08" title="Privacy & Ethics">
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

        {/* 09 — Future */}
        <DocCard id="future" num="09" title="Future: Smoothing & Aggregation">
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
      </main>
    </div>
  );
}
