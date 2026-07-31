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
import { ProfilePage } from './pages/ProfilePage';
import { SigilLabPage } from './pages/SigilLabPage';
import { CareerDirectionPage } from './pages/CareerDirectionPage';
import { PulseReminder } from './components/PulseReminder';
import { CommandPalette } from './components/ui/CommandPalette';
import { FirstChartTour } from './components/ui/FirstChartTour';

export default function App() {
  return (
    <Routes>
      {/* Existing Personality Atlas remains in its original provider and UI shell. */}
      <Route element={<LegacyAppShell />}>
        <Route path="/docs" element={<LegacyDocsLayout />} />
        <Route element={<LegacyProtectedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/baseline" element={<BaselinePage />} />
          <Route path="/pulse" element={<PulsePage />} />
          <Route path="/cockpit" element={<CockpitPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sigil-lab" element={<SigilLabPage />} />
        </Route>
      </Route>

      {/* Career Direction has an intentionally separate shell. No dashboard state,
          assessment navigation, pulse reminder, sigil, or chart tour is mounted. */}
      <Route path="/career-direction" element={<CareerProtectedLayout />}>
        <Route index element={<CareerDirectionPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function LegacyAppShell() {
  return (
    <DashboardProvider>
      <CommandPalette />
      <FirstChartTour />
      <Outlet />
    </DashboardProvider>
  );
}

function LegacyDocsLayout() {
  return <div style={{ minHeight: '100dvh' }}><Nav /><DocsPage /></div>;
}

function CareerProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (!user) return <AuthGate><div /></AuthGate>;
  return <div style={{ minHeight: '100vh' }}><Nav /><Outlet /></div>;
}

function LegacyProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', color: 'var(--color-text-muted)' }}>Loading…</div>;
  if (!user) return <AuthGate><div /></AuthGate>;
  return <div style={{ minHeight: '100vh' }}><Nav /><Outlet /><PulseReminder /></div>;
}
