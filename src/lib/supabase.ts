import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function subscribeEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('landing_subscribers')
      .insert([{ email, subscribed_at: new Date().toISOString() }]);

    if (error) {
      // 이미 구독된 이메일인 경우
      if (error.code === '23505') {
        return { success: true }; // 이미 있어도 성공으로 처리
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
}
