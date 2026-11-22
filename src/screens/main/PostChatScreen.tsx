/**
 * 독립형 채팅 화면. SPEC §12.16 / Android PostChatFragment.
 * 라우트: /meeting/:id/chat — PostDetailScreen 채팅 탭과 동일 UI지만 별도 진입점용.
 * BottomNav 없음 (PostDetailScreen과 같은 그룹).
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { useChatStore } from '../../store/chatStore';
import { loadChat } from '../../storage/chatRepo';
import { ChatMessageList } from '../../components/chat/ChatMessageList';
import { useAuthStore } from '../../store/authStore';
import { useCreatedMeetingsStore } from '../../store/createdMeetingsStore';
import type { Meeting, ChatMessage } from '../../data/models';

const EMPTY_MESSAGES: ChatMessage[] = [];

function readMeetings(): Meeting[] {
  try { return JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[]; }
  catch { return []; }
}
export function PostChatScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser  = useAuthStore((s) => s.currentUser);
  const isGuest      = useAuthStore((s) => s.isGuest);
  const initMessages = useChatStore((s) => s.initMessages);
  const addMessage   = useChatStore((s) => s.addMessage);
  // 안정 참조 필요: `?? []`는 매 호출 새 배열 → zustand v5 getSnapshot 불일치 경고/무한 렌더 위험
  const messages     = useChatStore((s) => s.messages[id ?? ''] ?? EMPTY_MESSAGES);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const created = useCreatedMeetingsStore((s) => s.meetings);
  const meeting = useMemo(
    () => [...created, ...readMeetings()].find((m) => m.id === id) ?? null,
    [created, id],
  );

  useEffect(() => {
    if (id) initMessages(id, loadChat(id));
  }, [id, initMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || !id) return;
    if (isGuest || !currentUser) { toast('로그인이 필요해요'); return; }
    const msg: ChatMessage = {
      id: `my-${Date.now()}`,
      senderName: currentUser.nickname,
      message: input.trim(),
      timestamp: Date.now(),
      isMe: true,
      isSystem: false,
    };
    addMessage(id, msg);
    setInput('');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface pt-safe">
      {/* 툴바 */}
      <div className="flex h-12 items-center gap-2 px-4">
        <button type="button" onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-textPrimary" />
        </button>
        <span className="flex-1 text-center text-h3 text-textPrimary">
          {meeting?.title ?? '채팅'}
        </span>
        <div className="w-8" />
      </div>

      {/* 공지 배너 */}
      <div className="bg-noticeBg px-5 py-2 text-micro text-noticeRed">
        핏플에서 배려하고, 존중하는 건강한 채팅 해요~
      </div>

      {/* 메시지 목록 */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3 pb-[88px]">
        <ChatMessageList messages={messages} />
        <div ref={chatEndRef} />
      </div>

      {/* 입력 바 */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-mobile -translate-x-1/2 flex items-center gap-2 border-t border-borderDefault bg-surface px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend(); }}
          placeholder="메시지를 입력해주세요"
          className="flex-1 rounded-[8px] bg-background px-3 py-2 text-caption text-textPrimary outline-none placeholder:text-textHint"
        />
        <button type="button" onClick={handleSend}
          className={cn('p-2', input.trim() ? 'text-orange' : 'text-textHint')}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
