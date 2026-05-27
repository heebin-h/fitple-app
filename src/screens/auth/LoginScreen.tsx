/**
 * 로그인 진입 화면 (Phase 1 placeholder). SPEC §12.2 / §11.5.
 *
 * Phase 1 범위:
 *   - 데모 빠른 로그인: demo@fitple.app / demo1234 (HANDOFF §5 데모 계정)
 *   - 게스트 진입: authStore.enterGuest() → /home (§11.5)
 *   - 소셜/이메일 버튼: Toast "준비 중인 기능이에요" (§12.2)
 *
 * 후속 Phase에서 hero 일러스트, 체험권 배지, EmailLoginScreen 연결, 가입 재개
 * 다이얼로그(§11.4)를 채운다. Korean 카피는 strings.xml 기준(룰 #5).
 */

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userManager } from '../../storage/userManager';
import { useAuthStore } from '../../store/authStore';

const DEMO_EMAIL = 'demo@fitple.app';
const DEMO_PASSWORD = 'demo1234';

export function LoginScreen() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const enterGuest = useAuthStore((s) => s.enterGuest);

  const handleDemoLogin = async () => {
    const ok = await userManager.loginUser(DEMO_EMAIL, DEMO_PASSWORD);
    if (!ok) {
      toast.error('데모 계정을 찾을 수 없어요');
      return;
    }
    userManager.setLoggedIn(DEMO_EMAIL);
    userManager.clearPendingSignup();
    const user = await userManager.getCurrentUser();
    setUser(user);
    navigate('/home', { replace: true });
  };

  const handleGuest = () => {
    enterGuest();
    navigate('/home');
  };

  const notReady = () => toast('준비 중인 기능이에요');

  return (
    <div className="flex min-h-screen flex-col px-5 pt-safe pb-safe">
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-display text-textPrimary">
          가장 편한 방법으로
          <br />
          <span className="text-orange">핏플</span>을 시작해보세요!
        </h1>
        <p className="mt-3 text-label text-textSecondary">
          회원가입하고 <span className="text-orange">1회 체험권</span> 받기!
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <button
          type="button"
          onClick={handleDemoLogin}
          className="h-[52px] rounded-card bg-orange text-body-strong text-textWhite"
        >
          데모 계정으로 로그인
        </button>

        <button
          type="button"
          onClick={notReady}
          className="h-[52px] rounded-card border border-borderDefault text-body-strong text-textPrimary"
        >
          카카오 · Apple · Google · 이메일로 시작하기
        </button>

        <div className="mt-2 flex items-center justify-center gap-6 text-caption text-textSecondary">
          <button type="button" onClick={notReady} className="underline">
            회원가입
          </button>
          <button type="button" onClick={handleGuest} className="underline">
            회원가입 없이 둘러보기
          </button>
        </div>
      </div>
    </div>
  );
}
