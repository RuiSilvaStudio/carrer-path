interface BaselinePageProps {
  onNavigate: (page: string) => void;
}

export function BaselinePage({ onNavigate: _onNavigate }: BaselinePageProps) {
  return (
    <div style={{ padding: '60px 40px', maxWidth: '800px' }}>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 500,
        color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: '12px',
      }}>
        Baseline Assessment
      </h1>
      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.6,
        color: 'var(--color-text-muted)',
      }}>
        Coming soon. The baseline assessment captures your personality starting point — Big Five, SD3, and ICAR — establishing the foundation for tracking change over time.
      </p>
    </div>
  );
}
