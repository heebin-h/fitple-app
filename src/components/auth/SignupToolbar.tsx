/**
 * 회원가입 플로우 공통 툴바.
 *
 *   < (뒤로)   회원가입 (중앙)   [선택: 우측 액션 텍스트]
 *
 * Android 디자인(`sign_signup_*` PNG) 1:1.
 *   - 비밀번호 화면 : 우측 "다음" 텍스트 — 활성 시 textPrimary, 비활성 시 btnDisabled
 *   - 선호운동 화면 : 우측 "건너뛰기" 텍스트 — 항상 활성
 *   - 닉네임/이메일 화면 : 우측 없음
 *
 * 높이 48px(h-12, 룰 #6). 텍스트는 caption-strong.
 */

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface Props {
  rightLabel?: string;
  onRightTap?: () => void;
  rightActive?: boolean;
}

export function SignupToolbar({ rightLabel, onRightTap, rightActive = true }: Props) {
  const navigate = useNavigate();
  return (
    <header className="relative flex h-12 items-center">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="뒤로"
        className="-ml-2 p-2 text-textPrimary"
      >
        <ArrowLeft size={24} />
      </button>
      <h2 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-h3 text-textPrimary">
        회원가입
      </h2>
      {rightLabel && (
        <button
          type="button"
          onClick={onRightTap}
          disabled={!rightActive}
          className={cn(
            'ml-auto -mr-2 p-2 text-caption-strong',
            rightActive ? 'text-textPrimary' : 'text-btnDisabled',
          )}
        >
          {rightLabel}
        </button>
      )}
    </header>
  );
}
