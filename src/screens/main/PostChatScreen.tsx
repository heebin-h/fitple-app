/**
 * 독립형 채팅 화면. SPEC §12.16 / Android PostChatFragment.
 * 라우트: /meeting/:id/chat — PostDetailScreen 채팅 탭과 동일 UI지만 별도 진입점용.
 * BottomNav 없음 (PostDetailScreen과 같은 그룹).
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import type { Meeting, ChatMessage } from '../../data/models';

function readMeetings(): Meeting[] {
  try { return JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[]; }
  catch { return []; }
}
function readChats(meetingId: string): ChatMessage[] {
  try { return JSON.parse(localStorage.getItem(`chats:${meetingId}`) ?? '[]') as ChatMessage[]; }
  catch { return []; }
}
function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours(), m = d.getMinutes();
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(m).padStart(2, '0')}`;
}

export function PostChatScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser  = useAuthStore((s) => s.currentUser);
  const initMessages = useChatStore((s) => s.initMessages);
  const addMessage   = useChatStore((s) => s.addMessage);
  const messages     = useChatStore((s) => s.messages[id ?? ''] ?? []);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const meeting = useMemo(() => readMeetings().find((m) => m.id === id) ?? null, [id]);

  useEffect(() => {
    if (id) initMessages(id, readChats(id));
  }, [id, initMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || !id) return;
    const msg: ChatMessage = {
      id: `my-${Date.now()}`,
      senderName: currentUser?.nickname ?? '나',
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
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-3 pb-[72px]">
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="text-center text-micro text-textHint">
                {msg.message}
              </div>
            );
          }
          return (
            <div key={msg.id} className={cn('flex flex-col', msg.isMe ? 'items-end' : 'items-start')}>
              {!msg.isMe && (
                <span className="mb-1 text-micro text-textHint">{msg.senderName}</span>
              )}
              <div className={cn(
                'max-w-[75%] rounded-[12px] px-3 py-2 text-caption',
                msg.isMe ? 'bg-orange text-textWhite' : 'bg-background text-textPrimary',
              )}>
                {msg.message}
              </div>
              <span className="mt-0.5 text-[10px] text-textHint">{formatTime(msg.timestamp)}</span>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* 입력 바 */}
      <div className="fixed inset-x-0 bottom-0 flex items-center gap-2 border-t border-borderDefault bg-surface px-4 py-3 pb-safe">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
