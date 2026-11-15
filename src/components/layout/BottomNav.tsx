/**
 * 하단 4탭 플로팅 내비게이션. SPEC §10.1 / §11.5.
 * Android `activity_fitple_main.xml` bottomNavigation + `menu/bottom_nav_menu.xml` + 디자인 PNG.
 *
 *   홈(/home) · 체험(/exercise) · 채팅(/chat) · MY(/my)
 *   - 라벨: strings.xml nav_home / nav_exercise("체험") / nav_chat / nav_my
 *   - 형태: 좌우·하단 16dp 여백, radius 20dp, elevation 8dp (bg_bottom_nav) — 화면에 떠 있는 카드
 *   - 아이콘: ic_nav_*.xml 벡터 그대로 (itemIconTint=@null → 원본 색 유지: 검정 + 주황 포인트)
 *   - 활성 표시: 라벨 굵게·textPrimary / 비활성 textSecondary + 아이콘 흐리게
 *
 * 채팅·MY — 비로그인(게스트)은 Android 문구 "로그인 후 이용할 수 있어요" 토스트 + 탭 선택 거부
 * (FitpleMainActivity nav_chat / nav_my).
 */

import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';

const INK = '#1A1A1A';
const ORANGE = '#FF5722';

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path fill={INK} d="M12,2 L2,10 L2,22 L22,22 L22,10 Z" />
      <path fill={ORANGE} d="M13,8 L9,14.5 L12.5,14.5 L11,19 L16,12.5 L12.5,12.5 Z" />
    </svg>
  );
}

function TrialIcon() {
  return (
    <svg width="28" height="24" viewBox="0 0 28 24" fill="none" aria-hidden="true">
      <path stroke={INK} strokeWidth="2"
        d="M5,2 L23,2 Q26,2 26,5 L26,9.5 Q23.5,9.5 23.5,12 Q23.5,14.5 26,14.5 L26,19 Q26,22 23,22 L5,22 Q2,22 2,19 L2,14.5 Q4.5,14.5 4.5,12 Q4.5,9.5 2,9.5 L2,5 Q2,2 5,2 Z" />
      <path stroke={INK} strokeWidth="1.5" d="M16,3 L16,21" />
      <path fill={ORANGE} d="M21.5,7 L20.5,8 L20.5,17 L22,17 L22,8 L21.5,8 Z" />
      <path fill={ORANGE} d="M20,17 L23,17 L23,18 L20,18 Z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path stroke={INK} strokeWidth="2" strokeLinejoin="round"
        d="M3,3 L21,3 Q22,3 22,4 L22,16 Q22,17 21,17 L8,17 L3,21 L3,17 Q2,17 2,16 L2,4 Q2,3 3,3 Z" />
      <circle cx="8" cy="10" r="1.5" fill={ORANGE} />
      <circle cx="12" cy="10" r="1.5" fill={ORANGE} />
      <circle cx="16" cy="10" r="1.5" fill={ORANGE} />
    </svg>
  );
}

function MyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke={INK} strokeWidth="2" />
      <circle cx="12" cy="9" r="3" fill={INK} />
      <path stroke={INK} strokeWidth="2" strokeLinecap="round" d="M6,20 Q6,14.5 12,14.5 Q18,14.5 18,20" />
      <path stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17.5,4 L19.5,6 L23,2" />
    </svg>
  );
}

const ITEM = 'flex flex-1 flex-col items-center justify-center gap-1';

function TabBody({ icon, label, active }: { icon: ReactNode; label: string; active: boolean }) {
  return (
    <>
      <span className={cn('flex h-6 items-center', !active && 'opacity-40')}>{icon}</span>
      <span className={cn('text-mini', active ? 'font-bold text-textPrimary' : 'text-textSecondary')}>{label}</span>
    </>
  );
}

function Tab({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink to={to} className={ITEM}>
      {({ isActive }) => <TabBody icon={icon} label={label} active={isActive} />}
    </NavLink>
  );
}

/** 게스트용: 탭 선택 거부 + 토스트 (Android setOnItemSelectedListener → false) */
function LockedTab({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button type="button" onClick={() => toast('로그인 후 이용할 수 있어요')} className={ITEM}>
      <TabBody icon={icon} label={label} active={false} />
    </button>
  );
}

export function BottomNav() {
  const isGuest     = useAuthStore((s) => s.isGuest);
  const currentUser = useAuthStore((s) => s.currentUser);
  const member = !isGuest && currentUser !== null;

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-mobile -translate-x-1/2 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pointer-events-none">
      <div className="pointer-events-auto flex h-16 items-stretch rounded-[20px] bg-surface shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
        <Tab to="/home" icon={<HomeIcon />} label="홈" />
        <Tab to="/exercise" icon={<TrialIcon />} label="체험" />
        {member
          ? <Tab to="/chat" icon={<ChatIcon />} label="채팅" />
          : <LockedTab icon={<ChatIcon />} label="채팅" />}
        {member
          ? <Tab to="/my" icon={<MyIcon />} label="MY" />
          : <LockedTab icon={<MyIcon />} label="MY" />}
      </div>
    </nav>
  );
}
