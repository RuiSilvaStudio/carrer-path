import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthGate } from './components/AuthGate';
import { Nav } from './components/Nav';
import { DashboardProvider } from './state/DashboardContext';
import { DashboardPage } from './pages/DashboardPage';
import { BaselinePage } from './pages/BaselinePage';
import { PulsePage } from './pages/PulsePage';
import { DocsPage } from './pages/DocsPage';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const { user, loading } = useAuth();

  // Docs page is accessible without auth
  if (page === 'docs') {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Nav currentPage={page} onNavigate={setPage} />
        <DocsPage />
      </div>
    );
  }

  // All other pages require auth
  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--color-text-muted)' }}>Loading…</div>;
  }

  if (!user) {
    return <AuthGate><div /></AuthGate>;
  }

  return (
    <DashboardProvider>
      <div style={{ minHeight: '100vh' }}>
        <Nav currentPage={page} onNavigate={setPage} />
        {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
        {page === 'baseline' && <BaselinePage onNavigate={setPage} />}
        {page === 'pulse' && <PulsePage onNavigate={setPage} />}
      </div>
    </DashboardProvider>
  );
}
