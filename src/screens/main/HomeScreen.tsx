/**
 * 홈 화면 — P4 풀 구현. SPEC §12.10 / §12.11.
 *
 * 섹션 순서:
 *   Top bar → Hero → SportRow → 활동중인 모임 → 체험 가능 모임 → 후기 → 다가오는 정기모임 → CTA 배너 → FAB
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, MapPin, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { MeetingCard } from '../../components/meeting/MeetingCard';
import { meetingImg } from '../../utils/meetingImage';
import { cn } from '../../utils/cn';
import type { Meeting, Review, ScheduleItem } from '../../data/models';

import iconRunning  from '../../assets/images/sports/sport_running.png';
import iconFutsal   from '../../assets/images/sports/sport_futsal.png';
import iconHiking   from '../../assets/images/sports/sport_hiking.png';
import iconCycling  from '../../assets/images/sports/sport_cycling.png';
import iconGolf     from '../../assets/images/sports/sport_golf.png';

const SPORT_ICONS: Record<string, string> = {
  러닝: iconRunning, 풋살: iconFutsal, 등산: iconHiking, 사이클: iconCycling, 골프: iconGolf,
};
const SPORT_NAMES = ['러닝', '풋살', '등산', '사이클', '골프'];

// ── localStorage helpers ────────────────────────────────────────────────────
function readLS<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]; }
  catch { return []; }
}

function todayStr()    { return new Date().toISOString().slice(0, 10); }
function tomorrowStr() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); }

// ── 필터 칩 ────────────────────────────────────────────────────────────────
const CHIPS = ['가까운순', '편하게', '평일오후', '주말'] as const;
type Chip = typeof CHIPS[number];

function applyChips(meetings: Meeting[], active: Set<Chip>): Meeting[] {
  return meetings.filter((m) => {
    if (active.has('편하게')  && m.level !== '보통') return false;
    if (active.has('평일오후') && m.meetingTime && !/[월화수목금]/.test(m.meetingTime)) return false;
    if (active.has('주말')    && m.meetingTime && !/[토일]|주말/.test(m.meetingTime)) return false;
    return true;
  });
}

// ── DateStrip 로컬 컴포넌트 ─────────────────────────────────────────────────
function DateStrip({
  schedules, selected, onSelect,
}: { schedules: ScheduleItem[]; selected: string; onSelect: (d: string) => void }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (i - 3)); // 오늘 중앙: -3, -2, -1, 0, +1, +2, +3
    const date = d.toISOString().slice(0, 10);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return { date, label: dayNames[d.getDay()], num: d.getDate() };
  });
  const hasSched = (date: string) => schedules.some((s) => s.date === date);

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
      {days.map(({ date, label, num }) => {
        const isToday  = date === todayStr();
        const isSel    = date === selected;
        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelect(date)}
            className={cn(
              'flex flex-shrink-0 flex-col items-center gap-0.5 rounded-[8px] px-3 py-2',
              isSel ? 'bg-orange text-textWhite' : 'bg-transparent text-textPrimary',
            )}
          >
            <span className={cn('text-micro', isSel ? 'text-textWhite' : isToday ? 'text-orange' : 'text-textHint')}>
              {isToday ? '오늘' : label}
            </span>
            <span className="text-body-strong">{num}</span>
            {hasSched(date) && (
              <span className={cn('h-1 w-1 rounded-full', isSel ? 'bg-textWhite' : 'bg-orange')} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────────────────
export function HomeScreen() {
  const navigate  = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isGuest   = useAuthStore((s) => s.isGuest);

  const meetings  = useMemo(() => readLS<Meeting>('meetings'), []);
  const reviews   = useMemo(() => readLS<Review>('reviews'), []);
  const schedules = useMemo(() => readLS<ScheduleItem>('schedules'), []);

  const [activeChips, setActiveChips] = useState<Set<Chip>>(new Set());
  const [selDate, setSelDate]         = useState(todayStr());

  // ── Hero 로직 (SPEC §12.10) ───────────────────────────────────────────
  const heroInfo = useMemo(() => {
    if (isGuest || !currentUser) return null;
    const todaySched    = schedules.find((s) => s.date === todayStr());
    const tomorrowSched = schedules.find((s) => s.date === tomorrowStr());
    if (todaySched)    return { type: 'today'    as const, sched: todaySched    };
    if (tomorrowSched) return { type: 'tomorrow' as const, sched: tomorrowSched };
    return { type: 'none' as const, sched: null };
  }, [schedules, isGuest, currentUser]);

  function heroContent() {
    if (isGuest || !currentUser) {
      return { title: '모임을 둘러보는 중이에요!', sub: '로그인하고 더 많은 기능을 사용해보세요', cta: '로그인하고 참여하기 →', ctaFn: () => navigate('/login') };
    }
    const nick = currentUser.nickname;
    if (heroInfo?.type === 'today') {
      const s = heroInfo.sched!;
      return { title: `안녕하세요 ${nick}님!`, sub: `오늘 ${s.time} · ${s.title}이 있어요`, cta: '일정 바로가기 →', ctaFn: () => navigate('/upcoming') };
    }
    if (heroInfo?.type === 'tomorrow') {
      const s = heroInfo.sched!;
      return { title: `안녕하세요 ${nick}님!`, sub: `다음 ${s.sport}은 내일 ${s.time}이에요 🏃`, cta: '일정 바로가기 →', ctaFn: () => navigate('/upcoming') };
    }
    return { title: `안녕하세요 ${nick}님!`, sub: '아직 가입한 모임이 없어요', cta: '가입하러 가기 →', ctaFn: () => navigate('/exercise') };
  }

  const hero = heroContent();

  // ── 활동 중인 모임 필터 ───────────────────────────────────────────────
  const toggleChip = (chip: Chip) => {
    if (chip === '가까운순') return; // 정렬만, 필터 없음
    setActiveChips((prev) => {
      const next = new Set(prev);
      next.has(chip) ? next.delete(chip) : next.add(chip);
      return next;
    });
  };
  const filteredMeetings = useMemo(() => applyChips(meetings, activeChips).slice(0, 5), [meetings, activeChips]);

  // ── 날짜별 일정 ───────────────────────────────────────────────────────
  const daySchedules = useMemo(() => schedules.filter((s) => s.date === selDate), [schedules, selDate]);

  // ── 체험 가능 모임 (처음 4개) ─────────────────────────────────────────
  const trialMeetings = useMemo(() => meetings.slice(0, 4), [meetings]);

  return (
    <div className="relative flex flex-col overflow-y-auto pb-4 pt-safe">
      {/* ── 상단 바 ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 py-3">
        <button type="button" onClick={() => toast('위치 변경 기능을 준비 중이에요')}
          className="flex items-center gap-1 text-caption font-medium text-textPrimary">
          <MapPin size={14} className="text-orange" />
          미사 1동 ▾
        </button>
        <button type="button" onClick={() => toast('검색 기능을 준비 중이에요')}
          className="flex flex-1 items-center gap-2 rounded-[8px] bg-background px-3 py-2">
          <Search size={14} className="text-textHint" />
          <span className="text-caption text-textHint">찾고싶은 모임이 있나요?</span>
        </button>
        <button type="button" onClick={() => toast('알림 기능을 준비 중이에요')}>
          <Bell size={22} className="text-textPrimary" />
        </button>
      </div>

      {/* ── Hero 카드 ──────────────────────────────────────── */}
      <div className="mx-5 rounded-card bg-orangeTint px-4 py-4">
        <p className="text-h2 text-textPrimary">{hero.title}</p>
        <p className="mt-1 text-caption text-textSecondary">{hero.sub}</p>
        <button type="button" onClick={hero.ctaFn}
          className="mt-3 text-label-semibold text-orange">
          {hero.cta}
        </button>
      </div>

      {/* ── 종목 아이콘 행 ─────────────────────────────────── */}
      <div className="mt-4 flex justify-around px-5">
        {SPORT_NAMES.map((name) => (
          <button key={name} type="button"
            onClick={() => navigate(`/explore/${encodeURIComponent(name)}`)}
            className="flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orangeTint">
              <img src={SPORT_ICONS[name]} alt={name} className="h-7 w-7 object-contain" />
            </div>
            <span className="text-mini text-textSecondary">{name}</span>
          </button>
        ))}
      </div>

      {/* ── 활동 중인 모임 — 게스트 제외 (SPEC §12.11) ────── */}
      {!isGuest && <div className="mt-5 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-textPrimary">활동 중인 모임</h2>
          <button type="button" onClick={() => navigate('/exercise')}
            className="text-caption text-orange">더보기 ›</button>
        </div>

        {/* 필터 칩 */}
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {CHIPS.map((chip) => {
            const isActive = chip === '가까운순' ? true : activeChips.has(chip);
            return (
              <button key={chip} type="button" onClick={() => toggleChip(chip)}
                className={cn(
                  'flex-shrink-0 rounded-full border px-3 py-1 text-micro',
                  isActive ? 'border-orange bg-orange text-textWhite' : 'border-borderDefault text-textSecondary',
                )}>
                {chip}
              </button>
            );
          })}
        </div>

        {/* 모임 카드 */}
        <div className="mt-2 flex flex-col gap-2">
          {filteredMeetings.length === 0 ? (
            <p className="py-4 text-center text-caption text-textHint">조건에 맞는 모임이 없어요</p>
          ) : (
            filteredMeetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} onClick={() => navigate(`/meeting/${m.id}`)} />
            ))
          )}
        </div>
      </div>}

      {/* ── 체험 가능 모임 ─────────────────────────────────── */}
      <div className="mt-6">
        <h2 className="px-5 text-h3 text-textPrimary">체험 가능 모임</h2>
        <div className="mt-2 flex gap-3 overflow-x-auto px-5 pb-2 [&::-webkit-scrollbar]:hidden">
          {trialMeetings.map((m) => (
            <button key={m.id} type="button" onClick={() => navigate(`/meeting/${m.id}`)}
              className="relative h-[180px] w-[140px] flex-shrink-0 overflow-hidden rounded-card">
              <img src={meetingImg(m.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
              <div className="absolute inset-x-3 bottom-3">
                <p className="text-[11px] font-bold leading-tight text-textWhite">{m.title}</p>
                <p className="mt-0.5 text-[10px] text-textWhite/60">{m.location}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 후기 ───────────────────────────────────────────── */}
      <div className="mt-6">
        <h2 className="px-5 text-h3 text-textPrimary">후기</h2>
        <div className="mt-2 flex gap-3 overflow-x-auto px-5 pb-2 [&::-webkit-scrollbar]:hidden">
          {reviews.map((r) => (
            <div key={r.id}
              className="relative h-[160px] w-[140px] flex-shrink-0 overflow-hidden rounded-card">
              <img src={meetingImg(r.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/85" />
              <div className="absolute inset-x-3 bottom-3">
                <p className="text-[10px] font-bold text-textWhite">{r.nickname}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-textWhite/70 line-clamp-2">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 다가오는 정기모임 ──────────────────────────────── */}
      <div className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-textPrimary">다가오는 정기모임</h2>
          <button type="button" onClick={() => navigate('/upcoming')}
            className="text-caption text-orange">더보기 ›</button>
        </div>
        <div className="mt-2">
          <DateStrip schedules={schedules} selected={selDate} onSelect={setSelDate} />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {daySchedules.length === 0 ? (
            <p className="py-3 text-center text-caption text-textHint">이 날은 일정이 없어요</p>
          ) : (
            daySchedules.map((s) => (
              <button key={s.id} type="button"
                onClick={() => navigate('/upcoming')}
                className="flex items-center gap-3 rounded-card border border-borderDefault p-3">
                <img src={meetingImg(s.image)} alt="" className="h-12 w-12 flex-shrink-0 rounded-[8px] object-cover" />
                <div className="flex-1 text-left">
                  <p className="text-body-strong text-textPrimary">{s.title}</p>
                  <p className="mt-0.5 text-caption text-textSecondary">{s.time} · {s.location}</p>
                  <p className="mt-0.5 text-micro text-textHint">{s.sport} · {s.level} · 멤버 {s.memberCount}명</p>
                </div>
                {s.isUrgent && (
                  <span className="rounded-[4px] bg-error px-1.5 py-0.5 text-[10px] text-textWhite">마감임박</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── CTA 배너 ───────────────────────────────────────── */}
      <div className="mx-5 mt-6 rounded-card bg-background px-4 py-4">
        <p className="text-caption text-textSecondary">나에게 딱맞는 모임이 없어 아쉬우신가요?</p>
        <p className="mt-0.5 text-body-strong text-textPrimary">직접 모임장이 되어 모임을 운영해보세요!</p>
        <button type="button" onClick={() => toast('모임 만들기 기능 준비 중이에요')}
          className="mt-3 text-label-semibold text-orange">모임 만들기 →</button>
      </div>

      {/* ── FAB — MobileFrame 내 우하단 고정 ──────────────── */}
      <div className="pointer-events-none fixed bottom-20 left-1/2 z-10 h-14 w-full max-w-mobile -translate-x-1/2">
        <button type="button" onClick={() => toast('모임 만들기 기능 준비 중이에요')}
          className="pointer-events-auto absolute right-4 top-0 flex h-14 w-14 items-center justify-center rounded-full bg-orange shadow-lg">
          <Plus size={24} className="text-textWhite" />
        </button>
      </div>
    </div>
  );
}
