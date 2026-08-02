interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Shared confirmation modal — presentational only.
 * State (pending action, loading, error) is managed by the parent.
 */
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete permanently',
  cancelLabel = 'Cancel',
  loading = false,
  error = '',
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={() => !loading && onCancel()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '32px',
          maxWidth: '400px',
          width: '90%',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--fs-h3)',
            fontWeight: 400,
            color: 'var(--color-text)',
            marginBottom: '12px',
            marginTop: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          {message}
        </p>
        {error && (
          <p
            style={{
              color: 'var(--color-danger)',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </p>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-button)',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: 'var(--color-danger)',
              color: 'var(--color-bg)',
              border: 'none',
              borderRadius: 'var(--radius-button)',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
