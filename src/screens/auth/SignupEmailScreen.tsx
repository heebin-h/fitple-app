/**
 * 회원가입 1단계 — 이메일 입력. SPEC §12.4 / Android `SignupEmailFragment.kt` 포팅.
 *
 * 5-state 머신(Android와 동일):
 *   empty   : 입력 없음               → 기본 보더
 *   typing  : @ 없이 입력 중          → active 보더 (에러 표시 안 함)
 *   invalid : @ 있지만 형식 미완성    → error 보더 + 형식 에러 + naver/gmail 자동완성
 *   taken   : 형식 OK + 이미 가입됨   → error 보더 + 가입됨 안내 + "로그인하기" CTA
 *   valid   : 형식 OK + 신규          → valid 보더 + 체크 아이콘 + "다음" 활성화
 *
 * isEmailTaken은 SHA-256 해시라 async — 200ms 디바운스 + 시퀀스 토큰으로 경합 방지(§12.4).
 *
 * ⚠️ "다음"의 라우팅은 §12.5 SignupPasswordScreen 구현 시 연결. 현재는 안내 Toast.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClearIcon, CheckCircleIcon, WarningIcon } from '../../components/icons';
import { userManager } from '../../storage/userManager';
import { isValidEmailFormat } from '../../utils/validation';
import { cn } from '../../utils/cn';
import { EmailSuggestions } from '../../components/auth/EmailSuggestions';
import { SignupToolbar } from '../../components/auth/SignupToolbar';

type State = 'empty' | 'typing' | 'invalid' | 'taken' | 'valid';

export function SignupEmailScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isTaken, setIsTaken] = useState(false);
  const checkSeq = useRef(0);

  const hasAt = email.includes('@');
  const isValid = isValidEmailFormat(email);

  // 200ms 디바운스 + 시퀀스 토큰: 마지막 입력 결과만 반영(빠른 타이핑 경합 방지).
  useEffect(() => {
    if (!isValid) {
      setIsTaken(false);
      return;
    }
    const seq = ++checkSeq.current;
    const timer = setTimeout(async () => {
      const taken = await userManager.isEmailTaken(email);
      if (checkSeq.current === seq) setIsTaken(taken);
    }, 200);
    return () => clearTimeout(timer);
  }, [email, isValid]);

  const state: State = useMemo(() => {
    if (!email) return 'empty';
    if (!hasAt) return 'typing';
    if (!isValid) return 'invalid';
    if (isTaken) return 'taken';
    return 'valid';
  }, [email, hasAt, isValid, isTaken]);

  const canProceed = state === 'valid';

  const borderClass: Record<State, string> = {
    empty: 'border-borderDefault',
    typing: 'border-borderActive',
    invalid: 'border-borderError',
    taken: 'border-borderError',
    valid: 'border-borderValid',
  };

  const handleNext = () => {
    if (!canProceed) return;
    navigate('/signup/password', { state: { email: email.trim().toLowerCase() } });
  };

  const handleGoLogin = () => {
    // SPEC §12.4: 이미 가입된 이메일이면 이메일 로그인 화면으로 + 이메일 prefill.
    navigate('/email-login', { state: { prefillEmail: email.trim().toLowerCase() } });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-surface px-6 pt-safe pb-safe">
      <SignupToolbar />

      <div className="flex flex-1 flex-col pt-2">
        <h1 className="text-[20px] font-bold leading-[1.4] text-textPrimary">사용하실 이메일 주소를 입력해주세요.</h1>

        <label className="mt-8 block text-label text-textPrimary">이메일 아이디</label>
        <div className={cn('mt-2 flex h-[52px] items-center gap-2 rounded-lg border px-3.5', borderClass[state])}>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="fitple@fitple.com"
            className="flex-1 bg-transparent text-body text-textPrimary outline-none placeholder:text-textHint"
          />
          {email.length > 0 && (
            <button type="button" onClick={() => setEmail('')} aria-label="지우기" className="text-textHint">
              <ClearIcon size={20} />
            </button>
          )}
          {state === 'valid' && <CheckCircleIcon size={20} className="text-blue" />}
          {(state === 'invalid' || state === 'taken') && (
            <WarningIcon size={20} className="text-error" />
          )}
        </div>

        {/* 에러/안내 */}
        {state === 'invalid' && (
          <p className="mt-2 text-caption text-error">이메일 주소가 올바르지 않습니다.</p>
        )}
        {state === 'taken' && (
          <p className="mt-2 text-caption text-error">
            이미 가입된 이메일이에요.{' '}
            <button
              type="button"
              onClick={handleGoLogin}
              className="font-bold text-textPrimary underline"
            >
              로그인하기
            </button>
          </p>
        )}

        {/* 자동완성 (State invalid 에서만 — EmailSuggestions 내부에서 분기) */}
        <EmailSuggestions email={email} onPick={setEmail} />
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
