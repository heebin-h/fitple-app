/**
 * 이메일 자동완성 드롭다운. Android `fragment_signup_email.xml` /
 * `fragment_email_login.xml` 의 `layoutEmailSuggestions` 디자인 1:1.
 *
 * 표시 조건: 입력에 `@` 가 포함됐으나 형식이 아직 완성되지 않은 상태(State 3).
 * `@` 가 없을 땐(타이핑 중) 숨기고, 형식이 완성되면 자동으로 닫힌다.
 *
 * 한 박스(rounded-card + borderDefault) 안에 2줄(각 48px height, 14px padding-start)
 * + 1px 구분선(background 회색)으로 깔끔하게.
 */

import { isValidEmailFormat } from '../../utils/validation';

interface Props {
  email: string;
  onPick: (next: string) => void;
}

export function EmailSuggestions({ email, onPick }: Props) {
  const hasAt = email.includes('@');
  const isValid = isValidEmailFormat(email);
  // State 3 (invalid format with @) 일 때만 표시
  if (!hasAt || isValid) return null;
  const idPart = email.split('@')[0];
  if (idPart.length === 0) return null;

  const candidates = [`${idPart}@naver.com`, `${idPart}@gmail.com`];

  // 디자인 `sign_signup_email_states.png` 기준: 입력 박스(흰색)보다 살짝 진한 회색.
  // 우리 토큰 `background`(#F2F2F2)가 정확히 그 톤.
  return (
    <div className="mt-2 overflow-hidden rounded-card border border-borderDefault bg-background">
      {candidates.map((s, i) => (
        <div key={s}>
          {i > 0 && <div className="h-px bg-borderDefault/60" />}
          <button
            type="button"
            onClick={() => onPick(s)}
            className="flex h-12 w-full items-center px-3.5 text-left text-label text-textPrimary active:bg-neutralLow/30"
          >
            {s}
          </button>
        </div>
      ))}
    </div>
  );
}
