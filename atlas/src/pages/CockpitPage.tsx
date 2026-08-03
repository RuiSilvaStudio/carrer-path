import { useAuth } from '../hooks/useAuth';
import { Cockpit } from '../components/cockpit/Cockpit';

// Rui's user IDs — supports both cloud (old) and self-hosted (new) Supabase
const RUI_USER_IDS = [
  'ef659d7c-60bb-4336-83e2-db5a804d4dfb', // self-hosted Supabase
  '37d25257-5fcf-4318-b1b6-5bdb48288a71', // cloud Supabase (legacy)
];

export function CockpitPage() {
  const { user } = useAuth();

  if (!user || !RUI_USER_IDS.includes(user.id)) {
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
