import { supabase } from './supabase';

export type AnalyticsEvent = {
  event_name: string;
  payload?: Record<string, unknown>;
};

export async function track(event: AnalyticsEvent['event_name'], payload?: Record<string, unknown>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('analytics_events')
      .insert({ user_id: user.id, event_name: event, payload: payload ?? {} });
  } catch {
    // analytics must never break the app
  }
}
