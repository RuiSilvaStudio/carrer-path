import { useState, useEffect } from 'react';
import { useCareerDirection } from '../hooks/useCareerDirection';
import { matchReference } from '../lib/careerRoleReference';
import {
  CAREER_STAGES,
  advanceStage,
  directionCountForComparison,
  directionFromTitle,
  getChosenDirection,
  getActiveDirections,
  getStageStatus,
  isExplorerStale,
  isMarketStale,
  type CareerDirection,
  type CareerDirectionData,
  type CareerStage,
  type StageStatus,
  type WizardStep,
} from '../lib/careerDirection';
import { track } from '../lib/analytics';
import { supabase, EDGE_FUNCTIONS_BASE } from '../lib/supabase';
import { WorkValuesAssessment } from '../components/career/WorkValuesAssessment';
import { ProfileBuilder } from '../components/career/ProfileBuilder';
import { FeedbackPrompt } from '../components/ui/FeedbackPrompt';
import { VALUE_LABELS, type WorkValuesResult } from '../lib/work-values-data';
import { type StructuredProfile } from '../lib/profile-data';

const ui = {
  page: { maxWidth: '1120px', margin: '0 auto', padding: '52px var(--space-page) 100px' },
  kicker: { color: 'var(--color-accent)', font: '11px var(--font-mono)', letterSpacing: '.12em', textTransform: 'uppercase' as const },
  h1: { font: '400 var(--fs-display)/1.04 var(--font-serif)', letterSpacing: '-.035em', margin: '12px 0 12px' },
  quiet: { color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.65 },
  rule: { border: 0, borderTop: '1px solid var(--color-border)', margin: '40px 0 20px' },
  panel: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '20px' },
  label: { display: 'block', color: 'var(--color-text-dim)', font: '10px var(--font-mono)', letterSpacing: '.11em', textTransform: 'uppercase' as const, marginBottom: '8px' },
  input: { width: '100%', color: 'var(--color-text)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', padding: '12px 12px', font: '14px/1.55 var(--font-sans)' },
  primary: { border: '1px solid var(--color-accent)', background: 'var(--color-accent)', color: 'var(--color-bg)', borderRadius: 'var(--radius-button)', padding: '12px 16px', font: '600 11px var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase' as const, cursor: 'pointer' },
  secondary: { border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-button)', padding: '12px 16px', font: '11px var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase' as const, cursor: 'pointer' },
  tag: { display: 'inline-flex', alignItems: 'center', padding: '4px 8px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-element)', font: '11px var(--font-sans)', color: 'var(--color-text)' },
};

// ── Nav status dot ─────────────────────────────────────────────────────
const STATUS_SYMBOL: Record<StageStatus, string> = {
  empty: '○',
  in_progress: '●',
  complete: '✓',
  stale: '⚠',
};
const STATUS_COLOR: Record<StageStatus, string> = {
  empty: 'var(--color-text-dim)',
  in_progress: 'var(--color-accent)',
  complete: 'var(--color-success)',
  stale: 'var(--color-warning)',
};

function stage(data: CareerDirectionData, next: CareerStage): CareerDirectionData {
  return { ...data, currentStage: next };
}

// ── Staleness banner ───────────────────────────────────────────────────
function StaleBanner({ message, onAction, actionLabel, onDismiss }: { message: string; onAction?: () => void; actionLabel?: string; onDismiss?: () => void }) {
  return (
    <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-warning)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--color-warning)', fontSize: '16px' }}>⚠</span>
      <p style={{ ...ui.quiet, fontSize: '13px', margin: 0, flex: 1, minWidth: '200px' }}>{message}</p>
      {onAction && actionLabel && (
        <button onClick={onAction} style={{ ...ui.secondary, fontSize: '10px', padding: '6px 12px', borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }}>{actionLabel}</button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} style={{ ...ui.secondary, fontSize: '10px', padding: '6px 10px' }}>Dismiss</button>
      )}
    </div>
  );
}

export function CareerDirectionPage() {
  const { data, setData, loading, saving, error, notice, save, deleteCareerData } = useCareerDirection();
  const [newDirection, setNewDirection] = useState('');

  const move = async (next: CareerDirectionData, message: string) => save(stage(next, advanceStage(next.currentStage)), message);

  // Touch profile to mark downstream as stale
  const touchProfile = (next: CareerDirectionData): CareerDirectionData => ({
    ...next,
    profileUpdatedAt: new Date().toISOString(),
  });

  if (loading) return <main className="atlas-page" style={ui.page}><p style={ui.quiet}>Opening your direction work…</p></main>;

  const currentStageStatus = (s: CareerStage) => getStageStatus(data, s);

  return (
    <main id="atlas-main" className="atlas-page career-direction-page" tabIndex={-1} style={ui.page}>
      {/* ── Nav with status dots ── */}
      <nav className="career-progress" aria-label="Career direction stages" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '40px', display: 'flex', overflowX: 'auto' }}>
        {CAREER_STAGES.map((item, index) => {
          const status = currentStageStatus(item.id);
          const isActive = item.id === data.currentStage;
          const isAccessible = index <= CAREER_STAGES.findIndex(s => s.id === data.currentStage) || status === 'complete';
          return (
            <button
              key={item.id}
              onClick={() => isAccessible && setData(stage(data, item.id))}
              disabled={!isAccessible}
              style={{
                background: 'transparent', border: 0,
                borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                color: isActive ? 'var(--color-accent)' : isAccessible ? 'var(--color-text-muted)' : 'var(--color-text-dim)',
                padding: '12px 12px', whiteSpace: 'nowrap',
                font: '10px var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase',
                cursor: isAccessible ? 'pointer' : 'not-allowed', opacity: isAccessible ? 1 : 0.4,
              }}
            >
              <span style={{ color: STATUS_COLOR[status], marginRight: '4px' }}>{STATUS_SYMBOL[status]}</span>
              {String(index + 1).padStart(2, '0')} <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {error && <p role="alert" style={{ color: 'var(--color-danger)', marginBottom: '20px' }}>{error}</p>}
      {notice && <p role="status" style={{ color: 'var(--color-success)', marginBottom: '20px' }}>{notice}</p>}

      {data.currentStage === 'profile' && <ProfileStep data={data} setData={setData} saving={saving} move={move} touchProfile={touchProfile} />}
      {data.currentStage === 'explorer' && <ExplorerStep data={data} setData={setData} saving={saving} save={save} newDirection={newDirection} setNewDirection={setNewDirection} />}
      {data.currentStage === 'brief' && <BriefStep data={data} setData={setData} saving={saving} move={move} />}
      {data.currentStage === 'marketAction' && <MarketActionStep data={data} setData={setData} saving={saving} save={save} />}

      <section style={{ ...ui.rule, paddingTop: '20px', borderTop: '1px solid var(--color-border)' }} aria-label="Career direction data controls">
        <p style={{ ...ui.quiet, fontSize: '12px', marginBottom: '12px' }}>Exporting or deleting here applies only to the information on this page.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => { const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'atlas-career-direction.json'; link.click(); URL.revokeObjectURL(url); }} style={ui.secondary}>Export my career data</button>
          <button onClick={() => { if (window.confirm('Delete your Career Direction data? This applies only to the information on this page.')) void deleteCareerData(); }} disabled={saving} style={{ ...ui.secondary, color: 'var(--color-danger)' }}>Delete career direction data</button>
        </div>
      </section>
    </main>
  );
}

type PageProps = {
  data: CareerDirectionData;
  setData: React.Dispatch<React.SetStateAction<CareerDirectionData>>;
  saving: boolean;
  move: (data: CareerDirectionData, message: string) => Promise<boolean>;
};

type StepProps = Omit<PageProps, 'move'>;

function Title({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return <><p style={ui.kicker}>{kicker}</p><h2 style={{ font: `400 var(--fs-display)/1.1 var(--font-serif)`, letterSpacing: '-.03em', margin: '8px 0' }}>{title}</h2><p style={{ ...ui.quiet, maxWidth: '680px', fontSize: '14px' }}>{children}</p></>;
}

function Actions({ back, onBack, next, onNext, disabled, saving }: { back?: string; onBack?: () => void; next: string; onNext: () => void; disabled?: boolean; saving: boolean }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '32px' }}>{back && <button onClick={onBack} style={ui.secondary}>{back}</button>}<button disabled={disabled || saving} onClick={onNext} style={{ ...ui.primary, opacity: disabled || saving ? .45 : 1, marginLeft: 'auto' }}>{saving ? 'Saving…' : next}</button></div>;
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 01 — PROFILE (merged: career history + work values)
// ═══════════════════════════════════════════════════════════════════════

function ProfileStep({ data, setData, saving, move, touchProfile }: PageProps & { touchProfile: (next: CareerDirectionData) => CareerDirectionData }) {
  const hasProfile = data.profile.roles.length > 0 || data.profile.careerSummary;
  const hasValues = !!data.preferences.workValues;
  const profileStatus = hasProfile ? '✓' : '○';
  const valuesStatus = hasValues ? '✓' : '○';

  // Track whether the user has made changes since last save.
  // On save, we snapshot the profile + values. Button re-activates only when
  // current data differs from the snapshot.
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(
    hasProfile || hasValues ? JSON.stringify({ p: data.profile, wv: data.preferences.workValues }) : null,
  );
  const currentSnapshot = JSON.stringify({ p: data.profile, wv: data.preferences.workValues });
  const hasUnsavedChanges = currentSnapshot !== savedSnapshot;
  const canSave = (hasProfile || hasValues) && hasUnsavedChanges;

  const handleProfileChange = (profile: StructuredProfile) => {
    setData(touchProfile({ ...data, profile }));
  };

  const handleValuesComplete = (result: WorkValuesResult) => {
    const updated = touchProfile({
      ...data,
      preferences: { ...data.preferences, workValues: result },
    });
    setData(updated);
  };

  const handleSave = async () => {
    setSavedSnapshot(currentSnapshot);
    await move(data, 'Profile saved.');
    void track('profile_saved', {
      has_roles: data.profile.roles.length > 0,
      has_summary: !!data.profile.careerSummary,
      has_work_values: !!data.preferences.workValues,
    });
  };

  return (
    <section>
      <Title kicker="01 / Your profile" title="Build your career foundation.">
        Atlas needs your career history and what matters to you. Both sections below are editable — fill them in any order.
      </Title>
      <hr style={ui.rule} />

      {/* ── Progress indicator ── */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', font: '11px var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--color-text-dim)' }}>
        <span style={{ color: hasProfile ? 'var(--color-success)' : 'var(--color-text-dim)' }}>{profileStatus} Career history</span>
        <span style={{ color: hasValues ? 'var(--color-success)' : 'var(--color-text-dim)' }}>{valuesStatus} Work values</span>
      </div>

      {/* ── Section A: Career history ── */}
      <div style={{ marginBottom: '48px' }}>
        <p style={{ ...ui.kicker, marginBottom: '16px' }}>Career history</p>
        <ProfileBuilder
          profile={data.profile}
          onChange={handleProfileChange}
        />
      </div>

      <hr style={ui.rule} />

      {/* ── Section B: Work values ── */}
      <div>
        <p style={{ ...ui.kicker, marginBottom: '16px' }}>What matters to you</p>
        <WorkValuesAssessment
          onComplete={handleValuesComplete}
          onBack={() => { /* no-op: both sections are on one page */ }}
          initialResult={data.preferences.workValues ?? null}
          saving={saving}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          style={{ ...ui.primary, opacity: saving || !canSave ? 0.5 : 1 }}
        >
          {saving ? 'Saving…' : hasUnsavedChanges ? 'Save and continue →' : 'Saved ✓'}
        </button>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 02 — EXPLORER (re-runnable wizard: Directions → Compare)
// ═══════════════════════════════════════════════════════════════════════

function ExplorerStep({ data, setData, saving, save, newDirection, setNewDirection }: StepProps & { save: (next: CareerDirectionData, message?: string) => Promise<boolean>; newDirection: string; setNewDirection: (v: string) => void }) {
  const [wizardStep, setWizardStep] = useState<WizardStep>('directions');
  const explorerStale = isExplorerStale(data);

  const handleChooseDirection = async (directionId: string) => {
    const updated: CareerDirectionData = {
      ...data,
      chosenDirectionId: directionId,
      explorerCompletedAt: new Date().toISOString(),
      directions: data.directions.map(d => ({
        ...d,
        selected: d.id === directionId,
        status: d.id === directionId ? 'active' as const : d.status,
      })),
    };
    // Save and navigate to Brief
    await save(stage(updated, 'brief'), 'Direction chosen. Building brief.');
    void track('direction_chosen', { direction_id: directionId });
  };

  return (
    <section>
      <Title kicker="02 / Explorer" title="Choose what deserves attention.">
        Atlas suggests directions based on your profile and work values. Add your own ideas too. When you're ready, compare side by side and pick one to take forward.
      </Title>
      <hr style={ui.rule} />

      {explorerStale && (
        <StaleBanner
          message="Your profile changed since your last exploration. Your directions may be different now."
          onDismiss={() => { /* user acknowledges */ }}
        />
      )}

      {/* ── Wizard step indicator ── */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', font: '11px var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
        <button
          onClick={() => setWizardStep('directions')}
          style={{ background: 'none', border: 0, cursor: 'pointer', color: wizardStep === 'directions' ? 'var(--color-accent)' : 'var(--color-text-dim)' }}
        >
          {wizardStep === 'directions' ? '●' : '○'} Directions
        </button>
        <button
          onClick={() => directionCountForComparison(data) >= 2 && setWizardStep('compare')}
          disabled={directionCountForComparison(data) < 2}
          style={{ background: 'none', border: 0, cursor: directionCountForComparison(data) >= 2 ? 'pointer' : 'not-allowed', color: wizardStep === 'compare' ? 'var(--color-accent)' : 'var(--color-text-dim)', opacity: directionCountForComparison(data) >= 2 ? 1 : 0.4 }}
        >
          {wizardStep === 'compare' ? '●' : '○'} Compare
        </button>
      </div>

      {wizardStep === 'directions' && (
        <DirectionsContent
          data={data}
          setData={setData}
          saving={saving}
          newDirection={newDirection}
          setNewDirection={setNewDirection}
          onContinue={() => setWizardStep('compare')}
        />
      )}

      {wizardStep === 'compare' && (
        <CompareContent
          data={data}
          setData={setData}
          saving={saving}
          onChoose={handleChooseDirection}
          onBack={() => setWizardStep('directions')}
        />
      )}
    </section>
  );
}

// ── Wizard Screen 1: Directions ────────────────────────────────────────

function DirectionsContent({ data, setData, saving, newDirection, setNewDirection, onContinue }: StepProps & { newDirection: string; setNewDirection: (v: string) => void; onContinue: () => void }) {
  const [loading, setLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [enrichingIds, setEnrichingIds] = useState<Set<string>>(new Set());
  const [hasFetched, setHasFetched] = useState(false);

  const SUGGEST_URL = `${EDGE_FUNCTIONS_BASE}suggest-direction`;
  const ENRICH_URL = `${EDGE_FUNCTIONS_BASE}enrich-direction`;

  const hasProfile = data.profile.roles.length > 0;
  const savedSuggestions = data.savedSuggestions ?? [];
  const activeSuggestions = savedSuggestions.filter((_, i) => !dismissed.has(String(i)));

  useEffect(() => {
    if (hasProfile && savedSuggestions.length === 0 && !hasFetched && !loading && !suggestionError) {
      fetchSuggestions();
    }
  }, [hasProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-enrich all unenriched directions on mount ─────────────────
  // This handles directions loaded from DB that never had enrichment,
  // and also re-enriches if the profile is stale.
  useEffect(() => {
    if (!hasProfile) return;
    const unenriched = data.directions.filter(d => !d.enrichment && !enrichingIds.has(d.id));
    if (unenriched.length === 0) return;
    // Enrich each one — fire all in parallel, they update independently via prev
    unenriched.forEach(d => enrichDirection(d.id));
  }, [hasProfile, data.directions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSuggestions = async () => {
    setLoading(true);
    setSuggestionError(null);
    setHasFetched(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in');

      const response = await fetch(SUGGEST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ profile: data.profile, workValues: data.preferences.workValues ?? null }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${response.status})`);
      }
      const result = await response.json();
      const newSuggestions = result.suggestions || [];
      setData(prev => ({ ...prev, savedSuggestions: newSuggestions }));
      setDismissed(new Set());
      void track('suggestions_fetched', { count: newSuggestions.length });
    } catch (err: any) {
      setSuggestionError(err.message || 'Could not load suggestions.');
    } finally {
      setLoading(false);
    }
  };

  // ── Enrich a single direction ──────────────────────────────────────
  const enrichDirection = async (directionId: string) => {
    // Use a ref to get the latest data — the closure's `data` may be stale
    const direction = data.directions.find(d => d.id === directionId);
    if (!direction || !hasProfile) return;
    setEnrichingIds(prev => new Set(prev).add(directionId));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(ENRICH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title: direction.title, profile: data.profile, workValues: data.preferences.workValues ?? null }),
      });
      if (!response.ok) return;
      const enrichment = await response.json();
      setData(prev => ({
        ...prev,
        directions: prev.directions.map(d => d.id === directionId ? {
          ...d,
          enrichment: { ...enrichment, enrichedAt: new Date().toISOString() },
          summary: enrichment.rationale || d.summary,
          unknown: enrichment.whatIsUnknown || d.unknown,
          nextTest: enrichment.suggestedTest || d.nextTest,
        } : d),
      }));
      void track('direction_enriched', { direction_id: directionId });
    } catch { /* silent */ }
    finally {
      setEnrichingIds(prev => { const n = new Set(prev); n.delete(directionId); return n; });
    }
  };

  const addDirection = (title?: string) => {
    const cleaned = (title ?? newDirection).trim();
    if (!cleaned) return;
    if (data.directions.some(item => item.title.toLowerCase() === cleaned.toLowerCase())) return;
    const newDir = directionFromTitle(cleaned);
    setData(prev => ({ ...prev, directions: [...prev.directions, newDir] }));
    setNewDirection('');
    void track('direction_added', { title: cleaned, total_directions: data.directions.length + 1 });
    // Auto-enrich on add
    if (hasProfile) {
      // Use setTimeout to let state settle before enriching
      setTimeout(() => enrichDirection(newDir.id), 100);
    }
  };

  const count = directionCountForComparison(data);

  return (
    <div>
      {/* ── AI Suggestions ── */}
      {hasProfile && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ ...ui.kicker, marginBottom: 0 }}>Suggested for you</p>
            {!loading && savedSuggestions.length > 0 && (
              <button onClick={() => { setDismissed(new Set()); fetchSuggestions(); }} style={{ ...ui.secondary, fontSize: '9px', padding: '4px 8px' }}>
                Reload suggestions
              </button>
            )}
          </div>
          {loading && <p style={{ ...ui.quiet, fontSize: '14px', padding: '20px 0' }}>Finding directions that match your profile…</p>}
          {suggestionError && (
            <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-warning)', marginBottom: '12px' }}>
              <p style={{ ...ui.quiet, fontSize: '13px', margin: 0 }}>{suggestionError}</p>
              <button onClick={fetchSuggestions} style={{ ...ui.secondary, marginTop: '8px', fontSize: '10px' }}>Try again</button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeSuggestions.map((sug) => {
              const realIdx = savedSuggestions.indexOf(sug);
              return <SuggestionCard key={realIdx} suggestion={sug} onAdd={() => { addDirection(sug.title); }} onDismiss={() => setDismissed(prev => new Set(prev).add(String(realIdx)))} />;
            })}
          </div>
          {!loading && activeSuggestions.length === 0 && !suggestionError && savedSuggestions.length > 0 && (
            <p style={{ ...ui.quiet, fontSize: '13px', padding: '12px 0' }}>All suggestions dismissed. Add your own direction below, or reload suggestions above.</p>
          )}
        </div>
      )}

      {/* ── Add your own direction ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input value={newDirection} onChange={(event) => setNewDirection(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addDirection(); } }} placeholder="Add a direction in your own words" style={{ ...ui.input, flex: '1 1 300px' }} />
        <button onClick={() => addDirection()} style={ui.secondary}>Add direction</button>
      </div>

      {/* ── Your directions ── */}
      {data.directions.length > 0 && <p style={{ ...ui.kicker, marginBottom: '12px' }}>Your directions</p>}
      <div className="career-choice-grid">
        {data.directions.map((direction) => (
          <DirectionChoice
            key={direction.id}
            direction={direction}
            enriching={enrichingIds.has(direction.id)}
            onToggle={() => setData(prev => ({ ...prev, directions: prev.directions.map((item) => item.id === direction.id ? { ...item, selected: !item.selected } : item) }))}
          />
        ))}
      </div>
      {data.directions.length === 0 && <p style={{ ...ui.quiet, padding: '20px 0' }}>No directions yet. Select at least two ideas worth examining.</p>}

      <Actions next={count >= 2 ? 'Compare →' : 'Select at least two directions'} disabled={count < 2} onNext={onContinue} saving={saving} />
    </div>
  );
}

interface Suggestion {
  title: string;
  rationale: string;
  skillOverlap: string[];
  skillGaps: string[];
  whatIsUnknown: string;
  suggestedTest: string;
}

function SuggestionCard({ suggestion, onAdd, onDismiss }: { suggestion: Suggestion; onAdd: () => void; onDismiss: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-accent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ font: '400 var(--fs-h3)/1.2 var(--font-serif)', color: 'var(--color-text)', margin: '0 0 8px' }}>{suggestion.title}</h3>
          <p style={{ ...ui.quiet, fontSize: '13px', margin: 0 }}>{suggestion.rationale}</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button onClick={onAdd} style={{ ...ui.primary, fontSize: '10px', padding: '4px 12px' }}>Add</button>
          <button onClick={onDismiss} style={{ ...ui.secondary, fontSize: '10px', padding: '4px 8px' }}>Dismiss</button>
        </div>
      </div>
      <button onClick={() => setExpanded(!expanded)} style={{ ...ui.secondary, fontSize: '10px', padding: '4px 8px', marginTop: '8px' }}>
        {expanded ? 'Hide details' : 'Show details'}
      </button>
      {expanded && (
        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ ...ui.kicker, marginBottom: '8px' }}>Skill overlap</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {suggestion.skillOverlap.map((s, i) => <span key={i} style={{ ...ui.tag, fontSize: '11px' }}>{s}</span>)}
            </div>
            <p style={{ ...ui.kicker, marginBottom: '8px', marginTop: '12px' }}>What's unknown</p>
            <p style={{ ...ui.quiet, fontSize: '12px', margin: 0 }}>{suggestion.whatIsUnknown}</p>
          </div>
          <div>
            <p style={{ ...ui.kicker, marginBottom: '8px' }}>Skill gaps</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {suggestion.skillGaps.map((s, i) => <span key={i} style={{ ...ui.tag, fontSize: '11px', borderColor: 'var(--color-warning)' }}>{s}</span>)}
            </div>
            <p style={{ ...ui.kicker, marginBottom: '8px', marginTop: '12px' }}>Suggested test</p>
            <p style={{ ...ui.quiet, fontSize: '12px', margin: 0 }}>{suggestion.suggestedTest}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DirectionChoice({ direction, enriching, onToggle }: { direction: CareerDirection; enriching?: boolean; onToggle: () => void }) {
  const reference = matchReference(direction.title);
  const hasEnrichment = !!direction.enrichment;
  return (
    <label className="career-choice" style={{ ...ui.panel, borderColor: direction.selected ? 'var(--color-accent)' : 'var(--color-border)', cursor: 'pointer' }}>
      <input type="checkbox" checked={direction.selected} onChange={onToggle} />
      <div>
        <p style={ui.kicker}>{direction.selected ? 'Included in comparison' : 'Not selected'}</p>
        <h3 style={{ font: '400 var(--fs-h2)/1.12 var(--font-serif)', margin: '8px 0 8px' }}>{direction.title}</h3>
        <p style={{ ...ui.quiet, fontSize: '13px' }}>{reference?.description ?? direction.summary}</p>
        {enriching && <p style={{ ...ui.quiet, fontSize: '11px', color: 'var(--color-accent)', marginTop: '8px' }}>Analysing…</p>}
        {!enriching && hasEnrichment && (
          <p style={{ ...ui.quiet, fontSize: '11px', color: 'var(--color-success)', marginTop: '8px' }}>✓ Analysed — see in Compare</p>
        )}
        <p style={{ color: 'var(--color-text-dim)', font: '10px/1.55 var(--font-mono)', letterSpacing: '.04em', marginTop: '12px' }}>{reference ? `ESCO / ISCO-08 ${reference.iscoCode}` : 'Your own direction'}</p>
      </div>
    </label>
  );
}

// ── Wizard Screen 2: Compare & Decide ──────────────────────────────────

function CompareContent({ data, saving, onChoose, onBack }: StepProps & { onChoose: (directionId: string) => Promise<void>; onBack: () => void }) {
  const wv = data.preferences.workValues;
  const directions = getActiveDirections(data);

  return (
    <div>
      {/* ── Your context (top, always visible) ── */}
      <div style={{ ...ui.panel, marginBottom: '24px' }}>
        <p style={{ ...ui.kicker, marginBottom: '8px' }}>Your context</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <ContextItem label="Work values" value={wv ? wv.values.slice(0, 3).map(v => `${VALUE_LABELS[v.value]} (${v.score})`).join(' · ') : 'Not assessed'} />
          <ContextItem label="Arrangement" value={data.profile.workArrangement ?? 'Not set'} />
          <ContextItem label="Location" value={data.profile.location ?? 'Not set'} />
          <ContextItem label="Availability" value={data.profile.availability ?? 'Not set'} />
        </div>
      </div>

      {directions.length > 0 ? (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {directions.map(d => (
            <ComparisonCard key={d.id} direction={d} onTakeForward={() => onChoose(d.id)} saving={saving} />
          ))}
        </div>
      ) : (
        <p style={{ ...ui.quiet, padding: '30px 0' }}>Return to Directions and select at least two hypotheses.</p>
      )}

      <Actions back="← Directions" onBack={onBack} next="Back to directions" onNext={onBack} saving={saving} />
    </div>
  );
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ color: 'var(--color-text-dim)', fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '4px' }}>{label}</p>
      <p style={{ ...ui.quiet, fontSize: '13px', margin: 0 }}>{value}</p>
    </div>
  );
}

const RATING_CONFIG: Record<string, { label: string; color: string; symbol: string }> = {
  strong: { label: 'Strong', color: 'var(--color-success)', symbol: '●●●' },
  good: { label: 'Good', color: 'var(--color-accent)', symbol: '●●○' },
  stretch: { label: 'Stretch', color: 'var(--color-warning)', symbol: '●○○' },
};

function ComparisonCard({ direction, onTakeForward, saving }: {
  direction: CareerDirection;
  onTakeForward: () => void;
  saving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasEnrichment = !!direction.enrichment;
  const hasRatings = !!direction.enrichment?.dimensionRatings;
  const ratings = direction.enrichment?.dimensionRatings;

  return (
    <div style={{ ...ui.panel, flex: '1 1 300px', minWidth: '280px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: hasEnrichment ? `1px solid var(--color-border)` : 'none' }}>
        <h3 style={{ font: '400 var(--fs-h3-sm)/1.2 var(--font-serif)', color: 'var(--color-text)', margin: 0 }}>{direction.title}</h3>
      </div>

      {!hasEnrichment && (
        <div style={{ padding: '16px', flex: 1 }}>
          <p style={{ ...ui.quiet, fontSize: '12px', margin: '0 0 12px' }}>Not yet analysed. Go back to Directions to analyse this direction and see fit badges.</p>
        </div>
      )}

      {hasEnrichment && !hasRatings && (
        <div style={{ padding: '16px', flex: 1 }}>
          <p style={{ ...ui.quiet, fontSize: '12px', margin: '0 0 12px' }}>This direction was analysed with an older version. Go back to Directions and re-analyse for fit badges.</p>
          <button onClick={() => setExpanded(!expanded)} style={{ ...ui.secondary, fontSize: '9px', padding: '4px 8px' }}>
            {expanded ? 'Hide details' : 'Show details'}
          </button>
          {expanded && direction.enrichment && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <DetailSection label="Why it fits" text={direction.enrichment.rationale} />
              <div>
                <p style={{ ...ui.kicker, marginBottom: '8px' }}>Skills that transfer</p>
                <Tags tags={direction.enrichment.skillOverlap} />
              </div>
              <div>
                <p style={{ ...ui.kicker, marginBottom: '8px' }}>Skills to prove</p>
                <Tags tags={direction.enrichment.skillGaps} variant="warning" />
              </div>
            </div>
          )}
        </div>
      )}

      {hasEnrichment && hasRatings && ratings && (
        <>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(() => {
              const cfg = RATING_CONFIG[ratings.skills] ?? RATING_CONFIG.good;
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ ...ui.quiet, fontSize: '12px', margin: 0 }}>Skills</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ font: '12px var(--font-mono)', color: 'var(--color-text-dim)' }}>{cfg.symbol}</span>
                      <span style={{ font: '500 11px var(--font-sans)', color: cfg.color }}>{cfg.label}</span>
                    </span>
                  </div>
                  <div style={{ paddingLeft: '12px' }}>
                  {direction.enrichment!.skillOverlap.length > 0 && (
                    <p style={{ ...ui.quiet, fontSize: '11px', lineHeight: 1.4, margin: '0 0 4px' }}>
                      <span style={{ color: 'var(--color-text-dim)' }}>▸ Transfers:</span> {direction.enrichment!.skillOverlap.join(', ')}
                    </p>
                  )}
                  {direction.enrichment!.skillGaps.length > 0 && (
                    <p style={{ ...ui.quiet, fontSize: '11px', lineHeight: 1.4, margin: 0 }}>
                      <span style={{ color: 'var(--color-text-dim)' }}>▸ Gaps:</span> {direction.enrichment!.skillGaps.join(', ')}
                    </p>
                  )}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const cfg = RATING_CONFIG[ratings.workValues] ?? RATING_CONFIG.good;
              const wvBullets = direction.enrichment?.workValuesBullets;
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ ...ui.quiet, fontSize: '12px', margin: 0 }}>Work values</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ font: '12px var(--font-mono)', color: 'var(--color-text-dim)' }}>{cfg.symbol}</span>
                      <span style={{ font: '500 11px var(--font-sans)', color: cfg.color }}>{cfg.label}</span>
                    </span>
                  </div>
                  <div style={{ paddingLeft: '12px' }}>
                  {wvBullets?.strong && wvBullets.strong.length > 0 && (
                    <p style={{ ...ui.quiet, fontSize: '11px', lineHeight: 1.4, margin: '0 0 4px' }}>
                      <span style={{ color: 'var(--color-text-dim)' }}>▸ Serves:</span> {wvBullets.strong.join(', ')}
                    </p>
                  )}
                  {wvBullets?.stretch && wvBullets.stretch.length > 0 && (
                    <p style={{ ...ui.quiet, fontSize: '11px', lineHeight: 1.4, margin: 0 }}>
                      <span style={{ color: 'var(--color-text-dim)' }}>▸ May not:</span> {wvBullets.stretch.join(', ')}
                    </p>
                  )}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const cfg = RATING_CONFIG[ratings.practical] ?? RATING_CONFIG.good;
              const pBullets = direction.enrichment?.practicalFitBullets;
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ ...ui.quiet, fontSize: '12px', margin: 0 }}>Practical</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ font: '12px var(--font-mono)', color: 'var(--color-text-dim)' }}>{cfg.symbol}</span>
                      <span style={{ font: '500 11px var(--font-sans)', color: cfg.color }}>{cfg.label}</span>
                    </span>
                  </div>
                  <div style={{ paddingLeft: '12px' }}>
                  {pBullets && pBullets.map((b, i) => (
                    <p key={i} style={{ ...ui.quiet, fontSize: '11px', lineHeight: 1.4, margin: i === pBullets.length - 1 ? 0 : '0 0 4px' }}>
                      <span style={{ color: 'var(--color-text-dim)' }}>▸</span> {b}
                    </p>
                  ))}
                  {!pBullets && direction.enrichment!.practicalFitFlags.length > 0 && (
                    <p style={{ ...ui.quiet, fontSize: '11px', lineHeight: 1.4, margin: 0 }}>
                      <span style={{ color: 'var(--color-text-dim)' }}>▸</span> {direction.enrichment!.practicalFitFlags.join(' · ')}
                    </p>
                  )}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const cfg = RATING_CONFIG[ratings.evidence] ?? RATING_CONFIG.good;
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ ...ui.quiet, fontSize: '12px', margin: 0 }}>Evidence</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ font: '12px var(--font-mono)', color: 'var(--color-text-dim)' }}>{cfg.symbol}</span>
                      <span style={{ font: '500 11px var(--font-sans)', color: cfg.color }}>{cfg.label}</span>
                    </span>
                  </div>
                </div>
              );
            })()}

            {direction.enrichment?.unknownBullet && (
              <p style={{ ...ui.quiet, fontSize: '11px', lineHeight: 1.4, margin: 0, paddingLeft: '12px', paddingTop: '4px', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-dim)' }}>Unknown:</span> {direction.enrichment.unknownBullet}
              </p>
            )}

            {direction.enrichment?.testBullet && (
              <p style={{ ...ui.quiet, fontSize: '11px', lineHeight: 1.4, margin: 0, paddingLeft: '12px' }}>
                <span style={{ color: 'var(--color-text-dim)' }}>First step:</span> {direction.enrichment.testBullet}
              </p>
            )}
          </div>

          <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderTop: `1px solid var(--color-border)`, color: 'var(--color-text-muted)', font: '11px var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em', cursor: 'pointer' }}>
            {expanded ? 'Hide full analysis' : 'Read full analysis'}
          </button>
          {expanded && direction.enrichment && (
            <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <DetailSection label="Why it fits" text={direction.enrichment.rationale} />
              <DetailSection label="Work values alignment" text={direction.enrichment.workValuesAlignment} />
              <div>
                <p style={{ ...ui.kicker, marginBottom: '8px' }}>Practical fit</p>
                <p style={{ ...ui.quiet, fontSize: '12px', lineHeight: 1.5, margin: '0 0 8px' }}>{direction.enrichment.practicalFit}</p>
                <Tags tags={direction.enrichment.practicalFitFlags} />
              </div>
              <DetailSection label="Biggest unknown" text={direction.enrichment.whatIsUnknown} />
              <DetailSection label="First step" text={direction.enrichment.suggestedTest} />
            </div>
          )}
        </>
      )}

      <div style={{ padding: '12px 16px', borderTop: `1px solid var(--color-border)`, marginTop: 'auto' }}>
        <button
          onClick={onTakeForward}
          disabled={saving}
          style={{ ...ui.primary, width: '100%', fontSize: '10px', padding: '8px', opacity: saving ? 0.5 : 1 }}
        >
          Take this forward →
        </button>
      </div>
    </div>
  );
}

function DetailSection({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p style={{ ...ui.kicker, marginBottom: '4px' }}>{label}</p>
      <p style={{ ...ui.quiet, fontSize: '12px', lineHeight: 1.5, margin: 0 }}>{text}</p>
    </div>
  );
}

function Tags({ tags, variant }: { tags: string[]; variant?: 'warning' }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {tags.map((t, i) => (
        <span key={i} style={{ ...ui.tag, fontSize: '11px', borderColor: variant === 'warning' ? 'var(--color-warning)' : 'var(--color-border)' }}>{t}</span>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 03 — BRIEF (persistent home base)
// ═══════════════════════════════════════════════════════════════════════

function BriefStep({ data, setData, saving, move }: PageProps) {
  const [showNote, setShowNote] = useState(!!getChosenDirection(data)?.evidence);
  const direction = getChosenDirection(data);
  const briefStale = isExplorerStale(data);

  if (!direction) {
    return <section>
      <Title kicker="03 / Direction brief" title="Choose a direction first">A direction brief needs one active direction from your Explorer. Run the Explorer to select one.</Title>
      <Actions next="Open Explorer" onNext={() => setData(stage(data, 'explorer'))} saving={saving} />
    </section>;
  }

  const e = direction.enrichment;

  return (
    <section>
      <DirectionHero direction={direction} label="03 / Direction brief" state="A working hypothesis" />

      {briefStale && (
        <StaleBanner
          message="Your profile changed since this brief was created. Re-run the Explorer to refresh."
          onAction={() => setData(stage(data, 'explorer'))}
          actionLabel="Re-run Explorer"
        />
      )}

      {e ? (
        <div style={{ marginTop: '32px', maxWidth: '760px' }}>
          <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-accent)', marginBottom: '20px' }}>
            <p style={{ ...ui.kicker, marginBottom: '8px' }}>Why this fits</p>
            <p style={{ ...ui.quiet, fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{e.rationale}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={ui.panel}>
              <p style={{ ...ui.kicker, marginBottom: '10px' }}>Skills that transfer</p>
              <Tags tags={e.skillOverlap} />
            </div>
            <div style={ui.panel}>
              <p style={{ ...ui.kicker, marginBottom: '10px' }}>Skills to prove</p>
              <Tags tags={e.skillGaps} variant="warning" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={ui.panel}>
              <p style={{ ...ui.kicker, marginBottom: '8px' }}>Work values fit</p>
              <p style={{ ...ui.quiet, fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{e.workValuesAlignment}</p>
            </div>
            <div style={ui.panel}>
              <p style={{ ...ui.kicker, marginBottom: '8px' }}>Practical fit</p>
              <p style={{ ...ui.quiet, fontSize: '13px', lineHeight: 1.6, margin: '0 0 8px' }}>{e.practicalFit}</p>
              <Tags tags={e.practicalFitFlags} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ ...ui.panel, borderLeft: '2px solid var(--color-warning)' }}>
              <p style={{ ...ui.kicker, marginBottom: '8px' }}>Biggest unknown</p>
              <p style={{ ...ui.quiet, fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{e.whatIsUnknown}</p>
            </div>
            <div style={{ ...ui.panel, borderLeft: '2px solid var(--color-success)' }}>
              <p style={{ ...ui.kicker, marginBottom: '8px' }}>First step</p>
              <p style={{ ...ui.quiet, fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{e.suggestedTest}</p>
            </div>
          </div>

          {showNote ? (
            <div>
              <span style={ui.label}>Your notes on this brief</span>
              <textarea
                value={direction.evidence ?? ''}
                onChange={(event) => setData({ ...data, directions: data.directions.map((item) => item.id === direction.id ? { ...item, evidence: event.target.value } : item) })}
                placeholder="Anything you want to add or disagree with…"
                rows={3}
                style={{ ...ui.input, resize: 'vertical', marginBottom: '8px' }}
              />
              <button onClick={() => { setData({ ...data, directions: data.directions.map((item) => item.id === direction.id ? { ...item, evidence: '' } : item) }); setShowNote(false); }} style={{ ...ui.secondary, fontSize: '10px', padding: '4px 10px' }}>Remove note</button>
            </div>
          ) : (
            <button onClick={() => setShowNote(true)} style={{ ...ui.secondary, fontSize: '10px', padding: '6px 12px' }}>+ Add note</button>
          )}

          {/* Feedback: did this brief clarify the direction? */}
          <div style={{ marginTop: '24px' }}>
            <FeedbackPrompt surface="direction" itemId={`brief-${direction.id}`} />
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '32px', maxWidth: '760px' }}>
          <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-warning)' }}>
            <p style={{ ...ui.quiet, fontSize: '14px', margin: '0 0 12px' }}>This direction hasn't been analysed yet. Go back to the Explorer and click "Analyse this direction" to generate the full brief.</p>
            <button onClick={() => setData(stage(data, 'explorer'))} style={{ ...ui.secondary, fontSize: '10px', padding: '6px 12px' }}>← Back to Explorer</button>
          </div>
        </div>
      )}

      <Actions back="← Re-run Explorer" onBack={() => setData(stage(data, 'explorer'))} next="Continue to market & action →" onNext={() => move(data, 'Brief saved.')} saving={saving} />
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 04 — MARKET & ACTION
// ═══════════════════════════════════════════════════════════════════════

// ── Monochrome SVG action icon (matches Nav stroke style) ───────────────
function ActionIcon({ category, size = 14 }: { category: string; size?: number }) {
  const stroke = { fill: 'none', stroke: 'var(--color-text-dim)', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    network: <><circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="M12 7v4M12 11l-5 6M12 11l5 6" /></>,
    learn: <><path d="M4 19V6l8-3 8 3v13l-8 3-8-3z" /><path d="M12 3v18" /></>,
    prepare: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></>,
    custom: <><path d="M12 2l2.4 7.4H22l-6 4.8 2.3 7.4L12 17l-6.3 4.6 2.3-7.4-6-4.8h7.6L12 2z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} style={{ flexShrink: 0 }}>
      {paths[category] ?? paths.custom}
    </svg>
  );
}

function MarketActionStep({ data, setData, saving, save }: StepProps & { save: (next: CareerDirectionData, message?: string) => Promise<boolean> }) {
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const MARKET_URL = `${EDGE_FUNCTIONS_BASE}market-insight`;
  const ACTIONS_URL = `${EDGE_FUNCTIONS_BASE}suggest-actions`;

  const direction = getChosenDirection(data);
  const insight = data.marketInsight;
  const actions = data.actionItems ?? [];
  const hasMarket = !!insight;
  const hasActions = actions.length > 0;
  const marketStale = isMarketStale(data);

  useEffect(() => {
    if (!hasFetched && !hasMarket && !hasActions && direction) {
      setHasFetched(true);
      fetchBoth();
    }
  }, [hasFetched, hasMarket, hasActions, direction]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!direction) return <section>
      <Title kicker="04 / Market & Action" title="Choose a direction first">Market insight needs an active direction from your Brief.</Title>
      <Actions next="Open Brief" onNext={() => setData(stage(data, 'brief'))} saving={saving} />
    </section>;

  const fetchBoth = async () => {
    setError(null);
    setLoadingMarket(true);
    setLoadingActions(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in');

      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      };

      const [marketRes, actionsRes] = await Promise.all([
        fetch(MARKET_URL, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ direction: direction.title, profile: data.profile }),
        }),
        fetch(ACTIONS_URL, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ direction: direction.title }),
        }),
      ]);

      let marketInsight = data.marketInsight;
      let actionItems = data.actionItems ?? [];

      if (marketRes.ok) {
        const marketData = await marketRes.json();
        marketInsight = { ...marketData, generatedAt: new Date().toISOString() };
        void track('market_insight_generated');
      }

      if (actionsRes.ok) {
        const actionsData = await actionsRes.json();
        actionItems = (actionsData.actions || []).map((a: any, i: number) => ({
          id: `action-${Date.now()}-${i}`,
          title: a.title,
          description: a.description,
          category: a.category,
          done: false,
        }));
        void track('actions_generated', { count: actionItems.length });
      }

      save({ ...data, marketInsight, actionItems });
      void track('market_actions_loaded', { has_market: !!marketInsight, action_count: actionItems.length });

      if (!marketRes.ok && !actionsRes.ok) {
        setError('Could not load market insight or actions. Try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoadingMarket(false);
      setLoadingActions(false);
    }
  };

  const toggleAction = (id: string) => {
    save({ ...data, actionItems: (data.actionItems ?? []).map(a => a.id === id ? { ...a, done: !a.done } : a) });
  };

  const removeAction = (id: string) => {
    save({ ...data, actionItems: (data.actionItems ?? []).filter(a => a.id !== id) });
  };

  const addCustomAction = () => {
    const newAction = {
      id: `action-${Date.now()}`,
      title: 'New action',
      description: 'Click to edit',
      category: 'custom' as const,
      done: false,
    };
    save({ ...data, actionItems: [...(data.actionItems ?? []), newAction] });
  };

  const updateAction = (id: string, key: 'title' | 'description', value: string) => {
    save({ ...data, actionItems: (data.actionItems ?? []).map(a => a.id === id ? { ...a, [key]: value } : a) });
  };

  const confidenceColor = { low: 'var(--color-warning)', moderate: 'var(--color-accent)', high: 'var(--color-success)' };

  return (
    <section>
      <DirectionHero direction={direction} label="04 / Market & Action" state="What's happening and what to do" />

      {marketStale && insight && (
        <StaleBanner
          message={`Market insight is for "${insight.summary?.slice(0, 40) || 'a previous direction'}" but your current brief is "${direction.title}". Refresh for the current direction.`}
          onAction={fetchBoth}
          actionLabel="Refresh for current direction"
        />
      )}

      {error && (
        <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-danger)', marginTop: '24px' }}>
          <p style={{ ...ui.quiet, fontSize: '13px', margin: '0 0 8px', color: 'var(--color-danger)' }}>{error}</p>
          <button onClick={fetchBoth} style={{ ...ui.secondary, fontSize: '10px', padding: '6px 12px' }}>Try again</button>
        </div>
      )}

      {/* ── Market Insight ── */}
      <div style={{ marginTop: '32px', maxWidth: '860px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <p style={{ ...ui.kicker, marginBottom: 0 }}>Market insight</p>
            {insight && !loadingMarket && insight.generatedAt && (
              <span style={{ ...ui.quiet, fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-dim)' }}>
                {new Date(insight.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
          {insight && !loadingMarket && (
            <button onClick={fetchBoth} style={{ ...ui.secondary, fontSize: '9px', padding: '4px 10px' }}>Refresh</button>
          )}
        </div>

        {loadingMarket && <p style={{ ...ui.quiet, fontSize: '14px', padding: '20px 0' }}>Researching market for this direction…</p>}

        {insight && !loadingMarket && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-accent)' }}>
                <p style={{ ...ui.quiet, fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{insight.summary}</p>
              </div>

              <div style={ui.panel}>
                <p style={{ ...ui.kicker, marginBottom: '6px' }}>Demand trend</p>
                <p style={{ ...ui.quiet, fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{insight.demandTrend}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={ui.panel}>
                  <p style={{ ...ui.kicker, marginBottom: '8px' }}>Hiring</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {insight.hiringSectors.map((s, i) => <span key={i} style={{ ...ui.tag, fontSize: '11px' }}>{s}</span>)}
                  </div>
                </div>
                <div style={ui.panel}>
                  <p style={{ ...ui.kicker, marginBottom: '8px' }}>Pulled back</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {insight.frozenSectors.map((s, i) => <span key={i} style={{ ...ui.tag, fontSize: '11px', borderColor: 'var(--color-warning)' }}>{s}</span>)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={ui.panel}>
                  <p style={{ ...ui.kicker, marginBottom: '6px' }}>Salary range</p>
                  <p style={{ ...ui.quiet, fontSize: '13px', margin: 0 }}>{insight.salaryRange}</p>
                </div>
                <div style={ui.panel}>
                  <p style={{ ...ui.kicker, marginBottom: '6px' }}>AI impact</p>
                  <p style={{ ...ui.quiet, fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{insight.aiImpact}</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ ...ui.panel, borderLeft: '2px solid var(--color-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ ...ui.kicker, marginBottom: 0 }}>Confidence</p>
                  <span style={{ font: '500 12px var(--font-sans)', color: confidenceColor[insight.confidence] }}>{insight.confidence}</span>
                </div>
                <p style={{ ...ui.quiet, fontSize: '11px', lineHeight: 1.5, margin: 0 }}>Atlas cannot verify real-time local demand. This is general market context, not a hiring forecast.</p>
              </div>

              <div style={ui.panel}>
                <p style={{ ...ui.kicker, marginBottom: '12px' }}>Sources</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {insight.sources.map((src, i) => (
                    <div key={i}>
                      <a href={src.url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', font: '500 12px var(--font-sans)', textDecoration: 'none' }}>{src.name}</a>
                      <p style={{ ...ui.quiet, fontSize: '11px', lineHeight: 1.4, margin: '2px 0 0' }}>{src.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Action Items ── */}
      <div style={{ marginTop: '40px', maxWidth: '860px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ ...ui.kicker, marginBottom: 0 }}>Actions to move forward</p>
          {!loadingActions && actions.length > 0 && (
            <button onClick={addCustomAction} style={{ ...ui.secondary, fontSize: '9px', padding: '4px 10px' }}>+ Add action</button>
          )}
        </div>

        {loadingActions && <p style={{ ...ui.quiet, fontSize: '14px', padding: '20px 0' }}>Generating actions…</p>}

        {!loadingActions && actions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {actions.map(action => (
              <div key={action.id} style={{ ...ui.panel, display: 'flex', gap: '14px', alignItems: 'flex-start', opacity: action.done ? 0.5 : 1 }}>
                <button
                  onClick={() => toggleAction(action.id)}
                  style={{
                    width: '22px', height: '22px', borderRadius: 'var(--radius-element)',
                    border: `2px solid ${action.done ? 'var(--color-success)' : 'var(--color-border)'}`,
                    background: action.done ? 'var(--color-success)' : 'transparent',
                    cursor: 'pointer', flexShrink: 0, marginTop: '2px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-bg)', fontSize: '12px', lineHeight: 1,
                  }}
                >
                  {action.done ? '✓' : ''}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <ActionIcon category={action.category} />
                    {action.category === 'custom' ? (
                      <input
                        value={action.title}
                        onChange={(e) => updateAction(action.id, 'title', e.target.value)}
                        style={{ ...ui.input, padding: '4px 8px', font: '500 14px var(--font-sans)', flex: 1 }}
                      />
                    ) : (
                      <span style={{ font: '500 14px var(--font-sans)', color: 'var(--color-text)' }}>{action.title}</span>
                    )}
                  </div>
                  {action.category === 'custom' ? (
                    <input
                      value={action.description}
                      onChange={(e) => updateAction(action.id, 'description', e.target.value)}
                      style={{ ...ui.input, padding: '4px 8px', fontSize: '13px' }}
                    />
                  ) : (
                    <p style={{ ...ui.quiet, fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{action.description}</p>
                  )}
                </div>
                <button onClick={() => removeAction(action.id)} style={{ ...ui.secondary, fontSize: '9px', padding: '3px 8px', color: 'var(--color-text-dim)', flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', marginTop: '32px' }}>
        <button onClick={() => setData(stage(data, 'brief'))} style={ui.secondary}>← Back to Brief</button>
      </div>
    </section>
  );
}

function DirectionHero({ direction, label, state: stateLabel }: { direction?: CareerDirection; label: string; state: string }) {
  const fallback = label.includes('Market') ? 'Read the evidence\nbefore the story.' : 'Choose a direction';
  const description = label.includes('Market') ? 'Atlas does not manufacture a local trend, forecast, or title-level claim when the evidence is not ready.' : 'Start from a direction you want to examine.';
  return (
    <header className="career-direction-hero">
      <div>
        <p style={ui.kicker}>{label}</p>
        <h2 style={ui.h1}>{direction ? <>Explore <em style={{ color: 'var(--color-accent)', fontWeight: 300 }}>{direction.title}</em></> : fallback}</h2>
        <p style={{ ...ui.quiet, maxWidth: '650px' }}>{direction?.summary ?? description}</p>
      </div>
      <div className="career-state">
        <p style={ui.kicker}>{stateLabel}</p>
        <p style={{ ...ui.quiet, fontSize: '13px', marginTop: '4px' }}>{direction?.unknown || 'Make the next unknown explicit.'}</p>
      </div>
    </header>
  );
}
