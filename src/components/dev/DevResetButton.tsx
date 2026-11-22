/**
 * 개발용 리셋 버튼. App.tsx에서 `import.meta.env.DEV`일 때만 렌더된다(배포 빌드엔 없음).
 *
 * 어느 화면에서든 우하단에 떠 있어, 탭 한 번으로 세션·시드·PWA 캐시를 비우고
 * 로그인 화면으로 되돌린다(resetApp). URL(`/?reset`)을 외울 필요 없이 직접 초기화.
 */

import { resetApp } from '../../utils/resetApp';

export function DevResetButton() {
  return (
    <button
      type="button"
      onClick={resetApp}
      aria-label="앱 리셋 (개발용)"
      className="fixed bottom-20 right-3 z-50 rounded-full bg-black/70 px-3 py-1.5 text-mini-strong text-white shadow-md"
    >
      ↻ 리셋
    </button>
  );
}
