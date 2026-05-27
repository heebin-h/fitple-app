import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * 개발용 리셋 해치.
 *
 * `/?reset` 으로 접속하면 localStorage(세션·시드) + PWA 서비스워커 + Cache Storage를
 * 모두 비우고 스플래시('/')로 되돌린다. 폰 Safari처럼 devtools로 localStorage를
 * 지우기 어려운 환경에서 "로그인 화면부터 다시 보기"용 초기화 수단.
 *
 * 콘솔에서는 `fitpleReset()` 으로도 호출 가능.
 *
 * @returns true면 리셋 후 리다이렉트 중이므로 React를 렌더하지 않는다.
 */
function maybeResetApp(): boolean {
  if (!new URLSearchParams(window.location.search).has('reset')) return false;
  localStorage.clear();
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.getRegistrations().then((regs) =>
      regs.forEach((r) => r.unregister()),
    );
  }
  if ('caches' in window) {
    void caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
  window.location.replace('/');
  return true;
}

(window as Window & { fitpleReset?: () => void }).fitpleReset = () => {
  localStorage.clear();
  window.location.replace('/');
};

if (!maybeResetApp()) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
