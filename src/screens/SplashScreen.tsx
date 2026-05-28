/**
 * 스플래시 + 부트 분기. SPEC §11.1 / §12.1.
 *
 * 부트 시퀀스(이 화면이 단독 소유 — App.tsx와 중복 호출 금지하여 첫 실행 시드 레이스 방지):
 *   1. seedIfFirstRun() (idempotent — `seeded` 플래그)
 *   2. 최소 노출 지연 800ms (시드 시간보다 살짝 길게 — Android 1.5s/4.6s는 dev에서 멈춘 듯 보여 단축)
 *   3. getCurrentUser() → 있으면 setUser + /home, 없으면 /login
 *
 * 시드 실패 시 콘솔 로그 후 /login으로 폴백(§12.1 edge case).
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { seedIfFirstRun } from '../storage/seedRunner';
import { userManager } from '../storage/userManager';
import { useAuthStore } from '../store/authStore';

const minDelay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function SplashScreen() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await Promise.all([seedIfFirstRun(), minDelay(800)]);
        if (cancelled) return;

        const user = await userManager.getCurrentUser();
        if (cancelled) return;

        if (user) {
          setUser(user);
          navigate('/home', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('[Splash] 부트 시퀀스 실패:', err);
        if (!cancelled) navigate('/login', { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, setUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface">
      <h1 className="text-display text-orange">FitPle</h1>
      <Zap size={40} className="mt-3 text-orange" fill="currentColor" />
    </div>
  );
}
