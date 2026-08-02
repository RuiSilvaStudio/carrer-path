import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAssessments } from '../hooks/useAssessments';
import { Sigil } from '../components/sigil/Sigil';
import { FeedbackPrompt } from '../components/ui/FeedbackPrompt';
import { sigilInputFromData, dominantTraitIndex, TRAIT_CSS_VARS, EMPTY_SIGIL_INPUT } from '../lib/sigil';
import type { AssessmentScores, BigFiveScores } from '../types';

const TRAIT_LABELS = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Emotional Stability'];

export function ProfilePage() {
  const { user, updateDisplayName, updatePassword } = useAuth();
  const { baseline, pulses, loading } = useAssessments(user?.id ?? null);

  const sigilInput = baseline
    ? sigilInputFromData(baseline.scores as AssessmentScores, pulses.length, pulses)
    : null;
  const dominant = sigilInput ? TRAIT_LABELS[dominantTraitIndex(sigilInput.bigFive as BigFiveScores)] : null;
  const dominantVar = sigilInput ? TRAIT_CSS_VARS[dominantTraitIndex(sigilInput.bigFive as BigFiveScores)] : null;

  const [name, setName] = useState(user?.displayName ?? '');
  const [nameMsg, setNameMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [nameBusy, setNameBusy] = useState(false);

  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  if (!user) return null;

  const saveName = async () => {
    if (!name.trim() || name.trim() === user.displayName) return;
    setNameBusy(true);
    setNameMsg(null);
    try {
      await updateDisplayName(name);
      setNameMsg({ kind: 'ok', text: 'Name updated.' });
    } catch (e) {
      setNameMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Failed to update name.' });
    } finally {
      setNameBusy(false);
    }
  };

  const savePassword = async () => {
    setPwMsg(null);
    if (pw1.length < 8) {
      setPwMsg({ kind: 'err', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (pw1 !== pw2) {
      setPwMsg({ kind: 'err', text: 'Passwords do not match.' });
      return;
    }
    setPwBusy(true);
    try {
      await updatePassword(pw1);
      setPwMsg({ kind: 'ok', text: 'Password updated. You stay signed in on this device.' });
      setPw1('');
      setPw2('');
    } catch (e) {
      setPwMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Failed to update password.' });
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="atlas-page" style={{ padding: '60px 40px', maxWidth: '640px', margin: '0 auto' }}>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h1)', fontWeight: 500,
        color: 'var(--color-text)', marginBottom: '8px',
      }}>
        Profile
      </h1>
      <p style={{
        fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6,
        marginBottom: '40px',
      }}>
        Signed in as <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{user.email}</span>
      </p>

      {/* ── Identity sigil ── */}
      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Your sigil</h2>
        <p style={sectionDescStyle}>
          A deterministic mark generated only from your assessment data — same scores, same mark, every time. It grows as you add pulses: bloom outline (baseline) → woven texture → milestone pips → a dominant-trait ring at 25 pulses.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
          {loading ? (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-dim)' }}>Loading…</p>
          ) : sigilInput ? (
            <>
              <Sigil input={sigilInput} size={132} showInsignia />
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '10px' }}>
                  {pulses.length === 0
                    ? 'Baseline complete. Your first pulse begins the woven texture and earns the first milestone pip.'
                    : `${pulses.length} ${pulses.length === 1 ? 'pulse' : 'pulses'} logged · ${Math.min(4, pulses.length >= 1 ? (pulses.length >= 25 ? 4 : pulses.length >= 12 ? 3 : pulses.length >= 5 ? 2 : 1) : 0)} of 4 milestones earned.`}
                </p>
                {pulses.length >= 25 && dominant && dominantVar && (
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Ring: <span style={{ color: `var(${dominantVar})`, fontWeight: 600 }}>{dominant}</span> — your dominant trait.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <Sigil input={EMPTY_SIGIL_INPUT} size={132} empty animate={false} />
              <p style={{ flex: '1 1 220px', minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Your sigil forms after your baseline. The frame is waiting.
              </p>
            </>
          )}
        </div>
      </section>

      {/* ── Display name ── */}
      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Display name</h2>
        <p style={sectionDescStyle}>
          Shown in the navigation bar. Falls back to your email if empty.
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameMsg(null); }}
              placeholder="e.g. Rui Silva"
              style={inputStyle}
            />
          </div>
          <button
            onClick={saveName}
            disabled={nameBusy || !name.trim() || name.trim() === user.displayName}
            style={{ ...primaryBtnStyle, opacity: (nameBusy || !name.trim() || name.trim() === user.displayName) ? 0.5 : 1 }}
          >
            Save
          </button>
        </div>
        {nameMsg && <div style={msgStyle(nameMsg.kind)}>{nameMsg.text}</div>}
      </section>

      {/* ── Change password ── */}
      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Change password</h2>
        <p style={sectionDescStyle}>
          Takes effect immediately. Other devices stay signed in until their sessions expire.
        </p>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>New password</label>
          <input
            type="password"
            value={pw1}
            onChange={(e) => { setPw1(e.target.value); setPwMsg(null); }}
            placeholder="At least 8 characters"
            style={inputStyle}
            autoComplete="new-password"
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Confirm new password</label>
          <input
            type="password"
            value={pw2}
            onChange={(e) => { setPw2(e.target.value); setPwMsg(null); }}
            placeholder="Repeat it"
            style={inputStyle}
            autoComplete="new-password"
          />
        </div>
        <button
          onClick={savePassword}
          disabled={pwBusy || !pw1 || !pw2}
          style={{ ...primaryBtnStyle, opacity: (pwBusy || !pw1 || !pw2) ? 0.5 : 1 }}
        >
          Update Password
        </button>
        {pwMsg && <div style={msgStyle(pwMsg.kind)}>{pwMsg.text}</div>}
      </section>

      {/* Feedback: the one account-level NPS ask. Once ever, user-initiated context. */}
      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Help shape Atlas Path</h2>
        <p style={sectionDescStyle}>
          One question, asked once. Your answer sets our direction.
        </p>
        <FeedbackPrompt surface="nps" itemId={`nps-${user.id}`} />
      </section>
    </div>
  );
}

// ── Styles (Atlas conventions) ──────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-card)',
  padding: '24px',
  marginBottom: '24px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-h3)',
  fontWeight: 500,
  color: 'var(--color-text)',
  marginBottom: '8px',
};

const sectionDescStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-text-dim)',
  lineHeight: 1.5,
  marginBottom: '20px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-text-dim)',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-input)',
  color: 'var(--color-text)',
  fontSize: '14px',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: 'var(--color-accent)',
  color: 'var(--color-bg)',
  border: 'none',
  borderRadius: 'var(--radius-button)',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const msgStyle = (kind: 'ok' | 'err'): React.CSSProperties => ({
  marginTop: '14px',
  fontSize: '13px',
  color: kind === 'ok' ? 'var(--color-success, #6ec48a)' : 'var(--color-danger, #c46e6e)',
});
