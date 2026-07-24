import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useAssessments } from './hooks/useAssessments';
import { AuthGate } from './components/AuthGate';
import { Nav } from './components/Nav';
import { DashboardProvider, useDashboardState } from './state/DashboardContext';
import { DashboardPage } from './pages/DashboardPage';
import { BaselinePage } from './pages/BaselinePage';
import { PulsePage } from './pages/PulsePage';
import { DocsPage } from './pages/DocsPage';
import { CockpitPage } from './pages/CockpitPage';
import { PulseReminder } from './components/PulseReminder';

export default function App() {
  return (
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  );
}

function AppContent() {
  const [page, setPage] = useState<string>('');
  const { user, loading } = useAuth();
  const { baseline, loading: assessmentsLoading } = useAssessments(user?.id ?? null);
  const { setMode } = useDashboardState();

  // Determine initial page once auth + assessments load
  useEffect(() => {
    if (loading || assessmentsLoading || !user) return;
    if (page === '') {
      if (baseline) {
        setMode('baseline');
        setPage('dashboard');
      } else {
        setPage('baseline');
      }
    }
  }, [loading, assessmentsLoading, user, baseline, page, setMode]);

  // Docs page is accessible without auth
  if (page === 'docs') {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Nav currentPage={page} onNavigate={setPage} />
        <DocsPage />
      </div>
    );
  }

  if (loading || (assessmentsLoading && !user)) {
    return <div style={{ padding: '40px', color: 'var(--color-text-muted)' }}>Loading…</div>;
  }

  if (!user) {
    return <AuthGate><div /></AuthGate>;
  }

  // Still determining initial page
  if (page === '') {
    return <div style={{ padding: '40px', color: 'var(--color-text-muted)' }}>Loading…</div>;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav currentPage={page} onNavigate={setPage} />
      {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
      {page === 'baseline' && <BaselinePage onNavigate={setPage} />}
      {page === 'pulse' && <PulsePage onNavigate={setPage} />}
      {page === 'cockpit' && <CockpitPage onNavigate={setPage} />}
      <PulseReminder onNavigate={setPage} refreshKey={page} />
    </div>
  );
}
