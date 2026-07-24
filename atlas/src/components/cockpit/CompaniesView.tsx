import { useState, useMemo } from 'react';
import {
  COMPANIES, companyGroup, FILTER_GROUPS,
  type Company, type CompanyGroup,
} from './cockpitData';

// Status → color mapping for badges
function statusColor(status: string): string {
  // active=success, inactive=text-dim, acquired=warning
  if (['Inactive', 'Low priority', 'No fit now'].includes(status)) return 'var(--color-text-dim)';
  if (status === 'Acquired') return 'var(--color-warning, #d4a574)';
  if (status === 'Hiring') return 'var(--color-success, #6ec48a)';
  if (status === 'Warm contact' || status === 'Reach out') return 'var(--color-accent)';
  return 'var(--color-text-muted)';
}

const TIER_COLORS: Record<string, string> = {
  'A': 'var(--color-accent)',
  'B': 'var(--color-text-dim)',
  'C': 'var(--color-text-dim)',
};

export function CompaniesView() {
  const [filter, setFilter] = useState<CompanyGroup>('all');
  const [sortBy, setSortBy] = useState<'name' | 'tier'>('name');
  const [expandedName, setExpandedName] = useState<string | null>(null);

  // "active" filter = all non-inactive
  const filtered = useMemo(() => {
    let list = COMPANIES.filter((c) => {
      if (filter === 'all') return true;
      if (filter === 'active') return !['Inactive', 'Acquired', 'Low priority', 'No fit now'].includes(c.status);
      if (filter === 'luxury') {
        // Chalhoub is the luxury entry; also any with "luxury" in notes
        return c.name === 'Chalhoub Group' || /luxury/i.test(c.why);
      }
      return companyGroup(c) === filter;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // tier sort: A first, then B, then C
      const ta = a.tier.charCodeAt(0);
      const tb = b.tier.charCodeAt(0);
      if (ta !== tb) return ta - tb;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [filter, sortBy]);

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {FILTER_GROUPS.map((g) => {
          const active = filter === g.key;
          const count = g.key === 'all'
            ? COMPANIES.length
            : g.key === 'active'
              ? COMPANIES.filter(c => !['Inactive', 'Acquired', 'Low priority', 'No fit now'].includes(c.status)).length
              : g.key === 'luxury'
                ? COMPANIES.filter(c => c.name === 'Chalhoub Group' || /luxury/i.test(c.why)).length
                : COMPANIES.filter(c => companyGroup(c) === g.key).length;
          return (
            <button
              key={g.key}
              onClick={() => setFilter(g.key)}
              style={{
                padding: '6px 12px',
                background: active ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '4px',
                color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
                fontSize: '11px', fontFamily: 'var(--font-mono)',
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em',
                transition: 'all 0.18s ease',
              }}
            >
              {g.label} {count > 0 && <span style={{ opacity: 0.5, marginLeft: '4px' }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Sort dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--color-text-dim)',
        }}>
          Sort by
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'tier')}
          style={{
            padding: '6px 12px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)', borderRadius: '4px',
            color: 'var(--color-text)', fontSize: '13px',
            fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="name">Name (A–Z)</option>
          <option value="tier">Tier (A → C)</option>
        </select>
      </div>

      {/* Company grid */}
      <div className="atlas-grid-auto" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '12px',
      }}>
        {filtered.map((c) => (
          <CompanyCard
            key={c.name}
            company={c}
            expanded={expandedName === c.name}
            onToggle={() => setExpandedName(expandedName === c.name ? null : c.name)}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '14px' }}>
          No companies in this filter.
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company, expanded, onToggle }: {
  company: Company;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sc = statusColor(company.status);
  return (
    <div
      onClick={onToggle}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px', padding: '16px 18px',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 500,
            color: 'var(--color-text)', marginBottom: '4px',
          }}>
            {company.name}
          </div>
          {company.loc && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {company.loc}
              {company.commute ? ` · ${company.commute}` : ''}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
          <span style={{
            display: 'inline-block', fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
            fontWeight: 500, fontFamily: 'var(--font-mono)',
            color: sc,
            border: `1px solid ${sc}`,
            background: 'transparent',
            whiteSpace: 'nowrap',
          }}>
            {company.status}
          </span>
          <span style={{
            display: 'inline-block', fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
            fontWeight: 600, fontFamily: 'var(--font-mono)',
            background: company.tier === 'A' ? 'rgba(212, 165, 116, 0.12)' : 'rgba(168, 154, 135, 0.08)',
            color: TIER_COLORS[company.tier] || 'var(--color-text-dim)',
            border: `1px solid ${company.tier === 'A' ? 'var(--color-accent)' : 'var(--color-border)'}`,
            whiteSpace: 'nowrap',
          }}>
            Tier {company.tier}
          </span>
        </div>
      </div>
      {expanded && (
        <div style={{
          marginTop: '12px', paddingTop: '12px',
          borderTop: '1px solid var(--color-border)',
        }}>
          <div style={{
            fontSize: '13px', color: 'var(--color-text-muted)',
            lineHeight: 1.6, whiteSpace: 'pre-wrap',
          }}>
            {company.why}
          </div>
          {company.url && (
            <a href={company.url} target="_blank" rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-block', marginTop: '10px',
                fontSize: '12px', color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)', textDecoration: 'none',
              }}>
              {company.url.replace(/^https?:\/\//, '')} →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
