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

  // 디자인 PNG 기준: 외곽에 라인 보더가 아니라 **드롭 섀도우**만 있는 카드.
  //   - 배경: 흰색(colorSurface)
  //   - 외곽: 보더 없음 + shadow-md (Android XML의 stroke 무시 — 디자인 우선)
  //   - 행: 48dp 높이, 14dp padding-start, 14sp textPrimary
  //   - 구분선: 1dp height, colorBackground(#F2F2F2)
  return (
    <div className="mt-2 overflow-hidden rounded-lg bg-surface shadow-md">
      {candidates.map((s, i) => (
        <div key={s}>
          {i > 0 && <div className="h-px bg-background" />}
          <button
            type="button"
            onClick={() => onPick(s)}
            className="flex h-12 w-full items-center px-3.5 text-left text-label text-textPrimary active:bg-background"
          >
            {s}
          </button>
        </div>
      ))}
    </div>
  );
}
