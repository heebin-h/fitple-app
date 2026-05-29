/**
 * 모바일 폭 프레임. SPEC §5 / HANDOFF §5 (max-w-mobile = 430px).
 *
 * 데스크톱 브라우저에서 앱을 가운데 정렬하고 좌우를 회색(background)으로 채운다.
 * Capacitor WKWebView에서는 뷰포트가 곧 폰 화면이라 회색 여백은 보이지 않는다.
 *
 * 내부 컨테이너는 `relative`이며 화면 전환 슬라이드와 BottomNav의
 * `absolute` 배치 기준이 된다.
 */

import type { ReactNode } from 'react';

export function MobileFrame({ children }: { children: ReactNode }) {
  // iOS Safari에서 100vh가 URL 바 포함이라 실제 화면보다 커지는 문제 회피:
  // `dvh`(dynamic viewport height)를 쓰면 URL 바 등 동적 UI를 빼고 측정 → 비율 정상.
  return (
    <div className="flex min-h-dvh w-full justify-center bg-background">
      <div className="relative min-h-dvh w-full max-w-mobile overflow-hidden bg-surface">
        {children}
      </div>
    </div>
  );
}
