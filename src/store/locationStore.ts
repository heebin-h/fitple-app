/**
 * 선택한 동네 — Android `LocationState` 포트.
 *
 * Android와 동일하게 세션 메모리 전용(재시작 시 기본값 "미사 1동"), 실제 GPS/필터링 없이
 * 화면 간 표시 텍스트만 공유한다. 사용처: 홈(회원·게스트) · 운동 · 추천 모임.
 */

import { create } from 'zustand';

export const NEIGHBORHOODS = [
  '미사 1동', '미사 2동', '미사 3동', '풍산동', '창우동', '신장동', '덕풍동', '위례동',
] as const;

interface LocationState {
  current: string;
  setCurrent: (name: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  current: NEIGHBORHOODS[0],
  setCurrent: (name) => set({ current: name }),
}));
