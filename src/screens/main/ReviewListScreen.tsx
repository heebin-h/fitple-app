/**
 * 이용 후기 전체 목록 — `/reviews`.
 * Android `ReviewListFragment.kt` + `fragment_review_list.xml` 포트. 디자인 PNG 없음 → XML 기준.
 *
 *   - 툴바 56dp, 좌측 뒤로(28dp), 가운데 타이틀 "이용 후기" 17sp bold
 *   - 목록: paddingHorizontal 20 / top 12 / bottom 24, item_review_card 세로 나열 (탭 동작 없음)
 *   - 카드 간 세로 간격: TrialListScreen과 동일하게 12px (Android는 0)
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ReviewCard } from '../../components/meeting/ReviewCard';
import type { Review } from '../../data/models';

function readReviews(): Review[] {
  try {
    return JSON.parse(localStorage.getItem('reviews') ?? '[]') as Review[];
  } catch (e) {
    console.error('[ReviewListScreen] reviews parse failed:', e);
    return [];
  }
}

export function ReviewListScreen() {
  const navigate = useNavigate();
  const reviews = useMemo(readReviews, []);

  return (
    <div className="flex min-h-dvh flex-col bg-surface pt-safe">
      <div className="relative flex h-14 items-center px-3">
        <button type="button" onClick={() => navigate(-1)} className="p-0.5" aria-label="뒤로가기">
          <ArrowLeft size={24} className="text-textPrimary" />
        </button>
        <h1 className="pointer-events-none absolute inset-x-0 text-center text-h2 text-textPrimary">
          이용 후기
        </h1>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3">
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
    </div>
  );
}
