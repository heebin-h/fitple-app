/**
 * 회원가입 Step 2 — 비밀번호 입력. SPEC §12.5 / Android `SignupPasswordFragment.kt`.
 *
 *   - 입력 1: 비밀번호 (regex `^(?=.*[A-Za-z])(?=.*\d).{8,20}$`)
 *   - 입력 2: 비밀번호 확인 (1번과 동일해야 함)
 *   - 비밀번호 표시 토글: 입력 1에만 적용 (확인란은 항상 마스킹 — Android와 동일)
 *   - "다음" 활성화: 둘 다 valid + 두 값 일치
 *   - 진행: `/signup/nickname` 으로 (email + password state 전달)
 *
 * 라이브 안내 chips: "영문+숫자" / "8~20자" (SPEC §12.5). 통과 시 초록.
 */

import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { isValidPassword } from '../../utils/validation';
import { cn } from '../../utils/cn';

export function SignupPasswordScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);

  const ruleLetterDigit = /[A-Za-z]/.test(pw) && /\d/.test(pw);
  const ruleLength = pw.length >= 8 && pw.length <= 20;
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
    if (!canProceed) return;
    if (!email) {
      navigate('/signup/email', { replace: true });
      return;
    }
    navigate('/signup/nickname', { state: { email, password: pw } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface px-5 pt-safe pb-safe">
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
        <h1 className="mt-4 text-display text-textPrimary">사용하실 비밀번호를 입력해주세요</h1>

        {/* 비밀번호 */}
        <div className={cn('mt-8 flex h-12 items-center gap-2 rounded-card border px-3', pwBorder)}>
          <input
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호"
            className="flex-1 bg-transparent text-body text-textPrimary outline-none placeholder:text-textHint"
          />
          {pw.length > 0 && (
            <button type="button" onClick={() => setPw('')} aria-label="지우기" className="text-textHint">
              <X size={18} />
            </button>
          )}
          {pwValid && <Check size={18} className="text-blue" />}
          {pwError && <AlertCircle size={18} className="text-error" />}
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보이기'}
            className={showPw ? 'text-orange' : 'text-textHint'}
          >
            {showPw ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        {/* 라이브 chips */}
        <div className="mt-3 flex gap-2">
          <RuleChip ok={ruleLetterDigit}>영문+숫자</RuleChip>
          <RuleChip ok={ruleLength}>8~20자</RuleChip>
        </div>

        {/* 비밀번호 확인 */}
        <div className={cn('mt-4 flex h-12 items-center gap-2 rounded-card border px-3', pw2Border)}>
          <input
            type="password"
            autoComplete="new-password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="비밀번호 확인"
            className="flex-1 bg-transparent text-body text-textPrimary outline-none placeholder:text-textHint"
          />
          {pw2.length > 0 && (
            <button type="button" onClick={() => setPw2('')} aria-label="지우기" className="text-textHint">
              <X size={18} />
            </button>
          )}
          {pw2Match && <Check size={18} className="text-blue" />}
          {pw2Error && <AlertCircle size={18} className="text-error" />}
        </div>
        {pw2Error && (
          <p className="mt-2 text-caption text-error">비밀번호가 일치하지 않아요.</p>
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

function RuleChip({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-full px-3 text-caption',
        ok ? 'bg-greenTint text-green' : 'bg-background text-textHint',
      )}
    >
      <Check size={14} className={ok ? 'opacity-100' : 'opacity-30'} />
      {children}
    </span>
  );
}
