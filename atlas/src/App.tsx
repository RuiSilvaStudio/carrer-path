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

const PAGE_STORAGE_KEY = 'atlas_current_page';

function getInitialPage(): string {
  // Restore from sessionStorage if available (handles refresh)
  const saved = sessionStorage.getItem(PAGE_STORAGE_KEY);
  if (saved && saved !== '') return saved;
  return '';
}

export default function App() {
  return (
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  );
}

function AppContent() {
  const [page, setPage] = useState<string>(getInitialPage);
  const { user, loading } = useAuth();
  const { baseline, loading: assessmentsLoading } = useAssessments(user?.id ?? null);
  const { setMode } = useDashboardState();

  // Persist page to sessionStorage on every change
  useEffect(() => {
    if (page !== '') {
      sessionStorage.setItem(PAGE_STORAGE_KEY, page);
    }
  }, [page]);

  // Determine initial page ONCE — only when assessments are ready for the first time
  useEffect(() => {
    if (loading || !user) return;
    // Wait until assessments are actually loaded for this user (ready flag handles stale data)
    if (assessmentsLoading) return;
    // Only determine the initial page once
    if (page !== '') return;

    if (baseline) {
      setMode('baseline');
      setPage('dashboard');
    } else {
      setPage('baseline');
    }
  }, [loading, assessmentsLoading, user, baseline, page, setMode]);

  const handleNavigate = (newPage: string) => {
    setPage(newPage);
    sessionStorage.setItem(PAGE_STORAGE_KEY, newPage);
  };

  // Docs page is accessible without auth
  if (page === 'docs') {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Nav currentPage={page} onNavigate={handleNavigate} />
        <DocsPage />
      </div>
    );
  }

  if (loading) {
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
      <Nav currentPage={page} onNavigate={handleNavigate} />
      {page === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {page === 'baseline' && <BaselinePage onNavigate={handleNavigate} />}
      {page === 'pulse' && <PulsePage onNavigate={handleNavigate} />}
      {page === 'cockpit' && <CockpitPage onNavigate={handleNavigate} />}
      <PulseReminder onNavigate={handleNavigate} refreshKey={page} />
    </div>
  );
}
