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
import { ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { userManager } from '../../storage/userManager';
import { isValidEmailFormat } from '../../utils/validation';
import { cn } from '../../utils/cn';

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

  const idPart = email.split('@')[0];
  const showSuggestions = state === 'invalid' && idPart.length > 0;
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
    // TODO(phase-2-next): navigate('/signup/password', { state: { email: email.trim().toLowerCase() } });
    toast('비밀번호 단계는 다음 커밋에서 추가됩니다');
  };

  const handleGoLogin = () => {
    // SPEC §12.4: 이미 가입된 이메일이면 로그인 화면으로 + 이메일 prefill.
    navigate('/login', { state: { prefillEmail: email.trim().toLowerCase() } });
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
        <h1 className="mt-4 text-display text-textPrimary">이메일을 입력해주세요</h1>

        <div className={cn('mt-8 flex h-12 items-center gap-2 rounded-card border px-3', borderClass[state])}>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소"
            className="flex-1 bg-transparent text-body text-textPrimary outline-none placeholder:text-textHint"
          />
          {email.length > 0 && (
            <button type="button" onClick={() => setEmail('')} aria-label="지우기" className="text-textHint">
              <X size={18} />
            </button>
          )}
          {state === 'valid' && <Check size={18} className="text-blue" />}
          {(state === 'invalid' || state === 'taken') && (
            <AlertCircle size={18} className="text-error" />
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

        {/* 자동완성 (State invalid 에서만) */}
        {showSuggestions && (
          <div className="mt-2 flex flex-col gap-1">
            {[`${idPart}@naver.com`, `${idPart}@gmail.com`].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setEmail(s)}
                className="rounded-card border border-borderDefault px-3 py-2 text-left text-caption text-textPrimary"
              >
                {s}
              </button>
            ))}
          </div>
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
