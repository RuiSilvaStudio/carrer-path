import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthGate } from './components/AuthGate';
import { Nav } from './components/Nav';
import { DashboardProvider } from './state/DashboardContext';
import { DashboardPage } from './pages/DashboardPage';
import { BaselinePage } from './pages/BaselinePage';
import { PulsePage } from './pages/PulsePage';
import { DocsPage } from './pages/DocsPage';
import { CockpitPage } from './pages/CockpitPage';
import { KnowledgeBaseView } from './components/cockpit/KnowledgeBaseView'; // TEMP: viewport QA
import { PulseReminder } from './components/PulseReminder';

export default function App() {
  return (
    <DashboardProvider>
      <Routes>
        {/* Public route — no auth required, but shows nav */}
        <Route path="/docs" element={
          <div style={{ minHeight: '100dvh' }}>
            <Nav />
            <DocsPage />
          </div>
        } />

        {/* TEMP: viewport QA for KB tab (real component, no auth) — delete after QA */}
        <Route path="/kb-preview" element={
          <div style={{ minHeight: '100dvh' }}>
            <Nav />
            <div className="atlas-page" style={{ padding: '32px 40px 80px', maxWidth: '1200px', margin: '0 auto' }}>
              <h1 style={{
                fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 400,
                color: 'var(--color-text)', letterSpacing: '-0.03em',
                marginBottom: '20px', lineHeight: 1.1,
              }}>
                04 Knowledge Base
              </h1>
              <KnowledgeBaseView />
            </div>
          </div>
        } />

        {/* Protected routes — require auth */}
        <Route
          element={
            <ProtectedLayout />
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/baseline" element={<BaselinePage />} />
          <Route path="/pulse" element={<PulsePage />} />
          <Route path="/cockpit" element={<CockpitPage />} />
        </Route>

        {/* Fallback — redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardProvider>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--color-text-muted)' }}>Loading…</div>;
  }

  if (!user) {
    return <AuthGate><div /></AuthGate>;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav />
      <Outlet />
      <PulseReminder />
    </div>
  );
}
