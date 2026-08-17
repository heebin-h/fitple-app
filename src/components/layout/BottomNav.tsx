/**
 * 하단 5탭 내비게이션. SPEC §10.1 / §11.5.
 *
 *   홈(/home) · 운동(/exercise) · 탐색(/explore) · MY(/my) — 실제 라우트
 *   채팅 — Phase 5에서 toast 유지
 *
 * 게스트는 MY 탭에서 "로그인이 필요해요" 토스트 (§11.5).
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, Compass, MessageCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';

const ITEM = 'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5';

function tabClass({ isActive }: { isActive: boolean }) {
  return cn(ITEM, isActive ? 'text-orange' : 'text-textHint');
}

export function BottomNav() {
  const navigate  = useNavigate();
  const isGuest   = useAuthStore((s) => s.isGuest);
  const currentUser = useAuthStore((s) => s.currentUser);

  function handleMy() {
    if (isGuest || !currentUser) {
      toast('로그인이 필요해요');
    } else {
      navigate('/my');
    }
  }

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-mobile -translate-x-1/2 flex-col border-t border-borderDefault bg-surface">
      <div className="flex h-14 items-stretch">
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
        <button
          type="button"
          onClick={() => toast('채팅 기능을 준비 중이에요')}
          className={cn(ITEM, 'text-textHint')}
        >
          <MessageCircle size={22} />
          <span className="text-mini">채팅</span>
        </button>
        <button
          type="button"
          onClick={handleMy}
          className={cn(ITEM, 'text-textHint')}
        >
          <User size={22} />
          <span className="text-mini">MY</span>
        </button>
      </div>
      {/* iOS 홈 인디케이터 safe area */}
      <div className="pb-safe" />
    </nav>
  );
}
