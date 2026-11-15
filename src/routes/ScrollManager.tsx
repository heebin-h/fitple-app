/**
 * 라우트 전환 시 window 스크롤 관리.
 *
 *   PUSH / REPLACE (새 화면) → 맨 위(0)로
 *   POP (뒤로/앞으로)         → 그 히스토리 항목에서 마지막으로 보던 위치로 복원
 *
 * Android Fragment 백스택과 동일한 체감: 새 화면은 항상 위에서 시작하고,
 * 뒤로 가면 보던 위치로 돌아온다. BrowserRouter(비-data router)라
 * <ScrollRestoration>을 쓸 수 없어 location.key 기준으로 직접 저장한다.
 *
 * 위치는 scroll 이벤트마다 "현재 key"에 기록한다. 전환 시점에 scrollY를 읽으면
 * 새 화면 DOM 때문에 이미 잘린(clamp) 값일 수 있어서다.
 */

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const positions = useRef(new Map<string, number>());
  const currentKey = useRef(location.key);

  useEffect(() => {
    const onScroll = () => positions.current.set(currentKey.current, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    currentKey.current = location.key;
    const saved = navType === 'POP' ? positions.current.get(location.key) : undefined;
    window.scrollTo(0, saved ?? 0);
  }, [location.key, navType]);

  return null;
}
