/**
 * 인증/회원가입 플로우 공통 툴바.
 *
 *   < (뒤로)   {title} (중앙, h3 18sp bold)   [선택: 우측 액션 텍스트]
 *
 * Android `layout_toolbar_signup(.xml | _password.xml | _email_login.xml)` 미러.
 *   - SignupEmail/Nickname : title="회원가입", 우측 없음
 *   - SignupPassword       : title="회원가입", 우측 "다음" (활성/비활성)
 *   - SignupPreference     : title="회원가입", 우측 "건너뛰기"
 *   - EmailLogin           : title="이메일로 로그인", 우측 없음
 *
 * 높이 56dp(h-14). elevation 0 (그림자 없음, Android XML 명시).
 */

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface Props {
  title?: string;             // 기본 "회원가입"
  rightLabel?: string;
  onRightTap?: () => void;
  rightActive?: boolean;
}

export function SignupToolbar({
  title = '회원가입',
  rightLabel,
  onRightTap,
  rightActive = true,
}: Props) {
  const navigate = useNavigate();
  return (
    <header className="relative flex h-14 items-center">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="뒤로"
        className="-ml-2 p-2 text-textPrimary"
      >
        <ArrowLeft size={24} />
      </button>
      <h2 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-h2 text-textPrimary">
        {title}
      </h2>
      {rightLabel && (
        <button
          type="button"
          onClick={onRightTap}
          disabled={!rightActive}
          className={cn(
            'ml-auto -mr-2 p-2 text-label',
            rightActive ? 'text-textPrimary' : 'text-btnDisabled',
          )}
        >
          {rightLabel}
        </button>
      )}
    </header>
  );
}
