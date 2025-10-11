import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import api from '../lib/api';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithKakao: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    set({
      user: data.user,
      session: data.session,
    });
  },

  signUp: async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) throw error;

    // 프로필 자동 생성은 Supabase 트리거로 처리
    set({
      user: data.user,
      session: data.session,
    });
  },

  signInWithKakao: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    // OAuth는 리다이렉트 방식이므로 여기서 세션을 설정하지 않음
    // 콜백에서 세션이 자동으로 설정됨
  },

  signInWithApple: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    // OAuth는 리다이렉트 방식이므로 여기서 세션을 설정하지 않음
    // 콜백에서 세션이 자동으로 설정됨
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  deleteAccount: async () => {
    // 백엔드 API를 통해 회원 탈퇴
    // Supabase Auth 사용자 삭제 + CASCADE로 모든 관련 데이터 삭제
    await api.delete('/api/auth/account');

    // 로컬 세션 정리
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      set({
        user: session?.user ?? null,
        session,
        loading: false,
      });

      // 세션 변경 리스너
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          session,
        });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },
}));
