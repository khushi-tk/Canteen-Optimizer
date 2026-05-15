/**
 * services/supabaseClient.ts
 *
 * Initializes and exports the Supabase client singleton.
 * When env vars are missing the export is null so the app
 * can fall back to mock data gracefully.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

if (!supabase) {
  console.warn(
    '[CanteenCrowd] Supabase credentials missing — running in mock-only mode.\n' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable the backend.',
  );
}
