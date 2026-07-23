import type React from 'react';

// ── Knowledge Base sections (static JSX content) ───────────────────
export interface KBSection {
  title: string;
  content: React.ReactNode;
}

const faintNote: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-text-dim)',
  marginTop: '6px',
};

const pillStyle: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '10px',
  padding: '2px 8px',
  borderRadius: '10px',
  fontWeight: 600,
  fontFamily: 'var(--font-mono)',
  background: 'rgba(212, 165, 116, 0.15)',
  color: 'var(--color-accent)',
  border: '1px solid var(--color-accent)',
  marginRight: '4px',
};

const decisionStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-text)',
  padding: '8px 0',
  borderBottom: '1px solid var(--color-border)',
  lineHeight: 1.5,
};

const bodyText: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: 1.6,
  color: 'var(--color-text)',
};

export const KB_SECTIONS: KBSection[] = [
  {
    title: 'Headline',
    content: (
      <div style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '14px', fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--color-text)' }}>
        <strong>Senior Creative Operations Leader | Ex-SVP, FARFETCH | Content Supply Chain &amp; Automation</strong>
      </div>
    ),
  },
  {
    title: 'LinkedIn Open to Work titles',
    content: (
      <>
        <div style={bodyText}>
          <p style={{ marginBottom: '4px' }}>
            <strong>1. Content Director</strong> — catches Content Operations (Adobe, Merck, Lilly, Netflix), Content Strategy, Content Supply Chain
          </p>
          <p style={{ marginBottom: '4px' }}>
            <strong>2. Creative Services Director</strong> — catches in-house creative team function (Fanatics, PVH, Warner Bros, Tom Ford). At VP level = Creative Operations.
          </p>
          <p>
            <strong>3. Director of Operations</strong> — broadest net. Catches VP Operations, Head of Operations, COO-track across every sector.
          </p>
        </div>
        <p style={faintNote}>Visibility: Recruiters only (not public). Locations: Portugal (Porto/Braga/Guimarães) + Remote EU/Global. Workplace: Remote, Hybrid, On-site.</p>
      </>
    ),
  },
  {
    title: 'Target job titles (search terms)',
    content: (
      <>
        <p style={bodyText}>
          VP Creative Services · Head of Creative Services · Head of Creative Production · Head of Creative Operations · Director Content Operations · Content Supply Chain · Studio Operations · Brand Operations
        </p>
        <p style={faintNote}>"Creative Operations" &amp; "Content Supply Chain" live in the headline (keyword search), not in LinkedIn's title dropdown (which doesn't recognise them).</p>
      </>
    ),
  },
  {
    title: 'About opening',
    content: (
      <div style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '14px', fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--color-text)' }}>
        I build the creative production systems that let creative work ship globally without losing quality.
      </div>
    ),
  },
  {
    title: 'Studio framing',
    content: (
      <div style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '14px', fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--color-text)' }}>
        A side venture, a labor of love I keep running when time allows.
      </div>
    ),
  },
  {
    title: 'Leadership archetype',
    content: (
      <p style={bodyText}>
        A precise, analytical, results-driven operational leader who combines systems thinking with genuine care for people — and whose edge is driving hard for perfection and control, sometimes harder than the situation needs.
      </p>
    ),
  },
  {
    title: 'Top 5 (CliftonStrengths)',
    content: (
      <>
        <p style={bodyText}>1. Relator · 2. Deliberative · 3. Learner · 4. Analytical · 5. Responsibility</p>
        <p style={faintNote}>+ Futuristic #7, Arranger #6, Strategic #8. Leads with Strategic Thinking + Executing.</p>
      </>
    ),
  },
  {
    title: 'DiSC',
    content: (
      <p style={bodyText}>
        <span style={pillStyle}>High C</span>{' '}
        Conscientiousness (primary) ·{' '}
        <span style={pillStyle}>High i</span>{' '}
        Influence (secondary). Pattern: "Prático".
      </p>
    ),
  },
  {
    title: 'Development areas (interview-ready)',
    content: (
      <div>
        <div style={decisionStyle}>• <strong>Blind spot:</strong> Under-claims strengths. LCP 360° showed others rate you ~10 pts higher. Practice saying "I drove X" plainly.</div>
        <div style={decisionStyle}>• <strong>Weakness answer:</strong> Perfectionism — backed by all 3 assessments.</div>
        <div style={{ ...decisionStyle, borderBottom: 'none' }}>• <strong>Network:</strong> Relator, not networker. Target 5-10 deep contacts.</div>
      </div>
    ),
  },
  {
    title: 'Credentials to pursue',
    content: (
      <>
        <div style={bodyText}>
          <div>1. MIT Prof Ed — Applied Generative AI ⭐</div>
          <div>2. Google Cloud Certified Generative AI Leader</div>
          <div>3. PMP</div>
          <div>4. Adobe Workfront Certification</div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '8px' }}>
          Do NOT display: Coursera content marketing, Google AI for Content Creation, Six Sigma Yellow Belt, Adobe GenStudio, Lokalise — too junior at SVP level.
        </p>
      </>
    ),
  },
  {
    title: 'Credibility assets',
    content: (
      <div style={bodyText}>
        <div style={{ marginBottom: '4px' }}>• <a href="https://www.youtube.com/watch?v=5moqOisGRYA" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>Henry Stewart DAM talk (2018)</a> — add to LinkedIn Featured</div>
        <div style={{ marginBottom: '4px' }}>• The org chart (4 pillars) — use in interviews</div>
        <div style={{ marginBottom: '4px' }}>• Kaizen 1st place award</div>
        <div>• ruisilvastudio.com — "Furniture as Cultural Infrastructure"</div>
      </div>
    ),
  },
];

// pillStyle and decisionStyle moved to top of file
