export interface CockpitContact {
  id: number;
  user_id: string;
  contact_name: string;
  company: string;
  relationship: string;
  tier: 'A' | 'B' | 'C';
  status: string;
  goals: string;
  message: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type PipelineStatus = 'Not contacted' | 'Aware' | 'Ready' | 'Warm contact' | 'Meeting';

// ── Job Listings ────────────────────────────────────────────────
export type JobStatus = 'New' | 'Reviewing' | 'Promoted' | 'Dismissed';

export interface JobListing {
  id: number;
  user_id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  description: string;
  posted_at: string | null;
  scraped_at: string;
  match_score: number | null;
  match_reasons: string;
  status: JobStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}
