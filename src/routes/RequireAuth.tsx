/**
 * 로그인 가드. SPEC §10.1 / §11.
 *
 * Phase 1 범위: 로그인 사용자(currentUser)와 게스트(isGuest) 모두 통과시켜
 * 둘러보기 탭(home/exercise/explore)에 접근하게 한다. 둘 다 아니면 /login으로
 * replace 리다이렉트하고 Toast로 안내한다.
 *
 * 추후 Phase: 게스트를 거부해야 하는 회원 전용 동작(채팅 전송, 모임 생성, MY)은
 * 별도 가드 또는 호출부에서 isGuest를 추가로 검사한다(§11.5).
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export function RequireAuth({ children }: { children: ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const isGuest = useAuthStore((s) => s.isGuest);
  const location = useLocation();
  const allowed = currentUser !== null || isGuest;

  useEffect(() => {
    if (!allowed) toast('로그인이 필요해요');
  }, [allowed]);

  if (!allowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
