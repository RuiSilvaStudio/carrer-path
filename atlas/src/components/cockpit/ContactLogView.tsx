import { useState } from 'react';
import { useContactLog } from '../../hooks/useContactLog';
import { Spinner } from '../ui/Spinner';
import type { ContactLogEntry } from '../../types/contactLog';
import type { CockpitContact } from '../../types/cockpit';

// ── Channels ─────────────────────────────────────────────────────
const CHANNELS = ['LinkedIn', 'Email', 'Phone', 'In-person', 'WhatsApp', 'Other'];

// ── Shared styles (mirror Cockpit.tsx) ────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)', fontSize: '10px',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--color-text-dim)', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)', borderRadius: '6px',
  color: 'var(--color-text)', fontSize: '14px',
  fontFamily: 'var(--font-sans)', outline: 'none',
};

const smallSaveBtn: React.CSSProperties = {
  padding: '4px 12px',
  background: 'var(--color-accent)',
  color: 'var(--color-bg)',
  border: 'none', borderRadius: '4px',
  fontSize: '11px', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
  whiteSpace: 'nowrap',
};

const smallGhostBtn: React.CSSProperties = {
  padding: '4px 10px',
  background: 'none',
  color: 'var(--color-text-muted)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  fontSize: '11px', fontWeight: 500,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
  whiteSpace: 'nowrap',
};

const smallAddBtn: React.CSSProperties = {
  padding: '3px 10px',
  background: 'none',
  color: 'var(--color-accent)',
  border: '1px solid var(--color-accent)',
  borderRadius: '4px',
  fontSize: '11px', fontWeight: 500,
  cursor: 'pointer', fontFamily: 'var(--font-mono)',
  whiteSpace: 'nowrap',
};

// ── ContactLogView ────────────────────────────────────────────────
export function ContactLogView({ contact }: { contact: CockpitContact }) {
  const { logs, loading, error, addLog, updateLog, deleteLog } = useContactLog(contact.id);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const blankEntry = {
    sent_date: today,
    channel: 'LinkedIn',
    message: '',
    status: 'waiting' as 'waiting' | 'replied',
  };

  type DraftType = typeof blankEntry;

  const [draft, setDraft] = useState<DraftType>(blankEntry);

  const startAdd = () => {
    setDraft({ ...blankEntry, message: contact.message || '' });
    setAdding(true);
    setEditingId(null);
  };

  const startEdit = (entry: ContactLogEntry) => {
    setDraft({
      sent_date: entry.sent_date,
      channel: entry.channel,
      message: entry.message,
      status: entry.status,
    });
    setEditingId(entry.id);
    setAdding(false);
  };

  const cancel = () => {
    setAdding(false);
    setEditingId(null);
  };

  const commitAdd = async () => {
    if (!draft.message.trim()) return;
    await addLog(draft);
    cancel();
  };

  const commitEdit = async () => {
    if (editingId === null) return;
    await updateLog(editingId, draft);
    cancel();
  };

  const toggleStatus = async (entry: ContactLogEntry) => {
    await updateLog(entry.id, {
      status: entry.status === 'waiting' ? 'replied' : 'waiting',
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={labelStyle}>Outreach Log</div>
        {!adding && editingId === null && (
          <button onClick={startAdd} style={smallAddBtn}>+ Log Outreach</button>
        )}
      </div>

      {loading && (
        <Spinner message="Loading…" />
      )}

      {error && (
        <div style={{ fontSize: '12px', color: 'var(--color-danger)', marginBottom: '8px' }}>
          {error}
        </div>
      )}

      {/* Entry list — reverse chronological */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {logs.map((entry) => (
          <LogEntryRow
            key={entry.id}
            entry={entry}
            editing={editingId === entry.id}
            draft={draft}
            onDraftChange={setDraft}
            onStartEdit={() => startEdit(entry)}
            onCancel={cancel}
            onSave={commitEdit}
            onDelete={() => deleteLog(entry.id)}
            onToggleStatus={() => toggleStatus(entry)}
          />
        ))}
      </div>

      {/* Add new entry form */}
      {adding && (
        <div style={{
          marginTop: '8px',
          padding: '12px',
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-accent)',
          borderRadius: '6px',
        }}>
          <LogEntryForm
            draft={draft}
            onDraftChange={setDraft}
            onSave={commitAdd}
            onCancel={cancel}
            saveLabel="Add"
          />
        </div>
      )}

      {logs.length === 0 && !adding && !loading && (
        <div style={{ fontSize: '13px', color: 'var(--color-text-dim)', fontStyle: 'italic' }}>
          No outreach logged yet.
        </div>
      )}
    </div>
  );
}

// ── Single log entry row (display or edit mode) ──────────────────
function LogEntryRow({
  entry, editing, draft, onDraftChange, onStartEdit, onCancel, onSave, onDelete, onToggleStatus,
}: {
  entry: ContactLogEntry;
  editing: boolean;
  draft: { sent_date: string; channel: string; message: string; status: 'waiting' | 'replied' };
  onDraftChange: (d: typeof draft) => void;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  if (editing) {
    return (
      <div style={{
        padding: '12px',
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-accent)',
        borderRadius: '6px',
      }}>
        <LogEntryForm
          draft={draft}
          onDraftChange={onDraftChange}
          onSave={onSave}
          onCancel={onCancel}
          saveLabel="Save"
        />
      </div>
    );
  }

  const isReplied = entry.status === 'replied';

  return (
    <div style={{
      padding: '10px 12px',
      background: 'var(--color-surface-elevated)',
      border: '1px solid var(--color-border)',
      borderRadius: '6px',
    }}>
      {/* Top row: date + channel + status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        flexWrap: 'wrap', marginBottom: '8px',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--color-accent)', letterSpacing: '0.05em',
        }}>
          {entry.sent_date}
        </span>
        <span style={{
          fontSize: '11px', fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-dim)',
          padding: '1px 8px', borderRadius: '10px',
          border: '1px solid var(--color-border)',
        }}>
          {entry.channel}
        </span>
        <button
          onClick={onToggleStatus}
          style={{
            padding: '2px 10px', borderRadius: '10px',
            fontSize: '10px', fontFamily: 'var(--font-mono)',
            cursor: 'pointer', whiteSpace: 'nowrap',
            background: isReplied
              ? 'rgba(106, 161, 100, 0.15)'
              : 'rgba(212, 165, 116, 0.12)',
            color: isReplied ? 'rgb(106, 161, 100)' : 'var(--color-accent)',
            border: `1px solid ${isReplied ? 'rgba(106, 161, 100, 0.3)' : 'var(--color-accent)'}`,
            fontWeight: 500,
          }}
        >
          {isReplied ? '● Replied' : '○ Waiting'}
        </button>
      </div>

      {/* Message */}
      {entry.message && (
        <div style={{
          fontSize: '13px', color: 'var(--color-text-muted)',
          lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: '8px',
        }}>
          {entry.message}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={onStartEdit} style={smallGhostBtn}>Edit</button>
        <button onClick={onDelete} style={{
          ...smallGhostBtn,
          color: 'var(--color-danger)',
          borderColor: 'var(--color-danger)',
        }}>Delete</button>
      </div>
    </div>
  );
}

// ── Log entry form (used for add + edit) ─────────────────────────
function LogEntryForm({
  draft, onDraftChange, onSave, onCancel, saveLabel,
}: {
  draft: { sent_date: string; channel: string; message: string; status: 'waiting' | 'replied' };
  onDraftChange: (d: typeof draft) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
}) {
  return (
    <>
      {/* Date + channel row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyle}>Date Sent</label>
          <input
            type="date"
            value={draft.sent_date}
            onChange={(e) => onDraftChange({ ...draft, sent_date: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Channel</label>
          <select
            value={draft.channel}
            onChange={(e) => onDraftChange({ ...draft, channel: e.target.value })}
            style={inputStyle}
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status toggle */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Status</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['waiting', 'replied'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onDraftChange({ ...draft, status: s })}
              style={{
                padding: '5px 14px', borderRadius: '10px',
                fontSize: '11px', fontFamily: 'var(--font-mono)',
                cursor: 'pointer', whiteSpace: 'nowrap',
                background: draft.status === s
                  ? (s === 'replied' ? 'rgba(106, 161, 100, 0.15)' : 'rgba(212, 165, 116, 0.12)')
                  : 'none',
                color: draft.status === s
                  ? (s === 'replied' ? 'rgb(106, 161, 100)' : 'var(--color-accent)')
                  : 'var(--color-text-dim)',
                border: `1px solid ${draft.status === s
                  ? (s === 'replied' ? 'rgba(106, 161, 100, 0.3)' : 'var(--color-accent)')
                  : 'var(--color-border)'}`,
                fontWeight: 500,
                textTransform: 'capitalize',
              }}
            >
              {s === 'replied' ? '● Replied' : '○ Waiting'}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Message Sent</label>
        <textarea
          value={draft.message}
          onChange={(e) => onDraftChange({ ...draft, message: e.target.value })}
          rows={3}
          placeholder="What did you send?"
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onSave} style={smallSaveBtn}>{saveLabel}</button>
        <button onClick={onCancel} style={smallGhostBtn}>Cancel</button>
      </div>
    </>
  );
}
