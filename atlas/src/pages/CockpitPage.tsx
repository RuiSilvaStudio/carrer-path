interface CockpitPageProps {
  onNavigate: (page: string) => void;
}

export function CockpitPage({ onNavigate: _onNavigate }: CockpitPageProps) {
  return (
    <div style={{ padding: '60px 40px', maxWidth: '800px' }}>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 500,
        color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: '12px',
      }}>
        Cockpit
      </h1>
      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.6,
        color: 'var(--color-text-muted)',
      }}>
        Coming soon. The cockpit provides a control center for managing your assessment schedule, data export, and account settings.
      </p>
    </div>
  );
}
