import { useState } from 'react';
import { AuthGate } from './components/AuthGate';
import { Nav } from './components/Nav';
import { DashboardProvider } from './state/DashboardContext';
import { DashboardPage } from './pages/DashboardPage';
import { BaselinePage } from './pages/BaselinePage';
import { PulsePage } from './pages/PulsePage';
import { CockpitPage } from './pages/CockpitPage';

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <AuthGate>
      <DashboardProvider>
        <div style={{ minHeight: '100vh' }}>
          <Nav currentPage={page} onNavigate={setPage} />
          {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
          {page === 'baseline' && <BaselinePage onNavigate={setPage} />}
          {page === 'pulse' && <PulsePage onNavigate={setPage} />}
          {page === 'cockpit' && <CockpitPage onNavigate={setPage} />}
        </div>
      </DashboardProvider>
    </AuthGate>
  );
}
