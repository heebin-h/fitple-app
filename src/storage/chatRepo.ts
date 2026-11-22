/**
 * 채팅 메시지 로드. SPEC §8 (`chats:{meetingId}`).
 *
 * 저장된 대화가 있으면 그것을, 없으면 Android 샘플 대화(sampleChat)를 돌려준다 —
 * Android PostDetailFragment는 모든 모임 채팅 탭에 같은 샘플 8건을 표시한다.
 * 파싱 실패 시 콘솔 로그 후 샘플로 폴백.
 */

import type { ChatMessage } from '../data/models';
import { sampleChat } from '../data/seedData';

export function loadChat(meetingId: string): ChatMessage[] {
  const raw = localStorage.getItem(`chats:${meetingId}`);
  if (!raw) return sampleChat();
  try {
    return JSON.parse(raw) as ChatMessage[];
  } catch (e) {
    console.error(`[chatRepo] chats:${meetingId} parse failed:`, e);
    return sampleChat();
  }
}
