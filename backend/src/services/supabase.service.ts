import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase 클라이언트 초기화
 */
let supabase: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }

  return supabase;
};

/**
 * Supabase Admin 클라이언트 (서비스 키 사용)
 * RLS를 우회하여 모든 데이터에 접근 가능
 */
export const getSupabaseAdmin = (): SupabaseClient => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set for admin access');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export { supabase };
