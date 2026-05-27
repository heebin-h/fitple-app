/**
 * 홈 (Phase 1 placeholder). SPEC §12.10 / §12.11 / §11.5.
 *
 * Phase 1 범위: 회원/게스트 분기 hero 카피 + 5종목 아이콘 행(→ /explore/:sport)만 구현.
 * 활동 중인 모임 / 체험 모임 / 후기 / 다가오는 정기모임 / FAB 등 풀 섹션(§12.10)은 Phase 4+.
 *
 * 종목 라벨은 constants/sports.ts의 SPORTS 순서를 따른다(룰 #3, 불변 5종목).
 */

import { useNavigate } from 'react-router-dom';
import { SPORTS } from '../../constants/sports';
import { useAuthStore } from '../../store/authStore';

export function HomeScreen() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isGuest = useAuthStore((s) => s.isGuest);

  const heroTitle = isGuest
    ? '모임을 둘러보는 중이에요!'
    : `안녕하세요 ${currentUser?.nickname ?? ''}님!`;
  const heroSub = isGuest
    ? '로그인하고 참여하기 →'
    : '오늘도 함께 운동할 모임을 찾아보세요';

  return (
    <div className="flex flex-col px-5 pt-safe">
      <header className="py-4">
        <span className="text-caption text-textSecondary">미사 1동 ▾</span>
        <h1 className="mt-2 text-h1 text-textPrimary">{heroTitle}</h1>
        <p className="mt-1 text-label text-textSecondary">{heroSub}</p>
      </header>

      <section className="grid grid-cols-5 gap-2 py-2">
        {SPORTS.map((sport) => (
          <button
            key={sport.name}
            type="button"
            onClick={() => navigate(`/explore/${encodeURIComponent(sport.name)}`)}
            className="flex flex-col items-center gap-1 rounded-card bg-orangeTint py-3"
          >
            <span className="text-h3 text-orange">{sport.name.charAt(0)}</span>
            <span className="text-mini text-textSecondary">{sport.name}</span>
          </button>
        ))}
      </section>

      <p className="py-6 text-caption text-textHint">
        모임 목록 · 후기 · 정기모임 섹션은 다음 단계에서 추가됩니다.
      </p>
    </div>
  );
}
