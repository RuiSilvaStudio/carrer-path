import { useState, useEffect } from 'react';
import { useCareerDirection } from '../hooks/useCareerDirection';
import type { SaveStatus } from '../hooks/useCareerDirection';
import { matchReference } from '../lib/careerRoleReference';
import {
  CAREER_STAGES,
  directionFromTitle,
  getChosenDirection,
  getStageStatus,
  isExplorerStale,
  isMarketStale,
  type CareerDirection,
  type CareerDirectionData,
  type CareerStage,
  type WizardStep,
} from '../lib/careerDirection';
import { track } from '../lib/analytics';
import { supabase, EDGE_FUNCTIONS_BASE } from '../lib/supabase';
import { LLMLoader } from '../components/ui/LLMLoader';
import { Spinner } from '../components/ui/Spinner';
import { FeedbackPrompt } from '../components/ui/FeedbackPrompt';
import { VALUE_LABELS } from '../lib/work-values-data';

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

// ── Auto-save status pill ───────────────────────────────────────────
// Sits in the sticky stage-nav bar. Fades in when saving starts,
// fades out ~2.5s after save completes. Always visible when scrolled
// because the stage-nav bar is sticky (top: var(--nav-height)).
function SaveStatusPill({ status }: { status: SaveStatus }) {
  // Only render when there's something to show
  if (status === 'idle') return null;

  const config: Record<SaveStatus, { label: string; color: string; bg: string; border: string }> = {
    idle:     { label: '',         color: '',                    bg: '',                     border: '' },
    saving:   { label: 'Saving…', color: 'var(--color-text-muted)',  bg: 'var(--color-surface)',     border: 'var(--color-border)' },
    saved:    { label: 'Saved ✓', color: 'var(--color-success)', bg: 'var(--color-surface)',     border: 'var(--color-border)' },
    error:    { label: 'Couldn’t save', color: 'var(--color-danger)', bg: 'var(--color-surface)',  border: 'var(--color-danger)' },
  };

  const c = config[status];

  return (
    <span
      key={status}
      style={{
        font: '10px var(--font-mono)',
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-pill)',
        padding: '3px 10px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        animation: 'savePillFade 0.3s ease',
      }}
    >
      {c.label}
    </span>
  );
}

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
  const { data, setData, loading, saving, error, notice, save, saveStatus, deleteCareerData } = useCareerDirection();
  const [newDirection, setNewDirection] = useState('');

  if (loading) return <main className="atlas-page" style={ui.page}><Spinner message="Opening your direction work…" /></main>;

  const currentStageStatus = (s: CareerStage) => getStageStatus(data, s);
  const hasProfile = data.profile.roles.length > 0 || data.profile.careerSummary;

  // Only show explorer + marketAction tabs; skip 'profile' in the tab bar
  const visibleStages = CAREER_STAGES.filter(s => s.id !== 'profile');

  return (
    <main id="atlas-main" className="atlas-page career-direction-page" tabIndex={-1} style={ui.page}>
      {/* ── Header (always shown) ── */}
      <p style={ui.kicker}>Your Career</p>
      <h2 style={{ font: `400 var(--fs-display)/1.04 var(--font-serif)`, letterSpacing: '-.035em', margin: '12px 0 12px' }}>
        Build your career foundation.
      </h2>
      <p style={{ ...ui.quiet, maxWidth: '680px', fontSize: '14px', marginBottom: '32px' }}>
        Your career history is managed on your Profile page. Fill it in there, then come back here to explore directions.
      </p>

      {/* ── Gating: no career history → prompt to go to Profile ── */}
      {!hasProfile && (
        <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-accent)', marginBottom: '24px', textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ ...ui.quiet, fontSize: '15px', margin: '0 0 20px' }}>
            Add your career history on your Profile page to unlock career direction exploration.
          </p>
          <a
            href="/profile?tab=career"
            style={{ ...ui.primary, display: 'inline-block', textDecoration: 'none' }}
            onClick={(e) => { e.preventDefault(); window.location.href = '/profile?tab=career'; }}
          >
            Go to Profile →
          </a>
        </div>
      )}

      {/* ── Stage tabs (Explorer / Market & Action) + save pill ── */}
      {hasProfile && (
        <nav className="career-progress atlas-sticky-tabs" aria-label="Career direction stages" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '40px', display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
          {visibleStages.map((item, index) => {
            const status = currentStageStatus(item.id);
            const isActive = item.id === data.currentStage;
            const isAccessible = index <= visibleStages.findIndex(s => s.id === data.currentStage) || status === 'complete';
            return (
              <button
                key={item.id}
                onClick={() => isAccessible && setData(stage(data, item.id))}
                disabled={!isAccessible}
                data-active={isActive ? 'true' : 'false'}
                className={`atlas-tab-btn${isActive ? ' active' : ''}`}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="atlas-tab-label">{item.label}</span>
              </button>
            );
          })}
          <div style={{ marginLeft: 'auto', paddingLeft: '12px', flexShrink: 0 }}>
            <SaveStatusPill status={saveStatus} />
          </div>
        </nav>
      )}

      {error && <p role="alert" style={{ color: 'var(--color-danger)', marginBottom: '20px' }}>{error}</p>}
      {notice && <p role="status" style={{ color: 'var(--color-success)', marginBottom: '20px' }}>{notice}</p>}

      {hasProfile && data.currentStage === 'explorer' && <ExplorerStep data={data} setData={setData} saving={saving} save={save} newDirection={newDirection} setNewDirection={setNewDirection} />}
      {hasProfile && data.currentStage === 'marketAction' && <MarketActionStep data={data} setData={setData} saving={saving} save={save} />}

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
// STEP 02 — EXPLORER (re-runnable wizard: Suggested → Manual → Compare)
//            whose outcome is the Brief (the chosen direction)
// ═══════════════════════════════════════════════════════════════════════

function ExplorerStep({ data, setData, saving, save, newDirection, setNewDirection }: StepProps & { save: (next: CareerDirectionData, message?: string) => Promise<boolean>; newDirection: string; setNewDirection: (v: string) => void }) {
  const wizardStep: WizardStep = data.explorerStep ?? (data.chosenDirectionId ? 'brief' : 'suggested');
  const explorerStale = isExplorerStale(data);

  // Navigate the wizard and remember position (auto-saved via setData).
  const goTo = (step: WizardStep) => setData(prev => ({ ...prev, explorerStep: step }));

  // Pick one direction in Compare → mark chosen, land on the Brief outcome.
  const handleChooseDirection = async (directionId: string) => {
    const updated: CareerDirectionData = {
      ...data,
      chosenDirectionId: directionId,
      explorerCompletedAt: new Date().toISOString(),
      explorerStep: 'brief',
      directions: data.directions.map(d => ({
        ...d,
        selected: d.id === directionId,
        status: d.id === directionId ? 'active' as const : d.status,
      })),
    };
    await save(updated, 'Direction chosen. Building brief.');
    void track('direction_chosen', { direction_id: directionId });
  };

  // Slim progress: only shown while the wizard is running (not on the Brief).
  const WIZARD_META: Record<Exclude<WizardStep, 'brief'>, { n: number; label: string; title: string; sub: string }> = {
    suggested: { n: 1, label: 'Suggested for you', title: 'Choose what deserves attention.', sub: 'Atlas suggests directions from your profile. Add the ones worth comparing.' },
    manual:    { n: 2, label: 'Add your own',       title: 'Add your own ideas.',            sub: 'Add your own directions on top of the suggestions.' },
    compare:   { n: 3, label: 'Compare',            title: 'Compare and pick one.',          sub: 'Everything you saved, side by side. Take one forward.' },
  };
  const meta = wizardStep !== 'brief' ? WIZARD_META[wizardStep] : null;

  return (
    <section>
      {meta && (
        <>
          <Title kicker="02 / Explorer" title={meta.title}>{meta.sub}</Title>
          <hr style={ui.rule} />
          {/* ── Slim progress line (not a tab row — display only) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', font: '10px var(--font-mono)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-text-dim)', margin: '6px 0 26px' }}>
            <span>Step <span style={{ color: 'var(--color-accent)' }}>{meta.n}</span> of 3</span>
            {[1, 2, 3].map(i => (
              <span key={i} style={{ width: '22px', height: '2px', borderRadius: '2px', background: i <= meta.n ? 'var(--color-accent)' : 'var(--color-border)' }} />
            ))}
            <span style={{ marginLeft: 'auto' }}>{meta.label}</span>
          </div>
        </>
      )}

      {explorerStale && wizardStep !== 'brief' && (
        <StaleBanner
          message="Your profile changed since your last exploration. Your directions may be different now."
          onDismiss={() => { /* user acknowledges */ }}
        />
      )}

      {wizardStep === 'suggested' && (
        <SuggestedContent data={data} setData={setData} saving={saving} save={save} onContinue={() => goTo('manual')} />
      )}

      {wizardStep === 'manual' && (
        <ManualContent data={data} setData={setData} saving={saving} save={save} newDirection={newDirection} setNewDirection={setNewDirection} onBack={() => goTo('suggested')} onContinue={() => goTo('compare')} />
      )}

      {wizardStep === 'compare' && (
        <CompareContent data={data} setData={setData} saving={saving} onChoose={handleChooseDirection} onBack={() => goTo('manual')} />
      )}

      {wizardStep === 'brief' && (
        <BriefStep data={data} setData={setData} saving={saving} onRerun={() => goTo('suggested')} />
      )}
    </section>
  );
}

// ── Shared direction card (used in the wizard's saved lists) ────────────
function DirectionCard({ direction, enriching, onDelete }: { direction: CareerDirection; enriching?: boolean; onDelete: () => void }) {
  const reference = matchReference(direction.title);
  const hasEnrichment = !!direction.enrichment;
  return (
    <div style={{ ...ui.panel, position: 'relative' }}>
      <button
        onClick={(e) => { e.preventDefault(); onDelete(); }}
        aria-label="Delete direction"
        style={{
          position: 'absolute', top: '8px', right: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-dim)', fontSize: '16px', lineHeight: 1,
          padding: '4px 6px', minHeight: 'auto', minWidth: 'auto',
          opacity: 0.5, transition: 'opacity 0.15s ease, color 0.15s ease',
          zIndex: 1,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-danger)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--color-text-dim)'; }}
      >
        ×
      </button>
      <h3 style={{ font: '400 var(--fs-h3-sm)/1.12 var(--font-serif)', margin: '0 0 8px', paddingRight: '20px' }}>{direction.title}</h3>
      {enriching && <LLMLoader message="Analysing direction" loading={enriching} />}
      {!enriching && hasEnrichment && (
        <p style={{ ...ui.quiet, fontSize: '11px', color: 'var(--color-success)', margin: 0 }}>✓ Analysed — see in Compare</p>
      )}
      <p style={{ color: 'var(--color-text-dim)', font: '10px/1.55 var(--font-mono)', letterSpacing: '.04em', marginTop: hasEnrichment ? '8px' : '0' }}>{reference ? `ESCO / ISCO-08 ${reference.iscoCode}` : 'Your own direction'}</p>
    </div>
  );
}

// ── Shared saved-directions list ─────────────────────────────────────────
function SavedDirectionsList({ data, setData, save, enrichingIds }: StepProps & { save: (next: CareerDirectionData, message?: string) => Promise<boolean>; enrichingIds: Set<string> }) {
  if (data.directions.length === 0) return null;
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{ ...ui.kicker, marginBottom: '12px' }}>Your directions ({data.directions.length})</p>
      <div className="career-choice-grid">
        {data.directions.map((direction) => (
          <DirectionCard
            key={direction.id}
            direction={direction}
            enriching={enrichingIds.has(direction.id)}
            onDelete={() => {
              const next = { ...data, directions: data.directions.filter(d => d.id !== direction.id) };
              setData(next);
              void save(next, 'Direction removed.');
              void track('direction_deleted', { title: direction.title });
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Wizard Screen 1: Directions ────────────────────────────────────────

// ── Shared add + enrich logic (used by both Suggested and Manual steps) ──
function useDirectionActions(data: CareerDirectionData, setData: React.Dispatch<React.SetStateAction<CareerDirectionData>>, save: (next: CareerDirectionData, message?: string) => Promise<boolean>) {
  const [enrichingIds, setEnrichingIds] = useState<Set<string>>(new Set());
  const ENRICH_URL = `${EDGE_FUNCTIONS_BASE}enrich-direction`;
  const hasProfile = data.profile.roles.length > 0;

  // ── Enrich a single direction ──────────────────────────────────────
  const enrichDirection = async (directionId: string) => {
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
      setData(prev => {
        const updated = {
          ...prev,
          directions: prev.directions.map(d => d.id === directionId ? {
            ...d,
            enrichment: { ...enrichment, enrichedAt: new Date().toISOString() },
            summary: enrichment.rationale || d.summary,
            unknown: enrichment.whatIsUnknown || d.unknown,
            nextTest: enrichment.suggestedTest || d.nextTest,
          } : d),
        };
        void save(updated);
        return updated;
      });
      void track('direction_enriched', { direction_id: directionId });
    } catch { /* silent */ }
    finally {
      setEnrichingIds(prev => { const n = new Set(prev); n.delete(directionId); return n; });
    }
  };

  const addDirection = (title: string) => {
    const cleaned = title.trim();
    if (!cleaned) return;
    if (data.directions.some(item => item.title.toLowerCase() === cleaned.toLowerCase())) return;
    const newDir = directionFromTitle(cleaned);
    const next = { ...data, directions: [...data.directions, newDir] };
    setData(next);
    void track('direction_added', { title: cleaned, total_directions: next.directions.length });
    void save(next, 'Direction added.');
    if (hasProfile) setTimeout(() => enrichDirection(newDir.id), 100);
  };

  // Auto-enrich any direction that has no analysis yet (covers reloads and
  // the single-direction "jump straight to Brief" case).
  useEffect(() => {
    if (!hasProfile) return;
    const unenriched = data.directions.filter(d => !d.enrichment && !enrichingIds.has(d.id));
    if (unenriched.length === 0) return;
    unenriched.forEach(d => enrichDirection(d.id));
  }, [hasProfile, data.directions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return { enrichingIds, addDirection, enrichDirection };
}

// ── Wizard Step 1: Suggested for you ────────────────────────────────────
function SuggestedContent({ data, setData, saving, save, onContinue }: StepProps & { save: (next: CareerDirectionData, message?: string) => Promise<boolean>; onContinue: () => void }) {
  const [loading, setLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [hasFetched, setHasFetched] = useState(false);
  const { enrichingIds, addDirection } = useDirectionActions(data, setData, save);

  const SUGGEST_URL = `${EDGE_FUNCTIONS_BASE}suggest-direction`;
  const hasProfile = data.profile.roles.length > 0;
  const savedSuggestions = data.savedSuggestions ?? [];
  const activeSuggestions = savedSuggestions.filter((_, i) => !dismissed.has(String(i)));

  useEffect(() => {
    if (hasProfile && savedSuggestions.length === 0 && !hasFetched && !loading && !suggestionError) {
      fetchSuggestions();
    }
  }, [hasProfile]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const incoming: Suggestion[] = result.suggestions || [];
      // Append fresh ideas to the pool — never wipe what the user already has,
      // and skip titles already saved or already shown.
      setData(prev => {
        const existing = new Set([
          ...prev.directions.map(d => d.title.toLowerCase()),
          ...(prev.savedSuggestions ?? []).map(s => s.title.toLowerCase()),
        ]);
        const fresh = incoming.filter(s => !existing.has(s.title.toLowerCase()));
        return { ...prev, savedSuggestions: [...(prev.savedSuggestions ?? []), ...fresh] };
      });
      void track('suggestions_fetched', { count: incoming.length });
    } catch (err: any) {
      setSuggestionError(err.message || 'Could not load suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const count = data.directions.length;

  return (
    <div>
      {/* ── Saved directions (persist across reloads) ── */}
      <SavedDirectionsList data={data} setData={setData} saving={saving} save={save} enrichingIds={enrichingIds} />

      {/* ── AI Suggestions ── */}
      {hasProfile && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ ...ui.kicker, marginBottom: 0 }}>Suggested for you</p>
            {!loading && savedSuggestions.length > 0 && (
              <button onClick={fetchSuggestions} style={{ ...ui.primary, fontSize: '10px', padding: '4px 8px' }}>
                Reload suggestions
              </button>
            )}
          </div>
          {loading && <LLMLoader message="Finding directions that match your profile" loading={loading} />}
          {suggestionError && (
            <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-warning)', marginBottom: '12px' }}>
              <p style={{ ...ui.quiet, fontSize: '13px', margin: 0 }}>{suggestionError}</p>
              <button onClick={fetchSuggestions} style={{ ...ui.secondary, marginTop: '8px', fontSize: '10px' }}>Try again</button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeSuggestions.map((sug) => {
              const realIdx = savedSuggestions.indexOf(sug);
              return <SuggestionCard key={realIdx} suggestion={sug} onAdd={() => { addDirection(sug.title); setDismissed(prev => new Set(prev).add(String(realIdx))); }} onDismiss={() => setDismissed(prev => new Set(prev).add(String(realIdx)))} />;
            })}
          </div>
          {!loading && activeSuggestions.length === 0 && !suggestionError && savedSuggestions.length > 0 && (
            <p style={{ ...ui.quiet, fontSize: '13px', padding: '12px 0' }}>That's every suggestion for now. Reload for fresh ideas, or continue to add your own.</p>
          )}
        </div>
      )}

      <Actions next={count >= 1 ? 'Continue →' : 'Add at least one direction'} disabled={count < 1} onNext={onContinue} saving={saving} />
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

// ── Wizard Step 2: Add your own ─────────────────────────────────────────
function ManualContent({ data, setData, saving, save, newDirection, setNewDirection, onBack, onContinue }: StepProps & { save: (next: CareerDirectionData, message?: string) => Promise<boolean>; newDirection: string; setNewDirection: (v: string) => void; onBack: () => void; onContinue: () => void }) {
  const { enrichingIds, addDirection } = useDirectionActions(data, setData, save);
  const count = data.directions.length;

  const handleAdd = () => {
    if (!newDirection.trim()) return;
    addDirection(newDirection);
    setNewDirection('');
  };

  return (
    <div>
      {/* ── Everything saved so far (LLM + manual) ── */}
      <SavedDirectionsList data={data} setData={setData} saving={saving} save={save} enrichingIds={enrichingIds} />

      {/* ── Add your own direction ── */}
      <p style={{ ...ui.kicker, marginBottom: '12px' }}>Add your own direction</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          value={newDirection}
          onChange={(event) => setNewDirection(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handleAdd(); } }}
          placeholder="A direction in your own words"
          style={{ ...ui.input, flex: '1 1 300px' }}
        />
        <button onClick={handleAdd} style={ui.secondary}>Add direction</button>
      </div>
      {count === 0 && <p style={{ ...ui.quiet, padding: '4px 0 8px' }}>Nothing saved yet — add at least one direction (here or from Suggested).</p>}

      <Actions back="← Suggested" onBack={onBack} next={count >= 1 ? 'Compare →' : 'Add at least one direction'} disabled={count < 1} onNext={onContinue} saving={saving} />
    </div>
  );
}

// ── Wizard Step 3: Compare & Decide ─────────────────────────────────────

function CompareContent({ data, saving, onChoose, onBack }: StepProps & { onChoose: (directionId: string) => Promise<void>; onBack: () => void }) {
  const wv = data.preferences.workValues;
  // Show every saved direction — the user picks one to take forward.
  const directions = data.directions.filter(d => d.status === 'active');

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
        <div className="career-comparison">
          {directions.map(d => (
            <ComparisonCard key={d.id} direction={d} onTakeForward={() => onChoose(d.id)} saving={saving} />
          ))}
        </div>
      ) : (
        <p style={{ ...ui.quiet, padding: '30px 0' }}>Nothing to compare yet — go back and add at least one direction.</p>
      )}

      <div style={{ display: 'flex', marginTop: '32px' }}>
        <button onClick={onBack} style={ui.secondary}>← Add your own</button>
      </div>
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
// EXPLORER OUTCOME — BRIEF (the chosen direction, end of the wizard)
// ═══════════════════════════════════════════════════════════════════════

function BriefStep({ data, setData, saving, onRerun }: Omit<PageProps, 'move'> & { onRerun: () => void }) {
  const [showNote, setShowNote] = useState(!!getChosenDirection(data)?.evidence);
  const direction = getChosenDirection(data);
  const briefStale = isExplorerStale(data);

  if (!direction) {
    return <section>
      <Title kicker="02 / Explorer" title="Choose a direction first">A direction brief needs one direction. Run the Explorer to pick one.</Title>
      <Actions next="Open Explorer" onNext={onRerun} saving={saving} />
    </section>;
  }

  const e = direction.enrichment;

  return (
    <section>
      <DirectionHero direction={direction} label="02 / Explorer · Brief" state="A working hypothesis" />

      {briefStale && (
        <StaleBanner
          message="Your profile changed since this brief was created. Re-run the Explorer to refresh."
          onAction={onRerun}
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
            <p style={{ ...ui.quiet, fontSize: '14px', margin: '0 0 12px' }}>This direction hasn't been analysed yet. Atlas analyses it automatically once it's added — re-run the Explorer to generate the full brief.</p>
            <button onClick={onRerun} style={{ ...ui.secondary, fontSize: '10px', padding: '6px 12px' }}>← Re-run Explorer</button>
          </div>
        </div>
      )}

      {/* Finished state: only "Do it again" — no Market & Action button.
          Market & Action is reached via the top 03 tab. */}
      <div style={{ display: 'flex', marginTop: '32px' }}>
        <button onClick={onRerun} style={ui.secondary}>↺ Do it again</button>
      </div>
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
    <Title kicker="03 / Market & Action" title="Choose a direction first">Market insight needs a chosen direction from your Explorer.</Title>
    <Actions next="Open Explorer" onNext={() => setData(stage(data, 'explorer'))} saving={saving} />
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
      <DirectionHero direction={direction} label="03 / Market & Action" state="What's happening and what to do" />

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

        {loadingMarket && <LLMLoader message="Researching market for this direction" loading={loadingMarket} />}

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

        {loadingActions && <LLMLoader message="Generating actions" loading={loadingActions} />}

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
        <button onClick={() => setData({ ...stage(data, 'explorer'), explorerStep: 'brief' })} style={ui.secondary}>← Back to Brief</button>
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
        <h2 style={ui.h1}>{direction ? <>Explore <em>{direction.title}</em></> : fallback}</h2>
        <p style={{ ...ui.quiet, maxWidth: '650px' }}>{direction?.summary ?? description}</p>
      </div>
      <div className="career-state">
        <p style={ui.kicker}>{stateLabel}</p>
        <p style={{ ...ui.quiet, fontSize: '13px', marginTop: '4px' }}>{direction?.unknown || 'Make the next unknown explicit.'}</p>
      </div>
    </header>
  );
}
