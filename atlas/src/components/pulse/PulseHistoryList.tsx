import { useState } from 'react';
import type { Assessment } from '../../types';
import { exportAssessmentCSV } from '../../lib/exportAssessment';
import { ConfirmModal } from '../ui/ConfirmModal';

interface Props {
  pulses: Assessment[];
  onDelete: (id: number) => Promise<void>;
}

export function PulseHistoryList({ pulses, onDelete }: Props) {
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const sorted = [...pulses].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const confirmDelete = async () => {
    if (pendingDelete === null) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await onDelete(pendingDelete);
      setPendingDelete(null);
    } catch (e: any) {
      setDeleteError(e?.message || 'Failed to delete pulse.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-dim)',
            }}
          >
            Pulse history
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-dim)',
            }}
          >
            {sorted.length} pulse{sorted.length === 1 ? '' : 's'}
          </span>
        </div>

        {sorted.length === 0 ? (
          <div
            style={{
              fontSize: '13px',
              color: 'var(--color-text-dim)',
              textAlign: 'center',
              padding: '24px 0',
            }}
          >
            No completed pulses yet. Your history will appear here.
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 80px 80px 1fr 96px',
                gap: '12px',
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
              <span>Date / time</span>
              <span>Phase</span>
              <span>Context</span>
              <span>Emotions</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>
            {sorted.map((p) => {
              const d = new Date(p.timestamp);
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 80px 80px 1fr 96px',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                    #{p.week ?? '?'}
                  </span>
                  <span>
                    {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    <span style={{ color: 'var(--color-text-dim)', marginLeft: '6px' }}>
                      {d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </span>
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
                    {p.phase || '—'}
                  </span>
                  <span>{p.contexts?.[0] ?? '—'}</span>
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(p.emotions ?? []).slice(0, 3).map((e) => (
                      <span
                        key={e}
                        style={{
                          padding: '2px 6px',
                          background: 'var(--color-surface-elevated)',
                          borderRadius: 'var(--radius-element)',
                          fontSize: '10px',
                          color: 'var(--color-text-dim)',
                        }}
                      >
                        {e}
                      </span>
                    ))}
                    {(p.emotions ?? []).length > 3 && (
                      <span style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>
                        +{(p.emotions ?? []).length - 3}
                      </span>
                    )}
                  </span>
                  <span style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => exportAssessmentCSV(p)}
                      title="Export as CSV"
                      style={{
                        padding: '6px 8px',
                        background: 'transparent',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-element)',
                        color: 'var(--color-text-muted)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-sans)',
                        cursor: 'pointer',
                      }}
                    >
                      Export
                    </button>
                    <button
                      onClick={() => setPendingDelete(p.id!)}
                      title="Delete this pulse"
                      style={{
                        padding: '6px 8px',
                        background: 'transparent',
                        border: '1px solid var(--color-danger)',
                        borderRadius: 'var(--radius-element)',
                        color: 'var(--color-danger)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-sans)',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete this pulse?"
        message="This permanently removes the pulse and all its data. This action cannot be undone and is done to comply with GDPR data-erasure rights."
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
