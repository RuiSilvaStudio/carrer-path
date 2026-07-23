import { useAuth } from '../hooks/useAuth';
import { Cockpit } from '../components/cockpit/Cockpit';

interface CockpitPageProps {
  onNavigate: (page: string) => void;
}

const RUI_USER_ID = '37d25257-5fcf-4318-b1b6-5bdb48288a71';

export function CockpitPage({ onNavigate: _onNavigate }: CockpitPageProps) {
  const { user } = useAuth();

  if (user?.id !== RUI_USER_ID) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400,
          color: 'var(--color-text)', marginBottom: '8px',
        }}>
          Access denied
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return <Cockpit />;
}
