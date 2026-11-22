/**
 * 로그인 가드. SPEC §10.1 / §11.
 *
 * 로그인 사용자(currentUser)와 게스트(isGuest) 모두 통과. 둘 다 아니면 /login으로
 * replace 리다이렉트하고 Toast로 안내한다.
 *
 * 세션 복원: authStore는 런타임 메모리라 `/home` 등에서 새로고침하면 비어 있다.
 * localStorage `current_user`가 남아 있으면(= 로그아웃 안 함) 프로필을 다시 읽어
 * setUser 후 통과시킨다 — Splash('/')를 거치지 않은 진입에서도 로그인 유지.
 * 게스트 세션은 영속하지 않는다(Android도 재시작 시 게스트 해제).
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { userManager } from '../storage/userManager';

export function RequireAuth({ children }: { children: ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const isGuest = useAuthStore((s) => s.isGuest);
  const setUser = useAuthStore((s) => s.setUser);
  const location = useLocation();
  const allowed = currentUser !== null || isGuest;

  // 저장된 세션이 있으면 복원 시도 — 끝날 때까지 리다이렉트 보류
  const [restoring, setRestoring] = useState(() => !allowed && userManager.isLoggedIn());

  useEffect(() => {
    if (!restoring) return;
    let cancelled = false;
    userManager.getCurrentUser()
      .then((user) => { if (!cancelled && user) setUser(user); })
      .catch((e) => console.error('[RequireAuth] 세션 복원 실패:', e))
      .finally(() => { if (!cancelled) setRestoring(false); });
    return () => { cancelled = true; };
  }, [restoring, setUser]);

  useEffect(() => {
    if (!allowed && !restoring) toast('로그인이 필요해요');
  }, [allowed, restoring]);

  if (restoring) return null;
  if (!allowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
