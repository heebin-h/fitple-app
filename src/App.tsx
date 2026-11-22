/**
 * 앱 셸. SPEC §10.
 *
 * 라우트 트리(AppRoutes) + 전역 Toast(react-hot-toast)만 담당한다.
 * 첫 실행 시드(seedIfFirstRun)는 SplashScreen이 단독 소유한다 — 부트 분기와
 * 동일 시퀀스에서 await해야 getCurrentUser 순서가 보장되고, 양쪽에서 호출 시
 * 첫 실행 데모 계정 생성 레이스가 생기기 때문(SPEC §12.1 > HANDOFF §4-12).
 */

import { Component, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes';
import { DevResetButton } from './components/dev/DevResetButton';

class ErrorBoundary extends Component<{ children: ReactNode }, { caught: boolean }> {
  state = { caught: false };
  static getDerivedStateFromError() { return { caught: true }; }
  render() {
    if (this.state.caught) {
      return (
        <div className="flex min-h-dvh items-center justify-center p-6 text-center">
          <p className="text-body text-textSecondary">
            문제가 발생했어요.<br />앱을 다시 시작해 주세요.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{ duration: 2000, style: { fontSize: '14px' } }}
      />
      {import.meta.env.DEV && <DevResetButton />}
    </ErrorBoundary>
  );
}

export default App;
