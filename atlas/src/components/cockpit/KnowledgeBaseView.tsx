import { useState } from 'react';
import { KB_SECTIONS } from './cockpitKB';

// ── Collapsible section card ────────────────────────────────────
function SectionCard({ title, preview, children, defaultOpen = false }: {
  title: string;
  preview?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      marginBottom: '8px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '9px',
          color: 'var(--color-text-dim)',
          transition: 'transform 0.18s ease',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          flexShrink: 0,
        }}>
          ▶
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: open ? 'var(--color-accent)' : 'var(--color-text-muted)',
          flexShrink: 0,
          transition: 'color 0.18s ease',
        }}>
          {title}
        </span>
        {!open && preview && (
          <span style={{
            fontSize: '12px', color: 'var(--color-text-dim)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1, minWidth: 0, textAlign: 'right',
          }}>
            {preview}
          </span>
        )}
      </button>
      {open && (
        <div style={{
          padding: '0 16px 14px',
          borderTop: '1px solid var(--color-border)',
        }}>
          <div style={{ paddingTop: '12px', color: 'var(--color-text)' }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CV rendering (structured, compact) ──────────────────────────
const cvSectionHead: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
  letterSpacing: '0.12em', textTransform: 'uppercase',
  color: 'var(--color-accent)', margin: '14px 0 6px',
};
const cvBody: React.CSSProperties = {
  fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-muted)',
};
const cvRole: React.CSSProperties = {
  fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginTop: '10px',
};

function BaselineCV() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <a
          href="/cv-rui-silva.pdf"
          download="Rui-Silva-CV.pdf"
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            padding: '6px 12px',
            textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            transition: 'background 0.15s ease, border-color 0.15s ease',
          }}
        >
          ↓ Download PDF
        </a>
      </div>
      <div style={{ ...cvBody, fontStyle: 'italic', marginBottom: '4px' }}>
        Senior Creative Operations Leader | Ex-SVP, FARFETCH — Guimarães, Portugal · linkedin.com/in/ruisilvagmr · ruisilvastudio.com
      </div>
      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-dim)', marginBottom: '8px' }}>
        Based in Portugal · Open to remote (EU/global) · EU work authorization
      </div>

      <div style={cvSectionHead}>Executive Summary</div>
      <p style={cvBody}>
        Senior Creative Operations leader with 15 years scaling the creative engine of one of the world's largest luxury fashion platforms. Rose from Production Manager to SVP at FARFETCH, leading a 600+ FTE global organization (900+ with seasonal staff) across 5 countries with a €40M+ P&L. Delivered a 10%→1% reduction in operational spend through Lean/Kaizen, AI/ML automation, and Virtual Model technology without dropping luxury quality standards. Trained originally in textile and graphic design, which is why I understand the craft side as well as the operational side.
      </p>

      <div style={cvSectionHead}>Key Achievements</div>
      <div style={cvBody}>
        <div>• <strong>10% → 1%</strong> — operational spend as % of sales, without dropping quality</div>
        <div>• <strong>€40M+ P&L</strong> — annual operational spend across 5-country organization</div>
        <div>• <strong>600+ FTE</strong> — 900+ with seasonal staff, across Portugal, UK, US, Hong Kong</div>
        <div>• <strong>3.6M+ assets/yr</strong> — 800k SKUs, 4–5 day SLA from arrival to live</div>
        <div>• <strong>€60 → &lt;€30</strong> — cost-per-item via Virtual Model technology</div>
        <div>• <strong>80%+ automation</strong> — product categorization; ML translation in 12+ languages</div>
        <div>• <strong>30%+ efficiency</strong> — via Kaizen; 1st place, Kaizen Institute & APGEI award</div>
      </div>

      <div style={cvSectionHead}>Core Competencies</div>
      <div style={cvBody}>
        <div>• <strong>Strategic Leadership</strong> — Global org design (600–900 HC), P&L (€40M+), corporate strategy, cross-cultural teams (PT/UK/US/HK)</div>
        <div>• <strong>Operational Excellence</strong> — Kaizen/Lean, process engineering, RPA, TD-ABC</div>
        <div>• <strong>Creative Content at Scale</strong> — DAM (3.6M+ assets/yr), content supply chain, luxury QA</div>
        <div>• <strong>Technology Transformation</strong> — AI/ML content automation, product categorization, machine translation, Virtual Model, RPA</div>
        <div>• <strong>Craft & Design</strong> — Graphic, Product Design and Furniture Prototyping; artisanal quality at industrial-scale profitability</div>
      </div>

      <div style={cvSectionHead}>FARFETCH · 2009 – Feb 2024 (15 yrs)</div>
      <div style={{ ...cvBody, fontStyle: 'italic', fontSize: '12px', marginBottom: '6px' }}>
        Production Manager → SVP Creative Operations (15 years, 6 promotions)
      </div>
      <div style={cvRole}>SVP / VP Creative Operations · 2018 – 2024</div>
      <div style={cvBody}>
        Owned the end-to-end creative content supply chain, from product arrival to on-platform "live": photography, retouching, styling, copy, translation, categorization, catalogue management, and digital asset production across 5 countries. Led through 4 pillars: Content Development, Content Creation, PPM (Planning, Performance & Management), and SDD (Services Design & Development).
        <div style={{ marginTop: '4px' }}>
          • Drove 10%→1% reduction in operational spend as % of sales, managing €40M+ budget without dropping quality standards<br />
          • Led 600+ FTE team (900+ with seasonal staff) across PT/UK/US/HK; 6–7 direct reports<br />
          • Built Portugal and Hong Kong studios from scratch; developed and promoted internal talent<br />
          • Delivered 3.6M+ digital assets/yr, 800k SKUs, 4–5 day SLA<br />
          • Virtual Model technology: cut cost-per-item from €60 to &lt;€30<br />
          • 80%+ automation of product categorization; ML translation across 12+ languages
        </div>
      </div>
      <div style={cvRole}>Senior Director, Creative Operations · 2017 – 2018</div>
      <div style={cvBody}>
        Expanded creative operations into LA and Hong Kong, building 2 local teams and studios from scratch. Aligned production standards across 4 cultural markets with shared workflows and quality gates.
      </div>
      <div style={cvRole}>Earlier roles at FARFETCH · 2009 – 2016</div>
      <div style={{ ...cvBody, fontStyle: 'italic', fontSize: '12px' }}>
        Production Manager → Production Director → Global Production Director
      </div>
      <div style={cvBody}>
        Built the production engine from the shop floor. These were the years where the operational culture and quality standards that later scaled to 5 countries were formed. Led production across 4 countries reporting to the COO before stepping into the Senior Director role.
      </div>

      <div style={cvSectionHead}>Rui Silva Studio · Founder · May 2024 – present</div>
      <div style={cvBody}>
        A contemporary collectible furniture practice: one-of-a-kind pieces in oak, steel, brass, and porcelain. A labor of love kept running when time allows.
        <div style={{ marginTop: '4px' }}>
          • Designed and launched the Lusitano Collection, handcrafted furniture inspired by Portugal's Lusitano horse<br />
          • Own the full lifecycle: concept, design, sourcing, manufacturing, finishing, brand, website
        </div>
      </div>

      <div style={cvSectionHead}>Education & Certifications</div>
      <div style={cvBody}>
        CSPO (Scrum Alliance) · CAP Professional Trainer (AEP) · Photojournalism (GI Press) · Multimedia & Web Design (School of Technology / IPFEL)<br />
        <span style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>Methods training: Lean Thinking, VSM, SMED, 8D, TD-ABC</span>
      </div>

      <div style={cvSectionHead}>Languages</div>
      <div style={cvBody}>
        Portuguese (native) · English (professional)
      </div>
    </div>
  );
}

// ── Main view ───────────────────────────────────────────────────
export function KnowledgeBaseView() {
  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Baseline CV — expandable, collapsed by default */}
      <SectionCard title="Baseline CV" preview="SVP Creative Ops, FARFETCH · 15 yrs · €40M+ P&L · 600+ FTE">
        <BaselineCV />
      </SectionCard>

      {/* Credentials & skills — placeholder, wiring later */}
      <SectionCard title="Credentials & Skills" preview="Coming soon — add skills, awards, certificates">
        <div style={{ padding: '8px 0 4px' }}>
          <div style={{
            border: '1px dashed var(--color-border)', borderRadius: '6px',
            padding: '20px', textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-text-dim)', marginBottom: '6px',
            }}>
              + Add entry
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', lineHeight: 1.5 }}>
              Skills · Awards · Certificates · Languages — saved to your KB and used to improve job-match scoring.
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Existing KB sections — collapsible */}
      {KB_SECTIONS.map((section, idx) => (
        <SectionCard
          key={idx}
          title={section.title}
          preview={section.preview}
        >
          {section.content}
        </SectionCard>
      ))}
    </div>
  );
}
