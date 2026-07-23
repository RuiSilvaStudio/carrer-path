import { BaselineAssessment } from '../components/baseline/BaselineAssessment';

interface BaselinePageProps {
  onNavigate: (page: string) => void;
}

export function BaselinePage({ onNavigate }: BaselinePageProps) {
  return <BaselineAssessment onNavigate={onNavigate} />;
}
