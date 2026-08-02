import { useState } from 'react';
import { useFeedback } from '../../hooks/useFeedback';
import { FEEDBACK_CONFIG, type FeedbackSurface } from '../../lib/feedback';

// ────────────────────────────────────────────────────────────────
// FeedbackPrompt
// One quiet, laddered feedback control. Boolean first, dropdown only
// on negative, ranking where configured, free text always optional.
// Renders nothing once answered or dismissed. Never interrupts.
// ────────────────────────────────────────────────────────────────

interface FeedbackPromptProps {
  surface: FeedbackSurface;
  /** Stable identifier for the thing being rated (insight id, stage, doc id…). */
  itemId: string | null;
  /** Override the configured prompt line. */
  label?: string;
  /** Visual variant: 'inline' sits under content, 'card' is a bordered panel. */
  variant?: 'inline' | 'card';
}

const mono: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

function Thumb({ up, active, onClick }: { up: boolean; active: boolean; onClick: () => void }) {
  const stroke = active ? 'var(--color-accent)' : 'var(--color-text-dim)';
  return (
    <button
      onClick={onClick}
      aria-label={up ? 'Yes, helpful' : 'No, not helpful'}
      style={{
        background: 'none',
        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-button)',
        padding: '8px 12px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        transition: 'border-color 0.15s ease',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {up ? (
          <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
        ) : (
          <path d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
        )}
      </svg>
    </button>
  );
}

export function FeedbackPrompt({ surface, itemId, label, variant = 'inline' }: FeedbackPromptProps) {
  const config = FEEDBACK_CONFIG[surface];
  const fb = useFeedback(surface, itemId);
  const [text, setText] = useState('');
  const [textSent, setTextSent] = useState(false);

  if (fb.state === 'hidden') return null;

  const containerStyle: React.CSSProperties =
    variant === 'card'
      ? {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-card)',
        }
      : { marginTop: '12px' };

  // ── Answered: collapse to a quiet thanks, plus optional text path. ──
  if (fb.state === 'answered') {
    const showText = config.allowText && !textSent;
    if (!showText) {
      return (
        <div style={containerStyle}>
          <span style={{ ...mono, color: 'var(--color-text-dim)' }}>Thanks for the feedback.</span>
        </div>
      );
    }
    return (
      <div style={containerStyle}>
        <div style={{ ...mono, color: 'var(--color-text-dim)', marginBottom: '8px' }}>Thanks.</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={config.textPlaceholder}
          rows={2}
          style={{
            width: '100%',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-input)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            padding: '10px 12px',
            resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={() => { fb.submitText(text); setTextSent(true); }}
            disabled={!text.trim()}
            style={{
              background: 'var(--color-accent)', color: 'var(--color-bg)',
              border: 'none', borderRadius: 'var(--radius-button)',
              padding: '8px 14px', ...mono, cursor: 'pointer',
              opacity: text.trim() ? 1 : 0.5,
            }}
          >
            Send
          </button>
          <button
            onClick={() => setTextSent(true)}
            style={{
              background: 'transparent', color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-button)',
              padding: '8px 14px', ...mono, cursor: 'pointer',
            }}
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  // ── Idle: the laddered prompt. ──
  return (
    <div style={containerStyle}>
      {/* Ranking-first surfaces (baseline, nps) */}
      {config.ranking ? (
        <RankingControl
          prompt={label ?? config.ranking.prompt}
          min={config.ranking.min}
          max={config.ranking.max}
          minLabel={config.ranking.minLabel}
          maxLabel={config.ranking.maxLabel}
          onSubmit={fb.submitRanking}
          onDismiss={fb.dismiss}
        />
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ ...mono, color: 'var(--color-text-muted)' }}>
              {label ?? config.prompt}
            </span>
            <Thumb up active={fb.vote === true} onClick={() => fb.submitBoolean(true)} />
            <Thumb up={false} active={fb.vote === false} onClick={() => fb.submitBoolean(false)} />
            <button
              onClick={fb.dismiss}
              aria-label="Dismiss"
              style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', ...mono }}
            >
              ✕
            </button>
          </div>

          {/* Negative path: dropdown offered, not required. */}
          {fb.vote === false && !fb.dropdownAnswered && config.negativeOptions && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ ...mono, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                {config.negativePrompt}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) fb.submitDropdown(e.target.value); }}
                  style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-input)',
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    padding: '10px 12px',
                  }}
                >
                  <option value="" disabled>Choose one…</option>
                  {config.negativeOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => fb.submitDropdown('skipped')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', ...mono }}
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RankingControl({
  prompt, min, max, minLabel, maxLabel, onSubmit, onDismiss,
}: {
  prompt: string;
  min: number; max: number;
  minLabel?: string; maxLabel?: string;
  onSubmit: (score: number) => void;
  onDismiss: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <div style={{ ...mono, color: 'var(--color-text-muted)', marginBottom: '12px' }}>{prompt}</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        {minLabel && <span style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginRight: '4px' }}>{minLabel}</span>}
        {values.map((v) => (
          <button
            key={v}
            onClick={() => setPicked(v)}
            style={{
              width: '36px', height: '36px',
              borderRadius: 'var(--radius-button)',
              border: `1px solid ${picked === v ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: picked === v ? 'var(--color-accent)' : 'transparent',
              color: picked === v ? 'var(--color-bg)' : 'var(--color-text)',
              fontFamily: 'var(--font-mono)', fontSize: '13px', cursor: 'pointer',
            }}
          >
            {v}
          </button>
        ))}
        {maxLabel && <span style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginLeft: '4px' }}>{maxLabel}</span>}
        <button
          onClick={() => picked !== null && onSubmit(picked)}
          disabled={picked === null}
          style={{
            marginLeft: '12px',
            background: 'var(--color-accent)', color: 'var(--color-bg)',
            border: 'none', borderRadius: 'var(--radius-button)',
            padding: '8px 14px', ...mono, cursor: 'pointer',
            opacity: picked !== null ? 1 : 0.5,
          }}
        >
          Send
        </button>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', ...mono }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
