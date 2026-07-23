import { WeeklyPulse } from '../components/pulse/WeeklyPulse';

interface PulsePageProps {
  onNavigate: (page: string) => void;
}

export function PulsePage({ onNavigate }: PulsePageProps) {
  return <WeeklyPulse onNavigate={onNavigate} />;
}
