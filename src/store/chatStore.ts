/**
 * 채팅 메시지 런타임 상태. SPEC §9 / §12.15-16.
 * meetingId 키로 메시지 배열 관리. localStorage 초기값은 initMessages로 주입.
 */

import { create } from 'zustand';
import type { ChatMessage } from '../data/models';

interface ChatState {
  messages: Record<string, ChatMessage[]>;
  initMessages: (meetingId: string, msgs: ChatMessage[]) => void;
  addMessage:   (meetingId: string, msg: ChatMessage) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  initMessages: (id, msgs) => {
    if (!get().messages[id]) {
      set((s) => ({ messages: { ...s.messages, [id]: msgs } }));
    }
  },
  addMessage: (id, msg) =>
    set((s) => ({
      messages: { ...s.messages, [id]: [...(s.messages[id] ?? []), msg] },
    })),
}));
