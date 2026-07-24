export interface ContactLogEntry {
  id: number;
  user_id: string;
  contact_id: number;
  sent_date: string;   // ISO date (YYYY-MM-DD)
  channel: string;
  message: string;
  status: 'waiting' | 'replied';
  created_at: string;
  updated_at: string;
}

export type NewLogEntry = Omit<ContactLogEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type LogEntryUpdate = Partial<NewLogEntry>;
