/**
 * 이메일 로그인. SPEC §12.3 / Android `fragment_email_login.xml` + `EmailLoginFragment.kt` 1:1.
 *
 * 레이아웃 (Android XML 그대로):
 *   - 툴바: < (뒤로) | "이메일로 로그인" 중앙 18sp bold | 우측 없음. elevation 0.
 *   - 본문: paddingHorizontal 24dp, paddingTop 24dp
 *   - 라벨 "이메일 아이디" (14sp bold textPrimary)
 *     입력 (52dp, hint "fitple@fitple.com")
 *     marginBottom 24dp
 *   - 라벨 "비밀번호" (14sp bold textPrimary)
 *     입력 (52dp, hint "문자, 숫자 포함 8자 ~20자")
 *   - 체크박스 "비밀번호 표시" (별도, marginTop 12dp)
 *   - "로그인" 버튼 (54dp, marginTop 32dp, 활성/비활성)
 *   - "회원가입" 링크 (centered, textSecondary, marginTop 24dp)
 *
 * 동작 (EmailLoginFragment.kt):
 *   - 이메일/비번 둘 다 형식 통과해야 로그인 버튼 활성.
 *   - 실패 → Toast "이메일 또는 비밀번호가 맞지 않아요" + 비번 칸 빨간 보더 + 에러 아이콘.
 *   - 성공 → setLoggedIn + clearPendingSignup + setUser + /home replace.
 */

import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { ClearIcon, CheckCircleIcon, WarningIcon } from '../../components/icons';
import toast from 'react-hot-toast';
import { userManager } from '../../storage/userManager';
import { useAuthStore } from '../../store/authStore';
import { isValidEmailFormat, isValidPassword } from '../../utils/validation';
import { cn } from '../../utils/cn';
import { EmailSuggestions } from '../../components/auth/EmailSuggestions';
import { SignupToolbar } from '../../components/auth/SignupToolbar';

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

  // @ 없이 입력 중인 상태는 에러 표시하지 않음 (Android 패턴)
  const emailHasError = email.length > 0 && email.includes('@') && !emailValid;

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
    return 'border-borderActive';     // @ 없이 타이핑 중
  }, [email, emailValid, emailHasError]);

  // Android EmailLoginFragment: 형식 invalid면 active 단계 없이 곧장 error.
  const pwFormatError = password.length > 0 && !pwValid;
  const pwBorder = pwError || pwFormatError
    ? 'border-borderError'
    : password.length === 0
      ? 'border-borderDefault'
      : 'border-borderValid';

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="px-6 pt-safe">
        <SignupToolbar title="이메일로 로그인" />
      </div>

      <div className="flex flex-1 flex-col px-6 pt-6 pb-safe">
        {/* 이메일 아이디 */}
        <label className="text-label text-textPrimary">이메일 아이디</label>
        <div className={cn('mt-2 flex h-[52px] items-center gap-2 rounded-lg border px-3.5', emailBorder)}>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="fitple@fitple.com"
            className="flex-1 bg-transparent text-label text-textPrimary outline-none placeholder:text-textHint"
          />
          {email.length > 0 && (
            <button type="button" onClick={() => setEmail('')} aria-label="지우기" className="text-textHint">
              <ClearIcon size={20} />
            </button>
          )}
          {emailValid && <CheckCircleIcon size={20} className="text-blue" />}
          {emailHasError && <WarningIcon size={20} className="text-error" />}
        </div>
        <EmailSuggestions email={email} onPick={setEmail} />

        {/* 비밀번호 */}
        <label className="mt-6 text-label text-textPrimary">비밀번호</label>
        <div className={cn('mt-2 flex h-[52px] items-center gap-2 rounded-lg border px-3.5', pwBorder)}>
          <input
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (pwError) setPwError(false);
            }}
            placeholder="문자, 숫자 포함 8자 ~20자"
            className="flex-1 bg-transparent text-label text-textPrimary outline-none placeholder:text-textHint"
          />
          {password.length > 0 && (
            <button type="button" onClick={() => setPassword('')} aria-label="지우기" className="text-textHint">
              <ClearIcon size={20} />
            </button>
          )}
          {pwValid && !pwError && <CheckCircleIcon size={20} className="text-blue" />}
          {(pwError || pwFormatError) && <WarningIcon size={20} className="text-error" />}
        </div>
        {/* 비번 형식 inline 에러 — Android `txtPasswordError` (panel 2 디자인) */}
        {password.length > 0 && !pwValid && (
          <p className="mt-1 text-caption text-error">문자, 숫자 포함 8-20자로 입력해주세요.</p>
        )}

        {/* 비밀번호 표시 — 별도 체크박스 (Android XML) */}
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

        {/* 로그인 버튼 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            'mt-8 h-[54px] w-full rounded-card text-h3 text-textWhite',
            canSubmit ? 'bg-orange' : 'bg-btnDisabled',
          )}
        >
          로그인
        </button>

        {/* 회원가입 링크 — 중앙 정렬, 보조 텍스트 컬러, 밑줄 (디자인 PNG 기준) */}
        <button
          type="button"
          onClick={() => navigate('/signup/email')}
          className="mt-6 self-center text-label text-textSecondary underline"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
