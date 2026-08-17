/**
 * 모임 상세 — 5탭. SPEC §12.15 / Android PostDetailFragment.
 * BottomNav 없음 — AppRoutes에서 MainLayout 밖에 배치.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { meetingImg } from '../../utils/meetingImage';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import type { Meeting, ChatMessage } from '../../data/models';

// ── localStorage helpers ────────────────────────────────────────────────────
function readMeetings(): Meeting[] {
  try { return JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[]; }
  catch { return []; }
}
function readChats(meetingId: string): ChatMessage[] {
  try { return JSON.parse(localStorage.getItem(`chats:${meetingId}`) ?? '[]') as ChatMessage[]; }
  catch { return []; }
}
function isJoined(email: string, meetingId: string): boolean {
  try {
    const list = JSON.parse(localStorage.getItem(`joined:${email}`) ?? '[]') as string[];
    return list.includes(meetingId);
  } catch { return false; }
}
function setJoined(email: string, meetingId: string) {
  try {
    const list = JSON.parse(localStorage.getItem(`joined:${email}`) ?? '[]') as string[];
    if (!list.includes(meetingId)) {
      localStorage.setItem(`joined:${email}`, JSON.stringify([...list, meetingId]));
    }
  } catch { /* ignore */ }
}

const TABS = ['홈', '게시판', '채팅', '사진첩', '멤버'] as const;
type Tab = typeof TABS[number];

// 게시판 더미 데이터
const NOTICES = [
  { id: 'n-1', title: '이번 주 모임 안내', date: '2026-05-20', preview: '예정대로 진행합니다. 준비물 챙겨오세요!' },
  { id: 'n-2', title: '운영진 공지',        date: '2026-05-15', preview: '신규 회원 환영합니다. 자유롭게 질문해 주세요.' },
  { id: 'n-3', title: '사진 공유',          date: '2026-05-10', preview: '지난 모임 사진 올렸어요. 확인해보세요~' },
];

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours(), m = d.getMinutes();
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(m).padStart(2, '0')}`;
}

export function PostDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isGuest     = useAuthStore((s) => s.isGuest);

  const meeting = useMemo(() => readMeetings().find((m) => m.id === id) ?? null, [id]);
  const [activeTab, setActiveTab] = useState<Tab>('홈');
  const [joined, setJoinedState] = useState(() =>
    currentUser ? isJoined(currentUser.email, id ?? '') : false,
  );
  const [noticeOpen, setNoticeOpen] = useState(true);

  // ── 채팅 ──────────────────────────────────────────────────────────────────
  const initMessages = useChatStore((s) => s.initMessages);
  const addMessage   = useChatStore((s) => s.addMessage);
  const messages     = useChatStore((s) => s.messages[id ?? ''] ?? []);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) initMessages(id, readChats(id));
  }, [id, initMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!meeting) {
    return (
      <div className="flex min-h-dvh items-center justify-center pt-safe">
        <p className="text-caption text-textHint">모임을 찾을 수 없어요</p>
      </div>
    );
  }

  function handleJoin() {
    if (!currentUser) { toast('로그인이 필요해요'); return; }
    setJoined(currentUser.email, meeting!.id);
    setJoinedState(true);
    toast('참가 신청이 완료되었어요!');
  }

  function handleSend() {
    if (!input.trim() || !id) return;
    if (isGuest || !currentUser) { toast('로그인이 필요해요'); return; }
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
      {/* ── 히어로 이미지 + 툴바 오버레이 ─────────────────── */}
      <div className="relative h-[220px] flex-shrink-0 overflow-hidden bg-background">
        <img src={meetingImg(meeting.image)} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 top-0 flex h-12 items-center justify-between px-4">
          <button type="button" onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30">
            <ArrowLeft size={18} className="text-textWhite" />
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => toast('찜하기 기능 준비 중이에요')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30">
              <Heart size={16} className="text-textWhite" />
            </button>
            <button type="button" onClick={() => toast('공유 기능 준비 중이에요')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30">
              <Share2 size={16} className="text-textWhite" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 제목 + 종목 배지 ─────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 py-3">
        <h1 className="flex-1 text-h2 text-textPrimary">{meeting.title}</h1>
        <span className="rounded-[4px] bg-orangeTint px-2 py-0.5 text-micro text-orange">
          {meeting.sport}
        </span>
      </div>

      {/* ── 탭 스트립 ────────────────────────────────────── */}
      <div className="flex border-b border-borderDefault">
        {TABS.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2.5 text-caption',
              activeTab === tab
                ? 'border-b-2 border-orange font-bold text-orange'
                : 'text-textSecondary',
            )}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── 탭 본문 ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-y-auto">

        {/* 홈 탭 */}
        {activeTab === '홈' && (
          <div className="flex flex-col gap-4 px-5 py-4 pb-24">
            {/* 설명 */}
            <p className="text-body text-textSecondary">{meeting.description ?? '모임 소개가 없어요.'}</p>

            {/* 운영진 공지 */}
            <div className="rounded-card bg-noticeBg p-3">
              <div className="flex items-center justify-between">
                <span className="text-caption-strong text-noticeRed">운영진 공지</span>
                <button type="button" onClick={() => setNoticeOpen((v) => !v)}
                  className="text-caption text-textHint">{noticeOpen ? '접기' : '펼치기'}</button>
              </div>
              {noticeOpen && (
                <p className="mt-2 text-caption text-textSecondary">
                  핏플에서 배려하고 존중하는 건강한 모임 문화를 만들어 가요~
                </p>
              )}
            </div>

            {/* 기본 정보 */}
            <div className="rounded-card border border-borderDefault p-4">
              <p className="text-caption-strong text-textPrimary">기본정보</p>
              <div className="mt-2 flex flex-col gap-2">
                {meeting.meetingTime && (
                  <div className="flex gap-3 text-caption">
                    <span className="w-20 text-textHint">정기모임시간</span>
                    <span className="text-textPrimary">{meeting.meetingTime}</span>
                  </div>
                )}
                <div className="flex gap-3 text-caption">
                  <span className="w-20 text-textHint">모집 인원</span>
                  <span className="text-textPrimary">{meeting.memberCount}/{meeting.maxMembers}명</span>
                </div>
                <div className="flex gap-3 text-caption">
                  <span className="w-20 text-textHint">장소</span>
                  <span className="text-textPrimary">{meeting.location}</span>
                </div>
                {meeting.level && (
                  <div className="flex gap-3 text-caption">
                    <span className="w-20 text-textHint">수준</span>
                    <span className="text-textPrimary">{meeting.level}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 지도 플레이스홀더 */}
            <div className="flex h-[120px] items-center justify-center rounded-card bg-background">
              <p className="text-caption text-textHint">📍 {meeting.location}</p>
            </div>
          </div>
        )}

        {/* 게시판 탭 */}
        {activeTab === '게시판' && (
          <div className="flex flex-col divide-y divide-borderDefault">
            {NOTICES.map((n) => (
              <button key={n.id} type="button"
                onClick={() => toast('게시글 상세 기능을 준비 중이에요')}
                className="flex flex-col gap-1 px-5 py-4 text-left">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-body-strong text-textPrimary">{n.title}</p>
                  <span className="flex-shrink-0 text-micro text-textHint">{n.date}</span>
                </div>
                <p className="text-caption text-textSecondary line-clamp-2">{n.preview}</p>
              </button>
            ))}
          </div>
        )}

        {/* 채팅 탭 */}
        {activeTab === '채팅' && (
          <div className="flex flex-1 flex-col">
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
            <div className="fixed bottom-0 left-1/2 w-full max-w-mobile -translate-x-1/2 flex flex-col border-t border-borderDefault bg-surface">
              <div className="flex items-center gap-2 px-4 py-3">
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
              <div className="pb-safe" />
            </div>
          </div>
        )}

        {/* 사진첩 / 멤버 탭 */}
        {(activeTab === '사진첩' || activeTab === '멤버') && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-caption text-textHint">{activeTab} 기능을 준비 중이에요</p>
          </div>
        )}
      </div>

      {/* ── 하단 고정 버튼 (홈탭에서만) ─────────────────── */}
      {activeTab === '홈' && (
        <div className="fixed bottom-0 left-1/2 w-full max-w-mobile -translate-x-1/2 flex flex-col border-t border-borderDefault bg-surface">
          <div className="px-5 py-3">
            <button type="button" onClick={handleJoin} disabled={joined}
              className={cn(
                'h-[52px] w-full rounded-card text-h3 text-textWhite',
                joined ? 'bg-btnDisabled' : 'bg-orange',
              )}>
              {joined ? '참가 완료' : '1회 참가하기'}
            </button>
          </div>
          <div className="pb-safe" />
        </div>
      )}
    </div>
  );
}
