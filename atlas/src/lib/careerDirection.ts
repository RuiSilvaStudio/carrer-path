import type { WorkValuesResult } from './work-values-data';
import { createEmptyProfile, type StructuredProfile } from './profile-data';

// ── 4-step flow (V2): Profile → Explorer → Brief → MarketAction ──────────
// Explorer is a re-runnable wizard that absorbs the old Directions + Compare tabs.
// Brief is the persistent result of the most recent Explorer run.
export type CareerStage = 'profile' | 'explorer' | 'brief' | 'marketAction';
export type DirectionStatus = 'active' | 'paused' | 'deprioritised';
export type ReassessmentChoice = 'continue' | 'adjust' | 'pause' | 'deprioritise';

// Wizard-internal step state (lives inside the Explorer stage).
export type WizardStep = 'directions' | 'compare';

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
  version: 2;
  updatedAt: string;
  currentStage: CareerStage;

  // Step 01 — Profile (merged: career history + work values)
  profile: StructuredProfile;
  profileUpdatedAt: string | null;     // timestamp of last profile/values edit
  preferences: WorkPreferences;

  // Step 02 — Explorer (wizard, re-runnable)
  directions: CareerDirection[];
  savedSuggestions: SavedSuggestion[];
  chosenDirectionId: string | null;   // set when user picks in Compare
  explorerCompletedAt: string | null; // timestamp of last Explorer completion

  // Step 03 — Brief (persistent output of Explorer)
  workspaceEvidence: string;
  workspaceAssumption: string;

  // Step 04 — Market & Action
  marketInsight?: MarketInsight | null;
  actionItems?: ActionItem[];
}

export const CAREER_STAGES: Array<{ id: CareerStage; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'explorer', label: 'Explorer' },
  { id: 'brief', label: 'Brief' },
  { id: 'marketAction', label: 'Market & Action' },
];

export function createEmptyCareerDirection(): CareerDirectionData {
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    currentStage: 'profile',
    profile: createEmptyProfile(),
    profileUpdatedAt: null,
    preferences: { contribution: '', environment: '', constraints: '' },
    directions: [],
    savedSuggestions: [],
    chosenDirectionId: null,
    explorerCompletedAt: null,
    workspaceEvidence: '',
    workspaceAssumption: '',
    marketInsight: null,
    actionItems: [],
  };
}

// ── Migration from V1 (6-stage) to V2 (4-stage) ──────────────────────────
const STAGE_MIGRATION: Record<string, CareerStage> = {
  // V1 direct
  'profile': 'profile',
  'preferences': 'profile',        // merged into Profile
  'shortlist': 'explorer',         // absorbed by Explorer wizard
  'compare': 'explorer',           // absorbed by Explorer wizard
  'brief': 'brief',
  'marketAction': 'marketAction',
  // Legacy names from older versions
  'pulse': 'marketAction',
  'workspace': 'brief',
  'marketContext': 'marketAction',
  'reassess': 'marketAction',
};

export function normaliseCareerDirection(input: Partial<CareerDirectionData> | null | undefined): CareerDirectionData {
  const empty = createEmptyCareerDirection();
  if (!input) return empty;

  const rawStage = (input as { currentStage?: string }).currentStage;
  const currentStage: CareerStage = (rawStage && STAGE_MIGRATION[rawStage]) || rawStage as CareerStage || empty.currentStage;

  // Migrate legacy profile (old free-text fields) to structured profile
  const inputProfile = input.profile as any;
  const profile: StructuredProfile = inputProfile && typeof inputProfile === 'object' && 'roles' in inputProfile
    ? { ...createEmptyProfile(), ...inputProfile }
    : createEmptyProfile();

  // Derive chosenDirectionId from legacy data if not present
  const directions = Array.isArray(input.directions) ? input.directions : [];
  const chosenDirectionId = input.chosenDirectionId
    ?? (directions.find(d => d.selected && d.status === 'active')?.id ?? null);

  return {
    ...empty,
    ...input,
    version: 2,
    currentStage,
    profile,
    profileUpdatedAt: input.profileUpdatedAt ?? null,
    preferences: { ...empty.preferences, ...input.preferences },
    directions,
    chosenDirectionId,
    explorerCompletedAt: input.explorerCompletedAt ?? null,
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

// ── Staleness helpers ────────────────────────────────────────────────────
// Compare upstream timestamps against downstream generation timestamps.
// If profile changed after explorer/brief/market were generated, they're stale.

export function isExplorerStale(data: CareerDirectionData): boolean {
  if (!data.profileUpdatedAt || !data.explorerCompletedAt) return false;
  return new Date(data.profileUpdatedAt) > new Date(data.explorerCompletedAt);
}

export function isBriefStale(data: CareerDirectionData): boolean {
  // Brief is stale if profile changed after explorer completed
  return isExplorerStale(data);
}

export function isMarketStale(data: CareerDirectionData): boolean {
  if (!data.marketInsight?.generatedAt) return false;
  // Market is stale if the chosen direction changed after market was generated,
  // or if profile changed after market was generated
  const chosenDir = data.directions.find(d => d.id === data.chosenDirectionId);
  const directionChanged = chosenDir?.enrichment?.enrichedAt
    && new Date(chosenDir.enrichment.enrichedAt) > new Date(data.marketInsight.generatedAt);
  const profileChanged = data.profileUpdatedAt
    && new Date(data.profileUpdatedAt) > new Date(data.marketInsight.generatedAt);
  return !!(directionChanged || profileChanged);
}

export function getChosenDirection(data: CareerDirectionData): CareerDirection | undefined {
  if (data.chosenDirectionId) {
    return data.directions.find(d => d.id === data.chosenDirectionId);
  }
  // Fallback: first selected active direction
  return data.directions.find(d => d.selected && d.status === 'active') ?? data.directions[0];
}

export function getActiveDirections(data: CareerDirectionData): CareerDirection[] {
  return data.directions.filter(d => d.selected && d.status === 'active');
}

// ── Stage status for nav dots ────────────────────────────────────────────
export type StageStatus = 'empty' | 'in_progress' | 'complete' | 'stale';

export function getStageStatus(data: CareerDirectionData, stageId: CareerStage): StageStatus {
  switch (stageId) {
    case 'profile': {
      const hasProfile = data.profile.roles.length > 0 || data.profile.careerSummary;
      const hasValues = !!data.preferences.workValues;
      if (!hasProfile && !hasValues) return 'empty';
      if (hasProfile && hasValues) return 'complete';
      return 'in_progress';
    }
    case 'explorer': {
      if (data.directions.length === 0) return 'empty';
      if (isExplorerStale(data)) return 'stale';
      if (data.chosenDirectionId) return 'complete';
      return 'in_progress';
    }
    case 'brief': {
      const chosen = getChosenDirection(data);
      if (!chosen) return 'empty';
      if (isBriefStale(data)) return 'stale';
      return 'complete';
    }
    case 'marketAction': {
      if (!data.marketInsight && !(data.actionItems ?? []).length) return 'empty';
      if (isMarketStale(data)) return 'stale';
      return 'complete';
    }
  }
}
