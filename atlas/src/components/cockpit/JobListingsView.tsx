import { useState, useMemo } from 'react';
import type { JobListing, JobStatus } from '../../types/cockpit';
import type { NewJob } from '../../hooks/useJobListings';

const STATUS_ORDER: JobStatus[] = ['New', 'Reviewing', 'Promoted', 'Dismissed'];

function statusColor(status: JobStatus): string {
  switch (status) {
    case 'Promoted': return 'var(--color-success, #6ec48a)';
    case 'Reviewing': return 'var(--color-accent)';
    case 'Dismissed': return 'var(--color-text-dim)';
    default: return 'var(--color-warning, #d4a574)'; // New
  }
}

function scoreColor(score: number | null): string {
  if (score == null) return 'var(--color-text-dim)';
  if (score >= 0.65) return 'var(--color-success, #6ec48a)';
  if (score >= 0.45) return 'var(--color-accent)';
  return 'var(--color-text-dim)';
}

function scoreLabel(score: number | null): string {
  if (score == null) return '—';
  return `${Math.round(score * 100)}`;
}

// ── Publish-date helpers ────────────────────────────────────────
function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function postedLabel(dateStr: string | null): string | null {
  const days = daysSince(dateStr);
  if (days == null) return null;
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted 1 day ago';
  if (days < 30) return `Posted ${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'Posted 1+ month ago' : `Posted ${months}+ months ago`;
}

function stalenessColor(days: number | null): string {
  if (days == null) return 'var(--color-text-dim)';
  if (days <= 14) return 'var(--color-success, #6ec48a)';   // fresh
  if (days <= 45) return 'var(--color-warning, #d4a574)';   // aging
  return 'var(--color-danger, #c46e6e)';                    // stale — verify before applying
}

interface Props {
  jobs: JobListing[];
  addJob: (job: NewJob) => Promise<void>;
  setJobStatus: (id: number, status: JobStatus) => Promise<void>;
  deleteJob: (id: number) => Promise<void>;
}

export function JobListingsView({ jobs, addJob, setJobStatus, deleteJob }: Props) {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | JobStatus>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [newJob, setNewJob] = useState<Partial<NewJob>>({
    title: '', company: '', location: '', url: '', source: 'Manual',
    description: '', status: 'New', match_score: null, match_reasons: '', notes: '', posted_at: null,
  });

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || j.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, filterStatus]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: jobs.length };
    for (const s of STATUS_ORDER) c[s] = jobs.filter(j => j.status === s).length;
    return c;
  }, [jobs]);

  const handleAdd = async () => {
    if (!newJob.title?.trim()) return;
    await addJob({
      title: newJob.title || '',
      company: newJob.company || '',
      location: newJob.location || '',
      url: newJob.url || '',
      source: newJob.source || 'Manual',
      description: newJob.description || '',
      posted_at: newJob.posted_at || null,
      match_score: newJob.match_score ?? null,
      match_reasons: newJob.match_reasons || '',
      status: 'New',
      notes: newJob.notes || '',
    });
    setNewJob({ title: '', company: '', location: '', url: '', source: 'Manual', description: '', status: 'New', match_score: null, match_reasons: '', notes: '', posted_at: null });
    setView('list');
  };

  const promoted = counts['Promoted'] || 0;
  const reviewing = counts['Reviewing'] || 0;
  const avgScore = jobs.length
    ? Math.round((jobs.reduce((a, j) => a + (j.match_score ?? 0), 0) / jobs.length) * 100)
    : 0;

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <StatBox num={jobs.length} label="Listings" />
        <StatBox num={reviewing} label="Reviewing" />
        <StatBox num={promoted} label="Promoted" />
        <StatBox num={`${avgScore}`} label="Avg Match" suffix="%" />
      </div>

      {/* View toggle + add */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
        <button style={viewBtnStyle(view === 'list')} onClick={() => setView('list')}>List</button>
        <div style={{ flex: 1 }} />
        <button onClick={() => setView('add')} style={viewBtnStyle(view === 'add', true)}>+ Add Job</button>
      </div>

      {/* ── Add form ── */}
      {view === 'add' && (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: '8px', padding: '24px', marginBottom: '24px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 500,
            color: 'var(--color-text)', marginBottom: '20px',
          }}>
            New Job Listing
          </h2>
          <div className="atlas-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <FormField label="Title" value={newJob.title || ''} onChange={(v) => setNewJob({ ...newJob, title: v })} placeholder="e.g. VP Creative Operations" />
            <FormField label="Company" value={newJob.company || ''} onChange={(v) => setNewJob({ ...newJob, company: v })} placeholder="Company name" />
          </div>
          <div className="atlas-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <FormField label="Location" value={newJob.location || ''} onChange={(v) => setNewJob({ ...newJob, location: v })} placeholder="e.g. Remote (EU), London" />
            <FormField label="URL" value={newJob.url || ''} onChange={(v) => setNewJob({ ...newJob, url: v })} placeholder="https://…" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={newJob.description || ''}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              placeholder="Paste the job description…"
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAdd} style={primaryBtnStyle}>Save Job</button>
            <button onClick={() => setView('list')} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Search + status filter ── */}
      {view === 'list' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search jobs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, maxWidth: '300px', minWidth: '180px',
              padding: '10px 14px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: '6px',
              color: 'var(--color-text)', fontSize: '14px',
              fontFamily: 'var(--font-sans)', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['all', ...STATUS_ORDER] as const).map((s) => {
              const active = filterStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: '8px 14px',
                    background: active ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                    border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: '4px',
                    color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
                    fontSize: '11px', fontFamily: 'var(--font-mono)',
                    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {s === 'all' ? 'All' : s} <span style={{ opacity: 0.5, marginLeft: '2px' }}>{counts[s] ?? 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Job list ── */}
      {view === 'list' && (
        <div>
          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '14px' }}>
              No job listings found. Add one manually or adjust your filters.
            </div>
          )}
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              expanded={expandedId === job.id}
              onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
              onStatusChange={(s) => setJobStatus(job.id, s)}
              onDelete={() => { deleteJob(job.id); setExpandedId(null); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Job card ────────────────────────────────────────────────────
function JobCard({ job, expanded, onToggle, onStatusChange, onDelete }: {
  job: JobListing;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (s: JobStatus) => Promise<void>;
  onDelete: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const act = async (fn: () => Promise<void> | void) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px', marginBottom: '10px',
      overflow: 'hidden',
      opacity: job.status === 'Dismissed' ? 0.55 : 1,
      transition: 'opacity 0.2s ease',
    }}>
      {/* Header row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px',
          textAlign: 'left',
        }}
      >
        {/* Score badge */}
        <div style={{
          flexShrink: 0, width: '44px', height: '44px', borderRadius: '50%',
          border: `1.5px solid ${scoreColor(job.match_score)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500,
          color: scoreColor(job.match_score),
        }}>
          {scoreLabel(job.match_score)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 500,
            color: 'var(--color-text)', marginBottom: '3px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {job.title}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {job.company}{job.company && job.location ? ' · ' : ''}{job.location}
          </div>
          {postedLabel(job.posted_at) && (
            <div style={{
              fontSize: '11px', fontFamily: 'var(--font-mono)',
              color: stalenessColor(daysSince(job.posted_at)),
              marginTop: '3px', letterSpacing: '0.02em',
            }}>
              {postedLabel(job.posted_at)}
            </div>
          )}
        </div>
        <div style={{
          flexShrink: 0,
          fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: statusColor(job.status),
          border: `1px solid ${statusColor(job.status)}`,
          borderRadius: '4px', padding: '4px 8px',
        }}>
          {job.status}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--color-border)' }}>
          {/* Meta row */}
          <div style={{
            display: 'flex', gap: '16px', flexWrap: 'wrap',
            padding: '14px 0', fontSize: '12px', color: 'var(--color-text-dim)',
            fontFamily: 'var(--font-mono)',
          }}>
            {job.source && <span>Source: {job.source}</span>}
            {job.scraped_at && <span>Captured: {new Date(job.scraped_at).toLocaleDateString()}</span>}
            {job.url && (
              <a href={job.url} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                Open posting ↗
              </a>
            )}
          </div>

          {/* Why it matched */}
          {job.match_reasons && (
            <div style={{ marginBottom: '14px' }}>
              <div style={labelStyle}>Why it matched</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {job.match_reasons}
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div style={{ marginBottom: '16px' }}>
              <div style={labelStyle}>Description</div>
              <div style={{
                fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6,
                maxHeight: '220px', overflowY: 'auto', paddingRight: '8px',
                whiteSpace: 'pre-wrap',
              }}>
                {job.description}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {job.status !== 'Reviewing' && (
              <button disabled={busy} onClick={() => act(() => onStatusChange('Reviewing'))} style={actionBtnStyle}>
                Mark Reviewing
              </button>
            )}
            {job.status !== 'Promoted' && (
              <button disabled={busy} onClick={() => act(() => onStatusChange('Promoted'))} style={{ ...actionBtnStyle, ...promoteBtnStyle }}>
                ★ Promote
              </button>
            )}
            {job.status !== 'Dismissed' && (
              <button disabled={busy} onClick={() => act(() => onStatusChange('Dismissed'))} style={actionBtnStyle}>
                Dismiss
              </button>
            )}
            {job.status !== 'New' && (
              <button disabled={busy} onClick={() => act(() => onStatusChange('New'))} style={actionBtnStyle}>
                Reset to New
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button disabled={busy} onClick={() => act(onDelete)} style={deleteBtnStyle}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared bits (mirror Cockpit.tsx styles) ─────────────────────
function StatBox({ num, label, suffix }: { num: number | string; label: string; suffix?: string }) {
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: '8px', padding: '16px 20px', minWidth: '110px',
    }}>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400,
        color: 'var(--color-text)', lineHeight: 1.1, marginBottom: '4px',
      }}>
        {num}{suffix && <span style={{ fontSize: '16px', color: 'var(--color-text-dim)' }}>{suffix}</span>}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)',
      }}>
        {label}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--color-text-dim)', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)', borderRadius: '6px',
  color: 'var(--color-text)', fontSize: '14px',
  fontFamily: 'var(--font-sans)', outline: 'none',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: 'var(--color-accent)', color: 'var(--color-bg)',
  border: 'none', borderRadius: '6px',
  fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  cursor: 'pointer',
};

const ghostBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: 'none', color: 'var(--color-text-muted)',
  border: '1px solid var(--color-border)', borderRadius: '6px',
  fontFamily: 'var(--font-mono)', fontSize: '12px',
  letterSpacing: '0.08em', textTransform: 'uppercase',
  cursor: 'pointer',
};

const actionBtnStyle: React.CSSProperties = {
  padding: '8px 14px',
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)', borderRadius: '6px',
  color: 'var(--color-text)', fontSize: '12px',
  fontFamily: 'var(--font-sans)', cursor: 'pointer',
  transition: 'all 0.18s ease',
};

const promoteBtnStyle: React.CSSProperties = {
  border: '1px solid var(--color-success, #6ec48a)',
  color: 'var(--color-success, #6ec48a)',
};

const deleteBtnStyle: React.CSSProperties = {
  padding: '8px 14px',
  background: 'none',
  border: '1px solid var(--color-danger, #c46e6e)',
  borderRadius: '6px',
  color: 'var(--color-danger, #c46e6e)', fontSize: '12px',
  fontFamily: 'var(--font-sans)', cursor: 'pointer',
};

function viewBtnStyle(active: boolean, primary = false): React.CSSProperties {
  if (primary) {
    return {
      padding: '8px 16px',
      background: active ? 'var(--color-accent)' : 'var(--color-surface)',
      border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
      borderRadius: '6px',
      color: active ? 'var(--color-bg)' : 'var(--color-text)',
      fontSize: '12px', fontFamily: 'var(--font-mono)',
      cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
      transition: 'all 0.18s ease',
    };
  }
  return {
    padding: '8px 16px',
    background: active ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
    border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
    borderRadius: '6px',
    color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
    fontSize: '12px', fontFamily: 'var(--font-mono)',
    cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
    transition: 'all 0.18s ease',
  };
}
