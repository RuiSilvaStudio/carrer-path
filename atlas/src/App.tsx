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
