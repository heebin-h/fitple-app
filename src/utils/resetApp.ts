/**
 * 앱 상태 전체 초기화.
 *
 * localStorage(세션 `current_user` + 시드 데이터 전부) + PWA 서비스워커 +
 * Cache Storage 를 비우고 스플래시('/')로 되돌린다. 다시 시드가 깔리고
 * 비로그인 상태이므로 로그인 화면부터 시작한다.
 *
 * 사용처: main.tsx의 `/?reset` 해치, 개발용 DevResetButton, 콘솔 `fitpleReset()`.
 */
export function resetApp(): void {
  localStorage.clear();
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()));
  }
  if ('caches' in window) {
    void caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
  window.location.replace('/');
}
