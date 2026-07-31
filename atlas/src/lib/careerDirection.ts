import type { WorkValuesResult } from './work-values-data';
import { createEmptyProfile, type StructuredProfile } from './profile-data';

export type CareerStage = 'profile' | 'preferences' | 'shortlist' | 'compare' | 'brief' | 'marketAction';
export type DirectionStatus = 'active' | 'paused' | 'deprioritised';
export type ReassessmentChoice = 'continue' | 'adjust' | 'pause' | 'deprioritise';

// New structured profile — replaces the old free-text fields.
// When present, structured data drives the UI; legacy strings remain for migration.
export interface WorkPreferences {
  contribution: string;
  environment: string;
  constraints: string;
  workValues?: WorkValuesResult;
}

export type DimensionRating = 'strong' | 'good' | 'stretch';

export interface DimensionRatings {
  skills: DimensionRating;
  workValues: DimensionRating;
  practical: DimensionRating;
  evidence: DimensionRating;
  fit: DimensionRating;
}

export interface DirectionEnrichment {
  rationale: string;
  skillOverlap: string[];
  skillGaps: string[];
  workValuesAlignment: string;
  workValuesBullets?: { strong: string[]; stretch: string[] };
  practicalFit: string;
  practicalFitFlags: string[];
  practicalFitBullets?: string[];
  whatIsUnknown: string;
  unknownBullet?: string;
  suggestedTest: string;
  testBullet?: string;
  dimensionRatings: DimensionRatings;
  enrichedAt: string;
}

export interface CareerDirection {
  id: string;
  title: string;
  summary: string;
  preferenceReason: string;
  evidenceReason: string;
  referenceConfidence: 'confirmed' | 'broad' | 'provisional';
  status: DirectionStatus;
  selected: boolean;
  evidence: string;
  unknown: string;
  nextTest: string;
  reassessment?: ReassessmentChoice;
  reassessmentNote?: string;
  enrichment?: DirectionEnrichment | null;
}

export interface SavedSuggestion {
  title: string;
  rationale: string;
  skillOverlap: string[];
  skillGaps: string[];
  whatIsUnknown: string;
  suggestedTest: string;
}

export interface MarketInsight {
  summary: string;
  demandTrend: string;
  hiringSectors: string[];
  frozenSectors: string[];
  salaryRange: string;
  aiImpact: string;
  confidence: 'low' | 'moderate' | 'high';
  sources: Array<{ name: string; url: string; note: string }>;
  generatedAt: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: 'search' | 'network' | 'learn' | 'prepare' | 'custom';
  done: boolean;
}

export interface CareerDirectionData {
  version: 1;
  updatedAt: string;
  currentStage: CareerStage;
  profile: StructuredProfile;
  preferences: WorkPreferences;
  directions: CareerDirection[];
  savedSuggestions: SavedSuggestion[];
  workspaceEvidence: string;
  workspaceAssumption: string;
  marketInsight?: MarketInsight | null;
  actionItems?: ActionItem[];
}

export const CAREER_STAGES: Array<{ id: CareerStage; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'shortlist', label: 'Directions' },
  { id: 'compare', label: 'Compare' },
  { id: 'brief', label: 'Brief' },
  { id: 'marketAction', label: 'Market & Action' },
];

export function createEmptyCareerDirection(): CareerDirectionData {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    currentStage: 'profile',
    profile: createEmptyProfile(),
    preferences: { contribution: '', environment: '', constraints: '' },
    directions: [],
    savedSuggestions: [],
    workspaceEvidence: '',
    workspaceAssumption: '',
    marketInsight: null,
    actionItems: [],
  };
}

export function normaliseCareerDirection(input: Partial<CareerDirectionData> | null | undefined): CareerDirectionData {
  const empty = createEmptyCareerDirection();
  const legacyStageMap: Record<string, CareerStage> = {
    'pulse': 'marketAction',
    'workspace': 'brief',
    'marketContext': 'marketAction',
    'reassess': 'marketAction',
  };
  const rawStage = (input as { currentStage?: string } | null | undefined)?.currentStage;
  const currentStage = rawStage && legacyStageMap[rawStage] ? legacyStageMap[rawStage] : rawStage as CareerStage | undefined;
  // Migrate legacy profile (old free-text fields) to structured profile
  const inputProfile = input?.profile as any;
  const profile: StructuredProfile = inputProfile && typeof inputProfile === 'object' && 'roles' in inputProfile
    ? { ...createEmptyProfile(), ...inputProfile }
    : createEmptyProfile();
  return {
    ...empty,
    ...input,
    currentStage: currentStage as CareerStage | undefined ?? empty.currentStage,
    profile,
    preferences: { ...empty.preferences, ...input?.preferences },
    directions: Array.isArray(input?.directions) ? input.directions : [],
  };
}

export function directionFromTitle(title: string): CareerDirection {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    summary: 'A direction you added. Add the reason it deserves examination before comparing it.',
    preferenceReason: 'Not yet recorded.',
    evidenceReason: 'Not yet recorded.',
    referenceConfidence: 'provisional',
    status: 'active',
    selected: true,
    evidence: '',
    unknown: '',
    nextTest: 'Speak with one practitioner or examine three live role descriptions.',
    enrichment: null,
  };
}

export function advanceStage(stage: CareerStage): CareerStage {
  const index = CAREER_STAGES.findIndex((item) => item.id === stage);
  return CAREER_STAGES[Math.min(index + 1, CAREER_STAGES.length - 1)].id;
}

export function directionCountForComparison(data: CareerDirectionData): number {
  return data.directions.filter((direction) => direction.selected && direction.status === 'active').length;
}

export function updateTimestamp(data: CareerDirectionData): CareerDirectionData {
  return { ...data, updatedAt: new Date().toISOString() };
}
