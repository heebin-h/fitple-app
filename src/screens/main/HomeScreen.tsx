/**
 * 홈 — `/home`. 회원이면 MemberHome(Android HomeFragment), 게스트면 GuestHome(Android GuestHomeFragment).
 * 레이아웃: fragment_home.xml · fragment_guest_home.xml + designs/home_main_postdetail_share_chat.png("홈 -가입 x"),
 *           home_bottom_banner_schedule.png. 공용 섹션은 components/home/HomeSections.tsx.
 *
 * 섹션 순서 (XML 그대로):
 *   회원  : 상단바 → 검색 → Hero → 종목 → 추천 모임 → 활동 중인 모임 → 체험 → CTA 배너 → 후기 → 정기모임 → FAB
 *   게스트: 상단바 → 검색 → Hero → 종목 → 추천 모임 →                  체험 → CTA 배너 → 후기 → 정기모임 → FAB
 * 상단(상단바~Hero)은 PNG처럼 옅은 회색 배경, 종목 행부터 위쪽 모서리가 둥근 흰 패널.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useCreatedMeetingsStore } from '../../store/createdMeetingsStore';
import { MeetingCard } from '../../components/meeting/MeetingCard';
import { TrialCard } from '../../components/meeting/TrialCard';
import { ReviewCard } from '../../components/meeting/ReviewCard';
import {
  HomeTopBar, HomeHero, SportIconRow, SectionDivider, SectionHeader,
  RecommendedFilterRow, HScroll, CtaBanner, UpcomingSection,
} from '../../components/home/HomeSections';
import {
  TRIAL_MEETING_IDS, HOME_RECOMMENDED_IDS, GUEST_RECOMMENDED_IDS, ACTIVE_MEETING_IDS,
} from '../../data/seedData';
import type { Meeting, Review, ScheduleItem } from '../../data/models';

// ── localStorage helpers ────────────────────────────────────────────────────
function readLS<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]; }
  catch (e) { console.error(`[HomeScreen] ${key} parse failed:`, e); return []; }
}

function pick(all: Meeting[], ids: readonly string[]): Meeting[] {
  return ids.map((id) => all.find((m) => m.id === id)).filter((m): m is Meeting => m !== undefined);
}

function todayMD(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function useHomeData() {
  const meetings  = useMemo(() => readLS<Meeting>('meetings'), []);
  const reviews   = useMemo(() => readLS<Review>('reviews'), []);
  const schedules = useMemo(() => readLS<ScheduleItem>('schedules'), []);
  const trials    = useMemo(() => pick(meetings, TRIAL_MEETING_IDS), [meetings]);
  return { meetings, reviews, schedules, trials };
}

function Fab({ onClick }: { onClick: () => void }) {
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-10 h-14 w-full max-w-mobile -translate-x-1/2">
      <button type="button" onClick={onClick} aria-label="모임 만들기"
        className="pointer-events-auto absolute right-4 top-0 flex h-14 w-14 items-center justify-center rounded-full bg-orange shadow-lg">
        <Plus size={24} className="text-textWhite" />
      </button>
    </div>
  );
}

const locationToast = () => toast('위치 변경 기능을 준비 중이에요');

// ── 회원 홈 — Android HomeFragment ──────────────────────────────────────────
function MemberHome() {
  const navigate = useNavigate();
  const nickname = useAuthStore((s) => s.currentUser?.nickname ?? '');
  const created = useCreatedMeetingsStore((s) => s.meetings);
  const { meetings, reviews, schedules, trials } = useHomeData();

  const recommended = useMemo(() => pick(meetings, HOME_RECOMMENDED_IDS), [meetings]);
  // setupActiveMeetings: UserCreatedMeetings + activeMeetings (필터 없음)
  const active = useMemo(() => [...created, ...pick(meetings, ACTIVE_MEETING_IDS)], [created, meetings]);

  // setupHero: 오늘 일정 → 내일 일정 → 없음
  const greeting = nickname.trim() ? `안녕하세요 ${nickname}님!` : '안녕하세요!';
  const todayItem    = schedules.find((s) => s.date === todayMD(0));
  const tomorrowItem = schedules.find((s) => s.date === todayMD(1));
  const hero = todayItem
    ? { title: `${greeting}\n오늘 ${todayItem.time} · ${todayItem.title}이 있어요`, cta: '일정 바로가기 →', to: '/upcoming' }
    : tomorrowItem
      ? { title: `${greeting}\n다음 ${tomorrowItem.sport}은 내일 ${tomorrowItem.time}이에요 🏃`, cta: '일정 바로가기 →', to: '/upcoming' }
      : { title: `${greeting}\n아직 가입한 모임이 없어요`, cta: '가입하러 가기 →', to: '/explore' };

  const toDetail = (m: Meeting) => navigate(`/meeting/${m.id}`);

  return (
    <div className="relative flex flex-col bg-background/50 pt-safe">
      <HomeTopBar onLocation={locationToast} onBell={() => navigate('/notifications')} onSearch={() => navigate('/search')} />
      <HomeHero title={hero.title} cta={hero.cta} onCta={() => navigate(hero.to)} />

      <div className="rounded-t-[16px] bg-surface">
        <SportIconRow onSport={(s) => navigate(`/explore/${encodeURIComponent(s)}`)} />

        <div className="px-5 pt-3">
          <SectionHeader title="추천 모임" onMore={() => navigate('/explore')} />
          <RecommendedFilterRow />
          {recommended.map((m) => (
            <MeetingCard key={m.id} meeting={m} variant="recommended" onClick={() => toDetail(m)} />
          ))}
        </div>
        <SectionDivider />

        <div className="px-5 pt-5">
          <SectionHeader title="활동 중인 모임" onMore={() => navigate('/exercise')} />
          {active.map((m) => <MeetingCard key={m.id} meeting={m} onClick={() => toDetail(m)} />)}
        </div>
        <SectionDivider />

        <div className="pt-5">
          <SectionHeader title="체험 가능 모임" onMore={() => navigate('/trials')} className="px-5" />
          <HScroll>
            {trials.map((m) => <TrialCard key={m.id} meeting={m} onApply={() => toDetail(m)} onClick={() => toDetail(m)} />)}
          </HScroll>
        </div>
        <SectionDivider />

        <CtaBanner title="나에게 딱맞는 모임이 없어 아쉬우신가요?" sub="직접 모임장이 되어 모임을 운영해보세요!"
          button="모임 만들기 →" onClick={() => navigate('/create-meeting')} />
        <SectionDivider />

        <div className="pt-5">
          <SectionHeader title="후기" onMore={() => navigate('/reviews')} className="px-5" />
          <HScroll>{reviews.map((r) => <ReviewCard key={r.id} review={r} />)}</HScroll>
        </div>
        <SectionDivider />

        <UpcomingSection schedules={schedules} onMore={() => navigate('/upcoming')} showMonth />
      </div>

      <Fab onClick={() => navigate('/create-meeting')} />
    </div>
  );
}

// ── 게스트 홈 — Android GuestHomeFragment ───────────────────────────────────
function GuestHome() {
  const navigate = useNavigate();
  const { meetings, reviews, schedules, trials } = useHomeData();
  const recommended = useMemo(() => pick(meetings, GUEST_RECOMMENDED_IDS), [meetings]);

  // showLoginRequired(featureName): 토스트 + 로그인 화면 push (뒤로 = 게스트 홈 복귀)
  const loginRequired = (feature: string) => () => {
    toast(`로그인 후 ${feature} 기능을 사용할 수 있어요`);
    navigate('/login');
  };

  return (
    <div className="relative flex flex-col bg-background/50 pt-safe">
      <HomeTopBar onLocation={locationToast} onBell={loginRequired('알림')} onSearch={() => navigate('/search')} />
      <HomeHero title="로그인하고 다양한 모임에 참여해요!" cta="로그인하기 →" onCta={() => navigate('/login')} />

      <div className="rounded-t-[16px] bg-surface">
        <SportIconRow onSport={(s) => navigate(`/explore/${encodeURIComponent(s)}`)} />

        <div className="px-5 pt-3">
          <SectionHeader title="추천 모임" onMore={() => navigate('/explore')} />
          <RecommendedFilterRow />
          {recommended.map((m) => (
            <MeetingCard key={m.id} meeting={m} variant="recommended"
              onClick={loginRequired('모임 상세 보기')} onGuestHeart={loginRequired('찜하기')} />
          ))}
        </div>
        <SectionDivider />

        <div className="pt-5">
          <SectionHeader title="체험 가능 모임" onMore={() => navigate('/trials')} className="px-5" />
          <HScroll>
            {trials.map((m) => (
              <TrialCard key={m.id} meeting={m} onApply={loginRequired('체험 신청')} onClick={loginRequired('모임 상세 보기')} />
            ))}
          </HScroll>
        </div>
        <SectionDivider />

        <CtaBanner title={'나에게 맞는 모임을\n찾아드릴까요?'} button="모임 찾아주기 →" onClick={loginRequired('맞춤 모임 추천')} />
        <SectionDivider />

        <div className="pt-5">
          <SectionHeader title="후기" onMore={() => navigate('/reviews')} className="px-5" />
          <HScroll>{reviews.map((r) => <ReviewCard key={r.id} review={r} />)}</HScroll>
        </div>
        <SectionDivider />

        <UpcomingSection schedules={schedules} onMore={() => navigate('/upcoming')} showMonth={false} />
      </div>

      <Fab onClick={loginRequired('모임 만들기')} />
    </div>
  );
}

export function HomeScreen() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const currentUser = useAuthStore((s) => s.currentUser);
  return isGuest || !currentUser ? <GuestHome /> : <MemberHome />;
}
