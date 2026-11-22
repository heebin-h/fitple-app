/**
 * Android `app/src/main/res/drawable/ic_*.xml` 벡터 패스를 1:1로 옮긴 인라인 SVG 컴포넌트들.
 *
 * lucide-react 디폴트 아이콘들은 outline 스타일이라 Android의 filled 아이콘과 모양이 다름.
 * → 입력칸 X/체크/경고는 반드시 이 컴포넌트들 사용.
 *
 *   ClearIcon       = ic_clear         (X in filled circle, colorTextHint)
 *   CheckCircleIcon = ic_check_circle  (check carved out of filled circle, color via currentColor)
 *   WarningIcon     = ic_warning       (filled triangle with !, colorError)
 *   ChevronRightIcon = ic_arrow_right  (gray chevron right)
 *
 * 색은 모두 `fill="currentColor"` 이므로 부모 `text-blue` / `text-error` / `text-orange` 등으로 제어.
 * `evenodd` fill-rule 사용해 카브아웃(체크의 흰 부분 등) 안전하게 표현.
 */

interface IconProps {
  size?: number;
  className?: string;
}

export function ClearIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12,2C6.47,2 2,6.47 2,12s4.47,10 10,10 10,-4.47 10,-10S17.53,2 12,2zm5,13.59L15.59,17 12,13.41 8.41,17 7,15.59 10.59,12 7,8.41 8.41,7 12,10.59 15.59,7 17,8.41 13.41,12 17,15.59z"
      />
    </svg>
  );
}

export function CheckCircleIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2zm-2,15l-5,-5 1.41,-1.41L10,14.17l7.59,-7.59L19,8l-9,9z"
      />
    </svg>
  );
}

export function WarningIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M1,21h22L12,2 1,21zM13,18h-2v-2h2v2zM13,14h-2v-4h2v4z"
      />
    </svg>
  );
}

export function ChevronRightIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M8.59,16.59L13.17,12 8.59,7.41 10,6l6,6-6,6-1.41-1.41z"
      />
    </svg>
  );
}
