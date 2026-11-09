/**
 * 회원 홈(HomeScreen) · 게스트 홈(GuestHomeScreen) 공용 섹션.
 * 출처: Android `fragment_home.xml` · `fragment_guest_home.xml` · `HomeSectionBinders.kt`
 *       + designs/home_main_postdetail_share_chat.png("홈 -가입 x") · home_bottom_banner_schedule.png.
 * PNG와 XML이 다르면 PNG 우선(DESIGN_IMPLEMENTATION_GUIDE §0). 차이는 각 컴포넌트 주석에 기록.
 */

import type { ReactNode } from 'react';
import { Bell, ChevronDown, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { ScheduleItem } from '../../data/models';
import { meetingImg } from '../../utils/meetingImage';
import heroIllust from '../../assets/images/home/hero_illust.png';
import iconRunning from '../../assets/images/sports/sport_running.png';
import iconFutsal  from '../../assets/images/sports/sport_futsal.png';
import iconHiking  from '../../assets/images/sports/sport_hiking.png';
import iconCycling from '../../assets/images/sports/sport_cycling.png';
import iconGolf    from '../../assets/images/sports/sport_golf.png';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// ── 상단: 위치 + 알림 / 검색창 ───────────────────────────────────────────────
/**
 * PNG: 위치 "미사 1동 ▾" 13pt semibold(XML 18sp bold), bell outline 24(XML ic_bell_filled 28),
 *      검색창 44pt · radius 8 · 1pt orange 테두리 · 우측 회색 돋보기.
 * 위치 텍스트: Android LocationState.current 기본값 "미사 1동" (회원·게스트 공통).
 */
export function HomeTopBar({ onLocation, onBell, onSearch }: {
  onLocation: () => void; onBell: () => void; onSearch: () => void;
}) {
  return (
    <>
      <div className="flex h-12 items-center justify-between px-5">
        <button type="button" onClick={onLocation} className="flex items-center gap-0.5 text-caption-strong text-textPrimary">
          미사 1동
          <ChevronDown size={14} strokeWidth={3} />
        </button>
        <button type="button" onClick={onBell} aria-label="알림">
          <Bell size={24} className="text-textPrimary" />
        </button>
      </div>
      <div className="px-5 pb-3">
        <button type="button" onClick={onSearch}
          className="flex h-11 w-full items-center justify-between rounded-lg border border-orange bg-surface px-3.5">
          <span className="text-label text-textHint">찾고싶은 모임이 있나요?</span>
          <Search size={20} className="text-textHint" />
        </button>
      </div>
    </>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
/**
 * 날짜 "M월 D일(요일)" (setupHero / setupGuestHero 공통) + 제목(여러 줄) + 오렌지 CTA + 우측 일러스트.
 * PNG: 회원 홈도 일러스트 있음(XML 주석은 "일러스트 없음") → PNG 우선. 날짜 13pt textPrimary,
 *      제목 15pt bold, CTA 36pt · radius 6 · 13pt bold.
 */
export function HomeHero({ title, cta, onCta }: { title: string; cta: string; onCta: () => void }) {
  const now = new Date();
  const date = `${now.getMonth() + 1}월 ${now.getDate()}일(${DAY_NAMES[now.getDay()]})`;
  return (
    <div className="flex items-end justify-between px-5 pb-5 pt-3">
      <div className="min-w-0">
        <p className="text-caption text-textPrimary">{date}</p>
        <p className="mt-1.5 whitespace-pre-line text-body-strong text-textPrimary [word-break:keep-all]">{title}</p>
        <button type="button" onClick={onCta}
          className="mt-4 h-9 rounded-md bg-orange px-3 text-caption-strong text-textWhite">
          {cta}
        </button>
      </div>
      <img src={heroIllust} alt="" className="ml-2 h-[80px] w-auto flex-shrink-0 object-contain" />
    </div>
  );
}

// ── 종목 아이콘 행 ───────────────────────────────────────────────────────────
/**
 * XML: 52dp 박스 bg_sport_icon(colorBackground, radius 14) + 30dp 아이콘 + 11sp textSecondary.
 * PNG의 선택 강조(오렌지 테두리)는 Android 미구현("추후: selectedSports 강조") → 미적용.
 */
const SPORT_ICONS: readonly { name: string; icon: string }[] = [
  { name: '러닝', icon: iconRunning }, { name: '풋살', icon: iconFutsal }, { name: '등산', icon: iconHiking },
  { name: '사이클', icon: iconCycling }, { name: '골프', icon: iconGolf },
];

export function SportIconRow({ onSport }: { onSport: (sport: string) => void }) {
  return (
    <div className="flex px-5 pb-3 pt-5">
      {SPORT_ICONS.map(({ name, icon }) => (
        <button key={name} type="button" onClick={() => onSport(name)} className="flex flex-1 flex-col items-center">
          <span className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-background">
            <img src={icon} alt="" className="h-[30px] w-[30px] object-contain" />
          </span>
          <span className="mt-[5px] text-mini text-textSecondary">{name}</span>
        </button>
      ))}
    </div>
  );
}

// ── 섹션 공통 ────────────────────────────────────────────────────────────────
/** 섹션 구분 띠 — XML 8dp colorBackground, PNG 약 12pt → PNG 우선 */
export function SectionDivider() {
  return <div className="h-3 bg-background" />;
}

/** 섹션 헤더 — 17sp bold + "더보기 >" 13sp textHint (PNG: 회색 chevron 아이콘) */
export function SectionHeader({ title, onMore, className }: { title: string; onMore?: () => void; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between pb-3', className)}>
      <h2 className="text-h2 text-textPrimary">{title}</h2>
      {onMore && (
        <button type="button" onClick={onMore} className="flex items-center text-caption text-textHint">
          더보기 <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

/**
 * 추천 모임 필터 행 — [필터] + 칩 5개.
 * Android: XML 정적 칩, 클릭 리스너 없음 → 표시 전용(span). 칩 문구 XML 그대로.
 * PNG: 칩 = 흰 배경 + orange 테두리·글자(XML은 회색 테두리·textSecondary) → PNG 우선. 32dp → PNG 약 28pt.
 */
const FILTER_CHIPS = ['가까운 순', '편하게', '평일 오후', '주말', '초보 환영'];

export function RecommendedFilterRow() {
  return (
    <div className="flex items-center pb-1">
      <span className="flex h-7 flex-shrink-0 items-center gap-1 rounded-full border border-borderDefault px-2.5 text-micro text-textSecondary">
        <SlidersHorizontal size={12} /> 필터
      </span>
      <div className="ml-2 flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {FILTER_CHIPS.map((c) => (
          <span key={c} className="flex h-7 flex-shrink-0 items-center rounded-full border border-orange bg-surface px-2.5 text-caption text-orange">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 가로 스크롤 컨테이너 (체험 · 후기) */
export function HScroll({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 overflow-x-auto px-5 pb-1 [&::-webkit-scrollbar]:hidden">{children}</div>
  );
}

// ── CTA 배너 ─────────────────────────────────────────────────────────────────
/**
 * PNG: 밝은 회색 카드(radius 14) + 제목 16 bold / 부제 14 + 우하단 orangeTint 버튼(orange 14 bold, radius 10),
 *      일러스트 없음. XML은 다크 카드 + 흰 외곽선 버튼 + 일러스트 → PNG 우선.
 * 게스트 문구는 디자인 없음 → fragment_guest_home.xml 문구를 같은 스타일로.
 */
export function CtaBanner({ title, sub, button, onClick }: {
  title: string; sub?: string; button: string; onClick: () => void;
}) {
  return (
    <div className="mx-5 my-4 rounded-[14px] bg-background px-4 py-4">
      <p className="whitespace-pre-line text-h3 font-bold text-textPrimary">{title}</p>
      {sub && <p className="mt-0.5 text-label text-textPrimary">{sub}</p>}
      <div className="mt-3 flex justify-end">
        <button type="button" onClick={onClick}
          className="flex h-10 items-center gap-1 rounded-[10px] bg-orangeTint px-3 text-label-strong text-orange">
          {button}
        </button>
      </div>
    </div>
  );
}

// ── 다가오는 정기모임 ────────────────────────────────────────────────────────
/**
 * 월 라벨 "YYYY년 M월" + 날짜 스트립(오늘 ±3일, 오늘만 강조) + 일정 전체 목록.
 * Android: 날짜 셀 클릭 리스너 없음, populateSchedule는 날짜 필터 없이 전체 표시 → 동일.
 * PNG: 오늘 = 진한 라운드 사각(숫자+요일 감쌈, XML bg_date_selected), 숫자 16 semibold / 요일 12, 하단 얇은 구분선.
 */
export function DateStrip() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i - 3);
    return { key: i, num: d.getDate(), dow: DAY_NAMES[d.getDay()], today: i === 3 };
  });
  return (
    <div className="flex justify-between border-b border-borderDefault pb-3">
      {days.map((d) => (
        <div key={d.key}
          className={cn('flex w-11 flex-col items-center rounded-lg py-1.5',
            d.today ? 'bg-textPrimary text-textWhite' : 'text-textPrimary')}>
          <span className="text-h3">{d.num}</span>
          <span className={cn('text-micro', d.today ? 'font-bold text-textWhite' : 'text-textSecondary')}>{d.dow}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * 일정 카드 — item_schedule.xml + populateSchedule.
 * 문구: "Level·{level}", "한자리 남았어요!!"(isUrgent), "{위치} · 매주({요일}) {시간} · {n}명 참석중".
 * PNG: Level 배지 blueTint/blue pill, 종목 배지 orangeTint pill, 제목 16, 긴급 문구 14 textPrimary
 *      (XML 12 orange), 정보 줄 위치·일정 = blue / 인원 = textHint, 썸네일 96×96 radius 8(XML 72×60).
 * 탭 동작 없음 (Android 리스너 없음).
 */
export function ScheduleCard({ item }: { item: ScheduleItem }) {
  return (
    <div className="flex items-center py-3">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex gap-1.5">
          <span className="rounded-full bg-blueTint px-2 py-0.5 text-mini text-blue">Level·{item.level}</span>
          <span className="rounded-full bg-orangeTint px-2 py-0.5 text-mini-strong text-orange">{item.sport}</span>
        </div>
        <p className="truncate text-h3 text-textPrimary">{item.title}</p>
        {item.isUrgent && <p className="mt-0.5 text-label text-textPrimary">한자리 남았어요!!</p>}
        <p className="mt-0.5 truncate text-mini">
          <span className="text-blue">
            {item.location ? `${item.location} · ` : ''}매주({item.day}) {item.time}
          </span>
          {item.memberCount > 0 && <span className="text-textHint"> · {item.memberCount}명 참석중</span>}
        </p>
      </div>
      <img src={meetingImg(item.image)} alt=""
        className="ml-3 h-24 w-24 flex-shrink-0 rounded-lg bg-background object-cover" />
    </div>
  );
}

/** showMonth: 회원 홈만 월 라벨 표시 (게스트 XML은 tvScheduleMonth 제거됨) */
export function UpcomingSection({ schedules, onMore, showMonth }: {
  schedules: ScheduleItem[]; onMore: () => void; showMonth: boolean;
}) {
  const now = new Date();
  return (
    <div className="px-5 pb-6 pt-5">
      <SectionHeader title="다가오는 정기모임" onMore={onMore} />
      {showMonth && (
        <p className="pb-3 text-center text-caption-strong text-textPrimary">
          {now.getFullYear()}년 {now.getMonth() + 1}월
        </p>
      )}
      <DateStrip />
      <div className="mt-1">
        {schedules.map((s) => <ScheduleCard key={s.id} item={s} />)}
      </div>
    </div>
  );
}
