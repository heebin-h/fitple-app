/**
 * 후기 billboard 카드. HomeScreen(가로 carousel) · ReviewListScreen(세로 목록) 공용.
 * Android `item_review_card.xml` + `HomeSectionBinders.populateReviews` 포트.
 *
 * PNG(designs/home_review_billboard_cards.png) vs XML 차이:
 *   - 크기 180×240 (3:4) — PNG 비율 동일 → XML 그대로
 *   - 닉네임: XML bold → PNG 일반 굵기 → 가이드 §3-1에 따라 PNG 우선(text-mini)
 *   - 인용문: Android가 코드에서 따옴표 감쌈(`"\"${text}\""`) → 동일 처리
 */

import type { Review } from '../../data/models';
import { meetingImg } from '../../utils/meetingImage';

interface Props {
  review: Review;
}

export function ReviewCard({ review: r }: Props) {
  return (
    <div className="relative h-[240px] w-[180px] flex-shrink-0 overflow-hidden rounded-card bg-surface">
      <img src={meetingImg(r.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-gradientStart to-gradientEnd" />

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="text-mini text-textWhite/80">{r.nickname}</p>
        <p className="mt-px truncate text-mini text-textWhite/60">{r.activity}</p>
        <p className="mt-1 line-clamp-3 text-micro-strong text-textWhite">"{r.text}"</p>
      </div>
    </div>
  );
}
