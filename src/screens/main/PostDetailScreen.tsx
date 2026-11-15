/**
 * 모임 상세 — 5탭. SPEC §12.15 / Android `PostDetailFragment.kt` + `fragment_post_detail.xml`.
 * 레이아웃은 디자인 PNG 우선: home_postdetail_participant_home.png(홈 탭),
 * home_postdetail_noticelist_chattab.png(공지·채팅 탭). BottomNav 없음 — MainLayout 밖.
 *
 *   툴바: ← | 모임 제목 | 검색(/search) · 알림(/notifications)      (Android btnSearch/btnBell)
 *   탭  : 홈 · 공지 · 채팅 · 사진첩 · 멤버                           (Android tabTitles)
 *   홈  : 헤더 사진 + 반투명 정보 카드(그룹명 · "조회 n · 채팅 n분전 활동" · 설명)
 *         → 다가오는 정기 모임(일시·위치·참석 멤버·지도) → [공유하기][1회 체험하기]
 *         → 기본정보(종목 배지·정기 모임시간·회원수·장소) → 설명 → 필독 · 안내사항
 *         → 하단 고정 [문의하기][가입하기]
 *   공지: Android setupNoticeList 4건 (item_notice_card)
 *   채팅: 접을 수 있는 안내 배너 + 메시지 + "작성"/"전송" 입력
 *
 * 동작 (Android 그대로):
 *   공유하기    → 시스템 공유(Web Share API). 미지원 브라우저는 클립보드 복사.
 *   1회 체험하기 → Toast "1회 체험 신청이 완료되었어요!" + 버튼 비활성
 *   문의하기    → mailto:support@fitple.app, 제목 "[FitPle 문의] {title}"
 *   가입하기    → Toast "가입 신청이 완료되었어요!" + "가입 완료"(회색, 비활성). joined:{email}에 영속
 *   지도        → Google Maps embed (Android WebView와 같은 URL)
 */

import { useState, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Bell, CalendarDays, ChevronUp, Clock, MapPin, Megaphone, MessageSquareMore, Search, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { meetingImg } from '../../utils/meetingImage';
import profileDefault from '../../assets/images/profile/profile_default.png';
import { useChatStore } from '../../store/chatStore';
import { loadChat } from '../../storage/chatRepo';
import { ChatMessageList } from '../../components/chat/ChatMessageList';
import { useAuthStore } from '../../store/authStore';
import { useCreatedMeetingsStore } from '../../store/createdMeetingsStore';
import type { Meeting, ChatMessage } from '../../data/models';

// ── localStorage helpers ────────────────────────────────────────────────────
function readMeetings(): Meeting[] {
  try { return JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[]; }
  catch (e) { console.error('[PostDetail] meetings parse failed:', e); return []; }
}
function readJoined(email: string): string[] {
  try { return JSON.parse(localStorage.getItem(`joined:${email}`) ?? '[]') as string[]; }
  catch (e) { console.error('[PostDetail] joined parse failed:', e); return []; }
}
function saveJoined(email: string, meetingId: string) {
  const list = readJoined(email);
  if (!list.includes(meetingId)) localStorage.setItem(`joined:${email}`, JSON.stringify([...list, meetingId]));
}

const TABS = ['홈', '공지', '채팅', '사진첩', '멤버'] as const;
type Tab = typeof TABS[number];

const EMPTY_MESSAGES: ChatMessage[] = [];

// 사진첩 — Android PostDetailFragment.setupPhotoGrid 9장 순서 그대로 (seed image 키)
const PHOTOS = [
  'img_meeting_group_photo1', 'img_meeting_running_beach', 'img_meeting_hiking_group1',
  'img_meeting_futsal_field1', 'img_meeting_cycling_group1', 'img_meeting_golf_field1',
  'img_trial_hiking_group1', 'img_meeting_outdoor_winter', 'img_meeting_hiking_group2',
] as const;

// 멤버 — Android setupMemberList 5명 (채팅 샘플 발신자와 동일 구성)
const MEMBERS: readonly { name: string; role: string }[] = [
  { name: '김상미', role: '모임장' },
  { name: '이현우', role: '운영진' },
  { name: '박지훈', role: '' },
  { name: '최유진', role: '' },
  { name: '정다은', role: '' },
];

// 공지 — Android setupNoticeList 4건 (썸네일 기본값 img_meeting_hiking_group1)
const NOTICES = [
  { title: '이번주는 쉽니다.',           preview: '이번주는 개인 사정으로 정기 모임을 쉬어갑니다. 다음주에 만나요!', date: '1일전', views: 20, comments: 8,  thumb: false },
  { title: '이번주만 위치가 변경됩니다.', preview: '📍 이번주는 보라매 공원에서 진행합니다. 정문에서 만나요~',       date: '2일전', views: 34, comments: 5,  thumb: true  },
  { title: '모임 정기 일정 안내',         preview: '매주 수요일 오후 8시, 미사역 3번 출구에서 만나요!',             date: '5일전', views: 58, comments: 12, thumb: false },
  { title: '신규 멤버 환영',              preview: '새로운 멤버 여러분을 환영합니다! 편하게 참여해 주세요.',        date: '1주전', views: 41, comments: 3,  thumb: false },
] as const;

/** 섹션 구분 띠 — XML 8dp colorBackground */
function Divider() {
  return <div className="h-2 bg-background" />;
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center py-1.5 text-label">
      <span className="flex w-[120px] flex-shrink-0 items-center gap-1.5 text-textSecondary">{icon}{label}</span>
      <span className="min-w-0 flex-1 truncate text-textPrimary">{value}</span>
    </div>
  );
}

export function PostDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isGuest     = useAuthStore((s) => s.isGuest);
  const member = !isGuest && currentUser !== null;

  const created = useCreatedMeetingsStore((s) => s.meetings);
  const meeting = useMemo(
    () => [...created, ...readMeetings()].find((m) => m.id === id) ?? null,
    [created, id],
  );
  // Android PostDetailFragment.newInstance(meeting, initialTab) — ChatList는 '채팅' 탭으로 진입
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const t = (location.state as { initialTab?: string } | null)?.initialTab;
    return (TABS as readonly string[]).includes(t ?? '') ? (t as Tab) : '홈';
  });
  const [joined, setJoinedState] = useState(false);
  const [trialApplied, setTrialApplied] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);

  // 다른 모임으로 이동해도(같은 컴포넌트 재사용) 가입 상태를 다시 읽는다
  useEffect(() => {
    setJoinedState(currentUser && id ? readJoined(currentUser.email).includes(id) : false);
    setTrialApplied(false);
  }, [currentUser, id]);

  // ── 채팅 ──────────────────────────────────────────────────────────────────
  const initMessages = useChatStore((s) => s.initMessages);
  const addMessage   = useChatStore((s) => s.addMessage);
  // 안정 참조 필요: `?? []`는 매 호출 새 배열 → zustand v5 getSnapshot 불일치 경고/무한 렌더 위험
  const messages     = useChatStore((s) => s.messages[id ?? ''] ?? EMPTY_MESSAGES);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) initMessages(id, loadChat(id));
  }, [id, initMessages]);

  useEffect(() => {
    if (activeTab === '채팅') chatEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, activeTab]);

  if (!meeting) {
    return (
      <div className="flex min-h-dvh items-center justify-center pt-safe">
        <p className="text-caption text-textHint">모임을 찾을 수 없어요</p>
      </div>
    );
  }
  const m = meeting;

  /** 회원 전용 동작 — 게스트는 안내 토스트 */
  function requireMember(): boolean {
    if (member) return true;
    toast('로그인이 필요해요');
    return false;
  }

  async function handleShare() {
    const text = `[FitPle] ${m.title}\n${m.location} · ${m.meetingTime ?? ''}\n${m.description ?? ''}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: '공유하기', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast('공유할 내용을 복사했어요');
      }
    } catch (e) {
      // 사용자가 공유 시트를 닫으면 AbortError — 정상 흐름
      if (!(e instanceof DOMException && e.name === 'AbortError')) console.error('[PostDetail] share failed:', e);
    }
  }

  function handleTrial() {
    if (!requireMember()) return;
    setTrialApplied(true);
    toast('1회 체험 신청이 완료되었어요!');
  }

  function handleInquiry() {
    const subject = encodeURIComponent(`[FitPle 문의] ${m.title}`);
    window.location.href = `mailto:support@fitple.app?subject=${subject}`;
  }

  function handleJoin() {
    if (!requireMember() || !currentUser) return;
    saveJoined(currentUser.email, m.id);
    setJoinedState(true);
    toast('가입 신청이 완료되었어요!');
  }

  function handleSend() {
    if (!input.trim() || !id) return;
    if (!member || !currentUser) { toast('로그인이 필요해요'); return; }
    addMessage(id, {
      id: `my-${Date.now()}`,
      senderName: currentUser.nickname,
      message: input.trim(),
      timestamp: Date.now(),
      isMe: true,
      isSystem: false,
    });
    setInput('');
  }

  const views = m.memberCount * 4; // Android: viewCount 없으면 memberCount * 4
  const chatActivity = m.lastActiveMinutes ? `${m.lastActiveMinutes}분전 활동` : '방금 활동';
  const extraMembers = Math.max(m.memberCount - 4, 0);
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(m.location)}&output=embed&hl=ko&z=15`;

  return (
    <div className="flex min-h-dvh flex-col bg-surface pt-safe">
      {/* ── 툴바 ───────────────────────────────────────────── */}
      <div className="flex h-12 items-center gap-2 px-4">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로" className="p-1">
          <ArrowLeft size={22} className="text-textPrimary" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-h2 text-textPrimary">{m.title}</h1>
        <button type="button" onClick={() => navigate('/search')} aria-label="검색" className="p-1">
          <Search size={22} className="text-textPrimary" />
        </button>
        <button type="button" onClick={() => navigate('/notifications')} aria-label="알림" className="p-1">
          <Bell size={22} className="text-textPrimary" />
        </button>
      </div>

      {/* ── 탭 ─────────────────────────────────────────────── */}
      <div role="tablist" className="flex">
        {TABS.map((tab) => (
          <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)}
            className={cn('relative flex-1 py-3 text-body', activeTab === tab ? 'font-bold text-textPrimary' : 'text-textSecondary')}>
            {tab}
            {activeTab === tab && <span className="absolute bottom-0 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-full bg-orange" />}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        {/* ── 홈 탭 ───────────────────────────────────────── */}
        {activeTab === '홈' && (
          <div className="flex flex-col pb-[96px]">
            {/* 헤더 사진 + 정보 카드 */}
            <div className="relative h-[236px] overflow-hidden bg-background">
              <img src={meetingImg(m.image)} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-4 bottom-4 rounded-card bg-black/35 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-baseline gap-2">
                  <p className="min-w-0 flex-1 truncate text-h2 text-textWhite">{m.groupName || m.title}</p>
                  <span className="flex-shrink-0 text-mini text-textWhite/80">조회 {views} · 채팅 {chatActivity}</span>
                </div>
                {m.description && <p className="mt-1 line-clamp-2 text-label text-textWhite">{m.description}</p>}
              </div>
            </div>

            {/* 다가오는 정기 모임 */}
            <section className="px-5 pb-5 pt-5">
              <h2 className="text-h3 text-textPrimary">다가오는 정기 모임</h2>
              <div className="mt-2">
                <InfoRow icon={<CalendarDays size={16} />} label="일시" value={m.meetingTime ?? '일정 미정'} />
                <InfoRow icon={<MapPin size={16} />} label="위치" value={m.location} />
              </div>
              <div className="mt-2 flex items-center">
                <div className="flex -space-x-2">
                  {[0, 1, 2, 3].map((i) => (
                    <img key={i} src={profileDefault} alt="" className="h-6 w-6 rounded-full border-2 border-surface bg-background" />
                  ))}
                  {extraMembers > 0 && (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-surface bg-textPrimary px-1 text-tiny text-textWhite">+{extraMembers}</span>
                  )}
                </div>
                <span className="ml-2 text-caption text-textSecondary">참석 멤버 {m.memberCount}/{m.maxMembers}</span>
              </div>
              <iframe title={`${m.location} 지도`} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                className="mt-3 h-[140px] w-full rounded-card border-0 bg-background" />
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={handleShare}
                  className="h-12 flex-1 rounded-card border border-borderDefault text-body text-textPrimary">공유하기</button>
                <button type="button" onClick={handleTrial} disabled={trialApplied}
                  className={cn('h-12 flex-1 rounded-card border text-body',
                    trialApplied ? 'border-borderDefault text-textHint' : 'border-orange text-orange')}>1회 체험하기</button>
              </div>
            </section>
            <Divider />

            {/* 기본정보 */}
            <section className="px-5 py-5">
              <h2 className="text-h3 text-textPrimary">기본정보</h2>
              {m.sport && (
                <span className="mt-2 inline-block rounded-full bg-orangeTint px-2.5 py-0.5 text-caption text-orange">{m.sport}</span>
              )}
              <div className="mt-2">
                <InfoRow icon={<Clock size={16} />} label="정기 모임시간" value={m.meetingTime ?? '일정 미정'} />
                <InfoRow icon={<Users size={16} />} label="회원수" value={`${m.memberCount}/${m.maxMembers}`} />
                <InfoRow icon={<MapPin size={16} />} label="장소" value={m.location} />
              </div>
            </section>
            <Divider />

            {/* 설명 + 필독 + 안내사항 */}
            <section className="flex flex-col gap-4 px-5 py-5">
              {m.description && <p className="whitespace-pre-line text-label text-textPrimary">{m.description}</p>}
              <div className="rounded-card bg-noticeBg p-4">
                <p className="text-caption-strong text-textPrimary">📢 필독: 모임 유의사항이에요</p>
                <p className="mt-1 text-micro text-textSecondary">
                  체험 참가는 1인 1회만 가능하며, 참가비 5,000원 현장 납부 바랍니다. 참가 확정 후 무단 불참시 이후 참여가 제한될 수 있어요.
                </p>
              </div>
              <div>
                <p className="text-label-strong text-textPrimary">안내사항</p>
                <p className="mt-1 text-micro text-textSecondary">
                  핏플은 모두가 건강한 스포츠 활동을 즐기기 위한 플랫폼이에요. 서로를 존중하고, 즐거운 활동 분위기를 만들어 주세요!
                </p>
              </div>
            </section>
          </div>
        )}

        {/* ── 공지 탭 — item_notice_card ─────────────────── */}
        {activeTab === '공지' && (
          <ul className="flex flex-col px-5">
            {NOTICES.map((n) => (
              <li key={n.title} className="border-b border-borderDefault py-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-noticeBg px-2.5 py-1 text-micro-strong text-noticeRed">
                  <Megaphone size={14} /> 공지
                </span>
                <div className="mt-2 flex gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-h3 text-textPrimary">{n.title}</p>
                    <p className="mt-1 line-clamp-1 text-label text-textSecondary">{n.preview}</p>
                  </div>
                  {n.thumb && (
                    <img src={meetingImg('img_meeting_hiking_group1')} alt="" className="h-[72px] w-[72px] flex-shrink-0 rounded-lg object-cover" />
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-caption text-textHint">
                  <span>{n.date} · 조회 {n.views}</span>
                  <span className="flex items-center gap-1"><MessageSquareMore size={16} />{n.comments}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* ── 채팅 탭 ─────────────────────────────────────── */}
        {activeTab === '채팅' && (
          <div className="flex flex-1 flex-col">
            {/* 안내 배너 — Android layoutNoticeBanner, "접기 ∧" 탭 시 이 탭에서 숨김 */}
            {bannerOpen && (
              <div className="bg-background px-5 py-3 text-micro text-textSecondary shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
                <p className="text-caption-strong text-textPrimary">🏃 {m.groupName || m.title} 채팅방입니다 🏃</p>
                <p className="mt-1 whitespace-pre-line">{'러닝 일정 공유와 자유로운 소통을 위한 공간이에요.\n서로 존중하며 즐겁게 달려요 😊'}</p>
                <p className="mt-2">✓ 러닝 일정·후기 공유 환영</p>
                <p>✓ 처음 오신 분은 간단한 인사 부탁드려요</p>
                <div className="flex items-end justify-between">
                  <p className="text-noticeRed">✗ 홍보·영리 목적·불쾌한 발언은 삼가주세요</p>
                  <button type="button" onClick={() => setBannerOpen(false)}
                    className="flex flex-shrink-0 items-center gap-0.5 text-micro text-textSecondary">
                    접기 <ChevronUp size={14} />
                  </button>
                </div>
              </div>
            )}
            <div className="flex flex-1 flex-col px-4 py-3 pb-[88px]">
              <ChatMessageList messages={messages} />
              <div ref={chatEndRef} />
            </div>
            {/* 입력 바 — Android etMessage(hint "작성") + btnSend("전송") */}
            <div className="fixed bottom-0 left-1/2 flex w-full max-w-mobile -translate-x-1/2 items-center gap-3 border-t border-borderDefault bg-surface px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend(); }}
                placeholder="작성"
                aria-label="메시지 입력"
                className="h-10 flex-1 bg-transparent text-label text-textPrimary outline-none placeholder:text-textHint"
              />
              <button type="button" onClick={handleSend} className="text-label-strong text-orange">전송</button>
            </div>
          </div>
        )}

        {/* ── 사진첩 — setupPhotoGrid: 3열, item_photo_grid 110dp, centerCrop ── */}
        {activeTab === '사진첩' && (
          <div className="grid grid-cols-3 gap-0.5 bg-surface px-px">
            {PHOTOS.map((key, i) => (
              <img key={i} src={meetingImg(key)} alt="모임 사진" className="h-[110px] w-full object-cover" />
            ))}
          </div>
        )}

        {/* ── 멤버 — setupMemberList + item_member_row ── */}
        {activeTab === '멤버' && (
          <ul className="bg-surface">
            {MEMBERS.map((mb) => (
              <li key={mb.name} className="flex items-center px-5 py-3">
                <img src={profileDefault} alt="" className="h-12 w-12 flex-shrink-0 rounded-full bg-background object-cover" />
                <span className="ml-3 min-w-0 flex-1 truncate text-label text-textPrimary">{mb.name}</span>
                {mb.role && (
                  <span className="rounded-full border-[1.5px] border-orange bg-orangeTint px-2 py-0.5 text-mini text-orange">
                    {mb.role}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── 하단 고정 [문의하기][가입하기] — 홈 탭 ── */}
      {activeTab === '홈' && (
        <div className="fixed bottom-0 left-1/2 flex w-full max-w-mobile -translate-x-1/2 gap-2 border-t border-borderDefault bg-surface px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <button type="button" onClick={handleInquiry}
            className="h-[52px] w-[30%] rounded-card border border-borderDefault text-body text-textPrimary">문의하기</button>
          <button type="button" onClick={handleJoin} disabled={joined}
            className={cn('h-[52px] flex-1 rounded-card text-h3 text-textWhite', joined ? 'bg-textHint' : 'bg-orange')}>
            {joined ? '가입 완료' : '가입하기'}
          </button>
        </div>
      )}
    </div>
  );
}
