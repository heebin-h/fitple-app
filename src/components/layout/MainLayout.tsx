/**
 * 탭 화면 공용 레이아웃. SPEC §10.1.
 *
 * 자식 라우트(<Outlet/>)를 그리고 하단에 BottomNav를 고정한다.
 * `pb-14`(56px)로 콘텐츠가 탭바 뒤로 가려지지 않게 하단 여백을 둔다.
 *
 * 인증/회원가입 플로우와 PostDetail은 이 레이아웃을 쓰지 않으므로 BottomNav가 없다(§10.1).
 */

import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  return (
    <div className="relative min-h-screen pb-14">
      <Outlet />
      <BottomNav />
    </div>
  );
}
