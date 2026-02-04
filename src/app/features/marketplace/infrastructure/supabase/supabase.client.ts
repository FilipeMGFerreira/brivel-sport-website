import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { appSettings } from '../../../../appsettings';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const url = appSettings.supabase?.url ?? '';
    const anonKey = appSettings.supabase?.anonKey ?? '';
    if (!url || !anonKey || url === 'YOUR_SUPABASE_URL' || anonKey === 'YOUR_SUPABASE_ANON_KEY') {
      throw new Error('Configure Supabase in appsettings.ts: set supabase.url and supabase.anonKey');
    }
    client = createClient(url, anonKey);
  }
  return client;
}
