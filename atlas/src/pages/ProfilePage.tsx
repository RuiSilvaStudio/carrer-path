import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAssessments } from '../hooks/useAssessments';
import { supabase, EDGE_FUNCTIONS_BASE } from '../lib/supabase';
import { Sigil } from '../components/sigil/Sigil';
import { FeedbackPrompt } from '../components/ui/FeedbackPrompt';
import { ProfileBuilder } from '../components/career/ProfileBuilder';
import { Spinner } from '../components/ui/Spinner';
import { sigilInputFromData, EMPTY_SIGIL_INPUT } from '../lib/sigil';
import { exportAllData } from '../lib/exportAllData';
import {
  createEmptyProfile,
  type StructuredProfile,
  type CurrentSituation,
  type ChangeDriver,
  type WorkArrangement,
  type Mobility,
  type TravelTolerance,
  type Availability,
  type IncomeExpectation,
  SITUATION_OPTIONS,
  DRIVER_OPTIONS,
  ARRANGEMENT_OPTIONS,
  MOBILITY_OPTIONS,
  TRAVEL_OPTIONS,
  AVAILABILITY_OPTIONS,
  INCOME_OPTIONS,
} from '../lib/profile-data';
import type { AssessmentScores } from '../types';

type ProfileTab = 'identity' | 'career' | 'situation' | 'feedback' | 'account';

// ── Helpers to read/write career direction profile data ─────────────
async function loadCareerProfile(userId: string): Promise<StructuredProfile> {
  const { data: row } = await supabase
    .from('career_direction_profiles')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  const profile = (row?.data as any)?.profile as StructuredProfile | undefined;
  return profile ?? createEmptyProfile();
}

async function saveProfile(userId: string, profile: StructuredProfile): Promise<void> {
  // Fetch current record to preserve non-profile fields
  const { data: row } = await supabase
    .from('career_direction_profiles')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  const existing = (row?.data as Record<string, unknown>) ?? {};
  const updated = {
    ...existing,
    profile,
    profileUpdatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await supabase
    .from('career_direction_profiles')
    .upsert({ user_id: userId, data: updated }, { onConflict: 'user_id' });
}

export function ProfilePage() {
  const { user, updateDisplayName, updatePassword, signOut } = useAuth();
  const { baseline, pulses, loading: assessLoading } = useAssessments(user?.id ?? null);
  const navigate = useNavigate();

  // Active tab
  const [tab, setTab] = useState<ProfileTab>('identity');

  // Profile data (from career_direction_profiles)
  const [profile, setProfile] = useState<StructuredProfile>(createEmptyProfile());
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaveMsg, setProfileSaveMsg] = useState<string | null>(null);

  const sigilInput = baseline
    ? sigilInputFromData(baseline.scores as AssessmentScores, pulses.length, pulses)
    : null;

  const [name, setName] = useState(user?.displayName ?? '');
  const [nameMsg, setNameMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [nameBusy, setNameBusy] = useState(false);

  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [exportBusy, setExportBusy] = useState(false);
  const [exportMsg, setExportMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // ── Load profile on mount ──
  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    loadCareerProfile(user.id).then(p => {
      setProfile(p);
      setProfileLoading(false);
    });
  }, [user]);

  // Sync display name
  useEffect(() => {
    if (user?.displayName) setName(user.displayName);
  }, [user?.displayName]);

  // ── Career history save (defined before early return so hooks stay consistent) ──
  const handleProfileChange = useCallback(async (p: StructuredProfile) => {
    setProfile(p);
    setProfileSaveMsg(null);
    try {
      if (user) await saveProfile(user.id, p);
      setProfileSaveMsg('Saved.');
    } catch {
      setProfileSaveMsg('Could not save.');
    }
  }, [user]);

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
    if (pw1.length < 8) { setPwMsg({ kind: 'err', text: 'Password must be at least 8 characters.' }); return; }
    if (pw1 !== pw2) { setPwMsg({ kind: 'err', text: 'Passwords do not match.' }); return; }
    setPwBusy(true);
    try {
      await updatePassword(pw1);
      setPwMsg({ kind: 'ok', text: 'Password updated. You stay signed in on this device.' });
      setPw1(''); setPw2('');
    } catch (e) {
      setPwMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Failed to update password.' });
    } finally {
      setPwBusy(false);
    }
  };

  const handleExportAll = async () => {
    if (!user?.id) return;
    setExportBusy(true); setExportMsg(null);
    try {
      const { exported, skipped } = await exportAllData(user.id);
      if (exported.length > 0) {
        const msg = skipped.length > 0
          ? `Downloaded ${exported.length} file${exported.length === 1 ? '' : 's'}: ${exported.join(', ')}. Skipped (empty): ${skipped.join(', ')}.`
          : `Downloaded ${exported.length} file${exported.length === 1 ? '' : 's'}: ${exported.join(', ')}.`;
        setExportMsg({ kind: 'ok', text: msg });
      } else {
        setExportMsg({ kind: 'err', text: 'No data found to export.' });
      }
    } catch (e) {
      setExportMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Failed to export data.' });
    } finally {
      setExportBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleteBusy(true); setDeleteError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session.');
      const res = await fetch(`${EDGE_FUNCTIONS_BASE}delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      await signOut();
      navigate('/');
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete account.');
    } finally {
      setDeleteBusy(false);
    }
  };

  // ── Tabs ──
  const TABS: Array<{ id: ProfileTab; label: string; num: string }> = [
    { id: 'identity', label: 'Identity', num: '01' },
    { id: 'career', label: 'Career History', num: '02' },
    { id: 'situation', label: 'Situation', num: '03' },
    { id: 'feedback', label: 'Feedback', num: '04' },
    { id: 'account', label: 'Account', num: '05' },
  ];

  return (
    <div className="atlas-page" style={{ padding: '40px var(--space-page) 100px', maxWidth: '960px', margin: '0 auto' }}>
      {/* ── Horizontal tabs ── */}
      <nav className="atlas-sticky-tabs" style={{ display: 'flex', gap: '28px', borderBottom: '1px solid var(--color-border)', marginBottom: '32px', overflowX: 'auto' }} aria-label="Profile sections">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`atlas-tab-btn${tab === t.id ? ' active' : ''}`}
            data-active={tab === t.id ? 'true' : 'false'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 0 8px',
              font: '12px var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase',
              color: tab === t.id ? 'var(--color-accent)' : 'var(--color-text-dim)',
              borderBottom: tab === t.id ? '1px solid var(--color-accent)' : '1px solid transparent',
              marginBottom: '-1px', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <span>{t.num}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* ═══════════════ 01 — IDENTITY ═══════════════ */}
      {tab === 'identity' && (
        <section>
          <h2 style={{ font: '400 var(--fs-h2)/1.2 var(--font-serif)', marginBottom: '6px' }}>Identity</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Who you are on Atlas Path — your name, your account, your mark.
          </p>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--color-accent)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {assessLoading ? null : sigilInput ? (
                  <Sigil input={sigilInput} size={48} minimal animate={false} />
                ) : (
                  <Sigil input={EMPTY_SIGIL_INPUT} size={48} empty animate={false} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ font: '400 var(--fs-h3-sm)/1.2 var(--font-serif)' }}>{user.displayName || 'You'}</div>
                    <div style={{ font: '12px var(--font-mono)', color: 'var(--color-text-dim)' }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ font: '10px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>Baseline</span>
                    <br />
                    <span style={{ fontSize: '13px', color: baseline ? 'var(--color-success)' : 'var(--color-text-dim)' }}>{baseline ? 'Complete' : 'Not done'}</span>
                  </div>
                  <div>
                    <span style={{ font: '10px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>Pulses</span>
                    <br />
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{pulses.length} logged</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Display name */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)', marginBottom: '20px' }}>
            <h3 style={{ font: '400 var(--fs-h3)/1.2 var(--font-serif)', marginBottom: '8px' }}>Display name</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-dim)', lineHeight: 1.5, marginBottom: '16px' }}>
              Shown in the navigation bar. Falls back to your email if empty.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', font: '10px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '6px' }}>Name</label>
                <input
                  type="text" value={name}
                  onChange={(e) => { setName(e.target.value); setNameMsg(null); }}
                  placeholder="e.g. Rui Silva"
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none' }}
                />
              </div>
              <button
                onClick={saveName}
                disabled={nameBusy || !name.trim() || name.trim() === user.displayName}
                style={{ padding: '10px 20px', background: 'var(--color-accent)', color: 'var(--color-bg)', border: 'none', borderRadius: 'var(--radius-button)', font: '12px var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', opacity: (nameBusy || !name.trim() || name.trim() === user.displayName) ? 0.5 : 1 }}
              >
                Save
              </button>
            </div>
            {nameMsg && <div style={{ marginTop: '14px', fontSize: '13px', color: nameMsg.kind === 'ok' ? 'var(--color-success)' : 'var(--color-danger)' }}>{nameMsg.text}</div>}
          </div>
        </section>
      )}

      {/* ═══════════════ 02 — CAREER HISTORY ═══════════════ */}
      {tab === 'career' && (
        <section>
          <h2 style={{ font: '400 var(--fs-h2)/1.2 var(--font-serif)', marginBottom: '6px' }}>Career History</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Your roles, skills, education — what you've done. This data enables Explorer and Market & Action in the Career tab.
          </p>

          {profileLoading ? (
            <Spinner message="Loading your profile…" />
          ) : (
            <ProfileBuilder
              profile={profile}
              onChange={handleProfileChange}
            />
          )}

          {profileSaveMsg && (
            <p style={{ marginTop: '12px', fontSize: '13px', color: profileSaveMsg === 'Could not save.' ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {profileSaveMsg}
            </p>
          )}
        </section>
      )}

      {/* ═══════════════ 03 — SITUATION ═══════════════ */}
      {tab === 'situation' && (
        <section>
          <h2 style={{ font: '400 var(--fs-h2)/1.2 var(--font-serif)', marginBottom: '6px' }}>Your Situation</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Your current context — what's happening, what you're looking for, and your practical constraints.
          </p>

          {profileLoading ? (
            <Spinner message="Loading…" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Current situation */}
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)' }}>
                <h3 style={{ font: '400 var(--fs-h3)/1.2 var(--font-serif)', marginBottom: '16px' }}>Current situation</h3>
                <SituationField
                  label="What's happening right now?"
                  value={profile.currentSituation}
                  options={SITUATION_OPTIONS}
                  onChange={(v) => handleProfileChange({ ...profile, currentSituation: v as CurrentSituation })}
                />
                <div style={{ height: '12px' }} />
                <SituationField
                  label="What's driving the change?"
                  value={profile.changeDriver}
                  options={DRIVER_OPTIONS}
                  onChange={(v) => handleProfileChange({ ...profile, changeDriver: v as ChangeDriver })}
                />
                <div style={{ height: '12px' }} />
                <label style={{ display: 'block', font: '10px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '6px' }}>Note</label>
                <input
                  type="text" value={profile.situationNote ?? ''}
                  onChange={(e) => handleProfileChange({ ...profile, situationNote: e.target.value || null })}
                  placeholder="Add a note about your situation"
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none' }}
                />
              </div>

              {/* Practical conditions */}
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)' }}>
                <h3 style={{ font: '400 var(--fs-h3)/1.2 var(--font-serif)', marginBottom: '16px' }}>Practical conditions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <TextField label="Location" value={profile.location} onChange={(v) => handleProfileChange({ ...profile, location: v })} placeholder="e.g. Porto, Portugal" />
                  <SelectField label="Work arrangement" value={profile.workArrangement} options={ARRANGEMENT_OPTIONS} onChange={(v) => handleProfileChange({ ...profile, workArrangement: v as WorkArrangement })} />
                  <SelectField label="Mobility" value={profile.mobility} options={MOBILITY_OPTIONS} onChange={(v) => handleProfileChange({ ...profile, mobility: v as Mobility })} />
                  <SelectField label="Travel tolerance" value={profile.travelTolerance} options={TRAVEL_OPTIONS} onChange={(v) => handleProfileChange({ ...profile, travelTolerance: v as TravelTolerance })} />
                  <SelectField label="Availability" value={profile.availability} options={AVAILABILITY_OPTIONS} onChange={(v) => handleProfileChange({ ...profile, availability: v as Availability })} />
                  <SelectField label="Income expectation" value={profile.incomeExpectation} options={INCOME_OPTIONS} onChange={(v) => handleProfileChange({ ...profile, incomeExpectation: v as IncomeExpectation })} />
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══════════════ 04 — FEEDBACK ═══════════════ */}
      {tab === 'feedback' && (
        <section>
          <h2 style={{ font: '400 var(--fs-h2)/1.2 var(--font-serif)', marginBottom: '6px' }}>Feedback</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Help shape Atlas Path. One question, asked once. Your answer sets our direction.
          </p>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)' }}>
            <h3 style={{ font: '400 var(--fs-h3)/1.2 var(--font-serif)', marginBottom: '16px' }}>NPS Score</h3>
            <FeedbackPrompt surface="nps" itemId={`nps-${user.id}`} />
          </div>
        </section>
      )}

      {/* ═══════════════ 05 — ACCOUNT ═══════════════ */}
      {tab === 'account' && (
        <section>
          <h2 style={{ font: '400 var(--fs-h2)/1.2 var(--font-serif)', marginBottom: '6px' }}>Account & Data</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Manage your account settings and your data under GDPR.
          </p>

          {/* Change password */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)', marginBottom: '20px' }}>
            <h3 style={{ font: '400 var(--fs-h3)/1.2 var(--font-serif)', marginBottom: '8px' }}>Change password</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-dim)', lineHeight: 1.5, marginBottom: '16px' }}>
              Takes effect immediately. Other devices stay signed in until their sessions expire.
            </p>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', font: '10px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '6px' }}>New password</label>
              <input type="password" value={pw1} onChange={(e) => { setPw1(e.target.value); setPwMsg(null); }} placeholder="At least 8 characters"
                style={{ width: '100%', padding: '10px 14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', font: '10px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '6px' }}>Confirm new password</label>
              <input type="password" value={pw2} onChange={(e) => { setPw2(e.target.value); setPwMsg(null); }} placeholder="Repeat it"
                style={{ width: '100%', padding: '10px 14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none' }} />
            </div>
            <button onClick={savePassword} disabled={pwBusy || !pw1 || !pw2}
              style={{ padding: '10px 20px', background: 'var(--color-accent)', color: 'var(--color-bg)', border: 'none', borderRadius: 'var(--radius-button)', font: '12px var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', opacity: (pwBusy || !pw1 || !pw2) ? 0.5 : 1 }}>
              Update Password
            </button>
            {pwMsg && <div style={{ marginTop: '14px', fontSize: '13px', color: pwMsg.kind === 'ok' ? 'var(--color-success)' : 'var(--color-danger)' }}>{pwMsg.text}</div>}
          </div>

          {/* Export */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)', marginBottom: '20px' }}>
            <h3 style={{ font: '400 var(--fs-h3)/1.2 var(--font-serif)', marginBottom: '8px' }}>Export my data</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-dim)', lineHeight: 1.5, marginBottom: '16px' }}>
              Downloads all your data as CSV files — assessments, pulses, contacts, contact log, job listings, career profile, and feedback. Your right under GDPR data portability.
            </p>
            <button onClick={handleExportAll} disabled={exportBusy}
              style={{ padding: '10px 20px', background: 'var(--color-accent)', color: 'var(--color-bg)', border: 'none', borderRadius: 'var(--radius-button)', font: '12px var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {exportBusy ? 'Exporting…' : 'Download all my data'}
            </button>
            {exportMsg && <div style={{ marginTop: '14px', fontSize: '13px', color: exportMsg.kind === 'ok' ? 'var(--color-success)' : 'var(--color-danger)' }}>{exportMsg.text}</div>}
          </div>

          {/* Delete account */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)' }}>
            <h3 style={{ font: '400 var(--fs-h3)/1.2 var(--font-serif)', color: 'var(--color-danger)', marginBottom: '8px' }}>Delete account</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-dim)', lineHeight: 1.5, marginBottom: '16px' }}>
              Permanently deletes your account and all associated data — assessments, pulses, contacts, job listings, career profile, and feedback. This action cannot be undone and complies with GDPR data-erasure rights.
            </p>
            <button onClick={() => { setDeleteOpen(true); setDeleteConfirm(''); setDeleteError(''); }}
              style={{ padding: '10px 20px', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-button)', font: '12px var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Delete my account
            </button>
          </div>

          {/* Delete confirmation modal */}
          {deleteOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
              onClick={() => !deleteBusy && setDeleteOpen(false)}>
              <div onClick={(e) => e.stopPropagation()}
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '32px', maxWidth: '420px', width: '90%' }}>
                <h3 style={{ font: '400 var(--fs-h3)/1.2 var(--font-serif)', marginBottom: '12px', marginTop: 0 }}>Delete your account?</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                  This permanently erases everything — your baseline, pulses, contacts, job listings, career profile, and feedback. <strong style={{ color: 'var(--color-text)' }}>This cannot be undone.</strong>
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Type <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-danger)', fontWeight: 600 }}>DELETE</span> to confirm:
                </p>
                <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" disabled={deleteBusy} autoFocus
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--color-bg)', border: `1px solid ${deleteConfirm === 'DELETE' ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-input)', color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '20px' }} />
                {deleteError && <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '16px' }}>{deleteError}</p>}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setDeleteOpen(false)} disabled={deleteBusy}
                    style={{ padding: '10px 20px', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-button)', fontSize: '13px', cursor: deleteBusy ? 'not-allowed' : 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleDeleteAccount} disabled={deleteBusy || deleteConfirm !== 'DELETE'}
                    style={{ padding: '10px 20px', background: 'var(--color-danger)', color: 'var(--color-bg)', border: 'none', borderRadius: 'var(--radius-button)', fontSize: '13px', fontWeight: 600, cursor: (deleteBusy || deleteConfirm !== 'DELETE') ? 'not-allowed' : 'pointer', opacity: deleteConfirm !== 'DELETE' ? 0.5 : 1 }}>
                    {deleteBusy ? 'Deleting…' : 'Delete permanently'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

    </div>
  );
}

// ── Inline helper components ──────────────────────────────────────

function SituationField<T extends string>({ label, value, options, onChange }: {
  label: string; value: T | null; options: Array<{ value: T; label: string }>; onChange: (v: T) => void;
}) {
  return (
    <div>
      <label style={{ display: 'block', font: '10px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '6px' }}>{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value as T)}
        style={{ width: '100%', padding: '10px 14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none' }}
      >
        <option value="" disabled>Select one</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextField({ label, value, placeholder, onChange }: {
  label: string; value: string | null; placeholder: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={{ display: 'block', font: '10px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '6px' }}>{label}</label>
      <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none' }} />
    </div>
  );
}

function SelectField<T extends string>({ label, value, options, onChange }: {
  label: string; value: T | null; options: Array<{ value: T; label: string }>; onChange: (v: T) => void;
}) {
  return (
    <div>
      <label style={{ display: 'block', font: '10px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '6px' }}>{label}</label>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value as T)}
        style={{ width: '100%', padding: '10px 14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none' }}>
        <option value="" disabled>Select one</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
