import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Admin 클라이언트 (Service Role Key 사용)
 * 백엔드는 RLS를 우회하여 모든 데이터에 접근 가능
 */
function getSupabaseAdmin(): SupabaseClient {
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
}

/**
 * Supabase 싱글톤 인스턴스 (Service Role 사용)
 * 백엔드에서는 항상 Admin 클라이언트 사용
 */
export const supabase = getSupabaseAdmin();

export { getSupabaseAdmin };
