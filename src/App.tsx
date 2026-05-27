/**
 * 앱 셸. SPEC §10.
 *
 * 라우트 트리(AppRoutes) + 전역 Toast(react-hot-toast)만 담당한다.
 * 첫 실행 시드(seedIfFirstRun)는 SplashScreen이 단독 소유한다 — 부트 분기와
 * 동일 시퀀스에서 await해야 getCurrentUser 순서가 보장되고, 양쪽에서 호출 시
 * 첫 실행 데모 계정 생성 레이스가 생기기 때문(SPEC §12.1 > HANDOFF §4-12).
 */

import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{ duration: 2000, style: { fontSize: '14px' } }}
      />
    </>
  );
}

export default App;
