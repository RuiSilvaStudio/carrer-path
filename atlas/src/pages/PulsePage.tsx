interface PulsePageProps {
  onNavigate: (page: string) => void;
}

export function PulsePage({ onNavigate: _onNavigate }: PulsePageProps) {
  return (
    <div style={{ padding: '60px 40px', maxWidth: '800px' }}>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 500,
        color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: '12px',
      }}>
        Weekly Pulse
      </h1>
      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.6,
        color: 'var(--color-text-muted)',
      }}>
        Coming soon. The weekly pulse is a short check-in that adds a new data point to your personality trajectory.
      </p>
    </div>
  );
}
