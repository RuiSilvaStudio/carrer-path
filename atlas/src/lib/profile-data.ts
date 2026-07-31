// ── Profile data: structured types, dropdown options ────────────
// Replaces the old free-text profile fields with structured, reusable data.

export type CurrentSituation =
  | 'employed_exploring'
  | 'employed_urgent'
  | 'unemployed_short'
  | 'unemployed_medium'
  | 'unemployed_long'
  | 'freelancing'
  | 'sabbatical'
  | 'returning';

export type ChangeDriver =
  | 'career_growth'
  | 'financial_pressure'
  | 'role_culture_misfit'
  | 'restructuring_layoff'
  | 'relocation'
  | 'personal_family';

export type WorkArrangement = 'onsite' | 'hybrid' | 'remote_only' | 'open';
export type Mobility = 'not_relocating' | 'open_to_relocate' | 'already_relocating';
export type TravelTolerance = 'no_travel' | 'up_to_10' | 'up_to_25' | 'up_to_50' | 'no_limit';
export type Availability = 'immediately' | '2_4_weeks' | '1_3_months' | '3_plus_months';
export type IncomeExpectation = 'prefer_not_to_share' | 'under_40k' | '40_60k' | '60_80k' | '80_100k' | '100_150k' | '150k_plus';

export interface CareerRole {
  id: string;
  title: string;
  organisation: string;
  startYear: number | null;
  endYear: number | null;
  location: string | null;
  scope: string;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  qualification: string;
  institution: string | null;
  year: number | null;
}

export interface StructuredProfile {
  // Current situation
  currentSituation: CurrentSituation | null;
  changeDriver: ChangeDriver | null;
  situationNote: string | null;

  // Career evidence
  roles: CareerRole[];
  skills: string[];
  education: EducationItem[];
  languages: string[];
  careerSummary: string | null;
  evidenceNote: string | null;

  // Practical conditions
  location: string | null;
  workArrangement: WorkArrangement | null;
  mobility: Mobility | null;
  travelTolerance: TravelTolerance | null;
  availability: Availability | null;
  incomeExpectation: IncomeExpectation | null;
  conditionsNote: string | null;
}

export function createEmptyProfile(): StructuredProfile {
  return {
    currentSituation: null,
    changeDriver: null,
    situationNote: null,
    roles: [],
    skills: [],
    education: [],
    languages: [],
    careerSummary: null,
    evidenceNote: null,
    location: null,
    workArrangement: null,
    mobility: null,
    travelTolerance: null,
    availability: null,
    incomeExpectation: null,
    conditionsNote: null,
  };
}

// ── Dropdown options ────────────────────────────────────────────

export const SITUATION_OPTIONS: Array<{ value: CurrentSituation; label: string }> = [
  { value: 'employed_exploring', label: 'Employed, exploring options' },
  { value: 'employed_urgent', label: 'Employed, need to leave (urgent)' },
  { value: 'unemployed_short', label: 'Unemployed (under 3 months)' },
  { value: 'unemployed_medium', label: 'Unemployed (3–12 months)' },
  { value: 'unemployed_long', label: 'Unemployed (over 12 months)' },
  { value: 'freelancing', label: 'Freelancing / consulting' },
  { value: 'sabbatical', label: 'Sabbatical / planned pause' },
  { value: 'returning', label: 'Returning after a break' },
];

export const DRIVER_OPTIONS: Array<{ value: ChangeDriver; label: string }> = [
  { value: 'career_growth', label: 'Career growth / hit a ceiling' },
  { value: 'financial_pressure', label: 'Financial pressure' },
  { value: 'role_culture_misfit', label: 'Role or culture misfit' },
  { value: 'restructuring_layoff', label: 'Company restructuring / layoff' },
  { value: 'relocation', label: 'Relocation' },
  { value: 'personal_family', label: 'Personal / family reasons' },
];

export const ARRANGEMENT_OPTIONS: Array<{ value: WorkArrangement; label: string }> = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote_only', label: 'Remote only' },
  { value: 'open', label: 'Open to any' },
];

export const MOBILITY_OPTIONS: Array<{ value: Mobility; label: string }> = [
  { value: 'not_relocating', label: 'Not willing to relocate' },
  { value: 'open_to_relocate', label: 'Open to relocation' },
  { value: 'already_relocating', label: 'Already relocating' },
];

export const TRAVEL_OPTIONS: Array<{ value: TravelTolerance; label: string }> = [
  { value: 'no_travel', label: 'No travel' },
  { value: 'up_to_10', label: 'Up to 10%' },
  { value: 'up_to_25', label: 'Up to 25%' },
  { value: 'up_to_50', label: 'Up to 50%' },
  { value: 'no_limit', label: 'No limit' },
];

export const AVAILABILITY_OPTIONS: Array<{ value: Availability; label: string }> = [
  { value: 'immediately', label: 'Immediately' },
  { value: '2_4_weeks', label: '2–4 weeks' },
  { value: '1_3_months', label: '1–3 months' },
  { value: '3_plus_months', label: '3+ months' },
];

export const INCOME_OPTIONS: Array<{ value: IncomeExpectation; label: string }> = [
  { value: 'prefer_not_to_share', label: 'Prefer not to share' },
  { value: 'under_40k', label: 'Under €40k' },
  { value: '40_60k', label: '€40–60k' },
  { value: '60_80k', label: '€60–80k' },
  { value: '80_100k', label: '€80–100k' },
  { value: '100_150k', label: '€100–150k' },
  { value: '150k_plus', label: '€150k+' },
];

// ── LLM extraction response type ───────────────────────────────
// Matches the Edge Function output (which matches the LLM prompt schema)

export interface ExtractedCV {
  roles: Array<{
    title: string;
    organisation: string;
    startYear: number | null;
    endYear: number | null;
    location: string | null;
    scope: string;
    highlights: string[];
  }>;
  skills: string[];
  education: Array<{
    qualification: string;
    institution: string | null;
    year: number | null;
  }>;
  languages: string[];
  summary: string;
  currentSituation: string | null;
}

// Convert LLM extraction to StructuredProfile
export function extractionToProfile(extracted: ExtractedCV): StructuredProfile {
  const profile = createEmptyProfile();

  profile.roles = extracted.roles.map((r, i) => ({
    id: `role-${Date.now()}-${i}`,
    title: r.title || '',
    organisation: r.organisation || '',
    startYear: r.startYear,
    endYear: r.endYear,
    location: r.location,
    scope: r.scope || '',
    highlights: r.highlights || [],
  }));

  profile.skills = extracted.skills || [];
  profile.languages = extracted.languages || [];

  profile.education = (extracted.education || []).map((e, i) => ({
    id: `edu-${Date.now()}-${i}`,
    qualification: e.qualification || '',
    institution: e.institution,
    year: e.year,
  }));

  profile.careerSummary = extracted.summary || null;

  // Map the LLM's situation inference to our enum
  const situationMap: Record<string, CurrentSituation> = {
    'employed_exploring': 'employed_exploring',
    'employed_urgent': 'employed_urgent',
    'unemployed_short': 'unemployed_short',
    'unemployed_medium': 'unemployed_medium',
    'unemployed_long': 'unemployed_long',
    'freelancing': 'freelancing',
    'sabbatical': 'sabbatical',
    'returning': 'returning',
  };
  if (extracted.currentSituation && situationMap[extracted.currentSituation]) {
    profile.currentSituation = situationMap[extracted.currentSituation];
  }

  return profile;
}
