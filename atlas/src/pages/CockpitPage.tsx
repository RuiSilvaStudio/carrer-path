import { Cockpit } from '../components/cockpit/Cockpit';

interface CockpitPageProps {
  onNavigate: (page: string) => void;
}

export function CockpitPage({ onNavigate: _onNavigate }: CockpitPageProps) {
  return <Cockpit />;
}
