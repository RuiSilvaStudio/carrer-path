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
