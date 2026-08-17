/**
 * 회원가입 Step 2 — 비밀번호 입력. SPEC §12.5 / Android `SignupPasswordFragment.kt` +
 * 디자인 `sign_signup_password_states.png` 기준.
 *
 *   - 헤더: < 회원가입 (중앙) + 우측 "다음" 텍스트 (활성/비활성 분기)
 *   - 입력 1: "비밀번호" 라벨 + 입력 (regex `^(?=.*[A-Za-z])(?=.*\d).{8,20}$`)
 *   - 라이브 안내: 통과 전엔 회색 도움말, 위반 시 빨강 에러 텍스트
 *   - 입력 1 밑에 "비밀번호 표시" 별도 체크박스 (Android 디자인) — 1번 입력에만 적용
 *   - 입력 2: "비밀번호 확인" 라벨 + 입력 (항상 마스킹) + 일치 검증
 *   - 하단 풀와이드 "다음" 버튼 (활성/비활성)
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { ClearIcon, CheckCircleIcon, WarningIcon } from '../../components/icons';
import { isValidPassword } from '../../utils/validation';
import { cn } from '../../utils/cn';
import { SignupToolbar } from '../../components/auth/SignupToolbar';

export function SignupPasswordScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';

  // URL 직접 진입 방어 — email 없으면 Step 1으로
  useEffect(() => {
    if (!email) navigate('/signup/email', { replace: true });
  }, [email, navigate]);

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);

  const pwValid = isValidPassword(pw);
  const pwError = pw.length > 0 && !pwValid;
  const pw2Match = pw2.length > 0 && pw2 === pw;
  const pw2Error = pw2.length > 0 && pw2 !== pw;
  const canProceed = pwValid && pw2Match;

  const pwBorder = useMemo(() => {
    if (pw.length === 0) return 'border-borderDefault';
    if (pwError) return 'border-borderError';
    if (pwValid) return 'border-borderValid';
    return 'border-borderActive';
  }, [pw, pwError, pwValid]);

  const pw2Border = useMemo(() => {
    if (pw2.length === 0) return 'border-borderDefault';
    if (pw2Error) return 'border-borderError';
    if (pw2Match) return 'border-borderValid';
    return 'border-borderActive';
  }, [pw2, pw2Error, pw2Match]);

  const handleNext = () => {
    if (!canProceed || !email) return;
    // password는 navigate state(브라우저 history)가 아닌 sessionStorage로 전달
    sessionStorage.setItem('_sp', pw);
    navigate('/signup/nickname', { state: { email } });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-surface px-6 pt-safe pb-safe">
      <SignupToolbar />

      <div className="flex flex-1 flex-col pt-2">
        <h1 className="text-[20px] font-bold leading-[1.4] text-textPrimary">사용하실 비밀번호를 입력해주세요.</h1>

        {/* 비밀번호 */}
        <label className="mt-8 block text-label text-textPrimary">비밀번호</label>
        <div className={cn('mt-2 flex h-[52px] items-center gap-2 rounded-lg border px-3.5', pwBorder)}>
          <input
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="문자, 숫자 포함 8자 ~20자"
            className="flex-1 bg-transparent text-body text-textPrimary outline-none placeholder:text-textHint"
          />
          {pw.length > 0 && (
            <button type="button" onClick={() => setPw('')} aria-label="지우기" className="text-textHint">
              <ClearIcon size={20} />
            </button>
          )}
          {pwValid && <CheckCircleIcon size={20} className="text-blue" />}
          {pwError && <WarningIcon size={20} className="text-error" />}
        </div>
        {/* 도움말은 빈 상태엔 숨김, 입력 있는데 형식 안 맞을 때만 빨강 노출 */}
        {pwError && (
          <p className="mt-2 text-caption text-error">문자, 숫자 포함 8-20자로 입력해주세요.</p>
        )}

        {/* 비밀번호 표시 — 별도 체크박스. EmailLogin과 사이즈 통일(14px). */}
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className="mt-3 inline-flex items-center gap-2 self-start"
          aria-pressed={showPw}
        >
          <span
            className={cn(
              'flex h-[14px] w-[14px] items-center justify-center rounded-sm border',
              showPw ? 'border-orange bg-orange text-textWhite' : 'border-neutralLow text-transparent',
            )}
          >
            <Check size={10} strokeWidth={3} />
          </span>
          <span className={cn('text-caption', showPw ? 'text-textPrimary' : 'text-textSecondary')}>
            비밀번호 표시
          </span>
        </button>

        {/* 비밀번호 확인 */}
        <label className="mt-6 block text-label text-textPrimary">비밀번호 확인</label>
        <div className={cn('mt-2 flex h-[52px] items-center gap-2 rounded-lg border px-3.5', pw2Border)}>
          <input
            type="password"
            autoComplete="new-password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="비밀번호를 한번 더 입력해주세요"
            className="flex-1 bg-transparent text-body text-textPrimary outline-none placeholder:text-textHint"
          />
          {pw2.length > 0 && (
            <button type="button" onClick={() => setPw2('')} aria-label="지우기" className="text-textHint">
              <ClearIcon size={20} />
            </button>
          )}
          {pw2Match && <CheckCircleIcon size={20} className="text-blue" />}
          {pw2Error && <WarningIcon size={20} className="text-error" />}
        </div>
        {pw2Error && (
          <p className="mt-2 text-caption text-error">비밀번호가 일치하지 않습니다</p>
        )}
      </div>

      <div className="pb-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className={cn(
            'h-[52px] w-full rounded-card text-body-strong text-textWhite',
            canProceed ? 'bg-orange' : 'bg-btnDisabled',
          )}
        >
          다음
        </button>
      </div>
    </div>
  );
}
