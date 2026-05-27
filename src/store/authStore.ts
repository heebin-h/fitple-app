/**
 * 인증 상태 스토어 (Zustand). SPEC §9.
 *
 *   currentUser — 로그인된 UserProfile (없으면 null)
 *   isGuest     — "회원가입 없이 둘러보기"로 진입한 게스트 세션 여부
 *
 * 영속성은 userManager(localStorage)가 담당. 이 스토어는 런타임 세션 상태만 보유한다.
 * 로그인 성공/게스트 진입은 상호 배타적: setUser는 게스트를 해제하고, enterGuest는
 * currentUser를 비운다.
 */

import { create } from 'zustand';
import type { UserProfile } from '../data/models';

interface AuthState {
  currentUser: UserProfile | null;
  isGuest: boolean;
  /** 로그인 사용자 지정. null이면 로그아웃 상태로 환원. 항상 게스트 플래그 해제. */
  setUser: (u: UserProfile | null) => void;
  /** 게스트(둘러보기) 진입 — currentUser를 비우고 isGuest를 켠다. */
  enterGuest: () => void;
  /** 게스트가 실제 로그인할 때 게스트 플래그만 해제. */
  exitGuest: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isGuest: false,
  setUser: (u) => set({ currentUser: u, isGuest: false }),
  enterGuest: () => set({ currentUser: null, isGuest: true }),
  exitGuest: () => set({ isGuest: false }),
}));
