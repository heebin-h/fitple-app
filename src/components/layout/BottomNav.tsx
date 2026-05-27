/**
 * 하단 5탭 내비게이션. SPEC §10.1 / §11.5.
 *
 *   홈(/home) · 운동(/exercise) · 탐색(/explore) — 실제 라우트
 *   채팅 · MY — Phase 1에선 라우트 미구현 → Toast 안내
 *
 * 게스트 세션에서는 채팅/MY가 "로그인이 필요한 기능이에요"를 띄운다(§11.5).
 * 회원 세션에서는 "준비 중이에요"(Phase 1 placeholder).
 *
 * MobileFrame 내부 `relative` 컨테이너 기준 `absolute` 하단 고정.
 * 노치 단말 대응으로 `pb-safe`(env(safe-area-inset-bottom)) 적용.
 */

import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Compass, MessageCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

const ITEM = 'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5';

function tabClass({ isActive }: { isActive: boolean }) {
  return cn(ITEM, isActive ? 'text-orange' : 'text-textHint');
}

export function BottomNav() {
  const isGuest = useAuthStore((s) => s.isGuest);

  const lockedTap = () =>
    toast(isGuest ? '로그인이 필요한 기능이에요' : '준비 중이에요');

  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 flex h-14 items-stretch border-t border-borderDefault bg-surface pb-safe">
      <NavLink to="/home" className={tabClass}>
        <Home size={22} />
        <span className="text-mini">홈</span>
      </NavLink>
      <NavLink to="/exercise" className={tabClass}>
        <Dumbbell size={22} />
        <span className="text-mini">운동</span>
      </NavLink>
      <NavLink to="/explore" className={tabClass}>
        <Compass size={22} />
        <span className="text-mini">탐색</span>
      </NavLink>
      <button type="button" onClick={lockedTap} className={cn(ITEM, 'text-textHint')}>
        <MessageCircle size={22} />
        <span className="text-mini">채팅</span>
      </button>
      <button type="button" onClick={lockedTap} className={cn(ITEM, 'text-textHint')}>
        <User size={22} />
        <span className="text-mini">MY</span>
      </button>
    </nav>
  );
}
