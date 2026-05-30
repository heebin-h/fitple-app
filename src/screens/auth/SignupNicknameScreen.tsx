/**
 * 회원가입 Step 3 — 닉네임 입력 + 약관 모달. SPEC §12.6 / Android `SignupNicknameFragment.kt`.
 *
 *   - 닉네임 trim 후 비어있지 않으면 valid (Android와 동일 — 길이는 SPEC §12.6의 2~10자 반영,
 *     공백만은 거부).
 *   - "다음" 클릭 → TermsBottomSheet 오픈.
 *   - 약관 5개 모두 동의 → onAgree:
 *       1. await userManager.saveUser(email, password, nickname)
 *       2. userManager.savePendingSignup(email)          // 중단 재개용
 *       3. navigate('/signup/preference', { state: { email } })
 *     이미 가입된 이메일이면 (정상 흐름에서 발생 X) Toast.
 */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { userManager } from '../../storage/userManager';
import { isValidNickname } from '../../utils/validation';
import { cn } from '../../utils/cn';
import { TermsBottomSheet } from '../../components/auth/TermsBottomSheet';
import { SignupToolbar } from '../../components/auth/SignupToolbar';

const MAX_LEN = 10;

export function SignupNicknameScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password } =
    (location.state as { email?: string; password?: string } | null) ?? {};

  const [nickname, setNickname] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  const trimmed = nickname.trim();
  const valid = isValidNickname(nickname);  // 2~10자
  const hasError = nickname.length > 0 && trimmed.length > 0 && !valid;

  const border = nickname.length === 0
    ? 'border-borderDefault'
    : hasError
      ? 'border-borderError'
      : valid
        ? 'border-borderValid'
        : 'border-borderActive';

  const handleNext = () => {
    if (!valid) return;
    if (!email || !password) {
      navigate('/signup/email', { replace: true });
      return;
    }
    setShowTerms(true);
  };

  const handleAgree = async () => {
    if (!email || !password) return;
    const ok = await userManager.saveUser(email, password, trimmed);
    if (!ok) {
      toast.error('이미 가입된 이메일이에요');
      navigate('/signup/email', { replace: true });
      return;
    }
    userManager.savePendingSignup(email);
    navigate('/signup/preference', { state: { email } });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-surface px-6 pt-safe pb-safe">
      <SignupToolbar />

      <div className="flex flex-1 flex-col pt-2">
        <h1 className="text-display text-textPrimary">사용하실 닉네임을 입력해주세요.</h1>

        <label className="mt-8 block text-label text-textPrimary">닉네임</label>
        <div className={cn('mt-2 flex h-[52px] items-center gap-2 rounded-lg border px-3.5', border)}>
          <input
            type="text"
            autoComplete="off"
            value={nickname}
            maxLength={MAX_LEN}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="ex)초보 운동가"
            className="flex-1 bg-transparent text-body text-textPrimary outline-none placeholder:text-textHint"
          />
          {nickname.length > 0 && (
            <button type="button" onClick={() => setNickname('')} aria-label="지우기" className="text-textHint">
              <XCircle size={18} />
            </button>
          )}
          {valid && <CheckCircle size={18} className="text-blue" />}
        </div>

        {/* 빈 상태에서는 헬퍼 텍스트 숨김. 입력 시작 후에만 카운트(+에러 시 빨강) 노출 */}
        {nickname.length > 0 && (
          <div className="mt-2 flex items-center justify-between text-caption">
            {hasError ? (
              <span className="text-error">2~10자로 입력해주세요.</span>
            ) : (
              <span />
            )}
            <span className="text-textHint">{trimmed.length}/{MAX_LEN}</span>
          </div>
        )}
      </div>

      <div className="pb-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={!valid}
          className={cn(
            'h-[52px] w-full rounded-card text-body-strong text-textWhite',
            valid ? 'bg-orange' : 'bg-btnDisabled',
          )}
        >
          다음
        </button>
      </div>

      <TermsBottomSheet open={showTerms} onOpenChange={setShowTerms} onAgree={handleAgree} />
    </div>
  );
}
