/**
 * 사용자가 만든 모임 — Android `UserCreatedMeetings` 포트.
 *
 * Android와 동일하게 **세션 메모리 전용**: localStorage에 저장하지 않으며 앱 재시작(새로고침) 시 사라진다.
 * 새 모임은 목록 맨 앞에 추가 (`_meetings.add(0, meeting)`).
 *
 * 사용처 (Android와 동일 풀): 홈 "활동 중인 모임" · 운동 목록 · 채팅방 목록 · 검색 · 모임 상세 조회.
 */

import { create } from 'zustand';
import type { Meeting } from '../data/models';

interface CreatedMeetingsState {
  meetings: Meeting[];
  add: (meeting: Meeting) => void;
}

export const useCreatedMeetingsStore = create<CreatedMeetingsState>((set) => ({
  meetings: [],
  add: (meeting) => set((s) => ({ meetings: [meeting, ...s.meetings] })),
}));
