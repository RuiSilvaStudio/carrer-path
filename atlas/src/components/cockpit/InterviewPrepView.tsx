import { useState } from 'react';
import { INTERVIEW } from './cockpitData';

export function InterviewPrepView() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      {INTERVIEW.map((item, idx) => {
        const expanded = expandedIdx === idx;
        return (
          <div
            key={idx}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              marginBottom: '12px',
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setExpandedIdx(expanded ? null : idx)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 20px',
                cursor: 'pointer',
              }}
            >
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '17px', fontWeight: 600,
                color: 'var(--color-text)',
                margin: 0, flex: 1, paddingRight: '12px',
                lineHeight: 1.3,
              }}>
                {item.q}
              </h3>
              <span style={{
                fontSize: '13px', color: 'var(--color-text-dim)',
                fontFamily: 'var(--font-mono)',
                flexShrink: 0,
              }}>
                {expanded ? '−' : '+'}
              </span>
            </div>
            {expanded && (
              <div style={{
                padding: '0 20px 18px',
                borderTop: '1px solid var(--color-border)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'var(--color-text-muted)',
                  paddingTop: '16px',
                  whiteSpace: 'pre-wrap',
                }}>
                  {item.a}
                </div>
                <div style={{ marginTop: '14px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(item.a, idx); }}
                    style={{
                      padding: '6px 14px',
                      background: copiedIdx === idx ? 'var(--color-success, #6ec48a)' : 'var(--color-surface-elevated)',
                      color: copiedIdx === idx ? 'var(--color-bg)' : 'var(--color-accent)',
                      border: `1px solid ${copiedIdx === idx ? 'var(--color-success, #6ec48a)' : 'var(--color-accent)'}`,
                      borderRadius: '4px',
                      fontSize: '11px', fontFamily: 'var(--font-mono)',
                      cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {copiedIdx === idx ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
