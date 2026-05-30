/**
 * 회원가입 Step 6 — 가입 완료. SPEC §12.9 / Android `SignupCompleteFragment.kt`.
 *
 * 중앙 체크 아이콘 + "가입이 완료 되었어요!" 타이틀 + 서브타이틀 + CTA "핏플 시작하기".
 * CTA → /home (replace). 이 화면 진입 시점에 이미 setLoggedIn 완료 (Preference 완료 단계).
 *
 * 뒤로가기 시 가입 흐름 스택 전체를 건너뛰고 홈으로 가는 게 자연스럽지만, React Router의
 * browser back을 막진 않는다 (history clean은 navigate replace로 누적 방지).
 *
 * SPEC §12.9의 "추천 모임 5개 carousel"은 Phase 4(홈 디자인 완성 후) 보강 예정.
 */

import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function SignupCompleteScreen() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);

  return (
    <div className="flex min-h-dvh flex-col bg-surface px-6 pt-safe pb-safe">
      <div className="flex flex-1 flex-col items-center justify-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-orange text-textWhite">
          <Check size={40} strokeWidth={3} />
        </span>
        <h1 className="mt-6 text-center text-display text-textPrimary">
          가입이 완료 되었어요!
        </h1>
        <p className="mt-2 text-center text-label text-textSecondary">
          이제 핏플과 함께 즐거운 운동을 시작해보세요
          {currentUser?.nickname && (
            <>
              <br />
              <span className="text-textPrimary">{currentUser.nickname}</span>님 환영합니다 👋
            </>
          )}
        </p>
      </div>

      <div className="pb-4">
        <button
          type="button"
          onClick={() => navigate('/home', { replace: true })}
          className="h-[52px] w-full rounded-card bg-orange text-body-strong text-textWhite"
        >
          핏플 시작하기
        </button>
      </div>
    </div>
  );
}
