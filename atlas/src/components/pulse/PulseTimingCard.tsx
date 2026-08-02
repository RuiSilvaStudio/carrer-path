import type { Assessment } from '../../types';

interface Props {
  pulses: Assessment[];
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);

function formatHour(h: number): string {
  const period = h < 12 ? 'AM' : 'PM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}${period}`;
}

/**
 * Visual: a 24-hour horizontal strip with a dot/marker at each hour
 * a pulse was actually taken. Bar height encodes count of pulses at that hour.
 * Below it, one row per past pulse with the time of day.
 */
export function PulseTimingCard({ pulses }: Props) {
  // Bucket pulses by hour-of-day
  const hourCounts = new Array(24).fill(0) as number[];
  for (const p of pulses) {
    const d = new Date(p.timestamp);
    hourCounts[d.getHours()] += 1;
  }
  const maxCount = Math.max(1, ...hourCounts);

  // Build rows for the table below — most recent first
  const rows = [...pulses]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map((p) => {
      const d = new Date(p.timestamp);
      const hh = d.getHours();
      return {
        id: p.id!,
        label: `Pulse ${p.week ?? '?'}`,
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
        hour: hh,
        phase: p.phase || '—',
      };
    });

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-text-dim)',
          marginBottom: '16px',
        }}
      >
        Time of day
      </div>

      {/* 24-hour strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(24, 1fr)',
          gap: '4px',
          marginBottom: '12px',
          alignItems: 'flex-end',
          height: '72px',
        }}
      >
        {HOURS.map((h) => {
          const count = hourCounts[h];
          const heightPct = count > 0 ? (count / maxCount) * 100 : 0;
          const has = count > 0;
          return (
            <div
              key={h}
              title={`${formatHour(h)} · ${count} pulse${count === 1 ? '' : 's'}`}
              style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: has ? `${Math.max(heightPct, 18)}%` : '2px',
                  background: has ? 'var(--color-accent)' : 'var(--color-border)',
                  borderRadius: 'var(--radius-element)',
                  opacity: has ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Hour axis labels — every 6h */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(24, 1fr)',
          gap: '4px',
          marginBottom: '24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--color-text-dim)',
        }}
      >
        {HOURS.map((h) => (
          <div key={h} style={{ textAlign: 'center' }}>
            {h % 6 === 0 ? formatHour(h) : ''}
          </div>
        ))}
      </div>

      {/* Per-pulse rows table */}
      {rows.length === 0 ? (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--color-text-dim)',
            textAlign: 'center',
            padding: '24px 0',
          }}
        >
          No pulses yet — your timing will appear here.
        </div>
      ) : (
        <div>
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '8px',
              padding: '8px 0',
              borderBottom: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-dim)',
            }}
          >
            <span>Pulse</span>
            <span>Date</span>
            <span>Time</span>
            <span>Phase</span>
          </div>
          {rows.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '8px',
                padding: '10px 0',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'var(--color-text)' }}>{r.label}</span>
              <span>{r.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--color-accent)',
                    display: 'inline-block',
                  }}
                />
                {r.time}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-dim)',
                }}
              >
                {r.phase}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
