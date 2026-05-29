/**
 * 이메일 로그인. SPEC §12.3 / Android `EmailLoginFragment.kt` 1:1 포트.
 *
 *   - 이메일/비밀번호 입력. 형식 검증은 utils/validation.ts (Android와 동일 정규식).
 *   - 로그인 버튼: 양쪽 형식 모두 통과 시에만 활성화(주황). 비활성은 btnDisabled 회색.
 *   - 제출 실패 → Toast "이메일 또는 비밀번호가 맞지 않아요" + 비번 칸 에러 보더.
 *   - 성공 → userManager.setLoggedIn(email) + clearPendingSignup + navigate('/home', replace).
 *   - 이메일 자동완성: @ 입력 후 형식이 미완성일 때만 naver/gmail 추천(SignupEmail과 동일 UX).
 *
 * 데모 계정으로 회원 홈을 확인할 땐 이 화면에서 demo@fitple.app / demo1234 입력.
 */

import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { userManager } from '../../storage/userManager';
import { useAuthStore } from '../../store/authStore';
import { isValidEmailFormat, isValidPassword } from '../../utils/validation';
import { cn } from '../../utils/cn';
import { EmailSuggestions } from '../../components/auth/EmailSuggestions';

export function EmailLoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);

  const prefill = (location.state as { prefillEmail?: string } | null)?.prefillEmail ?? '';
  const [email, setEmail] = useState(prefill);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState(false);

  const emailValid = isValidEmailFormat(email);
  const pwValid = isValidPassword(password);
  const canSubmit = emailValid && pwValid;

  const emailHasError = email.length > 0 && !emailValid && !email.includes('@')
    ? false                              // typing without @, no error yet
    : email.length > 0 && !emailValid;   // @ 있는데 형식 불완전

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const normalized = email.trim().toLowerCase();
    const ok = await userManager.loginUser(normalized, password);
    if (!ok) {
      setPwError(true);
      toast('이메일 또는 비밀번호가 맞지 않아요');
      return;
    }
    userManager.setLoggedIn(normalized);
    userManager.clearPendingSignup();
    setUser(await userManager.getCurrentUser());
    navigate('/home', { replace: true });
  };

  const emailBorder = useMemo(() => {
    if (email.length === 0) return 'border-borderDefault';
    if (emailHasError) return 'border-borderError';
    if (emailValid) return 'border-borderValid';
    return 'border-borderActive';      // typing, no @ yet
  }, [email, emailValid, emailHasError]);

  const pwBorder = pwError
    ? 'border-borderError'
    : password.length === 0
      ? 'border-borderDefault'
      : pwValid
        ? 'border-borderValid'
        : 'border-borderActive';

  return (
    <div className="flex min-h-dvh flex-col bg-surface px-5 pt-safe pb-safe">
      <header className="flex h-12 items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로"
          className="-ml-2 p-2 text-textPrimary"
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className="flex flex-1 flex-col">
        <h1 className="mt-4 text-display text-textPrimary">로그인</h1>

        {/* 이메일 */}
        <div className={cn('mt-8 flex h-12 items-center gap-2 rounded-card border px-3', emailBorder)}>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="flex-1 bg-transparent text-body text-textPrimary outline-none placeholder:text-textHint"
          />
          {email.length > 0 && (
            <button type="button" onClick={() => setEmail('')} aria-label="지우기" className="text-textHint">
              <X size={18} />
            </button>
          )}
          {emailValid && <Check size={18} className="text-blue" />}
          {emailHasError && <AlertCircle size={18} className="text-error" />}
        </div>
        <EmailSuggestions email={email} onPick={setEmail} />

        {/* 비밀번호 */}
        <div className={cn('mt-3 flex h-12 items-center gap-2 rounded-card border px-3', pwBorder)}>
          <input
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (pwError) setPwError(false);
            }}
            placeholder="비밀번호"
            className="flex-1 bg-transparent text-body text-textPrimary outline-none placeholder:text-textHint"
          />
          {password.length > 0 && (
            <button
              type="button"
              onClick={() => setPassword('')}
              aria-label="지우기"
              className="text-textHint"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보이기'}
            className={showPw ? 'text-orange' : 'text-textHint'}
          >
            {showPw ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        {pwError && (
          <p className="mt-2 text-caption text-error">이메일 또는 비밀번호가 맞지 않아요.</p>
        )}

        {/* 로그인 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            'mt-8 h-[52px] w-full rounded-card text-body-strong text-textWhite',
            canSubmit ? 'bg-orange' : 'bg-btnDisabled',
          )}
        >
          로그인
        </button>

        {/* 비밀번호 잊음 */}
        <button
          type="button"
          onClick={() => toast('준비 중이에요')}
          className="mt-4 self-center text-caption text-textSecondary underline"
        >
          비밀번호를 잊으셨나요?
        </button>

        <div className="mt-auto pb-6 text-center text-caption text-textSecondary">
          아직 계정이 없으신가요?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup/email')}
            className="font-bold text-textPrimary underline"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
