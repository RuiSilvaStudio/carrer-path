export type AssessmentType = 'baseline' | 'pulse';

export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotional_stability: number;
}

export interface FacetScores {
  [key: string]: number;
}

export interface SD3Scores {
  Machiavellianism: number;
  Narcissism: number;
  Psychopathy: number;
}

export interface ICARScores {
  correct: number;
  total: number;
  percent: number;
}

export interface AssessmentContext {
  current_role?: string;
  life_event?: string;
  stress_level?: number;
  energy_level?: number;
  primary_context?: string;
}

export interface AssessmentScores {
  bigFive: BigFiveScores;
  facets?: FacetScores;
  sd3?: SD3Scores;
  icar?: ICARScores;
  context?: AssessmentContext;
}

export interface Assessment {
  id?: number;
  user_id?: string;
  type: AssessmentType;
  timestamp: string;
  week?: number | null;
  phase?: string | null;
  responses: Record<string, number>;
  scores: AssessmentScores;
  contexts?: string[] | null;
  emotions?: string[] | null;
  note?: string | null;
}

export interface DemoPulse {
  pulse: number;
  date: string;
  hour: number;
  day: number;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotional_stability: number;
  facets?: Record<string, number>;
  emotions?: Record<string, number>;
  diamonds?: Record<string, number>;
  contexts?: string[];
  raw_contexts?: string[];
}

export interface TrajectoryPoint {
  type: 'baseline' | 'pulse';
  date: string;
  scores: BigFiveScores;
  contexts?: string[];
  emotions?: string[];
  emotionScores?: Record<string, number>;
  day?: number;
}

export interface User {
  id: string;
  email: string;
}

export type DataSourceMode = 'demo' | 'baseline';
export type ViewName = 'trajectory' | 'distribution' | 'context' | 'rhythm';
