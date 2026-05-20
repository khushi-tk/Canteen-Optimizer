/**
 * services/supabaseClient.ts
 *
 * Initializes and exports the Supabase client singleton.
 * Throws at startup when env vars are missing so auth
 * and data calls never silently degrade to mock mode.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  throw new Error(
    '[CanteenCrowd] Missing Supabase credentials.\n' +
      'Create a .env file at the project root with:\n' +
      '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
      '  VITE_SUPABASE_ANON_KEY=your-anon-key\n' +
      'Get these from Supabase Dashboard → Settings → API.',
  );
}

export const supabase: SupabaseClient = createClient(url, key);
